import { NextResponse } from 'next/server';
import { endAuctionService } from '@/lib/auction-service';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('[END API] ========== REQUEST RECEIVED ==========');

    try {
        const { id } = await params;
        console.log('[END API] Auction ID:', id);

        console.log('[END API] Calling endAuctionService...');
        const result = await endAuctionService(id);
        console.log('[END API] Service result:', result);

        if (!result.success) {
            console.log('[END API] ⚠️ Service returned failure:', result.message);
        } else {
            console.log('[END API] ✅ Success!');
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('[END API] 💥 FATAL ERROR:', error);
        console.error('[END API] Error stack:', error.stack);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
