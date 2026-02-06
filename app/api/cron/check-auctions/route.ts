import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { startAuctionService } from '@/lib/auction-service';

export const dynamic = 'force-dynamic'; // Prevent caching

export async function GET(req: Request) {
    try {
        // 1. Find all auctions that SHOULD be live but are still SCHEDULED
        // Logic: Status is SCHEDULED AND scheduledAt is in the past
        const now = new Date();

        const dueAuctions = await prisma.auction.findMany({
            where: {
                status: 'SCHEDULED',
                scheduledAt: {
                    lte: now
                }
            },
            select: { id: true, name: true }
        });

        if (dueAuctions.length === 0) {
            return NextResponse.json({ message: 'No auctions due for start', time: now.toISOString() });
        }

        console.log(`[Cron] Found ${dueAuctions.length} auctions to start:`, dueAuctions.map(a => a.name));

        // 2. Start them using the service
        const results = await Promise.allSettled(
            dueAuctions.map(a => startAuctionService(a.id))
        );

        // 3. Summarize results
        const summary = results.map((res, index) => {
            const auctionName = dueAuctions[index].name;
            if (res.status === 'fulfilled') {
                return { name: auctionName, ...res.value };
            } else {
                return { name: auctionName, success: false, error: res.reason };
            }
        });

        return NextResponse.json({
            success: true,
            processed: dueAuctions.length,
            results: summary
        });

    } catch (error: any) {
        console.error('[Cron] Error checking auctions:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
