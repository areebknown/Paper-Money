import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { assetId, type, units, all } = await req.json();

        if (!assetId || !type || (!units && !all)) {
            return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
        }

        const asset = await prisma.asset.findUnique({ where: { id: assetId } });
        if (!asset) return NextResponse.json({ error: 'Asset not found' }, { status: 404 });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Get admin user for the "Market" side of transactions
        const adminUser = await prisma.user.findFirst({ where: { isAdmin: true } });
        if (!adminUser) return NextResponse.json({ error: 'Market system error' }, { status: 500 });

        return await prisma.$transaction(async (tx) => {
            if (type === 'BUY') {
                const totalPrice = units * asset.currentPrice;
                if (user.balance < totalPrice) {
                    throw new Error('Insufficient balance');
                }

                // Deduct balance
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: totalPrice } }
                });

                // Update Portfolio - add units and increment totalCost
                await tx.portfolio.upsert({
                    where: { userId_assetId: { userId, assetId } },
                    update: {
                        units: { increment: units },
                        totalCost: { increment: totalPrice }
                    },
                    create: { userId, assetId, units, totalCost: totalPrice }
                });

                // Create Transaction record
                await tx.transaction.create({
                    data: {
                        amount: totalPrice,
                        category: 'MARKET_BUY',
                        description: `Invested in ${asset.name} (${units} ${units === 1 ? 'unit' : 'units'})`,
                        senderId: userId,
                        receiverId: adminUser.id,
                        assetId: asset.id,
                        status: 'COMPLETED'
                    }
                });

                return NextResponse.json({ success: true, message: 'Purchase successful' });
            } else if (type === 'SELL') {
                const portfolio = await tx.portfolio.findUnique({
                    where: { userId_assetId: { userId, assetId } }
                });

                if (!portfolio || portfolio.units <= 0) {
                    throw new Error('No units to sell');
                }

                const unitsToSell = all ? portfolio.units : units;
                if (unitsToSell > portfolio.units) {
                    throw new Error('Insufficient units to sell');
                }

                const saleValue = unitsToSell * asset.currentPrice;

                // Calculate cost to deduct (proportionally)
                const costToDeduct = (portfolio.totalCost * unitsToSell) / portfolio.units;

                // Update Portfolio
                await tx.portfolio.update({
                    where: { userId_assetId: { userId, assetId } },
                    data: {
                        units: { decrement: unitsToSell },
                        totalCost: { decrement: all ? portfolio.totalCost : costToDeduct }
                    }
                });

                // Add to balance
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { increment: saleValue } }
                });

                // Create Transaction record
                await tx.transaction.create({
                    data: {
                        amount: saleValue,
                        category: 'MARKET_SELL',
                        description: `Sold ${asset.name} (${unitsToSell} ${unitsToSell === 1 ? 'unit' : 'units'})`,
                        senderId: adminUser.id,
                        receiverId: userId,
                        assetId: asset.id,
                        status: 'COMPLETED'
                    }
                });

                return NextResponse.json({ success: true, message: 'Sale successful' });
            }

            return NextResponse.json({ error: 'Invalid trade type' }, { status: 400 });
        });

    } catch (error: any) {
        console.error('Trading error:', error);
        return NextResponse.json({ error: error.message || 'Transaction failed' }, { status: 500 });
    }
}
