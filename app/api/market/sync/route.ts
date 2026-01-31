import { NextResponse } from 'next/server';
import { updateMarketPrices } from '@/lib/market-engine';
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
        await updateMarketPrices();
        return NextResponse.json({ success: true, message: 'Market prices updated successfully' });
    } catch (error) {
        console.error('Market sync error:', error);
        return NextResponse.json({ error: 'Failed to update market' }, { status: 500 });
    }
}

// Optional: GET to fetch current asset status for admin preview
export async function GET(req: Request) {
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

    const assets = await prisma.asset.findMany({
        orderBy: { name: 'asc' }
    });

    return NextResponse.json({ assets });
}
