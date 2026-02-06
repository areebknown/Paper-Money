import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { pusherServer } from '@/lib/pusher';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        // 1. Update Auction in DB
        const auction = await prisma.auction.update({
            where: { id },
            data: {
                status: 'LIVE',
                startedAt: new Date(),
            },
        });

        // 2. Trigger Pusher Event (for immediate UI update)
        await pusherServer.trigger(`auction-${id}`, 'status-change', {
            status: 'LIVE',
            auctionId: id,
        });

        // 3. Trigger Global Event (optional, for home page updates)
        await pusherServer.trigger('global-auctions', 'auction-started', {
            id,
            name: auction.name,
            status: 'LIVE',
        });

        return NextResponse.json({ success: true, auction });
    } catch (error) {
        console.error('POST /api/auctions/[id]/start error:', error);
        return NextResponse.json({ error: 'Failed to start auction' }, { status: 500 });
    }
}
