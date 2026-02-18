import PusherClient from 'pusher-js';

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
    if (!pusherClient) {
        pusherClient = new PusherClient(
            process.env.NEXT_PUBLIC_PUSHER_KEY || 'MISSING_KEY',
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
                // Enable logging in dev to debug connection issues
                enabledTransports: ['ws', 'wss'],
            }
        );
    }
    return pusherClient;
}

/**
 * Fully disconnect and destroy the Pusher singleton.
 * Call this when you need a clean slate (e.g. on page unmount in dev StrictMode).
 */
export function disconnectPusher(): void {
    if (pusherClient) {
        pusherClient.disconnect();
        pusherClient = null;
    }
}
