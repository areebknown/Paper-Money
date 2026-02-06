import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
    req: Request,
    props: { params: Promise<{ id: string }> }
) {
    const params = await props.params;
    try {
        const auctionId = params.id;

        const bids = await prisma.auctionBid.findMany({
            where: { auctionId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
            orderBy: {
                amount: 'desc',
            },
            take: 50, // Limit to 50 most recent bids
        });

        return NextResponse.json({ bids });
    } catch (error) {
        console.error('Get bids error:', error);
        return NextResponse.json({ error: 'Failed to fetch bids' }, { status: 500 });
    }
}
