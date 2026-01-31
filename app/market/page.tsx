import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MarketClient from './MarketClient';

export default async function MarketPage() {
    const userId = await getUserIdFromRequest();
    if (!userId) redirect('/login');

    const assetsRaw = await prisma.asset.findMany({
        orderBy: { currentPrice: 'desc' },
        include: {
            history: {
                orderBy: { timestamp: 'desc' },
                take: 7
            }
        }
    });

    // Convert Decimal fields to number for Client Component serialization
    const assets = assetsRaw.map(asset => ({
        ...asset,
        currentPrice: Number(asset.currentPrice),
        history: asset.history.map(h => ({
            ...h,
            price: Number(h.price)
        }))
    }));

    return <MarketClient initialAssets={assets} />;
}
