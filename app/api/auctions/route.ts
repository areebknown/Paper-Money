import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { checkAndUpdateAuctionStatuses } from '@/lib/auction-service';
import { qstash } from '@/lib/qstash';
import { pusherServer } from '@/lib/pusher-server';

// GET /api/auctions - List auctions with optional status filter
export async function GET(req: Request) {
    try {
        // Legacy lazy-loading logic removed to strictly test QStash automation.


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
        console.log('[API] Create Auction Body:', body);

        // Strict Validation
        const {
            name,
            scheduledAt,
            rankTier,
            startingPrice,
            artifactIds,
        } = body;

        // Check for missing fields
        if (!name || !scheduledAt || !rankTier || startingPrice === undefined) {
            console.error('[API] Missing required fields:', { name, scheduledAt, rankTier, startingPrice });
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Validate artifacts array
        if (!Array.isArray(artifactIds) || artifactIds.length === 0) {
            console.error('[API] Invalid artifactIds:', artifactIds);
            return NextResponse.json({ error: 'At least one artifact is required' }, { status: 400 });
        }

        // Parse numeric values safely
        const price = parseFloat(startingPrice.toString());
        if (isNaN(price) || price < 0) {
            return NextResponse.json({ error: 'Invalid starting price' }, { status: 400 });
        }

        const auction = await prisma.auction.create({
            data: {
                name,
                scheduledAt: new Date(scheduledAt),
                rankTier,
                startingPrice: price,
                currentPrice: price, // Initialize current price
                status: 'SCHEDULED',
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

        console.log('[API] Auction Created:', auction.id);

        // Notify all connected home-page clients instantly
        pusherServer.trigger('global-auctions', 'auction-created', {
            id: auction.id,
            name: auction.name,
            status: auction.status,
            scheduledAt: auction.scheduledAt,
            startingPrice: auction.startingPrice,
            rankTier: auction.rankTier,
        }).catch(err => console.error('[API] Pusher auction-created failed:', err));

        const scheduledTime = new Date(scheduledAt);
        const minutesUntilStart = (scheduledTime.getTime() - Date.now()) / (1000 * 60);

        // Schedule auction start with QStash
        try {
            await qstash.scheduleAuctionStart(auction.id, scheduledTime);
            console.log('[API] QStash schedule requested for auction:', auction.id);
        } catch (qError) {
            console.error('[API] QStash scheduling failed (non-blocking):', qError);
        }

        // Edge case: if auction starts in < 5 minutes, immediately set to WAITING_ROOM
        // Don't rely on QStash delay-0 delivery which can take 30-60 seconds
        if (minutesUntilStart <= 5) {
            console.log(`[API] Auction starts in ${minutesUntilStart.toFixed(1)} min — promoting directly to WAITING_ROOM`);
            await prisma.auction.update({
                where: { id: auction.id },
                data: { status: 'WAITING_ROOM' }
            });
        }

        return NextResponse.json({ auction }, { status: 201 });
    } catch (error: any) {
        console.error('POST /api/auctions error:', error);
        return NextResponse.json({
            error: 'Failed to create auction',
            details: error.message
        }, { status: 500 });
    }
}
