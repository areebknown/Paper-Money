import Pusher from 'pusher';

const appId = process.env.PUSHER_APP_ID || '';
const key = process.env.NEXT_PUBLIC_PUSHER_KEY || '';
const secret = process.env.PUSHER_SECRET || '';
const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2';

// Log config on startup so we can verify in Vercel logs
console.log('[Pusher Server] Config check:', {
    appId: appId ? `${appId.slice(0, 4)}... (${appId.length} chars)` : '❌ MISSING',
    key: key ? `${key.slice(0, 4)}... (${key.length} chars)` : '❌ MISSING',
    secret: secret ? `set (${secret.length} chars)` : '❌ MISSING',
    cluster,
});

// Server-side Pusher instance
export const pusherServer = new Pusher({
    appId,
    key,
    secret,
    cluster,
    useTLS: true,
});

// Trigger a Pusher event with full error details
export async function triggerPusherEvent(
    channel: string,
    event: string,
    data: any
): Promise<void> {
    try {
        const result = await pusherServer.trigger(channel, event, data);
        console.log(`[Pusher] ✅ Triggered ${event} on ${channel}`, result);
    } catch (error: any) {
        console.error(`[Pusher] ❌ FAILED to trigger ${event} on ${channel}`);
        console.error('[Pusher] Status:', error.status);
        console.error('[Pusher] Body:', error.body);
        console.error('[Pusher] Message:', error.message);
        // Don't throw - let the calling function continue
    }
}
