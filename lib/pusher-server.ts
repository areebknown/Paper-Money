import Pusher from 'pusher';

// Server-side Pusher instance
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID || '',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
    secret: process.env.PUSHER_SECRET || '',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    useTLS: true,
});

// Trigger a Pusher event (non-blocking)
export async function triggerPusherEvent(
    channel: string,
    event: string,
    data: any
): Promise<void> {
    try {
        await pusherServer.trigger(channel, event, data);
        console.log(`[Pusher] ✅ Triggered ${event} on ${channel}`);
    } catch (error: any) {
        // Log but don't throw - Pusher failures shouldn't break the app
        console.error(`[Pusher] ❌ Failed to trigger ${event} on ${channel}:`, error.message);
        console.error('[Pusher] Error details:', {
            status: error.status,
            body: error.body,
            error: error.toString()
        });
        // Don't throw - let the calling function continue
    }
}
