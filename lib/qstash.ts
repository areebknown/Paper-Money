import { Client } from '@upstash/qstash';

const client = new Client({
    token: process.env.QSTASH_TOKEN || '',
    baseUrl: process.env.QSTASH_URL,
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';

export const qstash = {
    /**
     * Schedules a delayed message to start an auction.
     */
    async scheduleAuctionStart(auctionId: string, scheduledAt: Date) {
        if (!process.env.QSTASH_TOKEN) return null;

        const delaySeconds = Math.max(0, Math.floor((scheduledAt.getTime() - Date.now()) / 1000));

        console.log(`[QSTASH] Scheduling auction ${auctionId} for ${scheduledAt.toISOString()} (delay: ${delaySeconds}s)`);

        return await client.publishJSON({
            url: `${APP_URL}/api/webhooks/qstash`,
            body: {
                type: 'auction-start',
                auctionId
            },
            delay: delaySeconds,
            // Re-try logic for high-stakes auction starts
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
