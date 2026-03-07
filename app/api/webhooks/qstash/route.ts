import { NextRequest, NextResponse } from 'next/server';
import { Receiver } from '@upstash/qstash';
import { updateMarketPrices } from '@/lib/market-engine';
import { startAuctionService } from '@/lib/auction-service';
import { prisma } from '@/lib/db';
import { pusherServer } from '@/lib/pusher-server';
import { sendAuctionBeamsNotification } from '@/lib/pusher-beams';

// Initialize QStash Receiver for signature verification
const receiver = new Receiver({
    currentSigningKey: process.env.QSTASH_CURRENT_SIGNING_KEY || '',
    nextSigningKey: process.env.QSTASH_NEXT_SIGNING_KEY || '',
});

export async function POST(req: NextRequest) {
    console.log('[QSTASH WEBHOOK] Received request');

    // Always verify signature, even in development, to ensure keys match
    const signature = req.headers.get('upstash-signature');
    if (!signature) {
        console.error('[QSTASH WEBHOOK] Missing signature header');
        return new NextResponse('Missing signature', { status: 401 });
    }

    const body = await req.text();

    // Log the first few characters of the signature and body to help debug
    console.log(`[QSTASH WEBHOOK] Verifying... Signature Starts: ${signature.substring(0, 10)}... Body Starts: ${body.substring(0, 20)}...`);
    console.log(`[QSTASH WEBHOOK] Current Key exists: ${!!process.env.QSTASH_CURRENT_SIGNING_KEY}, Next Key exists: ${!!process.env.QSTASH_NEXT_SIGNING_KEY}`);

    const isValid = await receiver.verify({
        signature,
        body,
    }).catch(err => {
        console.error('[QSTASH WEBHOOK] Verification error thrown:', err.message || err);
        return false;
    });

    if (!isValid) {
        console.error('[QSTASH WEBHOOK] Invalid signature. The URL or payload was altered, or the Signing Keys in Vercel do not match the Upstash Dashboard.');
        return new NextResponse('Invalid signature', { status: 401 });
    }

    console.log('[QSTASH WEBHOOK] Signature verified successfully');

    // Parse body after verification
    try {
        const data = JSON.parse(body);
        return await handleMessage(data);
    } catch (error) {
        console.error('[QSTASH WEBHOOK] JSON Parse Error:', error);
        return new NextResponse('Invalid JSON', { status: 400 });
    }
}

async function handleMessage(data: any) {
    const { type, auctionId } = data;

    console.log(`[QSTASH WEBHOOK] Handling task type: ${type}`);

    try {
        switch (type) {
            case 'market-sync':
                console.log('[QSTASH WEBHOOK] Triggering daily market sync...');
                await updateMarketPrices(false); // false = scheduled (respects 20h limit)
                return NextResponse.json({ success: true, message: 'Market sync complete' });

            case 'auction-waiting-room':
                if (!auctionId) {
                    return NextResponse.json({ error: 'Missing auctionId' }, { status: 400 });
                }
                console.log(`[QSTASH WEBHOOK] Entering waiting room for auction: ${auctionId}`);

                const currentAuction = await prisma.auction.findUnique({
                    where: { id: auctionId },
                    select: { status: true, name: true, scheduledAt: true }
                });

                if (!currentAuction) {
                    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
                }

                // If auction is already LIVE, COMPLETED, or VOID (usually manually started by admin), skip waiting room
                if (currentAuction.status !== 'SCHEDULED') {
                    console.log(`[QSTASH WEBHOOK] Skipping Waiting Room — auction is already ${currentAuction.status}`);
                    return NextResponse.json({ success: true, message: `Skipped: Auction is ${currentAuction.status}` });
                }

                const auction = await prisma.auction.update({
                    where: { id: auctionId },
                    data: { status: 'WAITING_ROOM' }
                });

                await pusherServer.trigger('global-auctions', 'auction-waiting-room', {
                    id: auction.id,
                    name: auction.name,
                    scheduledAt: auction.scheduledAt,
                    status: 'WAITING_ROOM'
                });

                // Send push notifications — MUST await so serverless fn doesn't terminate first
                const subs = await prisma.auctionNotificationSubscription.findMany({
                    where: { auctionId },
                    select: { userId: true },
                });
                await Promise.allSettled(
                    subs.map(({ userId }) =>
                        sendAuctionBeamsNotification(
                            userId,
                            `🔔 ${auction.name} — Waiting Room Open`,
                            'The auction waiting room is now open. Get ready to bid!',
                        )
                    )
                );

                return NextResponse.json({ success: true, message: `Auction ${auctionId} in waiting room` });

            case 'auction-start':
                if (!auctionId) {
                    return NextResponse.json({ error: 'Missing auctionId' }, { status: 400 });
                }
                console.log(`[QSTASH WEBHOOK] Starting auction: ${auctionId}`);

                const startAuctionDb = await prisma.auction.findUnique({
                    where: { id: auctionId },
                    select: { status: true }
                });

                if (!startAuctionDb) {
                    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
                }

                // If auction is already LIVE, COMPLETED, or VOID, skip start
                if (startAuctionDb.status !== 'SCHEDULED' && startAuctionDb.status !== 'WAITING_ROOM') {
                    console.log(`[QSTASH WEBHOOK] Skipping Start — auction is already ${startAuctionDb.status}`);
                    return NextResponse.json({ success: true, message: `Skipped: Auction is ${startAuctionDb.status}` });
                }

                await startAuctionService(auctionId);

                // Send live notifications — MUST await so serverless fn doesn't terminate first
                const liveSubs = await prisma.auctionNotificationSubscription.findMany({
                    where: { auctionId },
                    select: { userId: true },
                });
                await Promise.allSettled(
                    liveSubs.map(({ userId }) =>
                        sendAuctionBeamsNotification(
                            userId,
                            `🔴 LIVE NOW — Auction Started!`,
                            'The auction is live! Place your bid now.',
                        )
                    )
                );

                return NextResponse.json({ success: true, message: `Auction ${auctionId} started` });

            case 'auction-claim-check':
                if (!auctionId) {
                    return NextResponse.json({ error: 'Missing auctionId' }, { status: 400 });
                }
                console.log(`[QSTASH WEBHOOK] Claim expiry check for auction: ${auctionId}`);
                const expiredAuction = await prisma.auction.findUnique({
                    where: { id: auctionId },
                    select: { id: true, isClaimed: true, status: true, name: true },
                });
                if (!expiredAuction) {
                    return NextResponse.json({ error: 'Auction not found' }, { status: 404 });
                }
                if (expiredAuction.status === 'COMPLETED' && !expiredAuction.isClaimed) {
                    await prisma.auction.update({
                        where: { id: auctionId },
                        data: { status: 'VOID' },
                    });
                    console.log(`[QSTASH WEBHOOK] ⚠️ Auction ${auctionId} voided — winner did not pay within 24h`);
                    return NextResponse.json({ success: true, message: `Auction ${auctionId} voided (unclaimed within 24h)` });
                }
                return NextResponse.json({ success: true, message: 'Already claimed or not applicable' });

            default:
                console.warn(`[QSTASH WEBHOOK] Unknown task type: ${type}`);
                return NextResponse.json({ error: 'Unknown task type' }, { status: 400 });
        }
    } catch (error: any) {
        console.error('[QSTASH WEBHOOK] Action failed:', error);
        return NextResponse.json({
            error: 'Task execution failed',
            details: error.message
        }, { status: 500 });
    }
}
