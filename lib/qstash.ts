import { Client } from '@upstash/qstash';

const client = new Client({
    token: process.env.QSTASH_TOKEN || '',
    baseUrl: process.env.QSTASH_URL,
});

// Helper to reliably get the base URL
const getBaseUrl = () => {
    if (process.env.NEXT_PUBLIC_APP_URL) {
        return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''); // Remove trailing slash if present
    }
    if (process.env.VERCEL_URL) {
        return `https://${process.env.VERCEL_URL}`;
    }
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }
    return 'https://paper-money.vercel.app';
};

const APP_URL = getBaseUrl();

export const qstash = {
    /**
     * Schedules a delayed message to start an auction.
     */
    async scheduleAuctionStart(auctionId: string, scheduledAt: Date) {
        if (!process.env.QSTASH_TOKEN) {
            console.error('[QSTASH] Error: Missing QSTASH_TOKEN');
            return null;
        }

        const now = Date.now();
        const startDelaySeconds = Math.max(0, Math.floor((scheduledAt.getTime() - now) / 1000));
        const waitingRoomDelaySeconds = Math.max(0, startDelaySeconds - 300);

        console.log(`[QSTASH] Scheduling Auction: ${auctionId}`);
        console.log(`[QSTASH] Targeting URL Base: ${APP_URL}`);
        console.log(`[QSTASH] Current Time (UTC): ${new Date(now).toISOString()}`);
        console.log(`[QSTASH] Target Time (UTC): ${scheduledAt.toISOString()}`);
        console.log(`[QSTASH] Calculated Delay: Waiting Room (${waitingRoomDelaySeconds}s), Live (${startDelaySeconds}s)`);

        console.log(`[QSTASH] Scheduling WAITING_ROOM for auction ${auctionId}`);
        await client.publishJSON({
            url: `${APP_URL}/api/webhooks/qstash`,
            body: {
                type: 'auction-waiting-room',
                auctionId
            },
            delay: waitingRoomDelaySeconds,
            retries: 3
        }).catch(err => console.error('[QSTASH] Failed to schedule waiting room webhook:', err));

        console.log(`[QSTASH] Scheduling LIVE for auction ${auctionId}`);
        return await client.publishJSON({
            url: `${APP_URL}/api/webhooks/qstash`,
            body: {
                type: 'auction-start',
                auctionId
            },
            delay: startDelaySeconds,
            retries: 3
        });
    },

    /**
     * Schedules or updates the daily market sync cron job.
     */
    async scheduleDailyMarketSync(cronExpression: string = '0 0 * * *') {
        if (!process.env.QSTASH_TOKEN) return null;

        console.log(`[QSTASH] Scheduling daily market sync with cron: ${cronExpression}`);

        // QStash allows creating schedules via the API
        return await client.schedules.create({
            destination: `${APP_URL}/api/webhooks/qstash`,
            cron: cronExpression,
            body: JSON.stringify({
                type: 'market-sync'
            })
        });
    }
};

export default client;
