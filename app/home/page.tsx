'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { LOGO_URL, getTierBg, MARKET_BG_URLS } from '@/lib/cloudinary';
import { getPusherClient } from '@/lib/pusher-client';
import Header from '@/components/Header';
import { AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function HomePage() {
    const [activeTab, setActiveTab] = useState<'bids' | 'market'>(() => {
        if (typeof sessionStorage !== 'undefined') {
            return (sessionStorage.getItem('homeTab') as any) || 'bids';
        }
        return 'bids';
    });

    // Fetch user data via SWR
    const { data: userDataObj, mutate: mutateUser, isLoading: userLoading } = useSWR('/api/user', fetcher, {
        revalidateOnFocus: false, // Rely on pusher for real-time
        refreshInterval: 0
    });
    const userData = userDataObj?.user || null;

    // Persist tab change
    useEffect(() => {
        if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('homeTab', activeTab);
        }
    }, [activeTab]);

    // Subscribe to real-time balance updates from Pusher
    // Fires whenever claim/payment routes emit 'balance-update' on user-${id}
    useEffect(() => {
        if (!userData?.id) return;
        const pusher = getPusherClient();
        const ch = pusher.subscribe(`user-${userData.id}`);
        ch.bind('balance-update', ({ balance }: { balance: number }) => {
            mutateUser((prev: any) => prev ? { ...prev, user: { ...prev.user, balance } } : prev, false);
        });

        const handleLocalBalance = (e: any) => {
            if (e.detail?.balance !== undefined) {
                mutateUser((prev: any) => prev ? { ...prev, user: { ...prev.user, balance: e.detail.balance } } : prev, false);
            }
        };
        window.addEventListener('balance-update-local', handleLocalBalance);

        return () => {
            ch.unbind('balance-update');
            pusher.unsubscribe(`user-${userData.id}`);
            window.removeEventListener('balance-update-local', handleLocalBalance);
        };
    }, [userData?.id, mutateUser]);

    if (userLoading) {
        return (
            <div className="min-h-screen bg-[#111827] flex items-center justify-center">
                <div className="text-white text-lg font-['Russo_One'] animate-pulse">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] font-['Inter'] antialiased flex flex-col selection:bg-[#FBBF24] selection:text-white bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
            <Header />

            {/* Folder Tab Area */}
            <main className="flex-1 flex flex-col pt-6 px-4 pb-20 relative z-10 min-h-0">
                {/* Tabs Row */}
                <div className="flex w-full relative z-20">
                    <button
                        onClick={() => setActiveTab('bids')}
                        className={`relative flex-1 py-3 text-xl tracking-wider font-['Russo_One'] rounded-t-[1.25rem] transition-all duration-300 ${activeTab === 'bids'
                            ? 'bg-[#FBBF24] text-[#0D121B] z-30'
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
                            ? 'bg-[#FBBF24] text-[#0D121B] z-30'
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
                <div id="home-scroll-container" className={`flex-1 bg-[#1E293B]/20 z-20 overflow-y-auto transition-[border-radius] duration-300 relative min-h-0 mb-4 border-t border-white/5 shadow-inner ${activeTab === 'bids'
                    ? 'rounded-tr-3xl rounded-b-3xl'
                    : 'rounded-tl-3xl rounded-b-3xl'
                    }`}>
                    <div className="p-4">
                        {activeTab === 'bids' ? <BidsContent userId={userData?.id} /> : <MarketContent />}
                    </div>
                </div>
            </main>



            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </div>
    );
}



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

    // Use Math.ceil so that 4 minutes and 59 seconds shows as "5 minutes" remaining
    // We add a tiny 1-second buffer (1000ms) to account for slight clock drift between client and server
    const minutes = Math.ceil((diff + 1000) / (1000 * 60));
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
    return 'bg-gray-600';
};

function BidsContent({ userId }: { userId?: string }) {
    const { data: auctionsData, mutate: mutateAuctions, isLoading: loadingAuctions } = useSWR('/api/auctions', fetcher, {
        revalidateOnFocus: false, // Pusher handles updates
        refreshInterval: 0,
        compare: (a, b) => JSON.stringify(a) === JSON.stringify(b)
    });

    const { data: subsData } = useSWR('/api/notifications/subscribe', fetcher, {
        revalidateOnFocus: false
    });

    const [scheduledBids, setScheduledBids] = useState<any[]>([]);
    const [wonBids, setWonBids] = useState<any[]>([]);
    const [showExactTime, setShowExactTime] = useState(false);
    const [notificationDialog, setNotificationDialog] = useState<any>(null);
    const [payNowDialog, setPayNowDialog] = useState<any>(null);
    const [payNowState, setPayNowState] = useState<'idle' | 'paying' | 'paid' | 'error'>('idle');
    const [payNowError, setPayNowError] = useState<string | null>(null);
    const [, setTick] = useState(0);

    const [visibleWonCount, setVisibleWonCount] = useState(4);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [scrollReady, setScrollReady] = useState(false);
    const observer = useRef<IntersectionObserver | null>(null);
    const isCurrentlyLoadingMore = useRef(false);

    useEffect(() => {
        if (!loadingAuctions) {
            const timer = setTimeout(() => setScrollReady(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [loadingAuctions]);

    const lastWonElementRef = useCallback((node: HTMLDivElement | null) => {
        if (!scrollReady) return;
        if (observer.current) observer.current.disconnect();
        if (!node || typeof window === 'undefined' || !('IntersectionObserver' in window)) return;
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && !isCurrentlyLoadingMore.current) {
                isCurrentlyLoadingMore.current = true;
                setIsLoadingMore(true);
                setTimeout(() => {
                    setVisibleWonCount(prev => prev + 4);
                    setIsLoadingMore(false);
                    isCurrentlyLoadingMore.current = false;
                }, 600);
            }
        }, {
            rootMargin: '0px',
            threshold: 0.5
        });
        observer.current.observe(node);
    }, [scrollReady]);

    const [subscribedAuctions, setSubscribedAuctions] = useState<Set<string>>(new Set());

    // Sync SWR payload to local state exactly once on update
    useEffect(() => {
        if (auctionsData?.auctions) {
            setScheduledBids(auctionsData.auctions.filter((a: any) =>
                a.status === 'SCHEDULED' || a.status === 'WAITING_ROOM' || a.status === 'LIVE'
            ));

            if (userId) {
                setWonBids(auctionsData.auctions
                    .filter((a: any) => a.winnerId === userId && a.status === 'COMPLETED')
                    .sort((a: any, b: any) => new Date(b.endedAt || 0).getTime() - new Date(a.endedAt || 0).getTime())
                );
            }
        }
    }, [auctionsData, userId]);

    // Sync Notification Bell State
    useEffect(() => {
        if (subsData?.subscribedAuctionIds) {
            setSubscribedAuctions(new Set(subsData.subscribedAuctionIds));
        }
    }, [subsData]);

    useEffect(() => {
        const tickId = setInterval(() => setTick(t => t + 1), 30_000);

        // Bug 3: refetch data when user returns to the tab/app after minimising
        const onVisibility = () => {
            if (document.visibilityState === 'visible') mutateAuctions();
        };
        document.addEventListener('visibilitychange', onVisibility);

        // ── Pusher WebSocket subscription on global-auctions ─────────────────
        const { getPusherClient } = require('@/lib/pusher-client');
        const pusher = getPusherClient();
        const channel = pusher.subscribe('global-auctions');

        channel.bind('auction-waiting-room', (data: any) => {
            setScheduledBids(prev => prev.map(b =>
                b.id === data.id ? { ...b, status: 'WAITING_ROOM' } : b
            ));
        });

        channel.bind('auction-started', (data: any) => {
            setScheduledBids(prev => prev.map(b =>
                b.id === data.id ? { ...b, status: 'LIVE', startedAt: data.startedAt } : b
            ));
        });

        channel.bind('auction-ended', (data: any) => {
            setScheduledBids(prev => prev.filter(b => b.id !== data.id));
            if (userId && data.winnerId === userId) {
                setWonBids(prev => {
                    if (prev.some(b => b.id === data.id)) return prev;
                    const newBid = { ...data, isClaimed: false };
                    return [newBid, ...prev].sort((a: any, b: any) => new Date(b.endedAt || 0).getTime() - new Date(a.endedAt || 0).getTime());
                });
            }
        });

        // Bug 4: new auction added by admin appears instantly without refresh
        channel.bind('auction-created', (data: any) => {
            setScheduledBids(prev => {
                if (prev.some(b => b.id === data.id)) return prev; // dedup
                return [data, ...prev];
            });
        });

        return () => {
            clearInterval(tickId);
            document.removeEventListener('visibilitychange', onVisibility);
            channel.unbind_all();
            pusher.unsubscribe('global-auctions');
        };
    }, [userId, mutateAuctions]);

    const openNotificationDialog = (e: React.MouseEvent, bid: any) => {
        e.preventDefault();
        e.stopPropagation();
        setNotificationDialog(bid);
    };

    const confirmNotification = async () => {
        if (!notificationDialog) return;
        const { id: auctionId } = notificationDialog;
        setNotificationDialog(null);

        // Step 1: Register browser for push notifications via Pusher Beams
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            try {
                const { Client } = await import('@pusher/push-notifications-web');
                const swReg = await navigator.serviceWorker.register('/service-worker.js');
                // Wait for SW to be active
                const activeSw = await navigator.serviceWorker.ready;
                const beamsClient = new Client({
                    instanceId: process.env.NEXT_PUBLIC_PUSHER_BEAMS_INSTANCE_ID || '',
                    serviceWorkerRegistration: activeSw,
                });
                await beamsClient.start();
                await beamsClient.addDeviceInterest(`user-${userId}`);
                console.log('[Beams] ✅ Registered for push with interest user-' + userId);
            } catch (err: any) {
                console.error('[Beams] ❌ Registration failed:', err);
            }
        }

        // Step 2: Save/toggle subscription in DB (independent of Beams success)
        try {
            const res = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auctionId }),
            });
            if (res.ok) {
                const { subscribed } = await res.json();
                setSubscribedAuctions(prev => {
                    const n = new Set(prev);
                    if (subscribed) n.add(auctionId);
                    else n.delete(auctionId);
                    return n;
                });
            }
        } catch (err) { console.error('[Notification] DB subscription failed:', err); }
    };


    if (loadingAuctions && scheduledBids.length === 0 && wonBids.length === 0) {
        return <div className="text-center py-10 text-gray-500 font-['Russo_One'] animate-pulse">Loading auctions...</div>;
    }



    return (
        <div>
            {/* Scheduled Bids */}
            <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-['Russo_One'] text-blue-400 uppercase tracking-widest flex items-center gap-2 m-0">
                        <span className="material-icons-round">schedule</span> Scheduled Bids
                    </h2>
                    <button onClick={() => setShowExactTime(!showExactTime)} className="text-blue-400 hover:text-blue-300 active:scale-95 transition-transform flex items-center justify-center p-1">
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

                            // Determine badge text and color based on server status
                            let badgeText = '';
                            let badgeColor = '';

                            const isUiLive = bid.status === 'LIVE';
                            const isUiWaiting = bid.status === 'WAITING_ROOM';
                            const isLiveOrWaiting = isUiLive || isUiWaiting;

                            if (isUiLive) {
                                badgeText = '🔴 Live';
                                badgeColor = 'bg-red-500';
                            } else if (isUiWaiting) {
                                badgeText = 'Waiting Room';
                                badgeColor = 'bg-yellow-500';
                            } else {
                                if (showExactTime) {
                                    const date = new Date(bid.scheduledAt);
                                    badgeText = date.toLocaleString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ', ' + date.toLocaleDateString('en-GB');
                                    badgeColor = 'bg-gray-700'; // Dark color for exact time
                                } else {
                                    badgeText = getTimeUntil(bid.scheduledAt);
                                    badgeColor = 'bg-blue-400'; // Blue for "Starts in X"
                                }
                            }

                            return (
                                <div key={bid.id} className="relative mb-4">
                                    <Link href={`/bid/${bid.id}`} prefetch={false} className="block">
                                        <div
                                            className="bg-gradient-to-br from-white/90 via-white/70 to-white/50 dark:from-gray-800/90 dark:via-gray-800/70 dark:to-gray-800/50 rounded-2xl p-3 shadow-lg border border-white/20 dark:border-gray-600/30 relative overflow-hidden group cursor-pointer hover:shadow-2xl transition-all"
                                            style={{
                                                backgroundImage: `url('${getTierBg(bid.rankTier)}')`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        >
                                            <div className="absolute inset-0 bg-black/50 dark:bg-black/70 rounded-2xl z-0"></div>
                                            <div className={`absolute bottom-0 right-0 ${badgeColor} text-white text-[9px] font-bold px-3 py-0.5 rounded-tl-xl font-['Russo_One'] uppercase shadow-md z-10`}>
                                                {badgeText}
                                            </div>
                                            <div className="relative z-10 flex items-center gap-3">
                                                <div className={`w-12 h-12 bg-gradient-to-b ${colors.bg} rounded-xl flex items-center justify-center shadow-[inset_0_2px_4px_0_rgba(255,255,255,0.3)] border-2 ${colors.border} shrink-0 relative`}>
                                                    <span className={`material-icons-round ${colors.text} text-2xl`}>shield</span>
                                                    <div className={`absolute -bottom-1.5 ${colors.badge} text-white text-[8px] px-1.5 rounded-full font-bold uppercase`}>
                                                        {bid.rankTier}
                                                    </div>
                                                </div>
                                                <div className="flex-1 pr-8 pb-2">
                                                    <h3 className="text-lg font-['Russo_One'] text-gray-800 dark:text-white leading-tight">{bid.name}</h3>
                                                    <p className="text-gray-500 dark:text-gray-400 text-xs font-normal font-['Russo_One'] uppercase">RANK - {bid.rankTier}</p>
                                                    <div className="flex items-center justify-between mt-2">
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-green-600 dark:text-green-400 font-bold text-[13px]">Start: ₹{Number(bid.startingPrice).toLocaleString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                    {!isLiveOrWaiting && (
                                        <button
                                            onClick={(e) => openNotificationDialog(e, bid)}
                                            className={`absolute top-6 right-0 text-white px-2.5 py-1.5 rounded-l-xl flex items-center shadow-md z-20 transition-colors active:scale-95 ${subscribedAuctions.has(bid.id) ? 'bg-yellow-500' : 'bg-blue-400'}`}
                                        >
                                            <span className="material-icons-round text-[14px] text-white">
                                                {subscribedAuctions.has(bid.id) ? 'notifications_active' : 'notifications'}
                                            </span>
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Won Shutters */}
            <div className="mb-8">
                <h2 className="text-lg font-['Russo_One'] text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2">
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
                            const isUnclaimed = bid.isClaimed === false && bid.status === 'COMPLETED';
                            const cardContent = (
                                <div className={`bg-gradient-to-r ${isUnclaimed ? 'from-yellow-500/20 to-transparent border-l-4 border-yellow-400' : 'from-[#FBBF24]/10 to-transparent border-l-4 border-[#FBBF24]'} rounded-2xl p-3 shadow-sm flex items-center justify-between cursor-pointer hover:shadow-lg transition-all`}>
                                    <div className="min-w-0 flex-1 pr-2">
                                        <h3 className="text-base font-['Russo_One'] text-white truncate">{bid.name}</h3>
                                        <div className="text-xs font-normal text-gray-500 font-['Russo_One'] mt-0.5 truncate uppercase">RANK - {bid.rankTier}</div>
                                        <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                                            Won at <span className="font-bold text-[#FBBF24]">₹{Number(bid.currentPrice).toLocaleString()}</span>
                                            {bid.endedAt ? (
                                                <> on <span className="font-bold text-[#FBBF24]">
                                                    {new Date(bid.endedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                                                </span></>
                                            ) : null}
                                            {isUnclaimed && <span className="text-yellow-500 font-bold"> · Payment pending</span>}
                                        </p>
                                    </div>
                                    {isUnclaimed ? (
                                        <button
                                            onClick={e => { e.preventDefault(); e.stopPropagation(); setPayNowState('idle'); setPayNowError(null); setPayNowDialog(bid); }}
                                            className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-black text-xs uppercase tracking-wide px-3 py-1.5 rounded-lg shrink-0 active:scale-95 transition"
                                        >
                                            PAY NOW
                                        </button>
                                    ) : (
                                        <button className="text-[#FBBF24] hover:text-yellow-600 font-bold text-xs uppercase tracking-wide flex items-center gap-1 shrink-0">
                                            info <span className="material-icons-round text-sm">chevron_right</span>
                                        </button>
                                    )}
                                </div>
                            );
                            return isUnclaimed ? (
                                <div key={bid.id} className={`animate-fade-in-up opacity-0 ${delayClass}`}>{cardContent}</div>
                            ) : (
                                <Link href={`/bid/${bid.id}`} key={bid.id} prefetch={false} className={`block animate-fade-in-up opacity-0 ${delayClass}`}>{cardContent}</Link>
                            );
                        })}
                        {visibleWonCount < wonBids.length && (
                            <div ref={lastWonElementRef}>
                                {isLoadingMore && (
                                    <div className="py-3 flex flex-col items-center gap-2">
                                        {/* Thin Instagram-style loading bar */}
                                        <div className="w-full h-0.5 bg-gray-800 rounded-full overflow-hidden">
                                            <div className="h-full bg-[#FBBF24] animate-[loading-bar_0.6s_ease-in-out_forwards]" />
                                        </div>
                                        <span className="text-[10px] text-gray-500 font-['Russo_One'] uppercase tracking-widest">Loading more...</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pay Now Dialog */}
            {payNowDialog && (
                <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setPayNowDialog(null)}>
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="relative w-full max-w-md bg-gray-900 rounded-t-3xl px-6 pt-5 pb-28 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                        <div className="w-10 h-1 rounded-full bg-gray-600 mx-auto mb-6" />
                        <div className="w-14 h-14 rounded-2xl bg-yellow-500 flex items-center justify-center mx-auto mb-4">
                            <span className="material-icons-round text-gray-900 text-3xl">emoji_events</span>
                        </div>
                        <h2 className="text-center text-white font-['Russo_One'] text-lg mb-1">Pay &amp; Claim</h2>
                        <p className="text-center text-gray-400 text-xs mb-5">Complete payment to receive your items in inventory.</p>
                        <div className="bg-gray-800 rounded-2xl p-4 mb-5 space-y-2">
                            <div className="flex justify-between"><span className="text-gray-400 text-xs uppercase">Auction</span><span className="text-white text-sm font-bold truncate max-w-[55%]">{payNowDialog.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400 text-xs uppercase">Winning Bid</span><span className="text-green-400 text-sm font-bold">₹{Number(payNowDialog.currentPrice).toLocaleString()}</span></div>
                            {payNowDialog.claimExpiresAt && (
                                <div className="flex justify-between"><span className="text-gray-400 text-xs uppercase">Expires</span><span className="text-yellow-400 text-xs font-bold">{new Date(payNowDialog.claimExpiresAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true })}</span></div>
                            )}
                        </div>
                        {payNowState === 'paid' ? (
                            <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mb-4 text-center">
                                <p className="text-green-400 font-bold text-sm">✅ Paid &amp; added to inventory!</p>
                                <p className="text-green-600 text-xs mt-1">₹{Number(payNowDialog.currentPrice).toLocaleString()} deducted from your balance.</p>
                            </div>
                        ) : (
                            <>
                                {payNowState === 'error' && payNowError && (
                                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-2 mb-3">
                                        <p className="text-red-400 text-xs">{payNowError}</p>
                                    </div>
                                )}
                                <div className="flex gap-3">
                                    <button onClick={() => setPayNowDialog(null)} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-500 text-gray-300 font-bold text-sm active:scale-95 transition-transform">Cancel</button>
                                    <button
                                        disabled={payNowState === 'paying'}
                                        onClick={async () => {
                                            setPayNowState('paying');
                                            setPayNowError(null);
                                            try {
                                                const res = await fetch(`/api/auctions/${payNowDialog.id}/claim`, { method: 'POST' });
                                                const data = await res.json();
                                                if (res.ok) {
                                                    setPayNowState('paid');
                                                    setWonBids(prev => prev.map(b => b.id === payNowDialog.id ? { ...b, isClaimed: true } : b));
                                                    if (data.newBalance !== undefined) {
                                                        window.dispatchEvent(new CustomEvent('balance-update-local', { detail: { balance: data.newBalance } }));
                                                    }
                                                } else {
                                                    setPayNowState('error');
                                                    setPayNowError(data.error || 'Payment failed');
                                                }
                                            } catch {
                                                setPayNowState('error');
                                                setPayNowError('Network error — please try again');
                                            }
                                        }}
                                        className="flex-[2] py-3.5 rounded-2xl bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 text-gray-900 font-black text-sm shadow-lg active:scale-95 transition-all"
                                    >
                                        {payNowState === 'paying' ? 'Processing...' : `💳 Pay ₹${Number(payNowDialog.currentPrice).toLocaleString()}`}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Notification Confirmation Dialog */}
            {notificationDialog && (
                <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setNotificationDialog(null)}>
                    <div className="absolute inset-0 bg-black/60" />
                    <div className="relative w-full max-w-md bg-gray-900 rounded-t-3xl px-6 pt-5 pb-28 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="w-14 h-14 rounded-2xl bg-blue-400 flex items-center justify-center mx-auto mb-4"><span className="material-icons-round text-white text-3xl">notifications</span></div>
                        <h2 className="text-center text-white font-['Russo_One'] text-lg mb-1">Get Notified?</h2>
                        <p className="text-center text-gray-400 text-xs mb-5">We'll ping you when the waiting room opens and when bidding goes live.</p>
                        <div className="bg-gray-800 rounded-2xl p-4 mb-6 space-y-2">
                            <div className="flex justify-between"><span className="text-gray-400 text-xs uppercase">Auction</span><span className="text-white text-sm font-bold truncate max-w-[50%]">{notificationDialog.name}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400 text-xs uppercase">Starts At</span><span className="text-white text-sm font-bold">{new Date(notificationDialog.scheduledAt).toLocaleString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true, day: 'numeric', month: 'short' })}</span></div>
                            <div className="flex justify-between"><span className="text-gray-400 text-xs uppercase">Starting Price</span><span className="text-green-400 text-sm font-bold">Rs.{Number(notificationDialog.startingPrice).toLocaleString()}</span></div>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => setNotificationDialog(null)} className="flex-1 py-3.5 rounded-2xl border-2 border-gray-500 text-gray-300 font-bold text-sm active:scale-95 transition-transform">Cancel</button>
                            <button onClick={confirmNotification} className="flex-[2] py-3.5 rounded-2xl bg-blue-400 text-white font-bold text-sm shadow-lg active:scale-95 transition-all">{subscribedAuctions.has(notificationDialog.id) ? 'Turn Off' : 'Notify Me'}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function MarketContent() {
    const categories = [
        { id: 'invest', name: 'Invest', description: 'Grow your wealth', icon: 'trending_up', bg: MARKET_BG_URLS.invest, iconBg: 'from-green-200 to-green-500', iconColor: 'text-green-900' },
        { id: 'pawn', name: 'Pawn', description: 'Quick cash solutions', icon: 'storefront', bg: MARKET_BG_URLS.pawn, iconBg: 'from-yellow-200 to-yellow-500', iconColor: 'text-yellow-900' },
        { id: 'dig', name: 'Dig', description: 'Find hidden treasures', icon: 'construction', bg: MARKET_BG_URLS.dig, iconBg: 'from-orange-200 to-orange-500', iconColor: 'text-orange-900' },
        { id: 'consumer', name: 'Consumer', description: 'Local marketplace', icon: 'shopping_cart', bg: MARKET_BG_URLS.consumer, iconBg: 'from-purple-200 to-purple-500', iconColor: 'text-purple-900' },
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
