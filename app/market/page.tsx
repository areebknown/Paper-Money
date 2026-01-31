import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import MarketClient from './MarketClient';

export default async function MarketPage() {
    const userId = await getUserIdFromRequest();
    if (!userId) redirect('/login');

    const assets = await prisma.asset.findMany({
        orderBy: { currentPrice: 'desc' },
        include: {
            history: {
                orderBy: { timestamp: 'desc' },
                take: 7
            }
        }
    });

    return <MarketClient initialAssets={assets} />;
}
