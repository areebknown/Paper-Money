import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// PUT /api/admin/rank — Update a user's rank points (admin only)
export async function PUT(req: Request) {
    const callerId = await getUserIdFromRequest();
    if (!callerId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const caller = await prisma.user.findUnique({ where: { id: callerId } });
    if (!caller?.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    const { userId, rankPoints } = await req.json() as { userId: string; rankPoints: number };
    if (!userId || typeof rankPoints !== 'number' || rankPoints < 0) {
        return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    // Determine new rank tier
    const TIERS = [
        { name: 'ROOKIE', min: 0 },
        { name: 'DEALER', min: 200 },
        { name: 'FINANCIER', min: 500 },
        { name: 'TYCOON', min: 1000 },
        { name: 'CROWN', min: 2500 },
        { name: 'CROWN+', min: 5000 },
        { name: 'MONARCH', min: 10000 },
    ];
    const newTier = TIERS.findLast(t => rankPoints >= t.min)?.name ?? 'ROOKIE';

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { rankPoints, rankTier: newTier },
        select: { id: true, username: true, rankPoints: true, rankTier: true },
    });

    return NextResponse.json({ success: true, user: updated });
}
