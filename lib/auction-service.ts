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
        },
    });

    // 3. Trigger Pusher Events

    // A. Specific Channel (For the Bid Page)
    // This tells anyone on /bid/[id] to wake up
    await pusherServer.trigger(`auction-${auctionId}`, 'status-change', {
        status: 'LIVE',
        auctionId: auctionId,
        startedAt: updatedAuction.startedAt,
    });

    // B. Global Channel (For Home/Admin Lists)
    // This tells the home page list to flip the badge to LIVE
    await pusherServer.trigger('global-auctions', 'auction-started', {
        id: auctionId,
        name: updatedAuction.name,
        status: 'LIVE',
        startedAt: updatedAuction.startedAt,
    });

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
