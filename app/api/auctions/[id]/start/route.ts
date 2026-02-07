import { NextResponse } from 'next/server';

// Simple test endpoint to verify dynamic routing works
export async function GET() {
    return NextResponse.json({
        message: 'Start route is working!',
        timestamp: new Date().toISOString()
    });
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    console.log('[START API] ========== REQUEST RECEIVED ==========');
    console.log('[START API] Headers:', Object.fromEntries(req.headers.entries()));
    console.log('[START API] URL:', req.url);

    try {
        const { id } = await params;
        console.log('[START API] Auction ID:', id);

        // Temporary: Just return success to test if route works
        return NextResponse.json({
            test: true,
            message: 'Route is accessible',
            auctionId: id
        });

        /* Original code - uncomment after testing
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
        */
    } catch (error: any) {
        console.error('[START API] 💥 FATAL ERROR:', error);
        console.error('[START API] Error stack:', error.stack);
        return NextResponse.json(
            { error: error.message || 'Failed to start auction', stack: error.stack },
            { status: 500 }
        );
    }
}
