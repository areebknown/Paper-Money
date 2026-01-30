import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        redirect('/login');
    }

    // Fetch ONLY user and initial info on the server to prevent flicker
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            balance: true,
            isAdmin: true,
            email: true,
            // We NO LONGER fetch transactions on the server to ensure instant navigation
        }
    });

    if (!user) {
        redirect('/login');
    }

    const fallbackData = {
        user: {
            id: user.id,
            username: user.username,
            balance: user.balance,
            isAdmin: user.isAdmin,
            email: user.email,
        },
        history: [] // Start with empty history so the UI doesn't crash, SWR will fill this in 100ms
    };

    return <DashboardClient fallbackData={fallbackData} />;
}
