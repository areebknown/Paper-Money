import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getUserIdFromRequest } from '@/lib/auth';
import { deductBalance } from '@/lib/deductBalance';
import { getRankFromPoints, RANKS } from '@/lib/rankData';

const MONTHLY_CAP = 150;

// ─── GET /api/user/rank ────────────────────────────────────────────────────────
export async function GET() {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                username: true,
                profileImage: true,
                rankPoints: true,
                loanTokens: true,
                loanTokenCap: true,
                balance: true,
                pointsPurchasedThisMonth: true,
                pointsMonthResetAt: true,
                completedMilestones: true,
            },
        });

        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        // Derive current rank from points
        const currentRank = getRankFromPoints(user.rankPoints);

        // Compute leaderboard position via indexed count
        const usersAbove = await prisma.user.count({
            where: { rankPoints: { gt: user.rankPoints } },
        });
        const leaderboardPosition = usersAbove + 1;

        // How many points can the user still buy this month?
        const now = new Date();
        let purchased = user.pointsPurchasedThisMonth;
        if (
            !user.pointsMonthResetAt ||
            user.pointsMonthResetAt.getMonth() !== now.getMonth() ||
            user.pointsMonthResetAt.getFullYear() !== now.getFullYear()
        ) {
            // New calendar month — reset counter
            purchased = 0;
        }
        const remainingCap = Math.max(0, MONTHLY_CAP - purchased);

        return NextResponse.json({
            rankPoints: user.rankPoints,
            loanTokens: user.loanTokens,
            loanTokenCap: user.loanTokenCap,
            balance: user.balance,
            currentRank,
            pointsPurchasedThisMonth: purchased,
            remainingCap,
            leaderboardPosition,
            completedMilestones: user.completedMilestones,
            username: user.username,
            profileImage: user.profileImage,
        });
    } catch (error) {
        console.error('GET /api/user/rank error:', error);
        return NextResponse.json({ error: 'Failed to fetch rank' }, { status: 500 });
    }
}

// ─── POST /api/user/rank — Buy points ─────────────────────────────────────────
export async function POST(req: Request) {
    const userId = await getUserIdFromRequest();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    try {
        const body = await req.json();
        const { points, targetUserId } = body;

        if (!points || typeof points !== 'number' || points < 1) {
            return NextResponse.json({ error: 'Invalid points value' }, { status: 400 });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                isAdmin: true,
                rankPoints: true,
                balance: true,
                loanTokens: true,
                loanTokenCap: true,
                pointsPurchasedThisMonth: true,
                pointsMonthResetAt: true,
            },
        });
        if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const isAdmin = currentUser.isAdmin;
        const isSelf = !targetUserId || targetUserId === userId;
        const userToUpdateId = (!isSelf && isAdmin) ? targetUserId : userId;

        // Skip payment and caps ONLY if an admin is giving points to *someone else*
        const bypassChecks = isAdmin && !isSelf;

        if (!isAdmin && !isSelf) {
            return NextResponse.json({ error: 'Cannot update other users' }, { status: 403 });
        }

        // ── Monthly cap check ──────────────────────────────
        if (!bypassChecks) {
            const now = new Date();
            let purchased = currentUser.pointsPurchasedThisMonth;
            const needsReset =
                !currentUser.pointsMonthResetAt ||
                currentUser.pointsMonthResetAt.getMonth() !== now.getMonth() ||
                currentUser.pointsMonthResetAt.getFullYear() !== now.getFullYear();

            if (needsReset) purchased = 0;

            if (purchased + points > MONTHLY_CAP) {
                return NextResponse.json({
                    error: `Monthly cap reached. You can buy at most ${MONTHLY_CAP - purchased} more points this month.`,
                }, { status: 400 });
            }
        }

        // ── Determine price from current rank ────────────────────────────────
        const userToUpdate = userToUpdateId !== userId
            ? await prisma.user.findUnique({ where: { id: userToUpdateId }, select: { rankPoints: true, loanTokens: true, loanTokenCap: true } })
            : null;
        const targetPoints = userToUpdate?.rankPoints ?? currentUser.rankPoints;
        const currentRank = getRankFromPoints(targetPoints);
        const pricePerPoint = currentRank.pricePerPoint;
        const totalCost = points * pricePerPoint;

        if (!bypassChecks && Number(currentUser.balance) < totalCost) {
            return NextResponse.json({
                error: `Insufficient balance. Need ₹${totalCost.toLocaleString('en-IN')}, have ₹${Number(currentUser.balance).toLocaleString('en-IN')}.`,
            }, { status: 400 });
        }

        // ── Transaction ───────────────────────────────────────────────────────
        const updated = await prisma.$transaction(async (tx) => {
            if (!bypassChecks) {
                await deductBalance(tx, userId, totalCost);
            }

            const afterUpdate = await tx.user.update({
                where: { id: userToUpdateId },
                data: { rankPoints: { increment: points } },
                select: { rankPoints: true, loanTokens: true, loanTokenCap: true },
            });

            // Auto-update loan token cap if user crossed into a higher rank tier
            const newRank = getRankFromPoints(afterUpdate.rankPoints);
            const oldRank = getRankFromPoints(targetPoints);
            const capDiff = newRank.loanTokenCap - oldRank.loanTokenCap;

            let finalLoanTokens = afterUpdate.loanTokens;
            let finalLoanTokenCap = afterUpdate.loanTokenCap;

            if (capDiff > 0) {
                finalLoanTokenCap = newRank.loanTokenCap;
                finalLoanTokens = afterUpdate.loanTokens + capDiff; // give back new slots
                await tx.user.update({
                    where: { id: userToUpdateId },
                    data: { loanTokenCap: finalLoanTokenCap, loanTokens: finalLoanTokens },
                });
            }

            // Update monthly counter
            if (!bypassChecks) {
                const now = new Date();
                const needsReset =
                    !currentUser.pointsMonthResetAt ||
                    currentUser.pointsMonthResetAt.getMonth() !== now.getMonth() ||
                    currentUser.pointsMonthResetAt.getFullYear() !== now.getFullYear();

                await tx.user.update({
                    where: { id: userId },
                    data: {
                        pointsPurchasedThisMonth: needsReset ? points : { increment: points },
                        pointsMonthResetAt: needsReset ? now : undefined,
                    },
                });
            }

            return {
                rankPoints: afterUpdate.rankPoints,
                loanTokens: finalLoanTokens,
                loanTokenCap: finalLoanTokenCap,
                newRank,
            };
        });

        return NextResponse.json({
            success: true,
            rankPoints: updated.rankPoints,
            loanTokens: updated.loanTokens,
            loanTokenCap: updated.loanTokenCap,
            currentRank: updated.newRank,
        });
    } catch (error) {
        console.error('POST /api/user/rank error:', error);
        return NextResponse.json({ error: 'Failed to update rank' }, { status: 500 });
    }
}
