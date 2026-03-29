import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AssetClient from './AssetClient';

export const dynamic = 'force-dynamic';

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserIdFromRequest();
    if (!userId) redirect('/login');

    const resolvedParams = await params;
    const assetId = resolvedParams?.id;

    if (!assetId) redirect('/invest');

    const [asset, portfolio, user] = await Promise.all([
        prisma.asset.findUnique({
            where: { id: assetId },
            include: {
                history: {
                    orderBy: { timestamp: 'desc' },
                    take: 7
                }
            }
        }),
        prisma.portfolio.findUnique({
            where: {
                userId_assetId: {
                    userId,
                    assetId
                }
            }
        }),
        prisma.user.findUnique({
            where: { id: userId },
            select: { balance: true, isSuspended: true, rankPoints: true }
        })
    ]);

    if (!asset) redirect('/invest');

    // Convert Decimal fields to number for Client Component serialization
    const normalizedAsset = {
        ...asset,
        currentPrice: Number(asset.currentPrice),
        history: asset.history.map(h => ({
            ...h,
            price: Number(h.price)
        })).reverse()
    };

    return (
        <AssetClient
            asset={normalizedAsset}
            userUnits={Number(portfolio?.units) || 0}
            userBalance={Number(user?.balance) || 0}
            rankPoints={user?.rankPoints || 0}
            isSuspended={user?.isSuspended || false}
        />
    );
}
