import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const userId = await getUserIdFromRequest();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Add the user to the exitedUsers relation for this auction
        await prisma.auction.update({
            where: { id },
            data: {
                exitedUsers: {
                    connect: { id: userId }
                }
            }
        });

        return NextResponse.json({ success: true, message: 'User permanently exited auction' });
    } catch (error) {
        console.error('POST /api/auctions/[id]/exit error:', error);
        return NextResponse.json({ error: 'Failed to exit auction' }, { status: 500 });
    }
}
