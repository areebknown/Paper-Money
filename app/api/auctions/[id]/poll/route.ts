import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Polling endpoint for real-time auction updates.
 * Returns new bids since `since` timestamp, current price, and auction status.
 * Called every 2s by clients as a reliable fallback to Pusher.
 *
 * GET /api/auctions/[id]/poll?since=<timestamp_ms>
 */
export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    const auctionId = params.id;
    const { searchParams } = new URL(req.url);
    const since = parseInt(searchParams.get('since') || '0', 10);
    const sinceDate = new Date(since);

    try {
        // Fetch auction status + current price
        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            select: {
                id: true,
                status: true,
                currentPrice: true,
                startingPrice: true,
                endedAt: true,
                startedAt: true,
                winnerId: true,
                name: true,
                winner: {
                    select: { id: true, username: true }
                }
            }
        });

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Fetch last 50 bids unconditionally (avoids clock skew issues)
        const newBids = await prisma.auctionBid.findMany({
            where: { auctionId },
            include: {
                bidder: { select: { id: true, username: true } }
            },
            orderBy: { timestamp: 'desc' }, // Get newest first
            take: 50,
        });

        const currentPrice = Number(auction.currentPrice || auction.startingPrice);

        // Derive lastBidAt and lastBidderId from the most recent bid
        // newBids is in desc order before reverse, so first element is newest
        const latestBid = newBids.length > 0 ? newBids[0] : null;
        const lastBidAt = latestBid ? latestBid.timestamp.getTime() : null;
        const lastBidderId = latestBid ? latestBid.bidderId : null;

        // Reverse to chronological order for the client
        const formattedBids = newBids.reverse().map(bid => ({
            id: bid.id,
            userId: bid.bidderId,
            username: bid.bidder?.username ?? 'Unknown',
            amount: Number(bid.amount),
            createdAt: bid.timestamp.toISOString(),
        }));

        return NextResponse.json({
            status: auction.status,
            currentPrice,
            endedAt: auction.endedAt?.toISOString() ?? null,
            startedAt: auction.startedAt?.toISOString() ?? null,
            newBids: formattedBids,
            // Timer sync — server tells client when the last bid was placed
            lastBidAt,
            lastBidderId,
            // Winner info (only set when COMPLETED)
            winnerId: auction.winnerId ?? null,
            winnerUsername: auction.winner?.username ?? null,
            finalPrice: auction.status === 'COMPLETED' ? currentPrice : null,
            auctionName: auction.name,
            serverTime: Date.now(),
        }, {
            headers: {
                'Cache-Control': 'no-store, max-age=0',
            }
        });
    } catch (error: any) {
        console.error('[Poll] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
