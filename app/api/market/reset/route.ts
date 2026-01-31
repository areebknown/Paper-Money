import { NextResponse } from 'next/server';
import { ASSETS } from '@/lib/market-engine';
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
        await prisma.$transaction(async (tx) => {
            // 1. Clear Portfolios (Optional, but makes sense for a "First Day" reset)
            await tx.portfolio.deleteMany({});

            // 2. Clear Price History
            await tx.assetPriceHistory.deleteMany({});

            // 3. Reset Assets to start prices
            for (const config of ASSETS) {
                await tx.asset.upsert({
                    where: { id: config.id },
                    update: {
                        currentPrice: config.startPrice,
                        change24h: 0,
                        history: {
                            create: {
                                price: config.startPrice,
                                timestamp: new Date()
                            }
                        }
                    },
                    create: {
                        id: config.id,
                        name: config.name,
                        unit: config.unit,
                        currentPrice: config.startPrice,
                        change24h: 0,
                        history: {
                            create: {
                                price: config.startPrice,
                                timestamp: new Date()
                            }
                        }
                    }
                });
            }
        });

        return NextResponse.json({ success: true, message: 'Market reset to Day 1 successfully' });
    } catch (error) {
        console.error('Market reset error:', error);
        return NextResponse.json({ error: 'Failed to reset market' }, { status: 500 });
    }
}
