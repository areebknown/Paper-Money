import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { qstash } from '@/lib/qstash';

/**
 * POST /api/admin/market/cron
 * Schedules or resets the daily market sync in Upstash QStash.
 */
export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    try {
        const { cron } = await req.json().catch(() => ({ cron: '0 0 * * *' })); // Default to midnight

        console.log(`[ADMIN] Scheduling market sync: ${cron}`);

        const result = await qstash.scheduleDailyMarketSync(cron);

        if (!result) {
            return NextResponse.json({
                error: 'QStash token is missing. Please set QSTASH_TOKEN in .env.local'
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            message: `Market sync scheduled for ${cron} successfully`,
            scheduleId: result.scheduleId
        });

    } catch (error: any) {
        console.error('[ADMIN] Market Cron Error:', error);
        return NextResponse.json({
            error: 'Failed to schedule market sync',
            details: error.message
        }, { status: 500 });
    }
}
