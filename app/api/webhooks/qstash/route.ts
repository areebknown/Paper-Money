import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { updateMarketPrices } from '@/lib/market-engine';
import { startAuctionService } from '@/lib/auction-service';

// Initialize QStash Receiver for signature verification
const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function POST(req: NextRequest) {
    console.log('[QSTASH WEBHOOK] Received request');

    // 1. Verify Signature (Security)
    if (process.env.NODE_ENV === 'production') {
        const signature = req.headers.get('upstash-signature');
        if (!signature) {
            return new NextResponse('Missing signature', { status: 401 });
        }

        const body = await req.text();
        const isValid = await receiver.verify({
            signature,
            body,
        }).catch(err => {
            console.error('[QSTASH WEBHOOK] Verification error:', err);
            return false;
        });

        if (!isValid) {
            console.error('[QSTASH WEBHOOK] Invalid signature');
            return new NextResponse('Invalid signature', { status: 401 });
        }

        // Parse body after verification
        try {
            const data = JSON.parse(body);
            return await handleMessage(data);
        } catch (error) {
            console.error('[QSTASH WEBHOOK] JSON Parse Error:', error);
            return new NextResponse('Invalid JSON', { status: 400 });
        }
    } else {
        // Skip verification in development for easier testing
        const data = await req.json();
        return await handleMessage(data);
    }
}

async function handleMessage(data: any) {
    const { type, auctionId } = data;

    console.log(`[QSTASH WEBHOOK] Handling task type: ${type}`);

    try {
        switch (type) {
            case 'market-sync':
                console.log('[QSTASH WEBHOOK] Triggering daily market sync...');
                await updateMarketPrices(false); // false = scheduled (respects 20h limit)
                return NextResponse.json({ success: true, message: 'Market sync complete' });

            case 'auction-start':
                if (!auctionId) {
                    return NextResponse.json({ error: 'Missing auctionId' }, { status: 400 });
                }
                console.log(`[QSTASH WEBHOOK] Starting auction: ${auctionId}`);
                await startAuctionService(auctionId);
                return NextResponse.json({ success: true, message: `Auction ${auctionId} started` });

            default:
                console.warn(`[QSTASH WEBHOOK] Unknown task type: ${type}`);
                return NextResponse.json({ error: 'Unknown task type' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[QSTASH WEBHOOK] Action failed:', error);
        return NextResponse.json({
            error: 'Task execution failed',
            details: error.message
        }, { status: 500 });
    }
}
