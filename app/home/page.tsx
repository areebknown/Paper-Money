'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, User } from 'lucide-react';
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
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-sticky bg-white border-b border-[var(--color-border-light)] px-6 py-4">
                <div className="flex items-center justify-between">
                    {/* Left: Balance & Rank */}
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-xs text-[var(--color-text-tertiary)]">Balance</span>
                            <span className="text-lg font-bold text-[var(--color-text-primary)]">
                                ₹{userData.balance.toLocaleString()}
                            </span>
                        </div>
                        <div className="h-10 w-px bg-[var(--color-border)]" />
                        <div className="flex items-center gap-2">
                            <RankBadge tier={userData.rankTier} size="sm" />
                            <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
                                {userData.rankPoints}
                            </span>
                        </div>
                    </div>

                    {/* Right: Profile & Notifications */}
                    <div className="flex items-center gap-3">
                        <button className="relative p-2 hover:bg-[var(--color-hover)] rounded-full transition">
                            <Bell className="w-5 h-5 text-[var(--color-text-secondary)]" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
                        </button>
                        <button className="p-2 hover:bg-[var(--color-hover)] rounded-full transition">
                            <div className="w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-yellow-900" />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Logo - Centered */}
                <div className="flex justify-center mt-4 mb-3">
                    <Image
                        src="/bid-wars-logo.png"
                        alt="Bid Wars"
                        width={180}
                        height={80}
                        priority
                        className="object-contain"
                    />
                </div>

                {/* Tab Toggle */}
                <div className="flex gap-2 mt-4 bg-[var(--color-bg-tertiary)] p-1 rounded-lg">
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`
              flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all
              ${activeTab === 'bids'
                                ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }
            `}
                    >
                        Bids
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`
              flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all
              ${activeTab === 'market'
                                ? 'bg-white text-[var(--color-text-primary)] shadow-sm'
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'
                            }
            `}
                    >
                        Market
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="px-6 py-6">
                {activeTab === 'bids' ? <BidsTab /> : <MarketTab />}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
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
        <div className="space-y-6">
            {/* Scheduled Bids */}
            <section>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                    Scheduled Bids
                </h2>
                <div className="space-y-3">
                    {scheduledBids.map((bid) => (
                        <div key={bid.id} className="card hover:shadow-md cursor-pointer">
                            <div className="flex items-center gap-3">
                                {/* Rank Icon */}
                                <div className="text-4xl">
                                    {bid.rank === 'GOLD' ? '🥇' : bid.rank === 'SILVER' ? '🥈' : '🥉'}
                                </div>

                                {/* Info */}
                                <div className="flex-1">
                                    <h3 className="font-bold text-[var(--color-text-primary)]">{bid.name}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Starts at {bid.startTime}
                                    </p>
                                    <p className="text-sm text-[var(--color-text-tertiary)]">
                                        Starting Price: ₹{bid.startingPrice.toLocaleString()}
                                    </p>
                                </div>

                                {/* Badge */}
                                <RankBadge tier={bid.rank} size="sm" />
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Won / Past Bids */}
            <section>
                <h2 className="text-lg font-bold text-[var(--color-text-primary)] mb-4">
                    Won Shutters
                </h2>
                <div className="space-y-3">
                    {wonBids.map((bid) => (
                        <div key={bid.id} className="card hover:shadow-md cursor-pointer border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-[var(--color-text-primary)]">{bid.name}</h3>
                                    <p className="text-sm text-[var(--color-text-secondary)]">
                                        Final Price: ₹{bid.finalPrice.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-[var(--color-text-tertiary)]">{bid.timestamp}</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                                    WON ✓
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

function MarketTab() {
    const categories = [
        {
            id: 'invest',
            name: 'Invest',
            icon: '📈',
            description: 'Trade minerals & assets',
            color: 'from-blue-400 to-blue-600',
        },
        {
            id: 'pawn',
            name: 'Pawn',
            icon: '🏪',
            description: 'Open your shop',
            color: 'from-purple-400 to-purple-600',
        },
        {
            id: 'dig',
            name: 'Dig',
            icon: '⛏️',
            description: 'Mine for resources',
            color: 'from-orange-400 to-orange-600',
        },
        {
            id: 'consumer',
            name: 'Consumer',
            icon: '🏠',
            description: 'Buy land, cars & more',
            color: 'from-green-400 to-green-600',
        },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">
                Market Categories
            </h2>
            <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                    <button
                        key={category.id}
                        className="card hover:shadow-lg active:scale-95 transition-all text-left"
                    >
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-2xl mb-3`}>
                            {category.icon}
                        </div>
                        <h3 className="font-bold text-[var(--color-text-primary)] mb-1">
                            {category.name}
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)]">
                            {category.description}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}
