'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { getPusherClient } from '@/lib/pusher-client';
import AuctionShutter from '@/components/auction/AuctionShutter';
import AuctionLock from '@/components/auction/AuctionLock';
import BidStream, { BidMessage } from '@/components/auction/BidStream';
import WaitingRoom from '@/components/auction/WaitingRoom';

type ShutterStatus = 'CLOSED' | 'OPENING' | 'OPEN' | 'CLOSING' | 'BIDDING';
type AuctionPhase = 'WAITING' | 'PRE_OPEN' | 'OPENING' | 'REVEAL' | 'CLOSING' | 'BIDDING' | 'SOLD';

export default function LiveBidPage() {
    const params = useParams();
    const router = useRouter();
    const auctionId = params.id as string;

    // Core State
    const [phase, setPhase] = useState<AuctionPhase>('WAITING');
    const [balance, setBalance] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bids, setBids] = useState<BidMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [bidding, setBidding] = useState(false);
    const [auctionData, setAuctionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ id: string, username: string } | null>(null);
    const [customBidAmount, setCustomBidAmount] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [isLateJoin, setIsLateJoin] = useState(false);

    // Animation Timers
    const [lockCountdown, setLockCountdown] = useState(5);
    const [shutterCountdown, setShutterCountdown] = useState(5);
    const [bidCountdown, setBidCountdown] = useState(10);

    // Refs for Pusher
    const serverStartTime = useRef<number | null>(null);
    const tickerRef = useRef<NodeJS.Timeout | null>(null);

    // === 1. INITIAL DATA FETCH ===
    useEffect(() => {
        const init = async () => {
            try {
                let currentUserId: string | null = null;

                // Get current user
                const userRes = await fetch('/api/user');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    currentUserId = userData.user.id;
                    setCurrentUser({ id: userData.user.id, username: userData.user.username });
                    setBalance(Number(userData.user.balance));
                }

                // Get auction
                const auctionRes = await fetch(`/api/auctions/${auctionId}`);
                if (!auctionRes.ok) throw new Error('Auction not found');
                const auctionJson = await auctionRes.json();
                setAuctionData(auctionJson.auction);
                setCurrentPrice(Number(auctionJson.auction.currentPrice || auctionJson.auction.startingPrice));

                // If auction is LIVE and has startedAt, begin animation
                if (auctionJson.auction.status === 'LIVE' && auctionJson.auction.startedAt) {
                    serverStartTime.current = new Date(auctionJson.auction.startedAt).getTime();
                    console.log('[BidPage] Auction already LIVE. StartedAt:', auctionJson.auction.startedAt);

                    // Check if they're joining late (after animation sequence)
                    const elapsed = (Date.now() - serverStartTime.current) / 1000;
                    if (elapsed > 16) {
                        console.log('[BidPage] 🚫 Late join detected (T+' + Math.floor(elapsed) + 's). Blocking user.');
                        setIsLateJoin(true);
                    }
                }

                // Fetch existing bids
                const bidsRes = await fetch(`/api/auctions/${auctionId}/bids`);
                if (bidsRes.ok) {
                    const bidsJson = await bidsRes.json();
                    const messages: BidMessage[] = bidsJson.bids.map((b: any) => ({
                        id: b.id,
                        username: b.user.username,
                        amount: Number(b.amount),
                        isMine: currentUserId === b.userId,
                        timestamp: new Date(b.createdAt).getTime(),
                        type: 'QUICK'
                    }));
                    setBids(messages.reverse());
                }

                setLoading(false);
            } catch (e) {
                console.error('[BidPage] Init error:', e);
                setLoading(false);
            }
        };
        init();
    }, [auctionId]);

    // === 2. PUSHER SUBSCRIPTION ===
    useEffect(() => {
        if (!auctionId) return;

        const pusher = getPusherClient();
        console.log('[Pusher] Connecting to auction-' + auctionId);

        // Connection state
        pusher.connection.bind('state_change', (states: any) => {
            console.log('[Pusher] State:', states.current);
            setIsConnected(states.current === 'connected');
        });

        pusher.connection.bind('error', (err: any) => {
            console.error('[Pusher] Connection error:', err);
        });

        const channel = pusher.subscribe(`auction-${auctionId}`);

        channel.bind('pusher:subscription_succeeded', () => {
            console.log('[Pusher] ✅ Subscribed to auction-' + auctionId);
        });

        channel.bind('pusher:subscription_error', (err: any) => {
            console.error('[Pusher] ❌ Subscription failed:', err);
        });

        // === CRITICAL EVENT: Auction Starts ===
        channel.bind('status-change', (data: any) => {
            console.log('[Pusher] status-change:', data);
            if (data.status === 'LIVE' && data.startedAt) {
                serverStartTime.current = new Date(data.startedAt).getTime();
                console.log('[Pusher] 🎬 Auction STARTED at:', data.startedAt);
                setAuctionData((prev: any) => ({ ...prev, status: 'LIVE', startedAt: data.startedAt }));
            }
            if (data.status === 'COMPLETED' || data.status === 'ENDED') {
                setPhase('SOLD');
                serverStartTime.current = null;
            }
        });

        // === CRITICAL EVENT: New Bid ===
        channel.bind('new-bid', (data: any) => {
            console.log('[Pusher] new-bid:', data);
            setCurrentPrice(data.amount);
            setBidCountdown(10); // Reset countdown

            // Add to chat
            const newBid: BidMessage = {
                id: data.bidId || `bid-${Date.now()}`,
                username: data.username,
                amount: data.amount,
                isMine: currentUser ? data.userId === currentUser.id : false,
                timestamp: Date.now(),
                type: data.isCustom ? 'CUSTOM' : 'QUICK'
            };
            setBids(prev => [newBid, ...prev]);
        });

        // === Auction Ended Event ===
        channel.bind('auction-ended', () => {
            console.log('[Pusher] Auction ended');
            setPhase('SOLD');
        });

        return () => {
            console.log('[Pusher] Unsubscribing');
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [auctionId, currentUser]);

    // === 3. ANIMATION TICKER (Synced to Server Time) ===
    useEffect(() => {
        if (!serverStartTime.current) {
            setPhase('WAITING');
            return;
        }

        // Clear old ticker
        if (tickerRef.current) clearInterval(tickerRef.current);

        tickerRef.current = setInterval(() => {
            const now = Date.now();
            const elapsed = (now - serverStartTime.current!) / 1000; // seconds

            if (elapsed < 0) {
                setPhase('WAITING');
            } else if (elapsed < 5) {
                setPhase('PRE_OPEN');
                setLockCountdown(Math.max(0, Math.ceil(5 - elapsed)));
            } else if (elapsed >= 5 && elapsed < 10) {
                setPhase('OPENING');
            } else if (elapsed >= 10 && elapsed < 15) {
                setPhase('REVEAL');
                setShutterCountdown(Math.max(0, Math.ceil(15 - elapsed)));
            } else if (elapsed >= 15 && elapsed < 16) {
                setPhase('CLOSING');
            } else {
                setPhase('BIDDING');
            }
        }, 100);

        return () => {
            if (tickerRef.current) clearInterval(tickerRef.current);
        };
    }, [serverStartTime.current]);

    // === 4. BIDDING COUNTDOWN ===
    useEffect(() => {
        if (phase === 'BIDDING' && bidCountdown > 0) {
            const t = setTimeout(() => setBidCountdown(p => Math.max(0, p - 1)), 1000);
            return () => clearTimeout(t);
        } else if (phase === 'BIDDING' && bidCountdown === 0) {
            setPhase('SOLD');
        }
    }, [phase, bidCountdown]);

    // === HANDLERS ===
    const placeBid = async (amount: number) => {
        if (bidding || phase !== 'BIDDING') return;
        if (amount <= currentPrice) {
            alert('Bid must be higher than current price!');
            return;
        }
        if (amount > balance) {
            alert('Insufficient balance!');
            return;
        }

        setBidding(true);
        try {
            const res = await fetch('/api/bid/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auctionId, amount })
            });

            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Failed to place bid');
            } else {
                const data = await res.json();
                setBalance(data.newBalance);
                setShowCustomInput(false);
                setCustomBidAmount('');
            }
        } catch (e) {
            console.error('[Bid] Error:', e);
            alert('Network error');
        } finally {
            setBidding(false);
        }
    };

    const handleCustomBid = () => {
        const amount = parseInt(customBidAmount);
        if (isNaN(amount) || amount <= currentPrice) {
            alert('Invalid bid amount');
            return;
        }
        placeBid(amount);
    };

    // === RENDERING ===
    if (loading) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center">
                <div className="text-lg">Loading auction...</div>
            </div>
        );
    }

    if (!auctionData) {
        return (
            <div className="h-screen bg-black text-white flex items-center justify-center">
                <div className="text-red-400">Auction not found</div>
            </div>
        );
    }

    // === WAITING ROOM ===
    if (auctionData.status === 'WAITING_ROOM') {
        return <WaitingRoom auction={auctionData} />;
    }

    // === LATE JOIN BLOCKER ===
    if (isLateJoin) {
        return (
            <div className="h-screen bg-gradient-to-b from-gray-900 to-black text-white flex flex-col items-center justify-center p-6">
                <div className="text-8xl mb-8">⏰</div>
                <h1 className="text-3xl font-black mb-4 text-center">
                    Auction Already In Progress
                </h1>
                <p className="text-gray-400 text-center mb-8 max-w-md">
                    This auction has already started and is currently accepting bids.
                    Join earlier next time to participate!
                </p>
                <div className="space-y-3">
                    <button
                        onClick={() => router.push('/home')}
                        className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition shadow-xl"
                    >
                        Back to Home
                    </button>
                    <p className="text-gray-600 text-xs text-center">
                        Tip: Join the waiting room 5 minutes before an auction starts
                    </p>
                </div>
            </div>
        );
    }

    // Map phase to shutter status
    const getShutterStatus = (): ShutterStatus => {
        if (phase === 'WAITING' || phase === 'PRE_OPEN') return 'CLOSED';
        if (phase === 'OPENING') return 'OPENING';
        if (phase === 'REVEAL') return 'OPEN';
        if (phase === 'CLOSING') return 'CLOSING';
        return 'BIDDING';
    };

    return (
        <div className="min-h-screen bg-black text-white font-sans flex flex-col">
            {/* === HEADER === */}
            <header className="p-4 flex justify-between items-center bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-800 rounded-lg">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400">Balance</span>
                    <span className="text-lg font-bold text-green-400">₹{balance.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                    {isConnected ? (
                        <Wifi className="w-5 h-5 text-green-400" />
                    ) : (
                        <WifiOff className="w-5 h-5 text-red-400" />
                    )}
                </div>
            </header>

            {/* === MAIN STAGE === */}
            <main className="flex-1 flex flex-col overflow-hidden">
                {/* Shutter & Lock */}
                <div className="relative p-4">
                    <AuctionLock
                        isLocked={phase === 'PRE_OPEN'}
                        countdown={lockCountdown}
                    />
                    <AuctionShutter status={getShutterStatus()}>
                        <div className="text-center p-6 bg-black/60 backdrop-blur-sm rounded-xl border border-white/20 max-w-md">
                            <div className="text-yellow-400 font-bold mb-2 uppercase tracking-wider">
                                {auctionData.rankTier} Tier
                            </div>
                            <h1 className="text-2xl font-black text-white mb-4 uppercase">
                                {auctionData.name}
                            </h1>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {auctionData.artifacts?.map((a: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-200 text-xs font-mono">
                                        {a.artifact.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </AuctionShutter>
                </div>

                {/* Status Bar */}
                <div className="bg-gray-900 px-4 py-2 text-center text-xs font-mono uppercase tracking-widest border-y border-gray-800">
                    {phase === 'WAITING' && <span className="text-gray-500">Waiting for auction to start...</span>}
                    {phase === 'PRE_OPEN' && <span className="text-yellow-400 animate-pulse">Starting in {lockCountdown}s</span>}
                    {phase === 'OPENING' && <span className="text-cyan-400">🔓 Security Breach Detected...</span>}
                    {phase === 'REVEAL' && <span className="text-red-400 animate-pulse font-bold">⚠️ Shutter Closing in {shutterCountdown}s</span>}
                    {phase === 'CLOSING' && <span className="text-gray-400">Engaging Privacy Mode...</span>}
                    {phase === 'BIDDING' && (
                        <span className={bidCountdown < 4 ? 'text-red-500 font-black animate-pulse' : 'text-green-400'}>
                            {bidCountdown === 0 ? '🔨 SOLD!' : `⏱️ ${bidCountdown}s Remaining`}
                        </span>
                    )}
                    {phase === 'SOLD' && <span className="text-green-500 font-bold">✅ Auction Ended</span>}
                </div>

                {/* Chat Stream */}
                <div className="flex-1 bg-gray-950/50 overflow-hidden">
                    <BidStream bids={bids} />
                </div>

                {/* Price Display */}
                <div className="px-6 py-3 bg-gray-900/50 border-t border-gray-800">
                    <div className="flex justify-between items-baseline">
                        <span className="text-xs text-gray-400 uppercase">Current High Bid</span>
                        <span className="text-3xl font-black text-cyan-400">₹{currentPrice.toLocaleString()}</span>
                    </div>
                </div>
            </main>

            {/* === CONTROLS === */}
            <footer className="p-4 bg-gray-900 border-t border-gray-800">
                {showCustomInput ? (
                    <div className="space-y-3">
                        <input
                            type="number"
                            value={customBidAmount}
                            onChange={(e) => setCustomBidAmount(e.target.value)}
                            placeholder={`Enter amount > ₹${currentPrice.toLocaleString()}`}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold text-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => { setShowCustomInput(false); setCustomBidAmount(''); }}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCustomBid}
                                disabled={bidding}
                                className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl font-bold"
                            >
                                {bidding ? 'Placing...' : 'Confirm'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button
                            disabled={phase !== 'BIDDING'}
                            onClick={() => alert('Loan feature coming soon')}
                            className="w-16 h-16 bg-gray-800 rounded-xl flex flex-col items-center justify-center disabled:opacity-30 hover:bg-gray-700 transition"
                        >
                            <span className="text-2xl">💰</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Loan</span>
                        </button>

                        <button
                            disabled={phase !== 'BIDDING' || bidCountdown === 0 || !isConnected}
                            onClick={() => placeBid(currentPrice + 1000)}
                            className="flex-1 h-16 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 disabled:opacity-30 disabled:grayscale rounded-xl flex items-center justify-between px-4 font-bold shadow-xl shadow-red-900/30 active:scale-95 transition"
                        >
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] text-red-100/70 uppercase">Quick Bid</span>
                                <span className="text-xl text-white">+₹1,000</span>
                            </div>
                            <div className="text-3xl">⚡</div>
                        </button>

                        <button
                            disabled={phase !== 'BIDDING'}
                            onClick={() => setShowCustomInput(true)}
                            className="w-16 h-16 bg-gray-800 rounded-xl flex flex-col items-center justify-center disabled:opacity-30 hover:bg-gray-700 transition"
                        >
                            <span className="text-2xl">✍️</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase mt-0.5">Custom</span>
                        </button>
                    </div>
                )}
            </footer>

            {/* Connection Lost Banner */}
            {!isConnected && (
                <div className="fixed top-20 left-4 right-4 bg-red-500/10 border border-red-500 rounded-lg p-3 backdrop-blur-md z-50">
                    <div className="text-red-400 text-sm font-semibold text-center">
                        🔌 Connection Lost - Reconnecting...
                    </div>
                </div>
            )}
        </div>
    );
}
