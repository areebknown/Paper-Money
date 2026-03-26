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
        { name: 'Rookie I',      min: 0    },
        { name: 'Rookie II',     min: 100  },
        { name: 'Rookie III',    min: 200  },
        { name: 'Dealer I',      min: 300  },
        { name: 'Dealer II',     min: 450  },
        { name: 'Dealer III',    min: 600  },
        { name: 'Financier I',   min: 750  },
        { name: 'Financier II',  min: 900  },
        { name: 'Financier III', min: 1050 },
        { name: 'Tycoon I',      min: 1400 },
        { name: 'Tycoon II',     min: 1600 },
        { name: 'Tycoon III',    min: 1800 },
        { name: 'Crown',         min: 2400 },
        { name: 'Crown+',        min: 3000 },
        { name: 'Monarch',       min: 4200 },
    ];
    const newTier = TIERS.findLast(t => rankPoints >= t.min)?.name ?? 'ROOKIE';

    const updated = await prisma.user.update({
        where: { id: userId },
        data: { rankPoints, rankTier: newTier },
        select: { id: true, username: true, rankPoints: true, rankTier: true },
    });

    return NextResponse.json({ success: true, user: updated });
}
