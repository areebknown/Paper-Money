import { NextResponse } from 'next/server';
import { startAuctionService } from '@/lib/auction-service';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;

        console.log(`[ManualStart] Request received for ${id}`);

        const result = await startAuctionService(id);

        if (!result.success) {
            return NextResponse.json(
                { error: result.message, auction: result.auction },
                { status: 400 }
            );
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('POST /api/auctions/[id]/start error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to start auction' },
            { status: 500 }
        );
    }
}
