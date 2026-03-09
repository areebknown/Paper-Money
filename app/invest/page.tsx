import { getUserIdFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { redirect } from 'next/navigation';
import InvestClient from './InvestClient';

export const dynamic = 'force-dynamic';

export default async function InvestPage() {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        redirect('/login');
    }

    // Verify user exists and get suspension status
    const userDb = await prisma.user.findUnique({
        where: { id: userId },
        select: { isSuspended: true }
    });

    if (!userDb) {
        redirect('/login');
    }

    if (userDb.isSuspended) {
        redirect('/suspended');
    }

    // Fetch initial market data for SSR
    const assets = await prisma.asset.findMany({
        orderBy: { name: 'asc' }
    });

    return <InvestClient initialAssets={assets} />;
}
