
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
                isSuspended: true,
                email: true,
                sentTransactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: {
                        receiver: { select: { username: true } },
                        asset: true
                    }
                },
                receivedTransactions: {
                    orderBy: { createdAt: 'desc' },
                    take: 50,
                    include: {
                        sender: { select: { username: true } },
                        asset: true
                    }
                },
                portfolios: {
                    include: { asset: true }
                }
            }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Combine and sort transactions for a unified history, limited to 10 for dashboard speed
        const history = [
            ...user.sentTransactions.map(t => ({
                ...t,
                type: 'SENT',
                otherUser: (t as any).asset ? (t as any).asset.name : t.receiver.username
            })),
            ...user.receivedTransactions.map(t => ({
                ...t,
                type: 'RECEIVED',
                otherUser: (t as any).asset ? (t as any).asset.name : t.sender.username
            }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);

        const rawInvested = user.portfolios.reduce((sum, p) => sum + (Number(p.units) * Number(p.asset.currentPrice)), 0);
        const totalInvested = Math.round(rawInvested * 100) / 100;

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                balance: user.balance,
                isAdmin: user.isAdmin,
                email: user.email,
                isSuspended: user.isSuspended,
                totalInvested,
                portfolios: user.portfolios
            },
            history
        });

    } catch (error) {
        console.error('Fetch user error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
        }

        // Update email
        const user = await prisma.user.update({
            where: { id: userId },
            data: { email },
            select: {
                id: true,
                username: true,
                email: true,
            }
        });

        return NextResponse.json({ message: 'Email updated successfully', user });

    } catch (error: any) {
        console.error('Update email error:', error);

        // Handle unique constraint violation
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
        }

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
