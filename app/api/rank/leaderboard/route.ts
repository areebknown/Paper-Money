import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { getRankFromPoints } from '@/lib/rankData';

const PAGE_SIZE = 50;

export async function GET(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const url = new URL(req.url);
        const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
        const skip = (page - 1) * PAGE_SIZE;

        // Paginated leaderboard
        const users = await prisma.user.findMany({
            orderBy: { rankPoints: 'desc' },
            skip,
            take: PAGE_SIZE,
            select: {
                id: true,
                username: true,
                profileImage: true,
                rankPoints: true,
            },
        });

        const entries = users.map((u, i) => ({
            ...u,
            rank: getRankFromPoints(u.rankPoints),
            position: skip + i + 1,
        }));

        // Current user's position (indexed — O(log n))
        const me = await prisma.user.findUnique({
            where: { id: userId },
            select: { rankPoints: true, username: true, profileImage: true },
        });

        const usersAbove = me
            ? await prisma.user.count({ where: { rankPoints: { gt: me.rankPoints } } })
            : 0;

        const myPosition = usersAbove + 1;
        const myEntry = me
            ? {
                  id: userId,
                  username: me.username,
                  profileImage: me.profileImage,
                  rankPoints: me.rankPoints,
                  rank: getRankFromPoints(me.rankPoints),
                  position: myPosition,
              }
            : null;

        const total = await prisma.user.count();

        return NextResponse.json({
            entries,
            myEntry,
            page,
            totalPages: Math.ceil(total / PAGE_SIZE),
            total,
        });
    } catch (error) {
        console.error('GET /api/rank/leaderboard error:', error);
        return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 });
    }
}
