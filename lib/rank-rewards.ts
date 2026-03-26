import { prisma } from '@/lib/db';

export const RANK_PERKS = {
    'Rookie I':      { loanTokens: 1, coupons: [] },
    'Rookie II':     { loanTokens: 1, coupons: [] },
    'Rookie III':    { loanTokens: 1, coupons: [] },
    'Dealer I':      { loanTokens: 2, coupons: [] },
    'Dealer II':     { loanTokens: 2, coupons: [{ type: 'CASHBACK', desc: 'Weekly Cashback Coupon', mult: 1.10 }] },
    'Dealer III':    { loanTokens: 2, coupons: [{ type: 'DISCOUNT', desc: 'Weekly Discount Coupon', mult: 0.90 }] },
    'Financier I':   { loanTokens: 3, coupons: [{ type: 'SHUTTER_PASS', desc: 'Special Shutters Access', mult: 1.0 }] },
    'Financier II':  { loanTokens: 3, coupons: [{ type: 'BID_PULL', desc: 'Weekly Bid Pull', mult: 1.0 }] },
    'Financier III': { loanTokens: 3, coupons: [{ type: 'DISCOUNT', desc: 'Better Discount Coupon', mult: 0.80 }] },
    'Tycoon I':      { loanTokens: 4, coupons: [] }, // No contract fee handled natively in code
    'Tycoon II':     { loanTokens: 4, coupons: [] }, // Loan perks handled natively
    'Tycoon III':    { loanTokens: 4, coupons: [{ type: 'CASHBACK', desc: 'Better Cashback Coupon', mult: 1.20 }] },
    'Crown':         { loanTokens: 5, coupons: [] }, // Loan perks handled natively
    'Crown+':        { loanTokens: 6, coupons: [] }, // Loan perks handled natively
    'Monarch':       { loanTokens: 8, coupons: [{ type: 'PREMIUM', desc: 'Premium Coupon', mult: 2.0 }] },
};

/**
 * Distributes weekly perks for a user based on their current rank.
 * Call this when a user logs in or visits the home page.
 */
export async function processWeeklyPerks(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, rankPoints: true, loanTokens: true, lastWeeklyClaim: true }
    });

    if (!user) return false;

    const now = new Date();
    
    // Check if user claimed in the last 7 days
    if (user.lastWeeklyClaim) {
        const daysSinceLastClaim = (now.getTime() - user.lastWeeklyClaim.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceLastClaim < 7) {
            return false; // Already claimed this week
        }
    }

    // Determine Rank
    const TIERS = [
        { name: 'Rookie I',      min: 0    },
        { name: 'Rookie II',     min: 100  },
        { name: 'Rookie III',    min: 200  },
        { name: 'Dealer I',      min: 300  },
        { name: 'Dealer II',     min: 450  },
        { name: 'Dealer III',    min: 600  },
        { name: 'Financier I',   min: 750  },
        { name: 'Financier II',  min: 900  },
        { name: 'Financier III', min: 1050 },
        { name: 'Tycoon I',      min: 1400 },
        { name: 'Tycoon II',     min: 1600 },
        { name: 'Tycoon III',    min: 1800 },
        { name: 'Crown',         min: 2400 },
        { name: 'Crown+',        min: 3000 },
        { name: 'Monarch',       min: 4200 },
    ];
    
    const currentTier = TIERS.findLast(t => user.rankPoints >= t.min)?.name ?? 'Rookie I';
    const perks = RANK_PERKS[currentTier as keyof typeof RANK_PERKS];

    // Transaction to update user and add coupons
    await prisma.$transaction(async (tx) => {
        // Update user's last claim date and top up their loan tokens to their max allowance
        // (Assuming weekly top-up replaces their tokens to max, or adds? Usually it's a fixed weekly allowance)
        await tx.user.update({
            where: { id: userId },
            data: { 
                lastWeeklyClaim: now,
                loanTokens: Math.max(user.loanTokens, perks.loanTokens) // Top up if below, don't reduce if above
            }
        });

        // Delete expired/unused weekly coupons from previous weeks to prevent hoarding
        await tx.coupon.deleteMany({
            where: {
                userId,
                isUsed: false,
                expiresAt: { not: null }
            }
        });

        // Grant new weekly coupons
        if (perks.coupons.length > 0) {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);

            await tx.coupon.createMany({
                data: perks.coupons.map(coupon => ({
                    userId,
                    type: coupon.type,
                    description: coupon.desc,
                    multiplier: coupon.mult,
                    isUsed: false,
                    expiresAt: nextWeek // Weekly coupons expire in 7 days
                }))
            });
        }
    });

    return true;
}
