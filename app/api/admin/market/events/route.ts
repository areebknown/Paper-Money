
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET: Fetch event history (pending and past)
export async function GET(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    try {
        const events = await (prisma as any).marketEvent.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        return NextResponse.json({ events });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch history' }, { status: 500 });
    }
}

// POST: Schedule a new event
export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    try {
        const { assetId, type, magnitude } = await req.json();

        if (magnitude === undefined || magnitude < 0 || magnitude > 100) {
            return NextResponse.json({ error: 'Invalid magnitude (0-100)' }, { status: 400 });
        }
        if (!['BOOM', 'CRASH'].includes(type)) {
            return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
        }

        const value = magnitude / 100;

        // Create the event
        const event = await (prisma as any).marketEvent.create({
            data: {
                assetId: assetId || 'ALL',
                type,
                magnitude: value,
                status: 'PENDING'
            }
        });

        return NextResponse.json({
            message: `${type} of ${magnitude}% scheduled for ${assetId === 'ALL' ? 'Entire Market' : assetId} successfully`,
            event
        });

    } catch (error) {
        console.error('Schedule event error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Cancel a pending event
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.isAdmin) return NextResponse.json({ error: 'Admin only' }, { status: 403 });

    if (!id) return NextResponse.json({ error: 'Missing event ID' }, { status: 400 });

    try {
        await (prisma as any).marketEvent.update({
            where: { id },
            data: { status: 'CANCELLED' }
        });
        return NextResponse.json({ message: 'Event cancelled successfully' });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to cancel event' }, { status: 500 });
    }
}
