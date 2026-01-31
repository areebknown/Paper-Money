import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AssetClient from './AssetClient';

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
    const userId = await getUserIdFromRequest();
    if (!userId) redirect('/login');

    const resolvedParams = await params;
    const assetId = resolvedParams?.id;

    if (!assetId) redirect('/market');

    const asset = await prisma.asset.findUnique({
        where: { id: assetId },
        include: {
            history: {
                orderBy: { timestamp: 'asc' },
                take: 7
            }
        }
    });

    if (!asset) redirect('/market');

    const portfolio = await prisma.portfolio.findUnique({
        where: {
            userId_assetId: {
                userId,
                assetId
            }
        }
    });

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { balance: true, isSuspended: true }
    });

    // Convert Decimal fields to number for Client Component serialization
    const normalizedAsset = {
        ...asset,
        currentPrice: Number(asset.currentPrice),
        history: asset.history.map(h => ({
            ...h,
            price: Number(h.price)
        }))
    };

    return (
        <AssetClient
            asset={normalizedAsset}
            userUnits={portfolio?.units || 0}
            userBalance={Number(user?.balance) || 0}
            isSuspended={user?.isSuspended || false}
        />
    );
}
