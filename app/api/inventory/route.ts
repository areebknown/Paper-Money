import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// Rank thresholds and perks
const RANK_TIERS = [
    { name: 'ROOKIE', icon: 'rookie', minPoints: 0, maxPoints: 199, loanTokens: 1, subRanks: ['rookie1', 'rookie2', 'rookie3'] },
    { name: 'DEALER', icon: 'dealer', minPoints: 200, maxPoints: 499, loanTokens: 2, subRanks: ['dealer1', 'dealer2', 'dealer3'] },
    { name: 'FINANCIER', icon: 'financier', minPoints: 500, maxPoints: 999, loanTokens: 3, subRanks: ['financier1', 'financier2', 'financier3'] },
    { name: 'TYCOON', icon: 'tycoon', minPoints: 1000, maxPoints: 2499, loanTokens: 4, subRanks: ['tycoon1', 'tycoon2', 'tycoon3'] },
    { name: 'CROWN', icon: 'crown', minPoints: 2500, maxPoints: 4999, loanTokens: 5, subRanks: ['crown1', 'crown2', 'crown3'] },
    { name: 'CROWN+', icon: 'crown+', minPoints: 5000, maxPoints: 9999, loanTokens: 6, subRanks: ['crown+'] },
    { name: 'MONARCH', icon: 'monarch', minPoints: 10000, maxPoints: Infinity, loanTokens: 8, subRanks: ['monarch'] },
];

export function getRankInfo(rankPoints: number) {
    const tier = RANK_TIERS.findLast(t => rankPoints >= t.minPoints) ?? RANK_TIERS[0];
    const range = tier.maxPoints === Infinity ? tier.minPoints : tier.maxPoints - tier.minPoints;
    const progress = tier.maxPoints === Infinity ? 100 : Math.min(100, Math.floor(((rankPoints - tier.minPoints) / range) * 100));
    
    // Determine sub-rank (1, 2, or 3)
    let subRankIndex = 0;
    if (tier.subRanks.length === 3) {
        if (progress >= 66) subRankIndex = 2;
        else if (progress >= 33) subRankIndex = 1;
        else subRankIndex = 0;
    }
    const iconName = tier.subRanks[subRankIndex];

    return { tier, progress, iconName, nextThreshold: tier.maxPoints === Infinity ? null : tier.maxPoints + 1 };
}

// GET /api/inventory
export async function GET(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                balance: true,
                rankPoints: true,
                rankTier: true,
                loanTokens: true,
                greenMoney: true,
                portfolios: {
                    include: { asset: true },
                },
                ownedArtifacts: {
                    where: { ownerId: userId },
                    select: {
                        id: true,
                        productId: true,
                        name: true,
                        tier: true,
                        imageUrl: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                },
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const balance = Number(user.balance);
        const totalInvested = user.portfolios.reduce(
            (sum, p) => sum + Number(p.units) * Number(p.asset.currentPrice), 0
        );

        // Net worth: balance + invested (estates/vehicles not in schema yet)
        const netWorth = balance + totalInvested;

        const rankInfo = getRankInfo(user.rankPoints);

        return NextResponse.json({
            user: {
                id: user.id,
                username: user.username,
                balance,
                greenMoney: Number(user.greenMoney),
                rankPoints: user.rankPoints,
                rankTier: user.rankTier,
                loanTokens: user.loanTokens,
                totalInvested,
                netWorth,
            },
            rank: rankInfo,
            portfolios: user.portfolios.map(p => ({
                assetId: p.assetId,
                name: p.asset.name,
                unit: p.asset.unit,
                units: Number(p.units),
                currentPrice: Number(p.asset.currentPrice),
                currentValue: Number(p.units) * Number(p.asset.currentPrice),
            })).filter(p => p.units > 0),
            ownedArtifacts: user.ownedArtifacts.map(a => ({
                id: a.id,
                productId: a.productId,
                name: a.name,
                tier: a.tier,
                imageUrl: a.imageUrl,
            })),
            totalArtifactCount: user.ownedArtifacts.length,
            // Placeholder until estates/vehicles schema is added
            ownedEstates: [],
            ownedVehicles: [],
        });
    } catch (error) {
        console.error('GET /api/inventory error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
