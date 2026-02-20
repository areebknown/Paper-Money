'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<'bids' | 'market'>('bids');
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();
                    setUserData(data.user);
                }
            } catch (e) {
                console.error('Failed to fetch user');
            } finally {
                setLoading(false);
            }
        }
        fetchUser();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#111827] flex items-center justify-center">
                <div className="text-white text-lg">Loading...</div>
            </div>
        );
    }

    const balance = userData?.balance ? Number(userData.balance) : 0;
    const rankPoints = userData?.rankPoints || 0;

    return (
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] font-['Inter'] antialiased flex flex-col">
            {/* Header */}
            <header className="bg-[#1E3A8A] bg-opacity-95 shadow-lg z-40 pb-4 pt-5 rounded-b-3xl">
                <div className="flex justify-between items-center px-4 mb-4 relative">
                    {/* Left: Balance + Rank Points */}
                    <div className="flex flex-col gap-1 w-auto">
                        <div className="flex items-center gap-1 bg-black/30 px-3 py-1.5 rounded-full border border-white/10 whitespace-nowrap">
                            <span className="material-icons-round text-[#FBBF24] text-sm drop-shadow-md">currency_rupee</span>
                            <span className="text-white text-xs font-bold font-['Russo_One'] tracking-wide">
                                {balance.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 px-2 py-1 rounded-full border border-white/10">
                            <span className="material-icons-round text-blue-400 text-sm drop-shadow-md">military_tech</span>
                            <span className="text-white text-xs font-bold font-['Russo_One'] tracking-wide">{rankPoints}</span>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <img
                            src="https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto,f_auto/ui/bid-wars-logo"
                            alt="Bid Wars Logo"
                            className="drop-shadow-lg object-contain h-14 w-auto"
                        />
                    </div>

                    {/* Right: Notifications + Profile */}
                    <div className="flex items-center gap-3 w-24 justify-end">
                        <button className="relative w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
                            <span className="material-icons-round text-white">notifications</span>
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1E3A8A]"></span>
                        </button>
                        <Link href="/profile">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBBF24] to-orange-500 p-0.5 shadow-lg cursor-pointer">
                                <div className="w-full h-full rounded-full border-2 border-white bg-gray-700 flex items-center justify-center">
                                    <span className="material-icons-round text-white text-xl">person</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex px-4 mt-6 gap-2">
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`flex-1 font-['Russo_One'] text-2xl py-3 rounded-t-xl transition-transform border-t-2 border-x-2 border-white/20 ${activeTab === 'bids'
                            ? 'bg-[#FBBF24] text-[#1E3A8A] shadow-[0_4px_0_0_rgba(0,0,0,0.2)] relative z-10 transform translate-y-1'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600 shadow-inner'
                            }`}
                    >
                        BIDS
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`flex-1 font-['Russo_One'] text-2xl py-3 rounded-t-xl transition-transform border-t-2 border-x-2 border-white/20 ${activeTab === 'market'
                            ? 'bg-[#FBBF24] text-[#1E3A8A] shadow-[0_4px_0_0_rgba(0,0,0,0.2)] relative z-10 transform translate-y-1'
                            : 'bg-gray-700 text-gray-400 hover:bg-gray-600 shadow-inner'
                            }`}
                    >
                        MARKET
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto px-4 py-6 pb-24 relative">
                {activeTab === 'bids' ? <BidsContent /> : <MarketContent />}
            </main>

            {/* Bottom Nav */}
            <BottomNav />

            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </div>
    );
}

function BidsContent() {
    const [scheduledBids, setScheduledBids] = useState<any[]>([]);
    const [wonBids, setWonBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchAuctions() {
            try {
                const res = await fetch('/api/auctions');
                if (res.ok) {
                    const data = await res.json();
                    const auctions = data.auctions || [];

                    setScheduledBids(auctions.filter((a: any) =>
                        a.status === 'SCHEDULED' ||
                        a.status === 'WAITING_ROOM' ||
                        a.status === 'LIVE'
                    ));

                    // Get user's won auctions
                    const userRes = await fetch('/api/user');
                    if (userRes.ok) {
                        const userData = await userRes.json();
                        const userId = userData.user.id;
                        setWonBids(auctions.filter((a: any) => a.winnerId === userId && a.status === 'COMPLETED'));
                    }
                }
            } catch (e) {
                console.error('Failed to fetch auctions');
            } finally {
                setLoading(false);
            }
        }
        fetchAuctions();

        // Poll every 10 seconds so statuses update without manual refresh
        const pollInterval = setInterval(fetchAuctions, 10000);
        return () => clearInterval(pollInterval);
    }, []);

    if (loading) {
        return <div className="text-center py-10 text-gray-500">Loading auctions...</div>;
    }

    const CDN = 'https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto,f_auto';
    const getTierBg = (tier: string) => {
        if (tier === 'BRONZE') return `${CDN}/shutter/bronze`;
        if (tier === 'SILVER') return `${CDN}/shutter/silver`;
        if (tier === 'GOLD') return `${CDN}/shutter/gold`;
        if (tier === 'DIAMOND') return `https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto,f_auto,w_800/v1771586328/shutter/xm9krvefxp1kzg8e08dn.png`;
        return `${CDN}/shutter/bronze`;
    };

    const getTierColors = (tier: string) => {
        if (tier === 'BRONZE') return {
            bg: 'from-amber-700 to-amber-900',
            border: 'border-amber-800',
            text: 'text-amber-200',
            badge: 'bg-amber-950'
        };
        if (tier === 'SILVER') return {
            bg: 'from-gray-200 to-gray-400',
            border: 'border-gray-100',
            text: 'text-gray-700',
            badge: 'bg-gray-600'
        };
        if (tier === 'GOLD') return {
            bg: 'from-amber-200 to-amber-500',
            border: 'border-amber-100',
            text: 'text-amber-900',
            badge: 'bg-yellow-600'
        };
        if (tier === 'DIAMOND') return {
            bg: 'from-indigo-400 to-purple-600',
            border: 'border-indigo-300',
            text: 'text-indigo-950',
            badge: 'bg-purple-900'
        };
        return {
            bg: 'from-gray-500 to-gray-700',
            border: 'border-gray-400',
            text: 'text-gray-200',
            badge: 'bg-gray-800'
        };
    };

    const getTimeUntil = (scheduledAt: string) => {
        const now = new Date().getTime();
        const scheduled = new Date(scheduledAt).getTime();
        const diff = scheduled - now;

        if (diff < 0) return 'Starting soon';

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `Starts in ${days}d`;
        if (hours > 0) return `Starts in ${hours}h`;
        if (minutes > 0) return `Live in ${minutes}m`;
        return 'Starting now';
    };

    const getStatusBadgeColor = (time: string) => {
        if (time.includes('Live in')) return 'bg-green-500';
        if (time.includes('h')) return 'bg-blue-500';
        return 'bg-gray-400';
    };

    return (
        <div>
            {/* Scheduled Bids */}
            <div className="mb-8">
                <h2 className="text-lg font-['Russo_One'] text-[#3B82F6] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-icons-round">schedule</span> Scheduled Bids
                </h2>
                {scheduledBids.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-900/50 rounded-lg">
                        No scheduled auctions
                    </div>
                ) : (
                    <div className="space-y-4">
                        {scheduledBids.map((bid) => {
                            const colors = getTierColors(bid.rankTier);

                            // Determine badge text and color based on actual status
                            let badgeText = '';
                            let badgeColor = '';
                            const isLiveOrWaiting = bid.status === 'LIVE' || bid.status === 'WAITING_ROOM';

                            if (bid.status === 'LIVE') {
                                badgeText = '🔴 Live';
                                badgeColor = 'bg-red-600';
                            } else if (bid.status === 'WAITING_ROOM') {
                                badgeText = 'Waiting Room';
                                badgeColor = 'bg-indigo-500';
                            } else {
                                const timeText = getTimeUntil(bid.scheduledAt);
                                badgeText = timeText;
                                badgeColor = getStatusBadgeColor(timeText);
                            }

                            return (
                                <Link href={`/bid/${bid.id}`} key={bid.id} className="block">
                                    <div
                                        className="relative rounded-2xl p-4 shadow-lg border border-white/20 overflow-hidden group cursor-pointer hover:shadow-2xl transition-all"
                                        style={{
                                            backgroundImage: `linear-gradient(rgba(0,0,0,0.35), rgba(0,0,0,0.35)), url('${getTierBg(bid.rankTier)}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {/* Status badge */}
                                        <div className={`absolute top-0 right-0 ${badgeColor} text-white text-xs font-bold px-3 py-1 rounded-bl-xl font-['Russo_One'] uppercase shadow-md`}>
                                            {badgeText}
                                        </div>

                                        <div className="flex items-center gap-4">
                                            {/* Tier icon */}
                                            <div className={`w-16 h-16 bg-gradient-to-b ${colors.bg} rounded-xl flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border-2 ${colors.border} shrink-0 relative`}>
                                                <span className={`material-icons-round ${colors.text} text-[48px]`}>shield</span>
                                                <div className={`absolute -bottom-2 ${colors.badge} text-white text-[10px] px-2 rounded-full font-bold uppercase`}>
                                                    {bid.rankTier}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-['Russo_One'] text-white leading-tight">{bid.name}</h3>
                                                <p className="text-gray-400 text-sm font-medium">Rank: {bid.rankTier}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-green-400 font-bold">Start: ₹{Number(bid.startingPrice).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Notification button — only for SCHEDULED auctions */}
                                            {!isLiveOrWaiting && (
                                                <button className="bg-blue-600 hover:bg-blue-500 text-white rounded-lg w-10 h-10 flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all">
                                                    <span className="material-icons-round text-xl">notifications_active</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Won Shutters */}
            <div className="mb-8">
                <h2 className="text-lg font-['Russo_One'] text-[#3B82F6] uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="material-icons-round">emoji_events</span> Won Shutters
                </h2>
                {wonBids.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 bg-gray-900/50 rounded-lg">
                        No won auctions yet
                    </div>
                ) : (
                    <div className="space-y-3">
                        {wonBids.map((bid) => (
                            <Link href={`/bid/${bid.id}`} key={bid.id}>
                                <div className="bg-gradient-to-r from-[#FBBF24]/10 to-transparent rounded-2xl p-4 border-l-4 border-[#FBBF24] shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg transition-all">
                                    <div>
                                        <h3 className="text-lg font-['Russo_One'] text-white">
                                            {bid.name} <span className="text-xs font-normal text-gray-400">RANK - {bid.rankTier}</span>
                                        </h3>
                                        <p className="text-sm text-gray-400">
                                            Won at <span className="font-bold text-[#FBBF24]">₹{Number(bid.currentPrice).toLocaleString()}</span> on <span className="font-bold text-[#FBBF24]">{new Date(bid.endedAt).toLocaleDateString()}</span>
                                        </p>
                                    </div>
                                    <button className="text-[#FBBF24] hover:text-yellow-600 font-bold text-sm uppercase tracking-wide flex items-center gap-1">
                                        info <span className="material-icons-round text-sm">chevron_right</span>
                                    </button>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

function MarketContent() {
    const CDN = 'https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto,f_auto';
    const categories = [
        { id: 'invest', name: 'Invest', description: 'Grow your wealth', icon: 'trending_up', bg: `${CDN}/market-bg/invest`, iconBg: 'from-green-200 to-green-500', iconColor: 'text-green-900' },
        { id: 'pawn', name: 'Pawn', description: 'Quick cash solutions', icon: 'storefront', bg: `${CDN}/market-bg/pawn`, iconBg: 'from-yellow-200 to-yellow-500', iconColor: 'text-yellow-900' },
        { id: 'dig', name: 'Dig', description: 'Find hidden treasures', icon: 'construction', bg: `${CDN}/market-bg/dig`, iconBg: 'from-orange-200 to-orange-500', iconColor: 'text-orange-900' },
        { id: 'consumer', name: 'Consumer', description: 'Local marketplace', icon: 'shopping_cart', bg: `${CDN}/market-bg/consumer`, iconBg: 'from-purple-200 to-purple-500', iconColor: 'text-purple-900' },
    ];

    return (
        <div className="space-y-4">
            {categories.map((category) => (
                <Link href={`/${category.id}`} key={category.id} className="block">
                    <div
                        className="relative rounded-2xl p-5 shadow-lg border border-white/20 hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02] overflow-hidden"
                        style={{
                            backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url('${category.bg}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-4">
                                <div className={`w-14 h-14 bg-gradient-to-b ${category.iconBg} rounded-xl flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border-2 ${category.iconBg.split(' ')[0].replace('from-', 'border-')}`}>
                                    <span className={`material-icons-round ${category.iconColor} text-3xl`}>{category.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-2xl font-['Russo_One'] text-white uppercase">{category.name}</h3>
                                    <p className="text-sm text-gray-400">{category.description}</p>
                                </div>
                            </div>
                            <span className="material-icons-round text-gray-400">chevron_right</span>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}

function BottomNav() {
    return (
        <nav className="fixed bottom-0 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pb-safe z-20 shadow-[0_-5px_10px_rgba(0,0,0,0.05)]">
            <div className="flex justify-around items-end pb-4 pt-2 relative">
                <Link href="/home" className="flex flex-col items-center gap-1 w-1/5 text-blue-600 group">
                    <span className="material-icons-round text-2xl group-hover:scale-110 transition-transform">home</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Home</span>
                </Link>
                <Link href="/artifacts" className="flex flex-col items-center gap-1 w-1/5 text-slate-400 hover:text-slate-600 transition-colors group">
                    <span className="material-icons-round text-2xl group-hover:scale-110 transition-transform">backpack</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Inventory</span>
                </Link>
                <div className="relative w-1/5 flex justify-center -top-6">
                    <Link href="/pay">
                        <button className="w-16 h-16 rounded-full bg-gradient-to-b from-[#FBBF24] to-yellow-600 shadow-lg border-4 border-slate-100 dark:border-slate-900 flex items-center justify-center transform hover:scale-105 active:scale-95 transition-all duration-200 z-30 group">
                            <span className="material-icons-round text-3xl text-white drop-shadow-md group-hover:rotate-12 transition-transform">qr_code_scanner</span>
                        </button>
                    </Link>
                    <span className="absolute -bottom-4 text-[10px] font-bold uppercase tracking-wider text-slate-500">Pay</span>
                </div>
                <Link href="/profile" className="flex flex-col items-center gap-1 w-1/5 text-slate-400 hover:text-slate-600 transition-colors group">
                    <span className="material-icons-round text-2xl group-hover:scale-110 transition-transform">inventory_2</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Vault</span>
                </Link>
                <button className="flex flex-col items-center gap-1 w-1/5 text-slate-400 hover:text-slate-600 transition-colors group">
                    <span className="material-icons-round text-2xl group-hover:scale-110 transition-transform">chat_bubble</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider">Chat</span>
                </button>
            </div>
        </nav>
    );
}
