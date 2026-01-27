
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                balance: true,
                isAdmin: true,
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
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Combine and sort transactions for a unified history
        const history = [
            ...user.sentTransactions.map(t => ({ ...t, type: 'SENT', otherUser: t.receiver.username })),
            ...user.receivedTransactions.map(t => ({ ...t, type: 'RECEIVED', otherUser: t.sender.username }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                isAdmin: user.isAdmin,
            },
            history
        });

    } catch (error) {
        console.error('Fetch user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
