import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET /api/auctions - List auctions with optional status filter
export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');

        const where = status ? { status } : {};

        const auctions = await prisma.auction.findMany({
            where,
            include: {
                artifacts: {
                    include: {
                        artifact: true,
                    },
                },
                winner: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                bids: {
                    orderBy: {
                        timestamp: 'desc',
                    },
                    take: 1,
                },
            },
            orderBy: {
                scheduledAt: 'desc',
            },
        });

        return NextResponse.json({ auctions });
    } catch (error) {
        console.error('GET /api/auctions error:', error);
        return NextResponse.json({ error: 'Failed to fetch auctions' }, { status: 500 });
    }
}

// POST /api/auctions - Create new auction (admin only)
export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
        }

        const body = await req.json();
        const {
            name,
            description,
            scheduledAt,
            rankTier,
            startingPrice,
            artifactIds = [],
        } = body;

        const auction = await prisma.auction.create({
            data: {
                name,
                description,
                scheduledAt: new Date(scheduledAt),
                rankTier,
                startingPrice: Number(startingPrice),
                currentPrice: Number(startingPrice),
                artifacts: {
                    create: artifactIds.map((artifactId: string) => ({
                        artifactId,
                    })),
                },
            },
            include: {
                artifacts: {
                    include: {
                        artifact: true,
                    },
                },
            },
        });

        return NextResponse.json({ auction }, { status: 201 });
    } catch (error) {
        console.error('POST /api/auctions error:', error);
        return NextResponse.json({ error: 'Failed to create auction' }, { status: 500 });
    }
}
