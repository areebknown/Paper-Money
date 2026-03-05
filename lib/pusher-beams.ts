import PushNotifications from '@pusher/push-notifications-server';

/**
 * Server-side Pusher Beams client.
 *
 * Instance ID  → find in Pusher Beams dashboard → "Keys" tab (UUID format)
 * Secret Key   → same tab, the long alphanumeric string
 */
export const beams = new PushNotifications({
    instanceId: process.env.PUSHER_BEAMS_INSTANCE_ID || '',
    secretKey: process.env.PUSHER_BEAMS_SECRET_KEY || '',
});

export async function sendAuctionBeamsNotification(
    userId: string,
    title: string,
    body: string,
) {
    if (!process.env.PUSHER_BEAMS_INSTANCE_ID || !process.env.PUSHER_BEAMS_SECRET_KEY) {
        console.warn('[Beams] Env vars not set — skipping push notification');
        return;
    }
    try {
        await beams.publishToInterests(['user-' + userId], {
            web: {
                notification: {
                    title,
                    body,
                    icon: 'https://wars-bid.vercel.app/icon-192.png',
                    deep_link: 'https://wars-bid.vercel.app/home',
                    requireInteraction: true,
                } as any,
            },
        });
        console.log(`[Beams] ✅ Sent "${title}" to user ${userId}`);
    } catch (err) {
        // Fire-and-forget — never block auction status updates on a notification failure
        console.error('[Beams] ❌ Failed to send notification:', err);
    }
}
