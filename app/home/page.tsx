'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, User, ChevronRight } from 'lucide-react';
import RankBadge from '@/components/RankBadge';
import BottomNav from '@/components/BottomNav';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<'bids' | 'market'>('bids');
    const [showProfileMenu, setShowProfileMenu] = useState(false);

    // Mock user data
    const userData = {
        balance: 34000,
        rankPoints: 340,
        rankTier: 'GOLD' as const,
    };

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-[200] bg-slate-900 border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Balance & Rank */}
                    <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-gray-500 uppercase tracking-wide">Balance</span>
                        <span className="text-lg font-bold text-gray-100">
                            ₹{userData.balance.toLocaleString()}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <RankBadge tier={userData.rankTier} size="sm" />
                            <span className="text-xs font-semibold text-gray-400">
                                {userData.rankPoints} pts
                            </span>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 -translate-x-1/2">
                        <Image
                            src="/bid-wars-logo.png"
                            alt="Bid Wars"
                            width={100}
                            height={45}
                            priority
                            className="object-contain"
                        />
                    </div>

                    {/* Right: Profile & Notifications */}
                    <div className="flex items-center gap-2">
                        <button className="relative p-2 hover:bg-gray-800 rounded-full transition">
                            <Bell className="w-5 h-5 text-gray-400" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-cyan-500 rounded-full" />
                        </button>
                        <div className="relative">
                            <button
                                onClick={() => setShowProfileMenu(!showProfileMenu)}
                                className="p-1.5 hover:bg-gray-800 rounded-full transition"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                            </button>

                            {/* Profile Dropdown */}
                            {showProfileMenu && (
                                <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl overflow-hidden z-50">
                                    <button
                                        onClick={() => {
                                            setShowProfileMenu(false);
                                            window.location.href = '/profile';
                                        }}
                                        className="w-full px-4 py-3 text-left text-gray-200 hover:bg-gray-700 transition flex items-center gap-2"
                                    >
                                        <User className="w-4 h-4" />
                                        Profile
                                    </button>
                                    <button
                                        onClick={async () => {
                                            // Call logout API to clear cookie server-side
                                            await fetch('/api/auth/logout', { method: 'POST' });
                                            // Redirect to login
                                            window.location.href = '/login';
                                        }}
                                        className="w-full px-4 py-3 text-left text-red-400 hover:bg-gray-700 transition"
                                    >
                                        Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="px-6 py-4">
                {/* Tab Toggle */}
                <div className="flex gap-2 bg-gray-800 p-1 rounded-lg mb-6">
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${activeTab === 'bids'
                            ? 'bg-cyan-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Bids
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`flex-1 py-2 px-4 rounded-md font-semibold text-sm transition-all ${activeTab === 'market'
                            ? 'bg-cyan-500 text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-200'
                            }`}
                    >
                        Market
                    </button>
                </div>

                {activeTab === 'bids' ? <BidsTab /> : <MarketTab />}
            </main>

            {/* Bottom Navigation */}
            <BottomNav />
        </div>
    );
}

function BidsTab() {
    const scheduledBids = [
        { id: '1', name: 'Shutter #1', rank: 'GOLD' as const, startTime: '10:00 AM', startingPrice: 5000 },
        { id: '2', name: 'Shutter #2', rank: 'SILVER' as const, startTime: '2:30 PM', startingPrice: 2000 },
    ];

    const wonBids = [
        { id: '3', name: 'Shutter #127', status: 'WON', finalPrice: 25000, timestamp: '2 days ago' },
    ];

    return (
        <div className="space-y-6">
            {/* Scheduled Bids */}
            <section>
                <h2 className="text-lg font-bold text-gray-100 mb-4">Scheduled Bids</h2>
                <div className="space-y-3">
                    {scheduledBids.map((bid) => (
                        <div key={bid.id} className="card hover:shadow-md cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="text-4xl">
                                    {bid.rank === 'GOLD' ? '🥇' : bid.rank === 'SILVER' ? '🥈' : '🥉'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-gray-100 mb-1">{bid.name}</h3>
                                    <p className="text-sm text-gray-300 mb-0.5">Starts at {bid.startTime}</p>
                                    <p className="text-sm text-gray-500">
                                        Starting Price: ₹{bid.startingPrice.toLocaleString()}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <RankBadge tier={bid.rank} size="sm" />
                                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-500 transition-colors" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Won Bids */}
            <section>
                <h2 className="text-lg font-bold text-gray-100 mb-4">Won Shutters</h2>
                <div className="space-y-3">
                    {wonBids.map((bid) => (
                        <div key={bid.id} className="card hover:shadow-md cursor-pointer border-l-4 border-green-500">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="font-bold text-gray-100 mb-1">{bid.name}</h3>
                                    <p className="text-sm text-gray-300 mb-0.5">
                                        Final Price: ₹{bid.finalPrice.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500">{bid.timestamp}</p>
                                </div>
                                <span className="inline-flex items-center px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-semibold">
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
        { id: 'invest', name: 'Invest', icon: '📈', description: 'Trade minerals & assets', color: 'from-blue-500 to-cyan-500' },
        { id: 'pawn', name: 'Pawn', icon: '🏪', description: 'Open your shop', color: 'from-purple-500 to-pink-500' },
        { id: 'dig', name: 'Dig', icon: '⛏️', description: 'Mine for resources', color: 'from-orange-500 to-red-500' },
        { id: 'consumer', name: 'Consumer', icon: '🏠', description: 'Buy land, cars & more', color: 'from-green-500 to-emerald-500' },
    ];

    return (
        <div className="space-y-4">
            <h2 className="text-lg font-bold text-gray-100">Market Categories</h2>
            <div className="grid grid-cols-2 gap-4">
                {categories.map((category) => (
                    <button key={category.id} className="card hover:shadow-lg active:scale-95 transition-all text-left group">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center text-3xl mb-3 group-hover:scale-110 transition-transform`}>
                            {category.icon}
                        </div>
                        <h3 className="font-bold text-gray-100 mb-1">{category.name}</h3>
                        <p className="text-sm text-gray-500">{category.description}</p>
                    </button>
                ))}
            </div>
        </div>
    );
}
