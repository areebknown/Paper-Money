import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { MILESTONES } from '@/lib/rankData';

// GET — list all milestones + which ones the user has completed
export async function GET() {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { completedMilestones: true },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        return NextResponse.json({
            milestones: MILESTONES,
            completed: user.completedMilestones,
        });
    } catch (error) {
        console.error('GET /api/rank/milestones error:', error);
        return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
    }
}

// POST — mark a milestone complete and award RP (only once per user)
export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const { milestoneId } = await req.json();

        const milestone = MILESTONES.find(m => m.id === milestoneId);
        if (!milestone) {
            return NextResponse.json({ error: 'Unknown milestone' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { completedMilestones: true },
        });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (user.completedMilestones.includes(milestoneId)) {
            return NextResponse.json({ error: 'Milestone already completed' }, { status: 409 });
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                completedMilestones: { push: milestoneId },
                rankPoints: { increment: milestone.points },
            },
            select: { rankPoints: true, completedMilestones: true },
        });

        return NextResponse.json({
            success: true,
            awardedPoints: milestone.points,
            rankPoints: updated.rankPoints,
            completed: updated.completedMilestones,
        });
    } catch (error) {
        console.error('POST /api/rank/milestones error:', error);
        return NextResponse.json({ error: 'Failed to complete milestone' }, { status: 500 });
    }
}
