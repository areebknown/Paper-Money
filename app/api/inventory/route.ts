import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// Rank thresholds — strictly from rank-system.md
// Each entry is a single named rank with one icon
const RANK_TIERS = [
    { name: 'Rookie I',      icon: 'rookie1',     minPoints: 0,    maxPoints: 99,   loanTokens: 1 },
    { name: 'Rookie II',     icon: 'rookie2',     minPoints: 100,  maxPoints: 199,  loanTokens: 1 },
    { name: 'Rookie III',    icon: 'rookie3',     minPoints: 200,  maxPoints: 299,  loanTokens: 1 },
    { name: 'Dealer I',      icon: 'dealer1',     minPoints: 300,  maxPoints: 449,  loanTokens: 2 },
    { name: 'Dealer II',     icon: 'dealer2',     minPoints: 450,  maxPoints: 599,  loanTokens: 2 },
    { name: 'Dealer III',    icon: 'dealer3',     minPoints: 600,  maxPoints: 749,  loanTokens: 2 },
    { name: 'Financier I',   icon: 'financier1',  minPoints: 750,  maxPoints: 899,  loanTokens: 3 },
    { name: 'Financier II',  icon: 'financier2',  minPoints: 900,  maxPoints: 1049, loanTokens: 3 },
    { name: 'Financier III', icon: 'financier3',  minPoints: 1050, maxPoints: 1399, loanTokens: 3 },
    { name: 'Tycoon I',      icon: 'tycoon1',     minPoints: 1400, maxPoints: 1599, loanTokens: 4 },
    { name: 'Tycoon II',     icon: 'tycoon2',     minPoints: 1600, maxPoints: 1799, loanTokens: 4 },
    { name: 'Tycoon III',    icon: 'tycoon3',     minPoints: 1800, maxPoints: 2399, loanTokens: 4 },
    { name: 'Crown',         icon: 'crown',       minPoints: 2400, maxPoints: 2999, loanTokens: 5 },
    { name: 'Crown+',        icon: 'crown+',      minPoints: 3000, maxPoints: 4199, loanTokens: 6 },
    { name: 'Monarch',       icon: 'monarch',     minPoints: 4200, maxPoints: Infinity, loanTokens: 8 },
];

export function getRankInfo(rankPoints: number) {
    const rank = [...RANK_TIERS].reverse().find(t => rankPoints >= t.minPoints) ?? RANK_TIERS[0];
    const isMax = rank.maxPoints === Infinity;
    const range = isMax ? 1 : rank.maxPoints + 1 - rank.minPoints;
    const progress = isMax ? 100 : Math.min(100, Math.floor(((rankPoints - rank.minPoints) / range) * 100));
    return {
        tier: rank,
        progress,
        iconName: rank.icon,
        nextThreshold: isMax ? null : rank.maxPoints + 1,
    };
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
