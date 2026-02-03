import { NextResponse } from 'next/server';
import { updateMarketPrices } from '@/lib/market-engine';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// Route configuration to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

// GET method for Vercel Cron Jobs
export async function GET(req: Request) {
    // Check for Vercel Cron secret bypass
    const authHeader = req.headers.get('Authorization');
    const isCron = authHeader === `Bearer ${process.env.CRON_SECRET}`;

    // Add logging for debugging
    console.log('[CRON] Market sync triggered at:', new Date().toISOString());
    console.log('[CRON] Is cron job:', isCron);
    console.log('[CRON] Authorization header present:', !!authHeader);

    if (!isCron) {
        // If not a cron job, require admin authentication for manual GET requests
        const userId = await getUserIdFromRequest();
        if (!userId) {
            console.log('[CRON] Unauthorized: No user ID found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user?.isAdmin) {
            console.log('[CRON] Forbidden: User is not admin');
            return NextResponse.json({ error: 'Admin only' }, { status: 403 });
        }

        console.log('[CRON] Manual GET trigger by admin:', user.username);
    }

    try {
        console.log('[CRON] Starting market price update...');
        await updateMarketPrices();
        console.log('[CRON] Market prices updated successfully');
        return NextResponse.json({
            success: true,
            message: 'Market prices updated successfully',
            timestamp: new Date().toISOString(),
            triggeredBy: isCron ? 'cron' : 'manual'
        });
    } catch (error) {
        console.error('[CRON] Market sync error:', error);
        return NextResponse.json({
            error: 'Failed to update market',
            details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
    }
}

// POST method for backward compatibility with admin panel
export async function POST(req: Request) {
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
