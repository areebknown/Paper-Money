import { Client } from '@upstash/qstash';

const client = new Client({
    token: process.env.QSTASH_TOKEN || '',
    baseUrl: process.env.QSTASH_URL,
});

// The URL QStash will POST webhooks to.
// Set QSTASH_WEBHOOK_URL in Vercel to override (e.g., https://wars-bid.vercel.app).
// This MUST be your production/public domain - NOT a preview deployment URL.
const WEBHOOK_BASE_URL = process.env.QSTASH_WEBHOOK_URL || 'https://wars-bid.vercel.app';

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
        console.log(`[QSTASH] Targeting URL Base: ${WEBHOOK_BASE_URL}`);
        console.log(`[QSTASH] Current Time (UTC): ${new Date(now).toISOString()}`);
        console.log(`[QSTASH] Target Time (UTC): ${scheduledAt.toISOString()}`);
        console.log(`[QSTASH] Calculated Delay: Waiting Room (${waitingRoomDelaySeconds}s), Live (${startDelaySeconds}s)`);

        console.log(`[QSTASH] Scheduling WAITING_ROOM for auction ${auctionId}`);
        await client.publishJSON({
            url: `${WEBHOOK_BASE_URL}/api/webhooks/qstash`,
            body: {
                type: 'auction-waiting-room',
                auctionId
            },
            delay: waitingRoomDelaySeconds,
            retries: 3
        }).catch(err => console.error('[QSTASH] Failed to schedule waiting room webhook:', err));

        console.log(`[QSTASH] Scheduling LIVE for auction ${auctionId}`);
        return await client.publishJSON({
            url: `${WEBHOOK_BASE_URL}/api/webhooks/qstash`,
            body: {
                type: 'auction-start',
                auctionId
            },
            delay: startDelaySeconds,
            retries: 3
        });
    },

    /**
     * Schedules a 24-hour claim expiry check for a completed auction.
     * If the winner hasn't paid by then, the auction will be voided.
     */
    async scheduleClaimExpiry(auctionId: string, delaySeconds: number = 86400) {
        if (!process.env.QSTASH_TOKEN) {
            console.warn('[QSTASH] Missing token — claim expiry not scheduled');
            return null;
        }
        return await client.publishJSON({
            url: `${WEBHOOK_BASE_URL}/api/webhooks/qstash`,
            body: { type: 'auction-claim-check', auctionId },
            delay: delaySeconds,
            retries: 2,
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
            destination: `${WEBHOOK_BASE_URL}/api/webhooks/qstash`,
            cron: cronExpression,
            body: JSON.stringify({
                type: 'market-sync'
            })
        });
    }
};

export default client;
