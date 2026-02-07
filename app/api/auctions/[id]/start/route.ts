import { NextResponse } from 'next/server';
import { startAuctionService } from '@/lib/auction-service';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('[START API] ========== REQUEST RECEIVED ==========');

    try {
        const { id } = await params;
        console.log('[START API] Auction ID:', id);

        console.log('[START API] Calling startAuctionService...');
        const result = await startAuctionService(id);
        console.log('[START API] Service result:', result);

        if (!result.success) {
            console.log('[START API] ❌ Service returned failure:', result.message);
            return NextResponse.json(
                { error: result.message, auction: result.auction },
                { status: 400 }
            );
        }

        console.log('[START API] ✅ Success! Returning result');
        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[START API] 💥 FATAL ERROR:', error);
        console.error('[START API] Error stack:', error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to start auction' },
            { status: 500 }
        );
    }
}
