
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');

    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    if (!assetId) return NextResponse.json({ error: 'Missing assetId' }, { status: 400 });

    try {
        const history = await prisma.assetPriceHistory.findMany({
            where: { assetId },
            orderBy: { timestamp: 'asc' }
        });

        const asset = await prisma.asset.findUnique({
            where: { id: assetId }
        });

        if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

        // Calculate some basic stats
        const prices = history.map(h => Number(h.price));
        const ath = prices.length > 0 ? Math.max(...prices) : 0;
        const atl = prices.length > 0 ? Math.min(...prices) : 0;
        const startPrice = prices.length > 0 ? prices[0] : 0;
        const currentPrice = Number(asset.currentPrice);
        const lifetimeGrowth = startPrice > 0 ? ((currentPrice - startPrice) / startPrice) * 100 : 0;

        return NextResponse.json({
            history,
            stats: {
                ath,
                atl,
                lifetimeGrowth,
                dataPoints: history.length
            }
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
