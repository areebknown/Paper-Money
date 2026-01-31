import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AssetClient from './AssetClient';

export default async function AssetPage({ params }: { params: { id: string } }) {
    const userId = await getUserIdFromRequest();
    if (!userId) redirect('/login');

    const assetId = params.id;

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
        select: { balance: true }
    });

    return (
        <AssetClient
            asset={asset}
            userUnits={portfolio?.units || 0}
            userBalance={user?.balance || 0}
        />
    );
}
