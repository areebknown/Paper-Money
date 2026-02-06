import PusherClient from 'pusher-js';

let pusherClient: PusherClient | null = null;

export function getPusherClient(): PusherClient {
    if (!pusherClient) {
        const key = process.env.NEXT_PUBLIC_PUSHER_KEY;
        if (!key) {
            console.error('Pusher Key is missing! Check .env file');
            // Retaining empty string to prevent full crash if just viewing, but logging error
        }
        pusherClient = new PusherClient(
            key || 'MISSING_KEY',
            {
                cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER || 'ap2',
            }
        );
    }
    return pusherClient;
}
