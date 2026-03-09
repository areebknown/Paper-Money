import { NextResponse } from 'next/server';
import { updateMarketPrices } from '@/lib/market-engine';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { pusherServer } from '@/lib/pusher-server';

// Route configuration to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET method: Handles two very different responsibilities
// 1. Cron Job Execution: If CRON_SECRET is present, it MUTATES state (updates prices)
// 2. Data Fetching: If no secret (or normal user), it READS state (returns assets)
export async function GET(req: Request) {
    // Check for Vercel Cron secret (Using QStash or Vercel cron)
    const authHeader = req.headers.get('Authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    // SCENARIO 1: CRON JOB (Trigger Update)
    if (isCron) {
        console.log('[CRON] Market sync triggered at:', new Date().toISOString());
        console.log('[CRON] Authorized via CRON_SECRET');

        try {
            console.log('[CRON] Starting market price update...');
            await updateMarketPrices();
            console.log('[CRON] Market prices updated successfully');

            // Broadcast the update globally via WebSockets
            await pusherServer.trigger('market-updates', 'prices-updated', {
                timestamp: new Date().toISOString()
            });

            return NextResponse.json({
                success: true,
                message: 'Market prices updated successfully',
                timestamp: new Date().toISOString(),
                triggeredBy: 'cron'
            });
        } catch (error) {
            console.error('[CRON] Market sync error:', error);
            return NextResponse.json({
                error: 'Failed to update market',
                details: error instanceof Error ? error.message : 'Unknown error'
            }, { status: 500 });
        }
    }

    // SCENARIO 2: DATA FETCHING (Read Only)
    // Used by the Invest dashboard (via useSWR) to get latest prices.
    try {
        const assets = await prisma.asset.findMany({
            orderBy: { name: 'asc' }
        });

        return NextResponse.json({ assets });
    } catch (error) {
        console.error('[MARKET API] Failed to fetch assets:', error);
        return NextResponse.json({ error: 'Failed to fetch market data' }, { status: 500 });
    }
}

// POST method for admin panel (Manual Trigger)
export async function POST(req: Request) {
    console.log('[ADMIN] Manual market sync request received');

    const userId = await getUserIdFromRequest();

    if (!userId) {
        console.log('[ADMIN] Unauthorized: No user ID found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user?.isAdmin) {
        console.log('[ADMIN] Forbidden: User is not admin');
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    try {
        console.log('[ADMIN] Manual market sync triggered by:', user.username);
        // Force true ignores the 20-hour idempotency check
        await updateMarketPrices(true);
        console.log('[ADMIN] Market sync completed successfully');

        // Broadcast the update globally via WebSockets
        await pusherServer.trigger('market-updates', 'prices-updated', {
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({
            success: true,
            message: 'Market prices updated successfully',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('[ADMIN] Market sync error:', error);
        return NextResponse.json({
            error: 'Failed to update market',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}
