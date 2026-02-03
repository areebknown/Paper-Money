import { NextResponse } from 'next/server';
import { updateMarketPrices } from '@/lib/market-engine';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// Route configuration to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET method: Handles two very different responsibilities
// 1. Cron Job Execution: If CRON_SECRET is present, it MUTATES state (updates prices)
// 2. Data Fetching: If no secret (or normal user), it READS state (returns assets)
export async function GET(req: Request) {
    // Check for Vercel Cron secret
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
    // Used by MarketClient.tsx (via useSWR) to get latest prices.
    // This strictly READS data and does NOT trigger updates.
    // This fixes the "Loop Bug" where visiting the page caused endless updates.
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

// POST method for backward compatibility with admin panel (Manual Trigger)
export async function POST(req: Request) {
    console.log('[ADMIN] Manual market sync request received');

    // Debug headers to see if cookies/auth are present
    console.log('[ADMIN] Headers:', JSON.stringify(Object.fromEntries(req.headers.entries())));

    const userId = await getUserIdFromRequest();
    console.log('[ADMIN] Resolved User ID:', userId);

    if (!userId) {
        console.log('[ADMIN] Unauthorized: No user ID found');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    console.log('[ADMIN] Found user:', user?.username, 'Is Admin:', user?.isAdmin);

    if (!user?.isAdmin) {
        console.log('[ADMIN] Forbidden: User is not admin');
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    try {
        console.log('[ADMIN] Manual market sync triggered by:', user.username);
        await updateMarketPrices();
        console.log('[ADMIN] Market sync completed successfully');
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
