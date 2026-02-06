'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Wifi, WifiOff, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPusherClient } from '@/lib/pusher-client';

// New Components
import AuctionShutter from '@/components/auction/AuctionShutter';
import AuctionLock from '@/components/auction/AuctionLock';
import BidStream, { BidMessage } from '@/components/auction/BidStream';

type AuctionPhase = 'PRE_OPEN' | 'OPENING' | 'REVEAL' | 'CLOSING' | 'BIDDING' | 'COMPLETED';

export default function LiveBidPage() {
    const params = useParams();
    const router = useRouter();
    const auctionId = params.id as string;

    // --- State ---
    const [phase, setPhase] = useState<AuctionPhase>('PRE_OPEN');
    const [balance, setBalance] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [bids, setBids] = useState<BidMessage[]>([]);
    const [isConnected, setIsConnected] = useState(true);
    const [bidding, setBidding] = useState(false);

    // Timers
    const [startCountdown, setStartCountdown] = useState(5); // 0-5s
    const [shutterCountdown, setShutterCountdown] = useState(5); // 10-15s
    const [bidCountdown, setBidCountdown] = useState(10); // The "Going once..." timer

    // Data
    const [auctionData, setAuctionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ id: string, username: string } | null>(null);

    // --- 1. Init & Sync ---
    useEffect(() => {
        const init = async () => {
            try {
                // Fetch User
                const userRes = await fetch('/api/user');
                if (userRes.ok) {
                    const uData = await userRes.json();
                    setCurrentUser(uData.user);
                    setBalance(Number(uData.user.balance));
                }

                // Fetch Auction
                const res = await fetch(`/api/auctions/${auctionId}`);
                if (!res.ok) throw new Error('Auction not found');
                const data = await res.json();
                setAuctionData(data.auction);
                setCurrentPrice(Number(data.auction.currentPrice));

                // Fetch Bids
                const bidsRes = await fetch(`/api/auctions/${auctionId}/bids`);
                if (bidsRes.ok) {
                    const bData = await bidsRes.json();
                    // Transform to Chat Messages
                    const msgs = bData.bids.map((b: any) => ({
                        id: b.id,
                        username: b.user.username,
                        amount: Number(b.amount),
                        isMine: b.userId === data.auction.winnerId, // Loose check, better is b.userId === currentUser.id
                        timestamp: new Date(b.createdAt).getTime(),
                        type: 'QUICK'
                    }));
                    setBids(msgs.reverse()); // Newest first
                }

                setLoading(false);
            } catch (e) {
                console.error(e);
                setLoading(false);
            }
        };
        init();
    }, [auctionId]);

    // --- 2. The "Show" Logic (Time Sync) ---
    useEffect(() => {
        if (!auctionData) return;

        // If completed, just show it
        if (auctionData.status === 'COMPLETED' || auctionData.status === 'ENDED') {
            setPhase('COMPLETED');
            return;
        }

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = new Date(auctionData.startedAt).getTime();
            const diff = (now - start) / 1000; // Seconds since start

            if (diff < 5) {
                setPhase('PRE_OPEN');
                setStartCountdown(Math.max(0, Math.ceil(5 - diff)));
            } else if (diff >= 5 && diff < 10) {
                setPhase('OPENING'); // Lock breaks, Shutter opens
            } else if (diff >= 10 && diff < 15) {
                setPhase('REVEAL');
                setShutterCountdown(Math.max(0, Math.ceil(15 - diff)));
            } else if (diff >= 15 && diff < 16) {
                setPhase('CLOSING'); // Shutter closes
            } else {
                setPhase('BIDDING');
            }
        }, 100);

        return () => clearInterval(interval);
    }, [auctionData]);

    // --- 3. Pusher Events ---
    useEffect(() => {
        const client = getPusherClient();
        const channel = client.subscribe(`auction-${auctionId}`);

        channel.bind('status-change', (data: any) => {
            if (data.status === 'LIVE' && auctionData) {
                // Update startedAt to sync animation
                setAuctionData((prev: any) => ({ ...prev, status: 'LIVE', startedAt: data.startedAt }));
            }
            if (data.status === 'COMPLETED' || data.status === 'ENDED') {
                setPhase('COMPLETED');
            }
        });

        channel.bind('new-bid', (data: any) => {
            setCurrentPrice(data.amount);
            setBidCountdown(10); // Reset timer

            // Add chat bubble
            setBids(prev => [{
                id: data.bidId || Math.random().toString(),
                username: data.username,
                amount: data.amount,
                isMine: currentUser ? data.userId === currentUser.id : false,
                timestamp: Date.now(),
                type: 'QUICK' // or Custom
            }, ...prev]);
        });

        return () => channel.unsubscribe();
    }, [auctionId, auctionData, currentUser]);

    // --- 4. Bidding Countdown (The "Going Once" timer) ---
    useEffect(() => {
        if (phase === 'BIDDING' && bidCountdown > 0) {
            const t = setTimeout(() => setBidCountdown(p => p - 1), 1000);
            return () => clearTimeout(t);
        }
    }, [phase, bidCountdown]);


    // --- Handlers ---
    const placeBid = async (amount: number) => {
        if (bidding || phase !== 'BIDDING') return;
        setBidding(true);
        try {
            await fetch('/api/bid/place', {
                method: 'POST',
                body: JSON.stringify({ auctionId, amount })
            });
            // Optimistic update handled by Pusher
        } catch (e) { alert('Error placing bid'); }
        finally { setBidding(false); }
    };

    if (loading) return <div className="bg-black text-white h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-black text-white font-sans overflow-hidden flex flex-col">
            {/* Top Bar */}
            <header className="p-4 flex justify-between items-center bg-gray-900 border-b border-gray-800 z-50">
                <button onClick={() => router.back()}><ArrowLeft /></button>
                <div className="font-bold text-green-400">₹{balance.toLocaleString()}</div>
                <div className="flex gap-2">
                    {isConnected ? <Wifi className="text-green-500" /> : <WifiOff className="text-red-500" />}
                </div>
            </header>

            {/* Main Stage */}
            <main className="flex-1 relative flex flex-col">

                {/* 1. The Shutter & Artifacts */}
                <div className="relative z-10">
                    <AuctionLock
                        isLocked={phase === 'PRE_OPEN'}
                        countdown={startCountdown}
                    />

                    <AuctionShutter status={phase}>
                        {/* The Content Inside the Shutter (Brick Wall BG is in component) */}
                        <div className="text-center p-6 bg-black/50 backdrop-blur-md rounded-xl border border-white/10 m-4">
                            <div className="text-yellow-400 text-lg font-bold mb-2">
                                {auctionData?.rankTier} TIER
                            </div>
                            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">
                                {auctionData?.name}
                            </h1>
                            <div className="flex flex-wrap gap-2 justify-center">
                                {auctionData?.artifacts?.map((a: any, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/50 rounded text-yellow-200 text-sm">
                                        {a.artifact.name}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </AuctionShutter>
                </div>

                {/* 2. Info / Timer Bar */}
                <div className="bg-gray-900 p-2 text-center text-xs font-mono uppercase tracking-widest text-gray-500 border-y border-gray-800">
                    {phase === 'PRE_OPEN' && 'Secure Channel Logic Initializing...'}
                    {phase === 'OPENING' && 'Security Shutter Disengaging...'}
                    {phase === 'REVEAL' && <span className="text-red-400 animate-pulse">SHUTTER CLOSING IN {shutterCountdown}s</span>}
                    {phase === 'CLOSING' && 'Engaging Privacy Shields...'}
                    {phase === 'BIDDING' && (
                        <span className={bidCountdown < 4 ? 'text-red-500 font-bold' : 'text-green-500'}>
                            {bidCountdown === 0 ? 'SOLD (Processing...)' : `Time Remaining: ${bidCountdown}s`}
                        </span>
                    )}
                    {phase === 'COMPLETED' && 'Auction Concluded'}
                </div>

                {/* 3. The Bid Stream (Chat) */}
                <div className="flex-1 relative bg-gray-950/50 flex flex-col">
                    <BidStream bids={bids} />
                </div>

                {/* 4. Controls */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 pb-safe">
                    <div className="flex justify-between items-end mb-4 px-2">
                        <div className="text-gray-400 text-xs uppercase">Current High</div>
                        <div className="text-4xl font-black text-cyan-400">₹{currentPrice.toLocaleString()}</div>
                    </div>

                    <div className="flex gap-3 h-16">
                        <button
                            disabled={phase !== 'BIDDING'}
                            onClick={() => alert('Loan coming soon')}
                            className="w-20 bg-gray-800 rounded-xl flex flex-col items-center justify-center disabled:opacity-30 active:scale-95 transition"
                        >
                            <span className="text-xl">💰</span>
                            <span className="text-[10px] uppercase font-bold text-gray-400">Loan</span>
                        </button>

                        <button
                            disabled={phase !== 'BIDDING' || bidCountdown === 0}
                            onClick={() => placeBid(currentPrice + 1000)}
                            className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl flex items-center justify-between px-6 hover:from-cyan-500 hover:to-blue-500 disabled:opacity-30 disabled:grayscale transition shadow-lg shadow-cyan-900/20 active:scale-95"
                        >
                            <div className="flex flex-col text-left">
                                <span className="text-[10px] font-bold text-cyan-100/70 uppercase">Quick Bid</span>
                                <span className="text-xl font-black text-white">+ ₹1000</span>
                            </div>
                            <div className="text-3xl font-thin opacity-50">IsMine?</div>
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
