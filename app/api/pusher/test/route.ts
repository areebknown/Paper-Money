import { NextResponse } from 'next/server';
import { triggerPusherEvent } from '@/lib/pusher-server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const channel = searchParams.get('channel') || 'test-channel';

    // Log env var presence (not values for security)
    const config = {
        PUSHER_APP_ID: process.env.PUSHER_APP_ID ? `set (${process.env.PUSHER_APP_ID.length} chars)` : '❌ MISSING',
        NEXT_PUBLIC_PUSHER_KEY: process.env.NEXT_PUBLIC_PUSHER_KEY ? `set (${process.env.NEXT_PUBLIC_PUSHER_KEY.length} chars, starts: ${process.env.NEXT_PUBLIC_PUSHER_KEY.slice(0, 4)}...)` : '❌ MISSING',
        PUSHER_SECRET: process.env.PUSHER_SECRET ? `set (${process.env.PUSHER_SECRET.length} chars)` : '❌ MISSING',
        NEXT_PUBLIC_PUSHER_CLUSTER: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || '❌ MISSING (defaulting to ap2)',
    };

    console.log('[Pusher Test] Config:', config);

    // Fire a test event
    try {
        await triggerPusherEvent(channel, 'test-event', {
            message: 'Hello from server!',
            timestamp: Date.now(),
            channel,
        });
        return NextResponse.json({ success: true, config, channel, message: 'Test event fired - check your Pusher debug panel' });
    } catch (err: any) {
        return NextResponse.json({ success: false, config, error: err.message }, { status: 500 });
    }
}
