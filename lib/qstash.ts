import { Client } from '@upstash/qstash';

const client = new Client({
    token: process.env.QSTASH_TOKEN || '',
    baseUrl: process.env.QSTASH_URL,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://paper-money.vercel.app');

export const qstash = {
    /**
     * Schedules a delayed message to start an auction.
     */
    async scheduleAuctionStart(auctionId: string, scheduledAt: Date) {
        if (!process.env.QSTASH_TOKEN) {
            console.error('[QSTASH] Error: Missing QSTASH_TOKEN');
            return null;
        }

        const startDelaySeconds = Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000));

        // Waiting room triggers exactly 5 minutes (300 seconds) before start
        const waitingRoomDelaySeconds = Math.max(0, startDelaySeconds - 300);

        console.log(`[QSTASH] Scheduling WAITING_ROOM for auction ${auctionId} (delay: ${waitingRoomDelaySeconds}s)`);
        await client.publishJSON({
            url: `${APP_URL}/api/webhooks/qstash`,
            body: {
                type: 'auction-waiting-room',
                auctionId
            },
            delay: waitingRoomDelaySeconds,
            retries: 3
        }).catch(err => console.error('[QSTASH] Failed to schedule waiting room webhook:', err));

        console.log(`[QSTASH] Scheduling LIVE for auction ${auctionId} (delay: ${startDelaySeconds}s)`);
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
