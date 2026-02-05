import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';

// GET /api/user/rank - Get current user's rank info
export async function GET() {
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
                rankPoints: true,
                loanTokens: true,
                rankTier: true,
            },
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ rank: user });
    } catch (error) {
        console.error('GET /api/user/rank error:', error);
        return NextResponse.json({ error: 'Failed to fetch rank' }, { status: 500 });
    }
}

// POST /api/user/rank - Update user rank (admin or self-purchase)
export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();

    if (!userId) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const { points, targetUserId } = body;

        const currentUser = await prisma.user.findUnique({ where: { id: userId } });
        if (!currentUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // If admin, can update any user. If regular user, can only buy points for themselves
        const isAdmin = currentUser.isAdmin;
        const userToUpdate = targetUserId && isAdmin ? targetUserId : userId;

        if (!isAdmin && targetUserId && targetUserId !== userId) {
            return NextResponse.json({ error: 'Cannot update other users' }, { status: 403 });
        }

        // If self-purchase, deduct balance
        const pointCost = 100; // ₹100 per rank point (configurable)
        const totalCost = points * pointCost;

        if (!isAdmin && Number(currentUser.balance) < totalCost) {
            return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });
        }

        const updatedUser = await prisma.$transaction(async (tx) => {
            // Deduct balance if self-purchase
            if (!isAdmin) {
                await tx.user.update({
                    where: { id: userId },
                    data: {
                        balance: { decrement: totalCost },
                    },
                });
            }

            // Add rank points
            const user = await tx.user.update({
                where: { id: userToUpdate },
                data: {
                    rankPoints: { increment: points },
                },
            });

            // Auto-upgrade tier based on thresholds
            let newTier = user.rankTier;
            let newLoanTokens = user.loanTokens;

            if (user.rankPoints >= 1000 && user.rankTier !== 'PLATINUM') {
                newTier = 'PLATINUM';
                newLoanTokens = 4;
            } else if (user.rankPoints >= 500 && user.rankTier === 'BRONZE') {
                newTier = 'GOLD';
                newLoanTokens = 3;
            } else if (user.rankPoints >= 200 && user.rankTier === 'BRONZE') {
                newTier = 'SILVER';
                newLoanTokens = 2;
            }

            if (newTier !== user.rankTier) {
                return tx.user.update({
                    where: { id: userToUpdate },
                    data: {
                        rankTier: newTier,
                        loanTokens: newLoanTokens,
                    },
                });
            }

            return user;
        });

        return NextResponse.json({
            rank: {
                rankPoints: updatedUser.rankPoints,
                rankTier: updatedUser.rankTier,
                loanTokens: updatedUser.loanTokens,
            },
        });
    } catch (error) {
        console.error('POST /api/user/rank error:', error);
        return NextResponse.json({ error: 'Failed to update rank' }, { status: 500 });
    }
}
