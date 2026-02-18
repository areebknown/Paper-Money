'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { getPusherClient } from '@/lib/pusher-client';
import WaitingRoom from '@/components/auction/WaitingRoom';

// ─── Types ────────────────────────────────────────────────────────────────────
type AuctionPhase = 'WAITING' | 'PRE_OPEN' | 'OPENING' | 'REVEAL' | 'CLOSING' | 'BIDDING' | 'SOLD';

interface BidMessage {
    id: string;
    username: string;
    amount: number;
    isMine: boolean;
    timestamp: number;
    isCustom: boolean;
}

interface SoldInfo {
    winnerId: string | null;
    winnerUsername: string | null;
    finalPrice: number;
    auctionName: string;
}

// ─── Tier helpers ─────────────────────────────────────────────────────────────
function getTierIcon(tier: string) {
    if (tier === 'GOLD') return { icon: 'workspace_premium', color: 'text-yellow-400', bg: 'from-yellow-600 to-yellow-900', border: 'border-yellow-500' };
    if (tier === 'SILVER') return { icon: 'shield', color: 'text-gray-300', bg: 'from-gray-400 to-gray-700', border: 'border-gray-300' };
    return { icon: 'shield', color: 'text-amber-400', bg: 'from-amber-700 to-amber-950', border: 'border-amber-600' };
}

// ─── Chat Bubble ──────────────────────────────────────────────────────────────
function ChatBubble({ bid }: { bid: BidMessage }) {
    const initials = bid.username.slice(0, 2).toUpperCase();
    const avatarColor = bid.isMine ? 'from-blue-500 to-blue-700' : 'from-purple-500 to-pink-600';

    return (
        <div className={`flex items-end gap-2 mb-2 ${bid.isMine ? 'flex-row-reverse' : 'flex-row'}`}>
            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white text-xs font-black shrink-0 shadow-lg`}>
                {initials}
            </div>
            <div className={`max-w-[70%] ${bid.isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                <span className={`text-[10px] text-gray-500 mb-0.5 ${bid.isMine ? 'text-right' : 'text-left'}`}>
                    {bid.username}
                </span>
                <div className={`px-3 py-2 rounded-2xl shadow-md ${bid.isMine
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-gray-800 text-gray-100 rounded-bl-sm border border-gray-700'
                    }`}>
                    <span className="text-sm font-semibold">
                        {bid.isCustom ? 'custom bid ' : 'bid '}
                        <span className="font-black">₹{bid.amount.toLocaleString()}</span>
                    </span>
                </div>
            </div>
        </div>
    );
}

// ─── Sold / Winner Dialog ─────────────────────────────────────────────────────
function SoldDialog({
    soldInfo,
    currentUserId,
    auctionId,
    onClaim,
    onGoHome,
}: {
    soldInfo: SoldInfo;
    currentUserId: string | null;
    auctionId: string;
    onClaim: () => void;
    onGoHome: () => void;
}) {
    const isWinner = currentUserId && soldInfo.winnerId === currentUserId;
    const [claiming, setClaiming] = useState(false);
    const [claimed, setClaimed] = useState(false);

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const res = await fetch(`/api/auctions/${auctionId}/claim`, { method: 'POST' });
            if (res.ok) {
                setClaimed(true);
                onClaim();
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to claim');
            }
        } catch {
            alert('Network error');
        } finally {
            setClaiming(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="relative w-full max-w-sm bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-700 rounded-3xl overflow-hidden shadow-2xl">
                {/* Top accent */}
                <div className={`h-1.5 w-full ${isWinner ? 'bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400' : 'bg-gradient-to-r from-gray-600 via-gray-500 to-gray-600'}`} />

                <div className="p-6 text-center">
                    {/* Gavel icon */}
                    <div className="text-6xl mb-3">🔨</div>

                    {/* Auctioneer announcement */}
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-2 font-mono">SOLD!</p>
                    <div className="bg-gray-800/60 border border-gray-700 rounded-2xl px-4 py-3 mb-4">
                        <p className="text-white text-sm leading-relaxed">
                            <span className="text-gray-400 italic">"</span>
                            <span className="font-bold text-white">{soldInfo.auctionName}</span>
                            {' '}is sold to{' '}
                            <span className={`font-black ${isWinner ? 'text-yellow-400' : 'text-cyan-400'}`}>
                                {soldInfo.winnerUsername ?? 'Unknown Bidder'}
                            </span>
                            {' '}for{' '}
                            <span className="font-black text-green-400">
                                ₹{soldInfo.finalPrice.toLocaleString()}
                            </span>
                            <span className="text-gray-400 italic">"</span>
                        </p>
                    </div>

                    {isWinner ? (
                        <>
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl px-4 py-2 mb-4">
                                <p className="text-yellow-400 font-bold text-sm">🏆 You won this auction!</p>
                            </div>
                            {claimed ? (
                                <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-2 mb-4">
                                    <p className="text-green-400 font-bold text-sm">✅ Added to your inventory!</p>
                                </div>
                            ) : (
                                <button
                                    onClick={handleClaim}
                                    disabled={claiming}
                                    className="w-full py-3.5 bg-gradient-to-b from-yellow-400 to-yellow-600 hover:from-yellow-300 hover:to-yellow-500 disabled:opacity-50 text-gray-900 font-black rounded-xl text-sm uppercase tracking-wide shadow-lg shadow-yellow-900/30 active:scale-95 transition mb-3"
                                >
                                    {claiming ? 'Adding...' : '📦 Add to Inventory'}
                                </button>
                            )}
                            <button
                                onClick={onGoHome}
                                className="w-full py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm transition"
                            >
                                Return to Home
                            </button>
                        </>
                    ) : (
                        <>
                            <p className="text-gray-500 text-xs mb-4">Better luck next time! Join the waiting room early for the next auction.</p>
                            <button
                                onClick={onGoHome}
                                className="w-full py-3.5 bg-gradient-to-b from-blue-600 to-blue-800 hover:from-blue-500 hover:to-blue-700 text-white font-black rounded-xl text-sm uppercase tracking-wide shadow-lg active:scale-95 transition"
                            >
                                Return to Home
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Layered Shutter Stage ────────────────────────────────────────────────────
function ShutterStage({
    phase,
    auctionData,
    lockCountdown,
    shutterCountdown,
}: {
    phase: AuctionPhase;
    auctionData: any;
    lockCountdown: number;
    shutterCountdown: number;
}) {
    const isShutterClosed = phase === 'WAITING' || phase === 'PRE_OPEN' || phase === 'CLOSING' || phase === 'BIDDING' || phase === 'SOLD';
    const shutterY = isShutterClosed ? '0%' : '-100%';

    return (
        <div className="relative w-full" style={{ aspectRatio: '16/9' }}>
            {/* ── LAYER 1 (bottom): Brick Wall Room ── */}
            <div className="absolute inset-0 overflow-hidden" style={{ background: '#1a1008' }}>
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 28px, rgba(0,0,0,0.4) 28px, rgba(0,0,0,0.4) 30px),
                        repeating-linear-gradient(90deg, transparent, transparent 58px, rgba(0,0,0,0.3) 58px, rgba(0,0,0,0.3) 60px)
                    `,
                    backgroundColor: '#3d2b1a',
                }} />
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        repeating-linear-gradient(0deg, transparent, transparent 13px, rgba(0,0,0,0.15) 13px, rgba(0,0,0,0.15) 15px),
                        repeating-linear-gradient(90deg, transparent, transparent 29px, rgba(0,0,0,0.2) 29px, rgba(0,0,0,0.2) 31px)
                    `,
                    backgroundPosition: '30px 15px',
                    opacity: 0.6,
                }} />
                <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 80% 40% at 50% 0%, rgba(255,200,100,0.12) 0%, transparent 70%)' }} />
                <div className="absolute bottom-0 left-0 right-0 h-1/4" style={{ background: 'linear-gradient(to bottom, #2a1f0f, #1a1208)', borderTop: '2px solid rgba(255,180,80,0.15)' }} />
                <div className="absolute left-0 top-0 bottom-0 w-8" style={{ background: 'linear-gradient(to right, rgba(0,0,0,0.6), transparent)' }} />
                <div className="absolute right-0 top-0 bottom-0 w-8" style={{ background: 'linear-gradient(to left, rgba(0,0,0,0.6), transparent)' }} />
            </div>

            {/* ── LAYER 2: Artifact Images ── */}
            <div className="absolute inset-0 flex items-center justify-center p-6 z-10">
                {auctionData.artifacts && auctionData.artifacts.length > 0 ? (
                    <div className="flex flex-wrap gap-3 justify-center items-center">
                        {auctionData.artifacts.map((a: any, i: number) => (
                            <div key={i}>
                                {a.artifact.imageUrl ? (
                                    <img src={a.artifact.imageUrl} alt="" className="h-20 w-20 object-contain drop-shadow-2xl"
                                        style={{ filter: 'drop-shadow(0 0 12px rgba(255,200,80,0.4))' }} />
                                ) : (
                                    <div className="w-20 h-20 bg-yellow-900/40 border border-yellow-600/30 rounded-lg flex items-center justify-center">
                                        <span className="material-icons-round text-yellow-500 text-3xl">inventory_2</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-yellow-600/40 text-center">
                        <span className="material-icons-round text-6xl">inventory_2</span>
                    </div>
                )}
            </div>

            {/* ── LAYER 3 (top): The Shutter ── */}
            <div
                className="absolute inset-0 z-20"
                style={{
                    transform: `translateY(${shutterY})`,
                    transition: isShutterClosed
                        ? 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                        : 'transform 1.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                }}
            >
                <div className="absolute inset-0 overflow-hidden" style={{ background: 'linear-gradient(180deg, #4a5568 0%, #2d3748 100%)' }}>
                    {Array.from({ length: 16 }).map((_, i) => (
                        <div key={i} className="absolute left-0 right-0" style={{
                            top: `${(i / 16) * 100}%`, height: '1px',
                            background: 'rgba(0,0,0,0.5)', boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
                        }} />
                    ))}
                    <div className="absolute inset-0" style={{ backgroundImage: 'repeating-linear-gradient(180deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 1px, transparent 1px, transparent 18px)' }} />
                    <div className="absolute left-3 top-0 bottom-0 w-3 rounded" style={{ background: 'linear-gradient(90deg, #1a202c, #2d3748, #1a202c)' }} />
                    <div className="absolute right-3 top-0 bottom-0 w-3 rounded" style={{ background: 'linear-gradient(90deg, #1a202c, #2d3748, #1a202c)' }} />

                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {phase === 'PRE_OPEN' && (
                            <div className="text-center">
                                <div className="text-5xl mb-2">🔒</div>
                                <p className="text-yellow-400 font-black text-xl font-mono">STARTING IN</p>
                                <p className="text-white font-black text-5xl font-mono">{lockCountdown}s</p>
                            </div>
                        )}
                        {phase === 'WAITING' && (
                            <div className="text-center opacity-60">
                                <div className="text-4xl mb-2">⏳</div>
                                <p className="text-gray-400 text-sm font-mono uppercase tracking-widest">Waiting for auction</p>
                            </div>
                        )}
                        {(phase === 'BIDDING' || phase === 'CLOSING') && (
                            <div className="text-center transform -rotate-6 border-4 border-yellow-500/40 px-6 py-3 rounded-xl">
                                <p className="text-yellow-500/60 font-black text-3xl tracking-widest uppercase">BIDDING</p>
                                <p className="text-yellow-500/40 font-black text-xl tracking-widest uppercase">ACTIVE</p>
                            </div>
                        )}
                        {phase === 'SOLD' && (
                            <div className="text-center transform -rotate-6 border-4 border-red-500/60 px-6 py-3 rounded-xl">
                                <p className="text-red-500/80 font-black text-4xl tracking-widest uppercase">SOLD!</p>
                            </div>
                        )}
                    </div>

                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-24 h-2.5 rounded-full"
                        style={{ background: 'linear-gradient(90deg, #718096, #a0aec0, #718096)', boxShadow: '0 2px 4px rgba(0,0,0,0.5)' }} />
                </div>
            </div>

            {/* REVEAL countdown overlay */}
            {phase === 'REVEAL' && (
                <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 bg-red-600/90 text-white text-xs font-black px-4 py-1.5 rounded-full font-mono animate-pulse shadow-lg">
                    ⚠️ CLOSING IN {shutterCountdown}s
                </div>
            )}
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function LiveBidPage() {
    const params = useParams();
    const router = useRouter();
    const auctionId = params.id as string;

    // Core state
    const [phase, setPhase] = useState<AuctionPhase>('WAITING');
    const [balance, setBalance] = useState(0);
    const [rankPoints, setRankPoints] = useState(0);
    const [currentPrice, setCurrentPrice] = useState(0);
    const [startingPrice, setStartingPrice] = useState(0);
    const [bids, setBids] = useState<BidMessage[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [bidding, setBidding] = useState(false);
    const [auctionData, setAuctionData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState<{ id: string; username: string } | null>(null);
    const [customBidAmount, setCustomBidAmount] = useState('');
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [soldInfo, setSoldInfo] = useState<SoldInfo | null>(null);

    // Animation timers
    const [lockCountdown, setLockCountdown] = useState(10);
    const [shutterCountdown, setShutterCountdown] = useState(5);
    // bidCountdown: null = hasn't started yet (no bids placed), number = counting down
    const [bidCountdown, setBidCountdown] = useState<number | null>(null);

    // Refs
    const serverStartTime = useRef<number | null>(null);
    const tickerRef = useRef<NodeJS.Timeout | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // Auto-scroll chat
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [bids]);

    // ── 1. Initial data fetch ──────────────────────────────────────────────────
    useEffect(() => {
        const init = async () => {
            try {
                let currentUserId: string | null = null;

                const userRes = await fetch('/api/user');
                if (userRes.ok) {
                    const userData = await userRes.json();
                    currentUserId = userData.user.id;
                    setCurrentUser({ id: userData.user.id, username: userData.user.username });
                    setBalance(Number(userData.user.balance));
                    setRankPoints(userData.user.rankPoints || 0);
                }

                const auctionRes = await fetch(`/api/auctions/${auctionId}`);
                if (!auctionRes.ok) throw new Error('Auction not found');
                const auctionJson = await auctionRes.json();
                const auction = auctionJson.auction;
                setAuctionData(auction);

                const sp = Number(auction.startingPrice);
                const cp = Number(auction.currentPrice || auction.startingPrice);
                setStartingPrice(sp);
                setCurrentPrice(cp);

                // If there are already bids, start the countdown
                if (cp > sp) {
                    setBidCountdown(10);
                }

                if (auction.status === 'LIVE' && auction.startedAt) {
                    serverStartTime.current = new Date(auction.startedAt).getTime();
                    const elapsed = (Date.now() - serverStartTime.current) / 1000;
                    if (elapsed > 21) {
                        setPhase('BIDDING');
                    }
                }

                // If already completed, show sold dialog
                if (auction.status === 'COMPLETED') {
                    setSoldInfo({
                        winnerId: auction.winnerId,
                        winnerUsername: auction.winner?.username ?? null,
                        finalPrice: cp,
                        auctionName: auction.name,
                    });
                    setPhase('SOLD');
                }

                const bidsRes = await fetch(`/api/auctions/${auctionId}/bids`);
                if (bidsRes.ok) {
                    const bidsJson = await bidsRes.json();
                    const messages: BidMessage[] = bidsJson.bids.map((b: any) => ({
                        id: b.id,
                        username: b.user?.username ?? b.bidder?.username ?? 'Unknown',
                        amount: Number(b.amount),
                        isMine: currentUserId === (b.userId ?? b.bidderId),
                        timestamp: new Date(b.createdAt ?? b.timestamp).getTime(),
                        isCustom: false,
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

    // ── 2. Pusher subscription ─────────────────────────────────────────────────
    useEffect(() => {
        if (!auctionId) return;
        const pusher = getPusherClient();

        pusher.connection.bind('state_change', (states: any) => {
            setIsConnected(states.current === 'connected');
        });

        const channel = pusher.subscribe(`auction-${auctionId}`);

        channel.bind('status-change', (data: any) => {
            if (data.status === 'LIVE' && data.startedAt) {
                serverStartTime.current = new Date(data.startedAt).getTime();
                setAuctionData((prev: any) => ({ ...prev, status: 'LIVE', startedAt: data.startedAt }));
            }
            if (data.status === 'COMPLETED' || data.status === 'ENDED') {
                setPhase('SOLD');
                serverStartTime.current = null;
            }
        });

        channel.bind('new-bid', (data: any) => {
            setCurrentPrice(data.amount);
            // Start/reset countdown only when a bid is placed
            setBidCountdown(10);

            const newBid: BidMessage = {
                id: data.bidId || `bid-${Date.now()}`,
                username: data.username,
                amount: data.amount,
                isMine: currentUser ? data.userId === currentUser.id : false,
                timestamp: Date.now(),
                isCustom: !!data.isCustom,
            };
            setBids(prev => [...prev, newBid]);
        });

        channel.bind('auction-ended', (data: any) => {
            setPhase('SOLD');
            setSoldInfo({
                winnerId: data.winnerId ?? null,
                winnerUsername: data.winnerUsername ?? null,
                finalPrice: data.finalPrice ?? 0,
                auctionName: data.auctionName ?? 'This Shutter',
            });
            serverStartTime.current = null;
        });

        return () => {
            channel.unbind_all();
            channel.unsubscribe();
        };
    }, [auctionId, currentUser]);

    // ── 3. Animation ticker ────────────────────────────────────────────────────
    useEffect(() => {
        if (!serverStartTime.current) {
            if (phase !== 'BIDDING' && phase !== 'SOLD') setPhase('WAITING');
            return;
        }
        if (tickerRef.current) clearInterval(tickerRef.current);

        tickerRef.current = setInterval(() => {
            const elapsed = (Date.now() - serverStartTime.current!) / 1000;

            if (elapsed < 0) {
                setPhase('WAITING');
            } else if (elapsed < 10) {
                setPhase('PRE_OPEN');
                setLockCountdown(Math.max(0, Math.ceil(10 - elapsed)));
            } else if (elapsed < 15) {
                setPhase('OPENING');
            } else if (elapsed < 20) {
                setPhase('REVEAL');
                setShutterCountdown(Math.max(0, Math.ceil(20 - elapsed)));
            } else if (elapsed < 21) {
                setPhase('CLOSING');
            } else {
                if (phase !== 'BIDDING' && phase !== 'SOLD') {
                    setPhase('BIDDING');
                }
                // Stop ticker once in BIDDING
                if (tickerRef.current) {
                    clearInterval(tickerRef.current);
                    tickerRef.current = null;
                }
            }
        }, 100);

        return () => { if (tickerRef.current) clearInterval(tickerRef.current); };
    }, [serverStartTime.current]);

    // ── 4. Bid countdown (only runs after first bid) ───────────────────────────
    useEffect(() => {
        if (phase !== 'BIDDING') return;
        if (bidCountdown === null) return; // No bids yet — don't count down

        if (bidCountdown > 0) {
            const t = setTimeout(() => setBidCountdown(p => (p !== null ? Math.max(0, p - 1) : null)), 1000);
            return () => clearTimeout(t);
        } else {
            // Countdown hit zero — end auction
            setPhase('SOLD');
            // Trigger server-side end
            fetch(`/api/auctions/${auctionId}/end`, { method: 'POST' }).catch(console.error);
        }
    }, [phase, bidCountdown, auctionId]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const placeBid = async (amount: number) => {
        if (bidding || phase !== 'BIDDING') return;
        if (amount > balance) { alert('Insufficient balance!'); return; }

        setBidding(true);
        try {
            const res = await fetch('/api/bid/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auctionId, amount }),
            });
            if (!res.ok) {
                const err = await res.json();
                // If bid too low, refresh current price from server response
                if (err.minimum) {
                    setCurrentPrice(err.minimum - 1); // Will be corrected by next bid event
                }
                alert(err.error || 'Failed to place bid');
            } else {
                const data = await res.json();
                setBalance(data.newBalance);
                setShowCustomInput(false);
                setCustomBidAmount('');
            }
        } catch {
            alert('Network error');
        } finally {
            setBidding(false);
        }
    };

    const handleCustomBid = () => {
        const amount = parseInt(customBidAmount);
        if (isNaN(amount) || amount <= currentPrice) { alert(`Bid must be more than ₹${currentPrice.toLocaleString()}`); return; }
        placeBid(amount);
    };

    // ── Loading / Not found ────────────────────────────────────────────────────
    if (loading) {
        return (
            <div className="h-screen bg-[#111827] text-white flex items-center justify-center">
                <div className="text-center">
                    <div className="text-4xl mb-4 animate-pulse">🔒</div>
                    <p className="text-gray-400 font-mono uppercase tracking-widest text-sm">Loading auction...</p>
                </div>
            </div>
        );
    }

    if (!auctionData) {
        return (
            <div className="h-screen bg-[#111827] text-white flex items-center justify-center">
                <div className="text-red-400">Auction not found</div>
            </div>
        );
    }

    if (auctionData.status === 'WAITING_ROOM') {
        return <WaitingRoom auction={auctionData} />;
    }

    const tierInfo = getTierIcon(auctionData.rankTier);
    const quickBidAmount = currentPrice + 1000;
    const canBid = phase === 'BIDDING' && isConnected;

    // Info bar label based on phase
    const getInfoLabel = () => {
        if (phase === 'PRE_OPEN') return `Counting for starting bid ₹${startingPrice.toLocaleString()}`;
        if (phase === 'OPENING' || phase === 'REVEAL') return 'Revealing contents...';
        if (phase === 'CLOSING') return 'Bidding begins...';
        if (phase === 'BIDDING') return 'Current Bid';
        if (phase === 'SOLD') return 'Final Price';
        return 'Starting Price';
    };

    return (
        <div className="h-screen bg-[#111827] text-white flex flex-col overflow-hidden font-['Inter'] relative">

            {/* ── SOLD DIALOG OVERLAY ── */}
            {phase === 'SOLD' && soldInfo && (
                <SoldDialog
                    soldInfo={soldInfo}
                    currentUserId={currentUser?.id ?? null}
                    auctionId={auctionId}
                    onClaim={() => { /* already handled inside */ }}
                    onGoHome={() => router.push('/home')}
                />
            )}

            {/* ── HEADER ── */}
            <header className="bg-[#1E3A8A] bg-opacity-95 shadow-lg z-40 py-3 px-4 flex justify-between items-center shrink-0 relative">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 bg-black/30 px-3 py-1 rounded-full border border-white/10">
                        <span className="material-icons-round text-[#FBBF24] text-sm">currency_rupee</span>
                        <span className="text-white text-xs font-bold font-['Russo_One']">{balance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/10">
                        <span className="material-icons-round text-blue-400 text-sm">military_tech</span>
                        <span className="text-white text-xs font-bold font-['Russo_One']">{rankPoints}</span>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2">
                    <Image src="/bid-wars-logo.png" alt="Bid Wars" width={100} height={50} className="object-contain drop-shadow-lg" />
                </div>

                <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-500'} shadow-lg`} />
                    <button className="relative w-9 h-9 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition">
                        <span className="material-icons-round text-white text-lg">notifications</span>
                        <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border border-[#1E3A8A]" />
                    </button>
                    <Link href="/profile">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#FBBF24] to-orange-500 p-0.5 shadow-lg">
                            <div className="w-full h-full rounded-full bg-gray-700 flex items-center justify-center">
                                <span className="material-icons-round text-white text-base">person</span>
                            </div>
                        </div>
                    </Link>
                </div>
            </header>

            {/* ── SHUTTER STAGE ── */}
            <div className="shrink-0 w-full">
                <ShutterStage
                    phase={phase}
                    auctionData={auctionData}
                    lockCountdown={lockCountdown}
                    shutterCountdown={shutterCountdown}
                />
            </div>

            {/* ── INFO BAR ── */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2 bg-gray-900/80 border-b border-gray-800">
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 bg-gradient-to-b ${tierInfo.bg} rounded-lg flex items-center justify-center border ${tierInfo.border} shadow`}>
                        <span className={`material-icons-round ${tierInfo.color} text-base`}>{tierInfo.icon}</span>
                    </div>
                    <span className={`text-xs font-black uppercase tracking-wider ${tierInfo.color}`}>{auctionData.rankTier} Tier</span>
                </div>

                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{getInfoLabel()}</p>
                    <p className="text-lg font-black text-cyan-400 leading-none">₹{currentPrice.toLocaleString()}</p>
                </div>
            </div>

            {/* ── LIVE CHAT ── */}
            <div className="flex-1 overflow-y-auto px-3 py-2 bg-gray-950/60 relative min-h-0">
                <div className="sticky top-0 flex justify-center mb-2 z-10">
                    {phase === 'BIDDING' && (
                        <div className="flex items-center gap-2 bg-gray-900/90 border border-gray-700 rounded-full px-3 py-1 backdrop-blur-sm">
                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-xs font-bold text-gray-300 font-mono">LIVE</span>
                            {bidCountdown !== null ? (
                                <span className={`text-xs font-black font-mono ml-1 ${bidCountdown <= 3 ? 'text-red-400 animate-pulse' : 'text-green-400'}`}>
                                    {bidCountdown}s
                                </span>
                            ) : (
                                <span className="text-xs font-mono ml-1 text-gray-500">Place first bid!</span>
                            )}
                        </div>
                    )}
                    {(phase === 'WAITING' || phase === 'PRE_OPEN') && (
                        <div className="bg-gray-900/80 border border-gray-700 rounded-full px-4 py-1">
                            <span className="text-xs text-gray-500 font-mono">Waiting for auction...</span>
                        </div>
                    )}
                    {(phase === 'OPENING' || phase === 'REVEAL' || phase === 'CLOSING') && (
                        <div className="bg-gray-900/80 border border-yellow-700/50 rounded-full px-4 py-1">
                            <span className="text-xs text-yellow-500 font-mono animate-pulse">🔓 Revealing...</span>
                        </div>
                    )}
                </div>

                {bids.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-600 text-sm">
                        No bids yet — be the first!
                    </div>
                ) : (
                    bids.map(bid => <ChatBubble key={bid.id} bid={bid} />)
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="shrink-0 p-3 bg-gray-900 border-t border-gray-800">
                {showCustomInput ? (
                    <div className="space-y-2">
                        <input
                            type="number"
                            value={customBidAmount}
                            onChange={e => setCustomBidAmount(e.target.value)}
                            placeholder={`Enter amount > ₹${currentPrice.toLocaleString()}`}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-bold text-lg focus:ring-2 focus:ring-cyan-500 outline-none"
                            autoFocus
                            onKeyDown={e => e.key === 'Enter' && handleCustomBid()}
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setShowCustomInput(false); setCustomBidAmount(''); }}
                                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 rounded-xl font-semibold text-sm transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCustomBid}
                                disabled={bidding}
                                className="flex-[2] py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 rounded-xl font-black text-sm transition"
                            >
                                {bidding ? 'Placing...' : 'Confirm Bid'}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {/* Loan */}
                        <button
                            disabled={!canBid}
                            onClick={() => alert('Loan feature coming soon')}
                            className="h-14 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
                        >
                            <span className="text-xl">💰</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Loan</span>
                        </button>

                        {/* Quick Bid — shows actual bid amount */}
                        <button
                            disabled={!canBid || bidding}
                            onClick={() => placeBid(quickBidAmount)}
                            className="h-14 bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 disabled:opacity-30 disabled:grayscale rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-lg shadow-red-900/40 active:scale-95 transition"
                        >
                            <span className="text-lg">⚡</span>
                            <span className="text-[9px] font-black text-white uppercase tracking-wide leading-none">
                                {bidding ? '...' : `₹${quickBidAmount.toLocaleString()}`}
                            </span>
                        </button>

                        {/* Custom Bid */}
                        <button
                            disabled={!canBid}
                            onClick={() => setShowCustomInput(true)}
                            className="h-14 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
                        >
                            <span className="text-xl">✍️</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Custom</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Connection lost banner */}
            {!isConnected && (
                <div className="fixed top-20 left-4 right-4 bg-red-900/80 border border-red-500 rounded-xl p-3 z-40 backdrop-blur-md text-center text-sm text-red-300 font-semibold">
                    🔌 Connection Lost — Reconnecting...
                </div>
            )}

            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </div>
    );
}
