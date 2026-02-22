'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] font-['Inter'] antialiased flex flex-col selection:bg-[#FBBF24] selection:text-white bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            {/* Header */}
            <header className="bg-[#1E3A8A] bg-opacity-95 shadow-[0_10px_20px_rgba(0,0,0,0.3)] z-40 pt-4 pb-2 border-b border-[#FBBF24]">
                <div className="flex justify-between items-center px-4 mb-2 relative">
                    {/* Left: Balance + Rank Points */}
                    <div className="flex flex-col gap-1 w-auto">
                        <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                            <span className="material-icons-round text-[#FBBF24] drop-shadow-md leading-none" style={{ fontSize: '14px' }}>currency_rupee</span>
                            <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">
                                {balance.toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded-full border border-white/10">
                            <span className="material-icons-round text-blue-400 drop-shadow-md leading-none" style={{ fontSize: '14px' }}>military_tech</span>
                            <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">{rankPoints}</span>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <img
                            src="https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto,f_auto/ui/bid-wars-logo"
                            alt="Bid Wars Logo"
                            className="drop-shadow-lg object-contain h-[50px] w-auto"
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
            </header>

            {/* Folder Tab Area */}
            <main className="flex-1 flex flex-col pt-6 px-4 pb-20 relative z-10 min-h-0">
                {/* Tabs Row */}
                <div className="flex w-full relative z-20">
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`relative flex-1 py-3 text-xl tracking-wider font-['Russo_One'] rounded-t-[1.25rem] transition-all duration-300 ${activeTab === 'bids'
                            ? 'bg-[#FBBF24] text-[#1E3A8A] z-30'
                            : 'bg-gray-900/40 text-gray-500 hover:text-gray-300 z-0 scale-y-95 origin-bottom backdrop-blur-sm'
                            }`}
                    >
                        BIDS
                        {activeTab === 'bids' && (
                            <svg className="absolute -right-5 bottom-0 w-5 h-5 text-[#FBBF24] z-30" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M 0 0 A 20 20 0 0 0 20 20 L 0 20 Z" />
                            </svg>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('market')}
                        className={`relative flex-1 py-3 text-xl tracking-wider font-['Russo_One'] rounded-t-[1.25rem] transition-all duration-300 ${activeTab === 'market'
                            ? 'bg-[#FBBF24] text-[#1E3A8A] z-30'
                            : 'bg-gray-900/40 text-gray-500 hover:text-gray-300 z-0 scale-y-95 origin-bottom backdrop-blur-sm'
                            }`}
                    >
                        MARKET
                        {activeTab === 'market' && (
                            <svg className="absolute -left-5 bottom-0 w-5 h-5 text-[#FBBF24] z-30" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M 20 0 A 20 20 0 0 1 0 20 L 20 20 Z" />
                            </svg>
                        )}
                    </button>
                </div>

                {/* Folder Body */}
                <div id="home-scroll-container" className={`flex-1 bg-[#1E293B]/20 backdrop-blur-md z-20 overflow-y-auto transform-gpu will-change-transform transition-all duration-300 relative min-h-0 mb-4 border-t border-white/5 shadow-inner ${activeTab === 'bids'
                    ? 'rounded-tr-3xl rounded-b-3xl'
                    : 'rounded-tl-3xl rounded-b-3xl'
                    }`}>
                    <div className="p-4">
                        {activeTab === 'bids' ? <BidsContent /> : <MarketContent />}
                    </div>
                </div>
            </main>

            {/* Bottom Nav */}
            <BottomNav />

            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </div>
    );
}

const CDN = 'https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto:eco,f_auto,w_400';

const getTierBg = (tier: string) => {
    if (tier === 'BRONZE') return `${CDN}/shutter/bronze`;
    if (tier === 'SILVER') return `${CDN}/shutter/silver`;
    if (tier === 'GOLD') return `${CDN}/shutter/gold`;
    if (tier === 'DIAMOND') return `${CDN}/shutter/xm9krvefxp1kzg8e08dn.png`;
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
    const months = Math.floor(days / 30);

    const pluralize = (count: number, unit: string) => `${count} ${unit}${count !== 1 ? 's' : ''}`;

    if (months > 0) return `Starts in ${pluralize(months, 'month')}`;
    if (days > 0) return `Starts in ${pluralize(days, 'day')}`;
    if (hours > 0) return `Starts in ${pluralize(hours, 'hour')}`;
    if (minutes > 0) return `Live in ${pluralize(minutes, 'minute')}`;
    return 'Starting now';
};

const getStatusBadgeColor = (time: string) => {
    if (time.includes('Live in')) return 'bg-green-500';
    if (time.includes('h')) return 'bg-blue-500';
    return 'bg-gray-400';
};

function BidsContent() {
    const [scheduledBids, setScheduledBids] = useState<any[]>([]);
    const [wonBids, setWonBids] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showExactTime, setShowExactTime] = useState(false);

    // Infinite Scroll State for Won Shutters
    const [visibleWonCount, setVisibleWonCount] = useState(4);
    const observer = useRef<IntersectionObserver | null>(null);
    const lastWonElementRef = useCallback((node: HTMLDivElement | null) => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
            observer.current = new IntersectionObserver(entries => {
                if (entries[0].isIntersecting) {
                    setVisibleWonCount(prev => prev + 5);
                }
            }, {
                root: document.getElementById('home-scroll-container'),
                rootMargin: '400px',
                threshold: 0.1
            });
            if (node) observer.current.observe(node);
        }
    }, [loading]);

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



    return (
        <div>
            {/* Scheduled Bids */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-['Russo_One'] text-[#3B82F6] uppercase tracking-widest flex items-center gap-2 m-0">
                        <span className="material-icons-round">schedule</span> Scheduled Bids
                    </h2>
                    <button onClick={() => setShowExactTime(!showExactTime)} className="text-[#3B82F6] hover:text-blue-400 active:scale-95 transition-transform flex items-center justify-center p-1">
                        <span className="material-icons-round text-xl">{showExactTime ? 'hourglass_empty' : 'alarm'}</span>
                    </button>
                </div>
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
                                if (showExactTime) {
                                    const date = new Date(bid.scheduledAt);
                                    badgeText = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ', ' + date.toLocaleDateString('en-GB');
                                    badgeColor = 'bg-gray-700';
                                } else {
                                    const timeText = getTimeUntil(bid.scheduledAt);
                                    badgeText = timeText;
                                    badgeColor = getStatusBadgeColor(timeText);
                                }
                            }

                            return (
                                <Link href={`/bid/${bid.id}`} key={bid.id} prefetch={false} className="block mb-4">
                                    <div
                                        className="bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-800/50 rounded-2xl p-3 shadow-lg border border-white/20 dark:border-gray-600/30 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all"
                                        style={{
                                            backgroundImage: `url('${getTierBg(bid.rankTier)}')`,
                                            backgroundSize: 'cover',
                                            backgroundPosition: 'center'
                                        }}
                                    >
                                        {/* Dark overlay for text visibility */}
                                        <div className="absolute inset-0 bg-black/50 dark:bg-black/70 rounded-2xl z-0"></div>

                                        {/* Status badge */}
                                        <div className={`absolute bottom-0 right-0 ${badgeColor} text-white text-[9px] font-bold px-3 py-0.5 rounded-tl-xl font-['Russo_One'] uppercase shadow-md z-10`}>
                                            {badgeText}
                                        </div>

                                        {/* Notification button — only for SCHEDULED auctions */}
                                        {!isLiveOrWaiting && (
                                            <button className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg w-8 h-8 flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] active:translate-y-1 active:shadow-none transition-all z-10">
                                                <span className="material-icons-round text-lg">notifications_active</span>
                                            </button>
                                        )}

                                        {/* Content inside the card */}
                                        <div className="relative z-10 flex items-center gap-3">
                                            {/* Tier icon */}
                                            <div className={`w-12 h-12 bg-gradient-to-b ${colors.bg} rounded-xl flex items-center justify-center shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.3)] border-2 ${colors.border} shrink-0 relative`}>
                                                <span className={`material-icons-round ${colors.text} text-2xl`}>shield</span>
                                                <div className={`absolute -bottom-1.5 ${colors.badge} text-white text-[8px] px-1.5 rounded-full font-bold uppercase`}>
                                                    {bid.rankTier}
                                                </div>
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1">
                                                <h3 className="text-lg font-['Russo_One'] text-gray-800 dark:text-white leading-tight">{bid.name}</h3>
                                                <p className="text-gray-500 dark:text-gray-400 text-xs font-medium">Rank: {bid.rankTier}</p>
                                                <div className="flex items-center justify-between mt-2">
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-green-600 dark:text-green-400 font-bold text-[13px]">Start: ₹{Number(bid.startingPrice).toLocaleString()}</span>
                                                    </div>
                                                </div>
                                            </div>
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
                    <div className="space-y-4">
                        {wonBids.slice(0, visibleWonCount).map((bid, index) => {
                            const delayClass = `delay-${((index % 5) + 1) * 100}`;
                            return (
                                <Link href={`/bid/${bid.id}`} key={bid.id} prefetch={false} className={`block animate-fade-in-up opacity-0 ${delayClass}`}>
                                    <div className="bg-gradient-to-r from-[#FBBF24]/10 to-transparent rounded-2xl p-3 border-l-4 border-[#FBBF24] shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg transition-all">
                                        <div className="min-w-0 flex-1 pr-2">
                                            <h3 className="text-base font-['Russo_One'] text-white truncate">
                                                {bid.name}
                                            </h3>
                                            <div className="text-[10px] font-normal text-gray-400 uppercase tracking-wider mt-0.5 truncate">
                                                RANK - {bid.rankTier}
                                            </div>
                                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                                Won at <span className="font-bold text-[#FBBF24]">₹{Number(bid.currentPrice).toLocaleString()}</span> on <span className="font-bold text-[#FBBF24]">{new Date(bid.endedAt).toLocaleDateString()}</span>
                                            </p>
                                        </div>
                                        <button className="text-[#FBBF24] hover:text-yellow-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1 shrink-0">
                                            info <span className="material-icons-round text-sm">chevron_right</span>
                                        </button>
                                    </div>
                                </Link>
                            );
                        })}
                        {visibleWonCount < wonBids.length && (
                            <div ref={lastWonElementRef} className="py-6 flex justify-center items-center opacity-50">
                                <span className="material-icons-round animate-spin text-[#FBBF24] text-3xl">refresh</span>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div >
    );
}

function MarketContent() {
    const CDN = 'https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto:eco,f_auto,w_400';
    const categories = [
        { id: 'invest', name: 'Invest', description: 'Grow your wealth', icon: 'trending_up', bg: `${CDN}/market-bg/invest`, iconBg: 'from-green-200 to-green-500', iconColor: 'text-green-900' },
        { id: 'pawn', name: 'Pawn', description: 'Quick cash solutions', icon: 'storefront', bg: `${CDN}/market-bg/pawn`, iconBg: 'from-yellow-200 to-yellow-500', iconColor: 'text-yellow-900' },
        { id: 'dig', name: 'Dig', description: 'Find hidden treasures', icon: 'construction', bg: `${CDN}/market-bg/dig`, iconBg: 'from-orange-200 to-orange-500', iconColor: 'text-orange-900' },
        { id: 'consumer', name: 'Consumer', description: 'Local marketplace', icon: 'shopping_cart', bg: `${CDN}/market-bg/consumer`, iconBg: 'from-purple-200 to-purple-500', iconColor: 'text-purple-900' },
    ];

    return (
        <div className="space-y-4">
            {categories.map((category) => (
                <Link href={`/${category.id}`} key={category.id} prefetch={false} className="block mb-4">
                    <div
                        className="bg-white dark:bg-card-dark rounded-2xl p-3 shadow-lg border border-white/20 dark:border-gray-600/30 hover:shadow-2xl transition-all cursor-pointer hover:scale-[1.02] relative overflow-hidden"
                        style={{
                            backgroundImage: `url('${category.bg}')`,
                            backgroundSize: 'cover',
                            backgroundPosition: 'center'
                        }}
                    >
                        {/* Dark overlay for text visibility */}
                        <div className="absolute inset-0 bg-black/35 dark:bg-black/45 rounded-2xl z-0"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-3">
                                <div className={`w-14 h-14 bg-gradient-to-b ${category.iconBg} rounded-xl flex items-center justify-center shadow-[0_4px_0_0_rgba(0,0,0,0.2)] border-2 ${category.iconBg.split(' ')[0].replace('from-', 'border-')}`}>
                                    <span className={`material-icons-round ${category.iconColor} text-3xl`}>{category.icon}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-['Russo_One'] text-gray-800 dark:text-white uppercase">{category.name}</h3>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{category.description}</p>
                                </div>
                            </div>
                            <span className="material-icons-round text-gray-400 dark:text-gray-500 text-xl">chevron_right</span>
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
