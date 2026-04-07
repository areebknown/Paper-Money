import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// Rank thresholds — same as inventory route
const RANK_TIERS = [
    { name: 'Rookie I',      icon: 'rookie1',     minPoints: 0,    maxPoints: 99 },
    { name: 'Rookie II',     icon: 'rookie2',     minPoints: 100,  maxPoints: 199 },
    { name: 'Rookie III',    icon: 'rookie3',     minPoints: 200,  maxPoints: 299 },
    { name: 'Dealer I',      icon: 'dealer1',     minPoints: 300,  maxPoints: 449 },
    { name: 'Dealer II',     icon: 'dealer2',     minPoints: 450,  maxPoints: 599 },
    { name: 'Dealer III',    icon: 'dealer3',     minPoints: 600,  maxPoints: 749 },
    { name: 'Financier I',   icon: 'financier1',  minPoints: 750,  maxPoints: 899 },
    { name: 'Financier II',  icon: 'financier2',  minPoints: 900,  maxPoints: 1049 },
    { name: 'Financier III', icon: 'financier3',  minPoints: 1050, maxPoints: 1399 },
    { name: 'Tycoon I',      icon: 'tycoon1',     minPoints: 1400, maxPoints: 1599 },
    { name: 'Tycoon II',     icon: 'tycoon2',     minPoints: 1600, maxPoints: 1799 },
    { name: 'Tycoon III',    icon: 'tycoon3',     minPoints: 1800, maxPoints: 2399 },
    { name: 'Crown',         icon: 'crown',       minPoints: 2400, maxPoints: 2999 },
    { name: 'Crown+',        icon: 'crown+',      minPoints: 3000, maxPoints: 4199 },
    { name: 'Monarch',       icon: 'monarch',     minPoints: 4200, maxPoints: Infinity },
];

function getRankInfo(rankPoints: number) {
    const rank = [...RANK_TIERS].reverse().find(t => rankPoints >= t.minPoints) ?? RANK_TIERS[0];
    const isMax = rank.maxPoints === Infinity;
    const range = isMax ? 1 : rank.maxPoints + 1 - rank.minPoints;
    const progress = isMax ? 100 : Math.min(100, Math.floor(((rankPoints - rank.minPoints) / range) * 100));
    return { tier: rank, progress, iconName: rank.icon, nextThreshold: isMax ? null : rank.maxPoints + 1 };
}

// GET /api/profile/[id]
export async function GET(req: Request, { params }: { params: { id: string } }) {
    // Viewer identity (optional — can be logged in or not)
    const viewerId = await getUserIdFromRequest();
    const targetId = params.id;

    try {
        const profile = await prisma.user.findUnique({
            where: { id: targetId },
            select: {
                id: true,
                username: true,
                realName: true,
                about: true,
                profileImage: true,
                rankPoints: true,
                lastSeenAt: true,
                // Public artifacts only
                ownedArtifacts: {
                    where: { ownerId: targetId, pawnShopId: null },
                    select: { id: true, productId: true, name: true, tier: true, imageUrl: true },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!profile) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Work out online / last seen
        const now = new Date();
        const lastSeenAt: Date | null = profile.lastSeenAt ?? null;
        const isOnline = lastSeenAt ? (now.getTime() - lastSeenAt.getTime()) < 5 * 60 * 1000 : false; // 5 min window

        const rank = getRankInfo(profile.rankPoints);

        // Friendship status (only fetchable if viewer is logged in and not self)
        let friendshipStatus: 'SELF' | 'NONE' | 'PENDING_SENT' | 'PENDING_RECEIVED' | 'FRIENDS' = 'NONE';
        if (viewerId) {
            if (viewerId === targetId) {
                friendshipStatus = 'SELF';
            } else {
                const friendship = await prisma.friendship.findFirst({
                    where: {
                        OR: [
                            { senderId: viewerId, receiverId: targetId },
                            { senderId: targetId, receiverId: viewerId },
                        ],
                    },
                });
                if (friendship) {
                    if (friendship.status === 'ACCEPTED') {
                        friendshipStatus = 'FRIENDS';
                    } else if (friendship.senderId === viewerId) {
                        friendshipStatus = 'PENDING_SENT';
                    } else {
                        friendshipStatus = 'PENDING_RECEIVED';
                    }
                }
            }
        }

        return NextResponse.json({
            profile: {
                id: profile.id,
                username: profile.username,
                realName: profile.realName,
                about: profile.about,
                profileImage: profile.profileImage,
                rankPoints: profile.rankPoints,
                lastSeenAt: lastSeenAt?.toISOString() ?? null,
                isOnline,
            },
            rank,
            artifacts: profile.ownedArtifacts,
            friendshipStatus,
        });

    } catch (error) {
        console.error('GET /api/profile/[id] error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST /api/profile/[id] — send or accept friend request
export async function POST(req: Request, { params }: { params: { id: string } }) {
    const viewerId = await getUserIdFromRequest();
    if (!viewerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const targetId = params.id;
    if (viewerId === targetId) return NextResponse.json({ error: 'Cannot friend yourself' }, { status: 400 });

    try {
        // Check existing
        const existing = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { senderId: viewerId, receiverId: targetId },
                    { senderId: targetId, receiverId: viewerId },
                ],
            },
        });

        if (!existing) {
            // Send request
            await prisma.friendship.create({ data: { senderId: viewerId, receiverId: targetId } });
            return NextResponse.json({ friendshipStatus: 'PENDING_SENT' });
        }

        if (existing.status === 'ACCEPTED') {
            return NextResponse.json({ friendshipStatus: 'FRIENDS' });
        }

        // Accept if the current user is the receiver
        if (existing.receiverId === viewerId) {
            await prisma.friendship.update({ where: { id: existing.id }, data: { status: 'ACCEPTED' } });
            return NextResponse.json({ friendshipStatus: 'FRIENDS' });
        }

        return NextResponse.json({ friendshipStatus: 'PENDING_SENT' });

    } catch (error) {
        console.error('POST /api/profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE /api/profile/[id] — remove friend / cancel request
export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    const viewerId = await getUserIdFromRequest();
    if (!viewerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const targetId = params.id;
    try {
        await prisma.friendship.deleteMany({
            where: {
                OR: [
                    { senderId: viewerId, receiverId: targetId },
                    { senderId: targetId, receiverId: viewerId },
                ],
            },
        });
        return NextResponse.json({ friendshipStatus: 'NONE' });
    } catch (error) {
        console.error('DELETE /api/profile error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
