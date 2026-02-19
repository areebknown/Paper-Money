import { NextResponse } from 'next/server';
import { startAuctionService } from '@/lib/auction-service';
import { getUserFromToken } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Only admins can manually start an auction
        const user = await getUserFromToken();
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { id } = await params;
        console.log('[START API] Starting auction:', id);

        const result = await startAuctionService(id);

        if (!result.success) {
            console.log('[START API] ❌ Service returned failure:', result.message);
            return NextResponse.json(
                { error: result.message, auction: result.auction },
                { status: 400 }
            );
        }

        console.log('[START API] ✅ Auction started successfully:', id);
        return NextResponse.json(result);

    } catch (error: any) {
        console.error('[START API] 💥 Error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to start auction' },
            { status: 500 }
        );
    }
}
