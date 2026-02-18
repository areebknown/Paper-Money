import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserFromToken } from '@/lib/auth';

/**
 * POST /api/auctions/[id]/claim
 * Transfers all artifacts from a completed auction to the winner's inventory.
 * Only the winner can call this.
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
                artifacts: {
                    include: { artifact: true }
                }
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

        // Transfer all artifacts to the winner
        const artifactIds = auction.artifacts.map(a => a.artifactId);

        await prisma.artifact.updateMany({
            where: { id: { in: artifactIds } },
            data: { ownerId: user.userId }
        });

        console.log(`[Claim] User ${user.userId} claimed ${artifactIds.length} artifacts from auction ${auctionId}`);

        return NextResponse.json({
            success: true,
            claimed: artifactIds.length,
            message: `${artifactIds.length} artifact(s) added to your inventory!`
        });

    } catch (error: any) {
        console.error('[Claim] Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
