'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, ArrowLeft, Wifi, WifiOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Shutter from '@/components/Shutter';
import { getPusherClient } from '@/lib/pusher-client';

type AuctionStatus = 'locked' | 'revealing' | 'bidding' | 'completed';

interface Bid {
    id: string;
    username: string;
    amount: number;
    timestamp: Date;
}

interface AuctionData {
    id: string;
    name: string;
    rankTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
    startingPrice: number;
    currentPrice: number;
    status: string;
    startsAt: Date;
    endedAt: Date;
}

export default function LiveBidPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<AuctionStatus>('locked');
    const [countdown, setCountdown] = useState(0);
    const [currentBid, setCurrentBid] = useState(0);
    const [customBidAmount, setCustomBidAmount] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [bids, setBids] = useState<Bid[]>([]);
    const [auction, setAuction] = useState<AuctionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [balance, setBalance] = useState(0);
    const [isConnected, setIsConnected] = useState(true);
    const [bidding, setBidding] = useState(false);

    const auctionId = params.id as string;

    // Fetch auction data
    useEffect(() => {
        async function fetchAuction() {
            try {
                const res = await fetch(`/api/auctions/${auctionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAuction(data.auction);
                    setCurrentBid(Number(data.auction.currentPrice) || Number(data.auction.startingPrice));

                    // Calculate countdown
                    const endedAt = new Date(data.auction.endedAt);
                    const now = new Date();
                    const remaining = Math.max(0, Math.floor((endedAt.getTime() - now.getTime()) / 1000));
                    setCountdown(remaining);

                    // Set status based on auction state
                    if (data.auction.status === 'LIVE') {
                        setStatus('bidding');
                    } else if (data.auction.status === 'ENDED') {
                        setStatus('completed');
                    }

                    // Fetch bids
                    const bidsRes = await fetch(`/api/auctions/${auctionId}/bids`);
                    if (bidsRes.ok) {
                        const bidsData = await bidsRes.json();
                        setBids(bidsData.bids.map((b: any) => ({
                            id: b.id,
                            username: b.user.username,
                            amount: Number(b.amount),
                            timestamp: new Date(b.createdAt),
                        })));
                    }
                }
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch auction:', error);
                setLoading(false);
            }
        }

        fetchAuction();
    }, [auctionId]);

    // Fetch user balance
    useEffect(() => {
        async function fetchBalance() {
            try {
                const res = await fetch('/api/user');
                if (res.ok) {
                    const data = await res.json();
                    setBalance(Number(data.user.balance));
                }
            } catch (error) {
                console.error('Failed to fetch balance:', error);
            }
        }
        fetchBalance();
    }, []);

    // Pusher WebSocket subscription
    useEffect(() => {
        if (!auctionId) return;

        const pusher = getPusherClient();
        const channel = pusher.subscribe(`auction-${auctionId}`);

        // Connection state
        pusher.connection.bind('state_change', (states: any) => {
            setIsConnected(states.current === 'connected');
        });

        // New bid event
        channel.bind('new-bid', (data: any) => {
            console.log('[Pusher] New bid received:', data);
            setCurrentBid(data.amount);
            setBids(prev => [
                {
                    id: data.bidId,
                    username: data.username,
                    amount: data.amount,
                    timestamp: new Date(data.timestamp),
                },
                ...prev,
            ]);

            // Extend countdown if needed
            if (data.timeExtended && countdown < 30) {
                setCountdown(prev => Math.min(prev + 10, 30));
            }
        });

        // Auction status change
        channel.bind('status-change', (data: any) => {
            console.log('[Pusher] Status change:', data);
            if (data.status === 'ENDED') {
                setStatus('completed');
                setCountdown(0);
            }
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [auctionId, countdown]);

    // Client-side countdown
    useEffect(() => {
        if (status === 'bidding' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'bidding' && countdown === 0) {
            setStatus('completed');
        }
    }, [status, countdown]);

    const handleRevealComplete = () => {
        setStatus('bidding');
    };

    const handleBid = async (amount?: number) => {
        const bidAmount = amount || currentBid + 1000;

        if (bidding) return; // Prevent double-click

        if (bidAmount > balance) {
            alert('Insufficient balance!');
            return;
        }

        setBidding(true);

        try {
            const res = await fetch('/api/bid/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    auctionId,
                    amount: bidAmount,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setBalance(data.newBalance);
                setShowCustomInput(false);
                setCustomBidAmount('');
            } else {
                alert(data.error || 'Failed to place bid');
            }
        } catch (error) {
            console.error('Bid error:', error);
            alert('Network error. Please try again.');
        } finally {
            setBidding(false);
        }
    };

    const handleCustomBid = () => {
        const amount = parseInt(customBidAmount);
        if (isNaN(amount) || amount <= currentBid) {
            alert('Bid must be higher than current bid!');
            return;
        }
        handleBid(amount);
    };

    const winner = status === 'completed' && bids.length > 0 ? bids[0] : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-gray-400">Loading auction...</div>
            </div>
        );
    }

    if (!auction) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-red-400">Auction not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 pb-6">
            {/* Header */}
            <header className="sticky top-0 z-[200] bg-slate-900 border-b border-gray-800 px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Back + Balance */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-gray-800 rounded-full transition"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-xs text-gray-500">Balance</span>
                            <span className="text-base font-bold text-gray-100">₹{balance.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Right: Connection Status */}
                    <div className="flex items-center gap-3">
                        {isConnected ? (
                            <Wifi className="w-5 h-5 text-green-400" />
                        ) : (
                            <WifiOff className="w-5 h-5 text-red-400" />
                        )}
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-600 to-blue-700 rounded-full flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-6 space-y-6">
                {/* Shutter */}
                <Shutter
                    status={status}
                    rankTier={auction.rankTier}
                    startingPrice={Number(auction.startingPrice)}
                    currentBid={currentBid}
                    countdown={countdown}
                    onRevealComplete={handleRevealComplete}
                />

                {/* Bid Feed */}
                {status === 'bidding' && (
                    <div className="space-y-3">
                        <h3 className="font-bold text-gray-100">Live Bids</h3>
                        <div className="max-h-64 overflow-y-auto space-y-2">
                            <AnimatePresence>
                                {bids.map((bid, index) => (
                                    <motion.div
                                        key={bid.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{
                                            opacity: 1,
                                            x: 0,
                                            scale: index === 0 && countdown === 0 ? 1.05 : 1,
                                        }}
                                        className={`
                                            flex items-start gap-3 p-3 rounded-lg bg-gray-800
                                            ${index === 0 && countdown === 0 ? 'ring-2 ring-green-500 shadow-lg' : 'shadow-sm'}
                                        `}
                                    >
                                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                                            <User className="w-6 h-6 text-white" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-semibold text-gray-100">
                                                    {bid.username}
                                                </span>
                                                {index === 0 && countdown === 0 && (
                                                    <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full">
                                                        WINNER 🎉
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-lg font-bold text-cyan-400">
                                                ₹{bid.amount.toLocaleString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>
                )}

                {/* Winner Announcement */}
                {status === 'completed' && winner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card text-center py-8"
                    >
                        <p className="text-6xl mb-4">🎉</p>
                        <h2 className="text-2xl font-bold text-gray-100 mb-2">
                            {winner.username} Wins!
                        </h2>
                        <p className="text-lg text-gray-400">
                            Final Bid: <span className="font-bold text-cyan-400">₹{winner.amount.toLocaleString()}</span>
                        </p>
                    </motion.div>
                )}
            </main>

            {/* Action Buttons (only during bidding) */}
            {status === 'bidding' && countdown > 0 && (
                <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-gray-800 p-4">
                    <div className="container max-w-lg mx-auto">
                        {showCustomInput ? (
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    value={customBidAmount}
                                    onChange={(e) => setCustomBidAmount(e.target.value)}
                                    placeholder={`Min: ₹${currentBid + 100}`}
                                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 font-semibold text-lg outline-none focus:ring-2 focus:ring-cyan-500"
                                    autoFocus
                                />
                                <div className="flex gap-3">
                                    <button
                                        onClick={() => {
                                            setShowCustomInput(false);
                                            setCustomBidAmount('');
                                        }}
                                        className="flex-1 btn btn-secondary py-3"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCustomBid}
                                        disabled={bidding}
                                        className="flex-1 btn btn-primary py-3"
                                    >
                                        {bidding ? 'Placing...' : 'Place Bid'}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <button
                                    onClick={() => alert('Loan feature coming soon!')}
                                    className="flex-1 btn btn-secondary py-4 text-base"
                                >
                                    💰 Loan
                                </button>
                                <button
                                    onClick={() => handleBid()}
                                    disabled={bidding}
                                    className="flex-1 btn btn-primary py-4 text-base font-bold"
                                >
                                    {bidding ? 'Placing...' : `₹${(currentBid + 1000).toLocaleString()}`}
                                </button>
                                <button
                                    onClick={() => setShowCustomInput(true)}
                                    className="flex-1 btn btn-secondary py-4 text-base"
                                >
                                    Custom
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Connection Lost Banner */}
            {!isConnected && (
                <div className="fixed top-16 left-0 right-0 bg-red-600 text-white text-center py-2 text-sm font-semibold z-[199]">
                    ⚠️ Connection lost. Reconnecting...
                </div>
            )}
        </div>
    );
}
