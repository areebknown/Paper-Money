import Pusher from 'pusher';

// Server-side Pusher instance
export const pusherServer = new Pusher({
    appId: process.env.PUSHER_APP_ID || '',
    key: process.env.NEXT_PUBLIC_PUSHER_KEY || '',
    secret: process.env.PUSHER_SECRET || '',
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
    useTLS: true,
});

// Trigger a Pusher event
export async function triggerPusherEvent(
    channel: string,
    event: string,
    data: any
): Promise<void> {
    try {
        await pusherServer.trigger(channel, event, data);
        console.log(`[Pusher] Triggered ${event} on ${channel}`);
    } catch (error) {
        console.error('[Pusher] Error triggering event:', error);
        throw error;
    }
}
