import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

/**
 * POST /api/auctions/[id]/claim
 * "Pay & Claim" — deducts the winning price from the winner's balance
 * and transfers all auction artifacts to their inventory.
 * Only the winner can call this, and only within the 24-hour claim window.
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const user = await getUserFromToken();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id: auctionId } = await params;

        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: {
                artifacts: { include: { artifact: true } }
            }
        });

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        if (auction.status !== 'COMPLETED') {
            return NextResponse.json({ error: 'Auction is not completed yet' }, { status: 400 });
        }

        if (auction.winnerId !== user.userId) {
            return NextResponse.json({ error: 'Only the winner can claim artifacts' }, { status: 403 });
        }

        if (auction.isClaimed) {
            return NextResponse.json({ error: 'Already claimed', claimed: true }, { status: 400 });
        }

        // Check claim window hasn't expired
        if (auction.claimExpiresAt && new Date() > auction.claimExpiresAt) {
            return NextResponse.json({ error: 'Claim window has expired (24h limit)' }, { status: 400 });
        }

        // Check winner still has sufficient balance
        const winner = await prisma.user.findUnique({ where: { id: user.userId } });
        if (!winner) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const finalPrice = Number(auction.currentPrice);
        if (Number(winner.balance) < finalPrice) {
            return NextResponse.json({
                error: `Insufficient balance. You need ₹${finalPrice.toLocaleString()} but have ₹${Number(winner.balance).toLocaleString()}`,
                required: finalPrice,
                available: Number(winner.balance),
            }, { status: 400 });
        }

        // Deduct balance, set isClaimed, transfer artifacts — all in one transaction
        const artifactIds = auction.artifacts.map(a => a.artifactId);

        await prisma.$transaction([
            // 1. Deduct winning price from winner's balance
            prisma.user.update({
                where: { id: user.userId },
                data: { balance: { decrement: finalPrice } },
            }),
            // 2. Mark auction as claimed
            prisma.auction.update({
                where: { id: auctionId },
                data: { isClaimed: true },
            }),
            // 3. Transfer all artifacts to winner
            prisma.artifact.updateMany({
                where: { id: { in: artifactIds } },
                data: { ownerId: user.userId },
            }),
        ]);

        console.log(`[Claim] ✅ User ${user.userId} paid ₹${finalPrice} and claimed ${artifactIds.length} artifacts from auction ${auctionId}`);

        return NextResponse.json({
            success: true,
            claimed: artifactIds.length,
            amountPaid: finalPrice,
            message: `₹${finalPrice.toLocaleString()} paid. ${artifactIds.length} artifact(s) added to your inventory!`
        });

    } catch (error: any) {
        console.error('[Claim] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
