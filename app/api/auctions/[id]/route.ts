import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const auction = await prisma.auction.findUnique({
            where: { id: params.id },
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
                        user: {
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
