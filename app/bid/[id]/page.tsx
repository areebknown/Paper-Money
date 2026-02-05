'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { User, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Shutter from '@/components/Shutter';

type AuctionStatus = 'locked' | 'revealing' | 'bidding' | 'completed';

export default function LiveBidPage() {
    const params = useParams();
    const router = useRouter();
    const [status, setStatus] = useState<AuctionStatus>('locked');
    const [countdown, setCountdown] = useState(5);
    const [currentBid, setCurrentBid] = useState(5000);
    const [customBidAmount, setCustomBidAmount] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);

    // Mock user data
    const userData = {
        balance: 34000,
        rankPoints: 340,
    };

    // Mock auction data
    const auctionData = {
        id: params.id,
        name: 'Shutter #1',
        rankTier: 'GOLD' as const,
        startingPrice: 5000,
    };

    // Mock bid history
    const [bids, setBids] = useState([
        { id: '1', username: 'Player1', amount: 5000, timestamp: new Date() },
    ]);

    // Countdown logic
    useEffect(() => {
        if (status === 'bidding' && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        } else if (status === 'bidding' && countdown === 0) {
            setStatus('completed');
        }
    }, [status, countdown]);

    // Simulate auction start (for demo purposes)
    useEffect(() => {
        // Auto-start after 2 seconds
        const timer = setTimeout(() => {
            if (status === 'locked') {
                setStatus('revealing');
            }
        }, 2000);
        return () => clearTimeout(timer);
    }, [status]);

    const handleRevealComplete = () => {
        setStatus('bidding');
        setCountdown(5);
    };

    const handleBid = (amount?: number) => {
        const bidAmount = amount || currentBid + 1000;

        if (bidAmount > userData.balance) {
            alert('Insufficient balance!');
            return;
        }

        setCurrentBid(bidAmount);
        setCountdown(5); // Reset countdown
        setBids([
            { id: Date.now().toString(), username: 'You', amount: bidAmount, timestamp: new Date() },
            ...bids,
        ]);
        setShowCustomInput(false);
        setCustomBidAmount('');
    };

    const handleCustomBid = () => {
        const amount = parseInt(customBidAmount);
        if (isNaN(amount) || amount <= currentBid) {
            alert('Bid must be higher than current bid!');
            return;
        }
        handleBid(amount);
    };

    const winner = status === 'completed' ? bids[0] : null;

    return (
        <div className="min-h-screen bg-[var(--color-bg-primary)] pb-6">
            {/* Header */}
            <header className="sticky top-0 z-sticky bg-white border-b border-[var(--color-border-light)] px-4 py-3">
                <div className="flex items-center justify-between">
                    {/* Left: Back + Balance & Rank */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-[var(--color-hover)] rounded-full transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div className="flex flex-col">
                            <span className="text-xs text-[var(--color-text-tertiary)]">Balance</span>
                            <span className="text-base font-bold">₹{userData.balance.toLocaleString()}</span>
                        </div>
                        <div className="text-sm">
                            <span className="text-[var(--color-text-tertiary)]">Rank:</span>
                            <span className="font-semibold ml-1">{userData.rankPoints}</span>
                        </div>
                    </div>

                    {/* Right: Profile */}
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-yellow-900" />
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container py-6 space-y-6">
                {/* Shutter */}
                <Shutter
                    status={status}
                    rankTier={auctionData.rankTier}
                    startingPrice={auctionData.startingPrice}
                    currentBid={currentBid}
                    countdown={countdown}
                    onRevealComplete={handleRevealComplete}
                />

                {/* Bid Feed */}
                {status === 'bidding' && (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                        <h3 className="font-bold text-[var(--color-text-primary)]">Live Bids</h3>
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
                    flex items-start gap-3 p-3 rounded-lg bg-white
                    ${index === 0 && countdown === 0 ? 'ring-2 ring-green-500 shadow-lg' : 'shadow-sm'}
                  `}
                                >
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                                        <User className="w-6 h-6 text-white" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold text-[var(--color-text-primary)]">
                                                {bid.username}
                                            </span>
                                            {index === 0 && countdown === 0 && (
                                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                                                    WINNER 🎉
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-lg font-bold text-yellow-700">
                                            ₹{bid.amount.toLocaleString()}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Winner Announcement */}
                {status === 'completed' && winner && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="card-elevated text-center py-8"
                    >
                        <p className="text-6xl mb-4">🎉</p>
                        <h2 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
                            {winner.username === 'You' ? 'You Won!' : `${winner.username} Wins!`}
                        </h2>
                        <p className="text-lg text-[var(--color-text-secondary)]">
                            Final Bid: <span className="font-bold text-yellow-700">₹{winner.amount.toLocaleString()}</span>
                        </p>
                    </motion.div>
                )}
            </main>

            {/* Action Buttons (only during bidding) */}
            {status === 'bidding' && (
                <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-[var(--color-border)] p-4 pb-safe">
                    <div className="container">
                        {showCustomInput ? (
                            <div className="space-y-3">
                                <input
                                    type="number"
                                    value={customBidAmount}
                                    onChange={(e) => setCustomBidAmount(e.target.value)}
                                    placeholder={`Min: ₹${currentBid + 1}`}
                                    className="w-full px-4 py-3 border-2 border-[var(--color-border)] rounded-lg font-semibold text-lg"
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
                                        className="flex-1 btn btn-primary py-3"
                                    >
                                        Place Bid
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
                                    className="flex-1 btn btn-primary py-4 text-base font-bold"
                                >
                                    ₹{(currentBid + 1000).toLocaleString()}
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
        </div>
    );
}
