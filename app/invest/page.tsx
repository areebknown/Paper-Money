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

    // Run database queries concurrently
    const [userDb, assets] = await Promise.all([
        prisma.user.findUnique({
            where: { id: userId },
            select: { isSuspended: true }
        }),
        prisma.asset.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    if (!userDb) {
        redirect('/login');
    }

    if (userDb.isSuspended) {
        redirect('/suspended');
    }

    return <InvestClient initialAssets={assets} />;
}
