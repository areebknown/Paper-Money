import { prisma } from '@/lib/db';
import { pusherServer } from '@/lib/pusher-server';

/**
 * Service to handle the logic of starting an auction.
 * This is used by both the Manual Admin API and the Cron Job.
 */
export async function startAuctionService(auctionId: string) {
    // 1. Fetch current status to avoid double-starting
    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        select: { id: true, status: true, name: true, scheduledAt: true }
    });

    if (!auction) {
        throw new Error(`Auction ${auctionId} not found`);
    }

    if (auction.status === 'LIVE') {
        return { success: false, message: 'Auction is already LIVE', auction };
    }

    if (auction.status === 'COMPLETED') {
        throw new Error('Cannot start a COMPLETED auction');
    }

    // 2. Update DB transactionally
    const updatedAuction = await prisma.auction.update({
        where: { id: auctionId },
        data: {
            status: 'LIVE',
            startedAt: new Date(),
            endedAt: new Date(Date.now() + 10 * 60 * 1000), // Default 10 minutes duration
        },
    });

    // 3. Trigger Pusher Events (fire-and-forget - don't block on these)

    // A. Specific Channel (For the Bid Page)
    pusherServer.trigger(`auction-${auctionId}`, 'status-change', {
        status: 'LIVE',
        auctionId: auctionId,
        startedAt: updatedAuction.startedAt,
    }).catch(err => console.error('[StartAuction] Pusher failed:', err));

    // B. Global Channel (For Home/Admin Lists)
    pusherServer.trigger('global-auctions', 'auction-started', {
        id: auctionId,
        name: updatedAuction.name,
        status: 'LIVE',
        startedAt: updatedAuction.startedAt,
    }).catch(err => console.error('[StartAuction] Pusher failed:', err));

    console.log(`[AuctionEngine] Started auction ${auctionId} (${updatedAuction.name})`);

    return { success: true, auction: updatedAuction };
}

/**
 * Checks for any SCHEDULED auctions that should be LIVE and starts them.
 * This is designed to be called "lazily" when users visit the site.
 */
export async function checkAndStartDueAuctions() {
    try {
        const now = new Date();
        // Find auctions that are SCHEDULED and past their start time
        const dueAuctions = await prisma.auction.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: { lte: now }
            },
            select: { id: true, name: true }
        });

        if (dueAuctions.length === 0) return { started: 0 };

        console.log(`[LazyStart] Found ${dueAuctions.length} due auctions. Starting...`);

        // Start them all nicely
        const results = await Promise.allSettled(
            dueAuctions.map(a => startAuctionService(a.id))
        );

        const startedCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`[LazyStart] Successfully started ${startedCount}/${dueAuctions.length} auctions.`);

        return { started: startedCount };
    } catch (error) {
        console.error('[LazyStart] Error:', error);
        return { started: 0, error };
    }
}

/**
 * Ends an auction manually.
 */
export async function endAuctionService(auctionId: string) {
    const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        select: { id: true, status: true, name: true, currentPrice: true, winnerId: true }
    });

    if (!auction) throw new Error("Auction not found");
    if (auction.status === 'COMPLETED') return { success: false, message: "Already completed" };

    const updated = await prisma.auction.update({
        where: { id: auctionId },
        data: {
            status: 'COMPLETED',
            endedAt: new Date(),
        }
    });

    // Notify everyone (fire-and-forget - don't block on Pusher)
    pusherServer.trigger(`auction-${auctionId}`, 'auction-ended', {
        auctionId,
        winnerId: auction.winnerId,
        finalPrice: auction.currentPrice
    }).catch(err => console.error('[EndAuction] Pusher failed:', err));

    pusherServer.trigger('global-auctions', 'auction-ended', {
        id: auctionId
    }).catch(err => console.error('[EndAuction] Pusher failed:', err));

    return { success: true, auction: updated };
}
/**
 * Checks for auctions that need status updates and transitions them.
 * Called lazily when users load the site.
 */
export async function checkAndUpdateAuctionStatuses() {
    try {
        const now = new Date();

        // 1. Find SCHEDULED auctions that should enter WAITING_ROOM (5 min before start)
        const waitingRoomCandidates = await prisma.auction.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: {
                    lte: new Date(now.getTime() + 5 * 60 * 1000), // 5 min from now
                    gt: now // But not yet past
                }
            },
            select: { id: true, name: true, scheduledAt: true }
        });

        console.log(`[StatusCheck] Found ${waitingRoomCandidates.length} auctions ready for waiting room`);

        // Transition to WAITING_ROOM
        for (const auction of waitingRoomCandidates) {
            await prisma.auction.update({
                where: { id: auction.id },
                data: { status: 'WAITING_ROOM' }
            });

            // Notify via Pusher
            await pusherServer.trigger('global-auctions', 'auction-waiting-room', {
                id: auction.id,
                name: auction.name,
                scheduledAt: auction.scheduledAt,
                status: 'WAITING_ROOM'
            });

            console.log(`[StatusCheck] ✅ ${auction.name} → WAITING_ROOM`);
        }

        // 2. Find WAITING_ROOM auctions that should start (reached scheduled time)
        const dueAuctions = await prisma.auction.findMany({
            where: {
                status: 'WAITING_ROOM',
                scheduledAt: { lte: now }
            },
            select: { id: true, name: true }
        });

        console.log(`[StatusCheck] Found ${dueAuctions.length} auctions ready to start`);

        // Start them
        const results = await Promise.allSettled(
            dueAuctions.map(a => startAuctionService(a.id))
        );

        const startedCount = results.filter(r => r.status === 'fulfilled').length;
        console.log(`[StatusCheck] ✅ Started ${startedCount}/${dueAuctions.length} auctions`);

        return {
            waitingRoom: waitingRoomCandidates.length,
            started: startedCount
        };
    } catch (error) {
        console.error('[StatusCheck] Error:', error);
        return { waitingRoom: 0, started: 0, error };
    }
}
