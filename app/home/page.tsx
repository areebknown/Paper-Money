'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, User, ChevronRight } from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import BottomNav from '@/components/BottomNav';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<'bids' | 'market'>('bids');

    // Mock user data - will be replaced with real data later
    const userData = {
        balance: 34000,
        rankPoints: 340,
        rankTier: 'GOLD' as const,
    };

    return (
        <div className=\"min-h-screen bg-[var(--color-bg-primary)] pb-24\">
    {/* Header */ }
    <header className=\"sticky top-0 z-sticky bg-[var(--color-bg-card)] border-b border-[var(--color-border)] px-6 py-4\">
        < div className =\"flex items-center justify-between mb-4\">
    {/* Left: Balance & Rank */ }
    <div className=\"flex items-center gap-4\">
        < div className =\"flex flex-col\">
            < span className =\"text-xs text-[var(--color-text-tertiary)] uppercase tracking-wide\">Balance</span>
                < span className =\"text-xl font-bold text-[var(--color-text-primary)]\">
                                ₹{ userData.balance.toLocaleString() }
                            </span >
                        </div >
        <div className=\"h-10 w-px bg-[var(--color-border)]\" />
            < div className =\"flex items-center gap-2\">
                < RankBadge tier = { userData.rankTier } size =\"sm\" />
                    < span className =\"text-sm font-semibold text-[var(--color-text-secondary)]\">
    { userData.rankPoints }
                            </span >
                        </div >
                    </div >

        {/* Right: Profile & Notifications */ }
        < div className =\"flex items-center gap-3\">
            < button className =\"relative p-2 hover:bg-[var(--color-hover)] rounded-full transition\">
                < Bell className =\"w-5 h-5 text-[var(--color-text-secondary)]\" />
                    < span className =\"absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent-primary)] rounded-full\" />
                        </button >
        <button className=\"p-2 hover:bg-[var(--color-hover)] rounded-full transition\">
            < div className =\"w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center\">
                < User className =\"w-5 h-5 text-white\" />
                            </div >
                        </button >
                    </div >
                </div >

        {/* Logo - Centered */ }
        < div className =\"flex justify-center mb-4\">
            < Image
    src =\"/bid-wars-logo.png\"
    alt =\"Bid Wars\"
    width = { 160}
    height = { 70}
    priority
    className =\"object-contain\"
        />
                </div >

        {/* Tab Toggle */ }
        < div className =\"flex gap-2 bg-[var(--color-bg-tertiary)] p-1 rounded-lg\">
            < button
    onClick = {() => setActiveTab('bids')
}
className = {`
              flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all
              ${activeTab === 'bids'
        ? 'bg-[var(--color-accent-primary)] text-white shadow-lg'
        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
    }
            `}
                    >
    Bids
                    </button >
    <button
        onClick={() => setActiveTab('market')}
        className={`
              flex-1 py-2.5 px-4 rounded-md font-semibold text-sm transition-all
              ${activeTab === 'market'
                ? 'bg-[var(--color-accent-primary)] text-white shadow-lg'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
            }
            `}
    >
        Market
    </button>
                </div >
            </header >

    {/* Content */ }
    < main className =\"px-6 py-6\">
{ activeTab === 'bids' ? <BidsTab /> : <MarketTab /> }
            </main >

    {/* Bottom Navigation */ }
    < BottomNav />
        </div >
    );
}

function BidsTab() {
    const scheduledBids = [
        {
            id: '1',
            name: 'Shutter #1',
            rank: 'GOLD' as const,
            startTime: '10:00 AM',
            startingPrice: 5000,
        },
        {
            id: '2',
            name: 'Shutter #2',
            rank: 'SILVER' as const,
            startTime: '2:30 PM',
            startingPrice: 2000,
        },
    ];

    const wonBids = [
        {
            id: '3',
            name: 'Shutter #127',
            status: 'WON',
            finalPrice: 25000,
            timestamp: '2 days ago',
        },
    ];

    return (
        <div className=\"space-y-6\">
    {/* Scheduled Bids */ }
            <section>
                <h2 className=\"text-lg font-bold text-[var(--color-text-primary)] mb-4\">
                    Scheduled Bids
                </h2>
                <div className=\"space-y-3\">
    {
        scheduledBids.map((bid) => (
            <div key={bid.id} className=\"card hover:shadow-md cursor-pointer group\">
        < div className =\"flex items-center gap-4\">
                                {/* Rank Icon */ }
            < div className =\"text-4xl\">
                                    { bid.rank === 'GOLD' ? '🥇' : bid.rank === 'SILVER' ? '🥈' : '🥉' }
                                </div >

            {/* Info */ }
            < div className =\"flex-1\">
        < h3 className =\"font-bold text-[var(--color-text-primary)] mb-1\">{bid.name}</h3>
        < p className =\"text-sm text-[var(--color-text-secondary)] mb-0.5\">
                                        Starts at { bid.startTime }
                                    </p >
            <p className=\"text-sm text-[var(--color-text-tertiary)]\">
                                        Starting Price: ₹{ bid.startingPrice.toLocaleString() }
                                    </p >
                                </div >

            {/* Badge & Arrow */ }
            < div className =\"flex items-center gap-3\">
        < RankBadge tier = { bid.rank } size =\"sm\" />
        < ChevronRight className =\"w-5 h-5 text-[var(--color-text-tertiary)] group-hover:text-[var(--color-accent-primary)] transition-colors\" />
                                </div >
                            </div >
                        </div >
                    ))
    }
                </div >
            </section >

        {/* Won / Past Bids */ }
        < section >
        <h2 className=\"text-lg font-bold text-[var(--color-text-primary)] mb-4\">
                    Won Shutters
                </h2 >
        <div className=\"space-y-3\">
    {
        wonBids.map((bid) => (
            <div key={bid.id} className=\"card hover:shadow-md cursor-pointer border-l-4 border-[var(--color-success)]\">
        < div className =\"flex items-center justify-between\">
        < div >
        <h3 className=\"font-bold text-[var(--color-text-primary)] mb-1\">{bid.name}</h3>
        < p className =\"text-sm text-[var(--color-text-secondary)] mb-0.5\">
                                        Final Price: ₹{ bid.finalPrice.toLocaleString() }
                                    </p >
            <p className=\"text-xs text-[var(--color-text-tertiary)]\">{bid.timestamp}</p>
                                </div >
            <span className=\"inline-flex items-center px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold\">
                                    WON ✓
                                </span >
                            </div >
                        </div >
                    ))
    }
                </div >
            </section >
        </div >
    );
}

function MarketTab() {
    const categories = [
        {
            id: 'invest',
            name: 'Invest',
            icon: '📈',
            description: 'Trade minerals & assets',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            id: 'pawn',
            name: 'Pawn',
            icon: '🏪',
            description: 'Open your shop',
            color: 'from-purple-500 to-pink-500',
        },
        {
            id: 'dig',
            name: 'Dig',
            icon: '⛏️',
            description: 'Mine for resources',
            color: 'from-orange-500 to-red-500',
        },
        {
            id: 'consumer',
            name: 'Consumer',
            icon: '🏠',
            description: 'Buy land, cars & more',
            color: 'from-green-500 to-emerald-500',
        },
    ];

    return (
        <div className=\"space-y-4\">
            < h2 className =\"text-lg font-bold text-[var(--color-text-primary)]\">
                Market Categories
            </h2 >
        <div className=\"grid grid-cols-2 gap-4\">
    {
        categories.map((category) => (
            <button
                key={category.id}
                className=\"card hover:shadow-lg active:scale-95 transition-all text-left group\"
        >
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform`}>
                            {category.icon}
                        </div>
                        <h3 className=\"font-bold text-[var(--color-text-primary)] mb-1\">
                            { category.name }
                        </h3 >
            <p className=\"text-sm text-[var(--color-text-tertiary)]\">
                            { category.description }
                        </p >
                    </button >
                ))
    }
            </div >
        </div >
    );
}
