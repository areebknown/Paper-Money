
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user?.isAdmin) {
        return NextResponse.json({ error: 'Admin only' }, { status: 403 });
    }

    try {
        const { assetId, magnitude } = await req.json();

        if (magnitude === undefined || magnitude < 0 || magnitude > 100) {
            return NextResponse.json({ error: 'Invalid magnitude (0-100)' }, { status: 400 });
        }

        const crashValue = magnitude / 100;

        if (assetId === 'ALL') {
            await prisma.asset.updateMany({
                data: {
                    scheduledCrashMagnitude: crashValue
                }
            });
            return NextResponse.json({ message: `Global market crash of ${magnitude}% scheduled successfully` });
        } else {
            await prisma.asset.update({
                where: { id: assetId },
                data: {
                    scheduledCrashMagnitude: crashValue
                }
            });
            return NextResponse.json({ message: `Crash of ${magnitude}% scheduled for ${assetId} successfully` });
        }

    } catch (error) {
        console.error('Schedule crash error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
