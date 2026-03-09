import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET() {
    try {
        const userId = await getUserIdFromRequest();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        // Get expected next PID
        const lastArt = await prisma.artifact.findFirst({
            orderBy: { productId: 'desc' },
            select: { productId: true }
        });
        const nextPid = lastArt?.productId ? Math.max(lastArt.productId + 1, 10001) : 10001;

        // Get live market prices for Gold and Silver
        const assets = await prisma.asset.findMany({
            where: { id: { in: ['GOLD', 'SILVER'] } },
            select: { id: true, currentPrice: true }
        });

        const prices: Record<string, number> = {
            gold: 0,
            silver: 0
        };
        assets.forEach(a => {
            prices[a.id.toLowerCase()] = Number(a.currentPrice);
        });

        return NextResponse.json({ nextPid, marketPrices: prices });
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
