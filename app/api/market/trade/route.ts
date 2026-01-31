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

        const totalPrice = units * asset.currentPrice;

        return await prisma.$transaction(async (tx) => {
            if (type === 'BUY') {
                if (user.balance < totalPrice) {
                    throw new Error('Insufficient balance');
                }

                // Deduct balance
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { decrement: totalPrice } }
                });

                // Add to portfolio
                await tx.portfolio.upsert({
                    where: { userId_assetId: { userId, assetId } },
                    update: { units: { increment: units } },
                    create: { userId, assetId, units }
                });

                return NextResponse.json({ success: true, message: 'Purchase successful' });
            } else if (type === 'SELL') {
                const portfolio = await tx.portfolio.findUnique({
                    where: { userId_assetId: { userId, assetId } }
                });

                if (!portfolio || portfolio.units < (all ? portfolio.units : units)) {
                    throw new Error('Insufficient units to sell');
                }

                const unitsToSell = all ? portfolio.units : units;
                const saleValue = unitsToSell * asset.currentPrice;

                // Deduct units
                await tx.portfolio.update({
                    where: { userId_assetId: { userId, assetId } },
                    data: { units: { decrement: unitsToSell } }
                });

                // Add to balance
                await tx.user.update({
                    where: { id: userId },
                    data: { balance: { increment: saleValue } }
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
