import { NextResponse } from 'next/server';
import { qstash } from '@/lib/qstash';

export async function GET() {
    return NextResponse.json({
        qstash_token_exists: !!process.env.QSTASH_TOKEN,
        qstash_token_prefix: process.env.QSTASH_TOKEN ? process.env.QSTASH_TOKEN.substring(0, 5) : null,
        qstash_url: process.env.QSTASH_URL,
        qstash_current_key_exists: !!process.env.QSTASH_CURRENT_SIGNING_KEY,
        qstash_next_key_exists: !!process.env.QSTASH_NEXT_SIGNING_KEY,
        vercel_url: process.env.VERCEL_URL,
        next_public_app_url: process.env.NEXT_PUBLIC_APP_URL,
        node_env: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
}

export async function POST() {
    try {
        if (!process.env.QSTASH_TOKEN) {
            return NextResponse.json({ error: 'Missing QSTASH_TOKEN on server' }, { status: 500 });
        }

        const scheduledTime = new Date(Date.now() + 60000); // 1 minute from now

        // This simulates exactly what happens when you create an auction
        await qstash.scheduleAuctionStart("test-auction-123", scheduledTime);

        return NextResponse.json({
            success: true,
            message: "Successfully called qstash.scheduleAuctionStart from inside Vercel. Check Upstash Dashboard!"
        });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
