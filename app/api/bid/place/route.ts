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

        // Get auction with artifacts
        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: {
                artifacts: {
                    include: {
                        artifact: true,
                    },
                },
            },
        });

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        // Verify auction is live
        if (auction.status !== 'LIVE') {
            return NextResponse.json({ error: 'Auction is not live' }, { status: 400 });
        }

        // Check if auction has ended (server time validation)
        const now = new Date();
        const endedAt = new Date(auction.endedAt);
        if (now >= endedAt) {
            return NextResponse.json({ error: 'Auction has ended' }, { status: 400 });
        }

        // Get current user balance
        const currentUser = await prisma.user.findUnique({
            where: { id: user.userId },
        });

        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Check if user has sufficient balance
        const userBalance = Number(currentUser.balance);
        if (userBalance < amount) {
            return NextResponse.json({
                error: 'Insufficient balance',
                required: amount,
                available: userBalance
            }, { status: 400 });
        }

        // Get current highest bid
        const highestBid = await prisma.auctionBid.findFirst({
            where: { auctionId },
            orderBy: { amount: 'desc' },
        });

        const minBidAmount = highestBid ? Number(highestBid.amount) + 100 : Number(auction.startingPrice);

        if (amount < minBidAmount) {
            return NextResponse.json({
                error: 'Bid too low',
                minimum: minBidAmount
            }, { status: 400 });
        }

        // Create bid
        const bid = await prisma.auctionBid.create({
            data: {
                auctionId,
                bidderId: user.userId,
                amount,
            },
        });

        // Deduct bid amount from user balance
        await prisma.user.update({
            where: { id: user.userId },
            data: {
                balance: {
                    decrement: amount,
                },
            },
        });

        // Update auction current bid
        await prisma.auction.update({
            where: { id: auctionId },
            data: {
                currentPrice: amount,
            },
        });

        // Extend countdown if bid placed in last 30 seconds
        const timeRemaining = endedAt.getTime() - now.getTime();
        if (timeRemaining > 0 && timeRemaining < 30000) {
            const newEndedAt = new Date(now.getTime() + 10000); // Add 10 seconds
            await prisma.auction.update({
                where: { id: auctionId },
                data: { endedAt: newEndedAt },
            });
        }

        // Trigger Pusher event for real-time update
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
            newBalance: userBalance - amount
        });

    } catch (error) {
        console.error('Place bid error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
