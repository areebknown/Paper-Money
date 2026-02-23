import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

import { checkAndUpdateAuctionStatuses } from '@/lib/auction-service';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Legacy lazy-loading logic removed to strictly test QStash automation.

        const { id } = await params;
        const auction = await prisma.auction.findUnique({
            where: { id },
            include: {
                artifacts: {
                    include: {
                        artifact: true,
                    },
                },
                bids: {
                    orderBy: {
                        amount: 'desc',
                    },
                    take: 10,
                    include: {
                        bidder: {
                            select: {
                                username: true,
                            },
                        },
                    },
                },
            },
        });

        if (!auction) {
            return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
        }

        return NextResponse.json({ auction });
    } catch (error) {
        console.error('GET /api/auctions/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

import { getUserIdFromRequest } from '@/lib/auth';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromRequest();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const { id } = await params;

        await prisma.auction.delete({
            where: { id },
        });

        return NextResponse.json({ success: true, message: 'Auction deleted successfully' });
    } catch (error) {
        console.error('DELETE /api/auctions/[id] error:', error);
        return NextResponse.json({ error: 'Failed to delete auction' }, { status: 500 });
    }
}
