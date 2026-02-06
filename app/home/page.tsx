'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Bell, User, ChevronRight } from 'lucide-react';
import Link from 'next/link';
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
    const [scheduledBids, setScheduledBids] = useState<any[]>([]);
    const [liveBids, setLiveBids] = useState<any[]>([]); // New state for live auctions
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAuctions() {
            try {
                const res = await fetch('/api/auctions');
                if (res.ok) {
                    const data = await res.json();
                    const auctions = data.auctions || [];

                    setScheduledBids(auctions.filter((a: any) => a.status === 'SCHEDULED'));
                    setLiveBids(auctions.filter((a: any) => a.status === 'LIVE' || a.status === 'REVEALING' || a.status === 'BIDDING'));
                }
            } catch (e) {
                console.error('Failed to fetch auctions');
            } finally {
                setLoading(false);
            }
        }
        fetchAuctions();
    }, []);

    if (loading) {
        return <div className="text-center py-10 text-gray-500">Loading auctions...</div>;
    }

    // Sort functions
    const sortByTime = (a: any, b: any) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime();

    return (
        <div className="space-y-6">
            {/* Live Bids */}
            {liveBids.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
                        <h2 className="text-lg font-bold text-gray-100">Live Now</h2>
                    </div>
                    <div className="space-y-3">
                        {liveBids.map((bid) => (
                            <Link href={`/bid/${bid.id}`} key={bid.id}>
                                <div className="card hover:shadow-md cursor-pointer group border-l-4 border-red-500 bg-red-900/10 mb-3">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">🔥</div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-100 mb-1">{bid.name}</h3>
                                            <p className="text-sm text-red-400 font-bold animate-pulse">
                                                Current Price: ₹{Number(bid.currentPrice).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="px-4 py-2 bg-red-600 font-bold text-white rounded-lg text-sm">
                                            JOIN
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Scheduled Bids */}
            <section>
                <h2 className="text-lg font-bold text-gray-100 mb-4">Upcoming Auctions</h2>
                {scheduledBids.length === 0 && liveBids.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-900/50 rounded-lg">
                        No scheduled auctions. Check back later!
                    </div>
                ) : (
                    <div className="space-y-3">
                        {scheduledBids.sort(sortByTime).map((bid) => (
                            <Link href={`/bid/${bid.id}`} key={bid.id}>
                                <div className="card hover:shadow-md cursor-pointer group hover:bg-gray-800/80 transition-colors">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">
                                            {bid.rankTier === 'GOLD' ? '🥇' : bid.rankTier === 'SILVER' ? '🥈' : '🥉'}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-100 mb-1">{bid.name}</h3>
                                            <p className="text-sm text-gray-300 mb-0.5">
                                                Starts: {new Date(bid.scheduledAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                                            </p>
                                            <p className="text-sm text-gray-500">
                                                Starting Price: ₹{Number(bid.startingPrice).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <RankBadge tier={bid.rankTier} size="sm" />
                                            <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
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
