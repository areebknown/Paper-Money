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

        // Check isClaimed via raw SQL — bypasses any stale Prisma type bundle on Vercel
        const claimStatus = await prisma.$queryRaw<Array<{ isClaimed: boolean }>>`
            SELECT "isClaimed" FROM "Auction" WHERE id = ${auctionId}
        `;
        if (claimStatus[0]?.isClaimed) {
            return NextResponse.json({ error: 'Already claimed', claimed: true }, { status: 400 });
        }

        const auction = await prisma.auction.findUnique({
            where: { id: auctionId },
            include: { artifacts: { include: { artifact: true } } },
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

        // Check claim window (claimExpiresAt may be null for older auctions — allow those)
        const claimExpiresAt = (auction as any).claimExpiresAt;
        if (claimExpiresAt && new Date() > new Date(claimExpiresAt)) {
            return NextResponse.json({ error: 'Claim window has expired (24h limit)' }, { status: 400 });
        }

        // Check winner still has sufficient balance
        const winner = await prisma.user.findUnique({ where: { id: user.userId } });
        if (!winner) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const finalPrice = Number(auction.currentPrice);
        if (Number(winner.balance) < finalPrice) {
            return NextResponse.json({
                error: `Insufficient balance. You need ₹${finalPrice.toLocaleString()} but only have ₹${Number(winner.balance).toLocaleString()}.`,
                required: finalPrice,
                available: Number(winner.balance),
            }, { status: 400 });
        }

        const artifactIds = auction.artifacts.map(a => a.artifactId);

        // ── Atomic transaction ───────────────────────────────────────────────────
        // Interactive transaction used so we can mix Prisma model calls with
        // $executeRaw for isClaimed (which uses a raw column bypass to avoid
        // any stale Prisma client type issues on Vercel's bundled deployment).
        await prisma.$transaction(async (tx) => {
            // 1. Deduct winning price from winner's balance
            await tx.user.update({
                where: { id: user.userId },
                data: { balance: { decrement: finalPrice } },
            });

            // 2. Mark auction as claimed (raw SQL — guaranteed to work regardless of Prisma type cache)
            await tx.$executeRaw`UPDATE "Auction" SET "isClaimed" = true WHERE id = ${auctionId}`;

            // 3. Transfer all artifacts to winner's inventory
            if (artifactIds.length > 0) {
                await tx.artifact.updateMany({
                    where: { id: { in: artifactIds } },
                    data: { ownerId: user.userId },
                });
            }
        });

        console.log(`[Claim] ✅ User ${user.userId} paid ₹${finalPrice} and claimed ${artifactIds.length} artifact(s) from auction ${auctionId}`);

        return NextResponse.json({
            success: true,
            claimed: artifactIds.length,
            amountPaid: finalPrice,
            message: `₹${finalPrice.toLocaleString()} paid. ${artifactIds.length} artifact(s) added to your inventory!`,
        });

    } catch (error: any) {
        console.error('[Claim] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
