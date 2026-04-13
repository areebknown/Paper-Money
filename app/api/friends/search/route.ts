import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    
    if (!query || query.trim() === '') {
        return NextResponse.json({ results: [] });
    }

    try {
        const results = await prisma.user.findMany({
            where: {
                OR: [
                    { username: { contains: query } },
                    { realName: { contains: query } }
                ],
                NOT: {
                    id: userId // don't return self
                },
                isAdmin: false
            },
            select: {
                id: true,
                username: true,
                realName: true,
                profileImage: true,
            },
            take: 20
        });

        // We also need to get the friendship status so the frontend knows if we already sent a request or are friends.
        // A simple pass will do
        const list = [];
        for (const u of results) {
            const f: any = await prisma.friendship.findFirst({
                where: {
                    OR: [
                        { senderId: userId, receiverId: u.id },
                        { senderId: u.id, receiverId: userId }
                    ]
                }
            });

            let status = 'NONE';
            if (f) {
                if (f.status === 'ACCEPTED') status = 'FRIENDS';
                else if (f.senderId === userId) status = 'PENDING_SENT';
                else status = 'PENDING_RECEIVED';
            }

            list.push({ ...u, friendshipStatus: status });
        }

        return NextResponse.json({ results: list });

    } catch (error) {
        console.error('API /friends/search GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
