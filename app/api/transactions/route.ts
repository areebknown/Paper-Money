import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export const runtime = 'edge';

export async function GET(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    try {
        // Fetch sent and received separately to combine and sort
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                sentTransactions: {
                    orderBy: { createdAt: 'desc' },
                    take: skip + limit, // We need to fetch enough to skip accurately across two lists
                    include: { receiver: { select: { username: true } } }
                },
                receivedTransactions: {
                    orderBy: { createdAt: 'desc' },
                    take: skip + limit,
                    include: { sender: { select: { username: true } } }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Combine and sort with stable logic
        const allTransactions = [
            ...user.sentTransactions.map(t => ({ ...t, type: 'SENT', otherUser: t.receiver.username })),
            ...user.receivedTransactions.map(t => ({ ...t, type: 'RECEIVED', otherUser: t.sender.username }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Slice for the actual page
        const history = allTransactions.slice(skip, skip + limit);
        const hasMore = allTransactions.length > skip + limit;

        return NextResponse.json({ history, hasMore });

    } catch (error) {
        console.error('Fetch transactions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
