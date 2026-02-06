import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
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
