import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';
import { triggerPusherEvent } from '@/lib/pusher-server';

export async function POST(req: Request) {
    try {
        const user = await getUserFromToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { auctionId, amount } = await req.json();
        if (!auctionId || !amount || amount <= 0) {
            return NextResponse.json({ error: 'Invalid bid data' }, { status: 400 });
        }

        // Quick pre-checks (no lock yet — just read-only validation)
        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            select: { id: true, status: true, endedAt: true, startingPrice: true },
        });

        if (!auction) return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        if (auction.status !== 'LIVE') return NextResponse.json({ error: 'Auction is not live' }, { status: 400 });

        const now = new Date();
        const endedAt = auction.endedAt ? new Date(auction.endedAt) : null;
        if (!endedAt) return NextResponse.json({ error: 'Auction end time not set' }, { status: 400 });
        if (now >= endedAt) return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });

        // Balance check (read-only, outside lock — fast path)
        const currentUser = await prisma.user.findUnique({ where: { id: user.userId } });
        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const userBalance = Number(currentUser.balance);
        if (userBalance < amount) {
            return NextResponse.json({
                error: 'Insufficient balance',
                required: amount,
                available: userBalance,
            }, { status: 400 });
        }

        // ── Atomic bid placement with PostgreSQL row lock ────────────────────────
        // SELECT ... FOR UPDATE acquires an exclusive lock on the auction row.
        // This means only ONE bid request can proceed at a time per auction —
        // preventing the "twin-bubble" race where two users bid simultaneously
        // and both pass the minimum check before either has written.
        let bid: any;
        try {
            bid = await prisma.$transaction(async (tx) => {
                // Lock the auction row exclusively for this transaction
                await tx.$queryRaw`SELECT id FROM "Auction" WHERE id = ${auctionId} FOR UPDATE`;

                // Re-check minimum INSIDE the lock (race-safe)
                const highest = await tx.auctionBid.findFirst({
                    where: { auctionId },
                    orderBy: { amount: 'desc' },
                });
                const minBid = highest
                    ? Number(highest.amount) + 100
                    : Number(auction.startingPrice);

                if (amount < minBid) {
                    const err: any = new Error('BID_TOO_LOW');
                    err.minimum = minBid;
                    throw err;
                }

                // Create the bid (only person inside the lock can do this now)
                const newBid = await tx.auctionBid.create({
                    data: { auctionId, bidderId: user.userId, amount },
                });

                // Update auction price + lastBidAt via raw SQL
                // (bypasses any stale Prisma type cache for lastBidAt field)
                await tx.$executeRaw`
                    UPDATE "Auction"
                    SET "currentPrice" = ${amount}::numeric, "lastBidAt" = now()
                    WHERE id = ${auctionId}
                `;

                return newBid;
            });
        } catch (err: any) {
            if (err.message === 'BID_TOO_LOW') {
                return NextResponse.json(
                    { error: 'Bid too low', minimum: err.minimum },
                    { status: 400 }
                );
            }
            throw err;
        }

        // Extend endedAt by 10s if bid placed in last 30s (non-critical, outside lock)
        const timeRemaining = endedAt.getTime() - now.getTime();
        if (timeRemaining > 0 && timeRemaining < 30000) {
            await prisma.$executeRaw`
                UPDATE "Auction" SET "endedAt" = now() + interval '10 seconds' WHERE id = ${auctionId}
            `;
        }

        // Broadcast to all connected clients
        await triggerPusherEvent(`auction-${auctionId}`, 'new-bid', {
            bidId: bid.id,
            userId: user.userId,
            username: currentUser.username,
            amount,
            timestamp: bid.timestamp,
            timeExtended: timeRemaining < 30000 && timeRemaining > 0,
        });

        return NextResponse.json({
            success: true,
            bid,
            newBalance: userBalance, // unchanged — deducted only at Pay & Claim
            newPrice: amount,
            bidId: bid.id,
            bidderId: user.userId,
            username: currentUser.username,
        });

    } catch (error) {
        console.error('Place bid error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
