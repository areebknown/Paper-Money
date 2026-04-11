// ─── Rank System Data ─────────────────────────────────────────────────────────
// Single source of truth. Keep in sync with rank-system.md

export interface RankEntry {
    id: string;         // e.g. "ROOKIE_I"
    name: string;       // e.g. "Rookie I"
    minPoints: number;
    maxPoints: number | null; // null = no upper limit (Monarch)
    pricePerPoint: number;    // in INR
    perks: string[];
    prize: string;
    iconName: string;         // filename without .svg, e.g. "rookie1"
    loanTokenCap: number;     // max parallel loans allowed at this rank
}

export const RANKS: RankEntry[] = [
    {
        id: 'ROOKIE_I',
        name: 'Rookie I',
        minPoints: 0,
        maxPoints: 99,
        pricePerPoint: 1000,
        perks: ['Max 1 parallel loan'],
        prize: '—',
        iconName: 'rookie1',
        loanTokenCap: 1,
    },
    {
        id: 'ROOKIE_II',
        name: 'Rookie II',
        minPoints: 100,
        maxPoints: 200,
        pricePerPoint: 1000,
        perks: ['Lesser interest on loans'],
        prize: '5 Lithium Packets',
        iconName: 'rookie2',
        loanTokenCap: 1,
    },
    {
        id: 'ROOKIE_III',
        name: 'Rookie III',
        minPoints: 201,
        maxPoints: 300,
        pricePerPoint: 1000,
        perks: ['Lesser interest on loans'],
        prize: '5 Lithium Packets',
        iconName: 'rookie3',
        loanTokenCap: 1,
    },
    {
        id: 'DEALER_I',
        name: 'Dealer I',
        minPoints: 301,
        maxPoints: 450,
        pricePerPoint: 1500,
        perks: ['Max 2 parallel loans'],
        prize: '5 Silver Biscuits',
        iconName: 'dealer1',
        loanTokenCap: 2,
    },
    {
        id: 'DEALER_II',
        name: 'Dealer II',
        minPoints: 451,
        maxPoints: 600,
        pricePerPoint: 1500,
        perks: ['Weekly Cashback Coupon'],
        prize: '6 Silver Biscuits',
        iconName: 'dealer2',
        loanTokenCap: 2,
    },
    {
        id: 'DEALER_III',
        name: 'Dealer III',
        minPoints: 601,
        maxPoints: 750,
        pricePerPoint: 1500,
        perks: ['Weekly Discount Coupon'],
        prize: '7 Silver Biscuits',
        iconName: 'dealer3',
        loanTokenCap: 2,
    },
    {
        id: 'FINANCIER_I',
        name: 'Financier I',
        minPoints: 751,
        maxPoints: 900,
        pricePerPoint: 2500,
        perks: ['Special Shutters access'],
        prize: '3 Crude Oil Barrels',
        iconName: 'financier1',
        loanTokenCap: 3,
    },
    {
        id: 'FINANCIER_II',
        name: 'Financier II',
        minPoints: 901,
        maxPoints: 1050,
        pricePerPoint: 3000,
        perks: ['Bid Pull'],
        prize: '4 Crude Oil Barrels',
        iconName: 'financier2',
        loanTokenCap: 3,
    },
    {
        id: 'FINANCIER_III',
        name: 'Financier III',
        minPoints: 1051,
        maxPoints: 1400,
        pricePerPoint: 3500,
        perks: ['Better Discount Coupon'],
        prize: '5 Crude Oil Barrels',
        iconName: 'financier3',
        loanTokenCap: 3,
    },
    {
        id: 'TYCOON_I',
        name: 'Tycoon I',
        minPoints: 1401,
        maxPoints: 1600,
        pricePerPoint: 4500,
        perks: ['No contract fee'],
        prize: '1 Gold Biscuit',
        iconName: 'tycoon1',
        loanTokenCap: 4,
    },
    {
        id: 'TYCOON_II',
        name: 'Tycoon II',
        minPoints: 1601,
        maxPoints: 1800,
        pricePerPoint: 6000,
        perks: ['200% loan at 18% CI rate'],
        prize: '30 Lithium Packets',
        iconName: 'tycoon2',
        loanTokenCap: 4,
    },
    {
        id: 'TYCOON_III',
        name: 'Tycoon III',
        minPoints: 1801,
        maxPoints: 2400,
        pricePerPoint: 8000,
        perks: ['Better Cashback Coupon'],
        prize: '40 Lithium Packets',
        iconName: 'tycoon3',
        loanTokenCap: 4,
    },
    {
        id: 'CROWN',
        name: 'Crown',
        minPoints: 2401,
        maxPoints: 3000,
        pricePerPoint: 15000,
        perks: ['200% loan at 15% CI rate'],
        prize: '2 Gold Biscuits',
        iconName: 'crown',
        loanTokenCap: 5,
    },
    {
        id: 'CROWN_PLUS',
        name: 'Crown+',
        minPoints: 3001,
        maxPoints: 4200,
        pricePerPoint: 25000,
        perks: ['220% loan at 15% CI rate'],
        prize: '2 Gold Biscuits',
        iconName: 'crown+',
        loanTokenCap: 6,
    },
    {
        id: 'MONARCH',
        name: 'Monarch',
        minPoints: 4201,
        maxPoints: null,
        pricePerPoint: 25000,
        perks: ['Premium Coupon'],
        prize: '5 Gold Biscuits',
        iconName: 'monarch',
        loanTokenCap: 8,
    },
];

// ─── Helper: get rank from point value ────────────────────────────────────────
export function getRankFromPoints(points: number): RankEntry {
    // Walk from top down, return first rank the user qualifies for
    for (let i = RANKS.length - 1; i >= 0; i--) {
        if (points >= RANKS[i].minPoints) return RANKS[i];
    }
    return RANKS[0];
}

// ─── Milestones ───────────────────────────────────────────────────────────────
export interface Milestone {
    id: string;
    description: string;
    points: number;
}

export const MILESTONES: Milestone[] = [
    { id: 'NETWORTH_2L',        description: 'Reach ₹2 Lakh Net Worth',                    points: 50 },
    { id: 'FIRST_GOLD_BAR',     description: 'Buy 1 Gold Bar for the First Time',           points: 20 },
    { id: 'NETWORTH_10L',       description: 'Reach ₹10 Lakh Net Worth',                   points: 80 },
    { id: 'NETWORTH_1CR',       description: 'Reach ₹1 Crore Net Worth',                   points: 120 },
    { id: 'FIRST_SHUTTER_WIN',  description: 'Win Your First Shutter',                      points: 10 },
    { id: 'FIRST_LOAN',         description: 'Take Your First Loan',                        points: 10 },
    { id: 'FIRST_CONTRACT',     description: 'Make Your First Contract',                    points: 10 },
    { id: 'HAVE_ANTIQUE',       description: 'Own an Antique Item',                         points: 20 },
    { id: 'ITEM_OVER_1L',       description: 'Own an Item Worth Over ₹1 Lakh',              points: 20 },
    { id: 'DIAMOND_SHUTTER',    description: 'Participate in a Diamond Rank Shutter',       points: 30 },
    { id: 'GOLDEN_SHUTTER',     description: 'Participate in a Golden Rank Shutter',        points: 20 },
    { id: 'ITEM_OVER_1CR',      description: 'Own an Item Worth Over ₹1 Crore',             points: 120 },
];
