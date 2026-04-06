import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

async function isAdmin(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) return false;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    return user?.isAdmin === true;
}

export async function GET(req: Request) {
    if (!(await isAdmin(req))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const queries = await prisma.playerQuery.findMany({
            orderBy: { createdAt: 'desc' },
        });

        return NextResponse.json({ queries });
    } catch (error) {
        console.error('Failed to fetch player queries:', error);
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }
}
