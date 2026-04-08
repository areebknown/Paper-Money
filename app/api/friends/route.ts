import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const friendships = await prisma.friendship.findMany({
            where: {
                OR: [
                    { senderId: userId },
                    { receiverId: userId }
                ]
            },
            include: {
                sender: {
                    select: {
                        id: true,
                        username: true,
                        realName: true,
                        profileImage: true,
                        lastSeenAt: true
                    }
                },
                receiver: {
                    select: {
                        id: true,
                        username: true,
                        realName: true,
                        profileImage: true,
                        lastSeenAt: true
                    }
                }
            },
            orderBy: {
                updatedAt: 'desc'
            }
        });

        // Determine online status & sort by categories
        const now = new Date().getTime();
        
        const mapUser = (u: any) => {
            const lastSeen = u.lastSeenAt ? new Date(u.lastSeenAt).getTime() : null;
            const isOnline = lastSeen ? (now - lastSeen) < 5 * 60 * 1000 : false;
            return { ...u, isOnline };
        };

        const friends = [];
        const receivedRequests = [];
        const sentRequests = [];

        for (const f of friendships) {
            if (f.status === 'ACCEPTED') {
                const friendInfo = f.senderId === userId ? f.receiver : f.sender;
                friends.push({
                    friendshipId: f.id,
                    updatedAt: f.updatedAt,
                    ...mapUser(friendInfo)
                });
            } else if (f.status === 'PENDING') {
                if (f.receiverId === userId) {
                    receivedRequests.push({
                        friendshipId: f.id,
                        updatedAt: f.updatedAt,
                        ...mapUser(f.sender)
                    });
                } else if (f.senderId === userId) {
                    sentRequests.push({
                        friendshipId: f.id,
                        updatedAt: f.updatedAt,
                        ...mapUser(f.receiver)
                    });
                }
            }
        }

        return NextResponse.json({
            friends,
            receivedRequests,
            sentRequests
        });

    } catch (error) {
        console.error('API /friends GET error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
