import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * POST /api/notifications/subscribe
 * Body: { auctionId: string }
 *
 * Toggles a push notification subscription for the calling user on the given auction.
 * - If no subscription exists → creates one (subscribed).
 * - If one exists → deletes it (unsubscribed).
 *
 * Returns { subscribed: boolean } so the client can update the bell icon state.
 */
export async function POST(req: NextRequest) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { auctionId } = await req.json();
    if (!auctionId) {
        return NextResponse.json({ error: 'auctionId is required' }, { status: 400 });
    }

    const existing = await prisma.auctionNotificationSubscription.findUnique({
        where: { userId_auctionId: { userId, auctionId } },
    });

    if (existing) {
        await prisma.auctionNotificationSubscription.delete({
            where: { userId_auctionId: { userId, auctionId } },
        });
        return NextResponse.json({ subscribed: false });
    } else {
        await prisma.auctionNotificationSubscription.create({
            data: { userId, auctionId },
        });
        return NextResponse.json({ subscribed: true });
    }
}

/**
 * GET /api/notifications/subscribe
 * - With ?auctionId=xxx → returns { subscribed: boolean } for that auction.
 * - Without query param  → returns { subscribedAuctionIds: string[] } for ALL subscriptions.
 *   Used on home page load to restore bell UI state without extra round trips.
 */
export async function GET(req: NextRequest) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const auctionId = searchParams.get('auctionId');

    // No auctionId → return all subscribed auction IDs (for home page initialisation)
    if (!auctionId) {
        const subs = await prisma.auctionNotificationSubscription.findMany({
            where: { userId },
            select: { auctionId: true },
        });
        return NextResponse.json({ subscribedAuctionIds: subs.map(s => s.auctionId) });
    }

    const existing = await prisma.auctionNotificationSubscription.findUnique({
        where: { userId_auctionId: { userId, auctionId } },
    });

    return NextResponse.json({ subscribed: !!existing });
}
