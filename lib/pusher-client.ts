import PusherClient from 'pusher-js';

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
    if (!pusherClient) {
        pusherClient = new PusherClient(
            process.env.NEXT_PUBLIC_PUSHER_KEY || 'MISSING_KEY',
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
                // Do NOT restrict transports — let Pusher choose the best one.
                // Forcing ws-only causes error 1006 (abnormal close) on mobile/proxied networks.
                // Pusher will use WSS first and fall back to HTTP if needed.
                activityTimeout: 30000,   // ping server every 30s to keep connection alive
                pongTimeout: 10000,       // wait 10s for pong before reconnecting
            }
        );
    }
    return pusherClient;
}

/**
 * Fully disconnect and destroy the Pusher singleton.
 */
export function disconnectPusher(): void {
    if (pusherClient) {
        pusherClient.disconnect();
        pusherClient = null;
    }
}
