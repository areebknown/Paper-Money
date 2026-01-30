import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './DashboardClient';

export default async function DashboardPage() {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        redirect('/login');
    }

    // Fetch user and initial history on the server to prevent flicker
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            username: true,
            balance: true,
            isAdmin: true,
            email: true,
            sentTransactions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { receiver: { select: { username: true } } }
            },
            receivedTransactions: {
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: { sender: { select: { username: true } } }
            }
        }
    });

    if (!user) {
        redirect('/login');
    }

    // Format history the same way as the API
    const history = [
        ...user.sentTransactions.map(t => ({ ...t, type: 'SENT', otherUser: t.receiver.username })),
        ...user.receivedTransactions.map(t => ({ ...t, type: 'RECEIVED', otherUser: t.sender.username }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    const fallbackData = {
        user: {
            id: user.id,
            username: user.username,
            balance: user.balance,
            isAdmin: user.isAdmin,
            email: user.email,
        },
        history
    };

    return <DashboardClient fallbackData={fallbackData} />;
}
