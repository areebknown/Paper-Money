'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
    if (tier === 'DIAMOND') return { icon: 'diamond', color: 'text-indigo-300', bg: 'from-indigo-600 to-purple-900', border: 'border-purple-500' };
    return { icon: 'shield', color: 'text-amber-400', bg: 'from-amber-700 to-amber-950', border: 'border-amber-600' };
}

// ─── Image compression utility ──────────────────────────────────────────────────
function compressImageUrl(url: string) {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('res.cloudinary.com') && !url.includes('q_auto:eco')) {
        // Find the "upload/" part and insert our compression modifiers right after it
        // A standard Cloudinary URL might look like .../image/upload/v1234/file.png
        return url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_400/');
    }
    return url;
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

// ─── Too Early Screen ────────────────────────────────────────────────────────
function TooEarlyScreen({
    auctionName,
    scheduledAt,
    onGoHome,
}: {
    auctionName: string;
    scheduledAt: string;
    onGoHome: () => void;
}) {
    const [timeLeft, setTimeLeft] = useState({ h: 0, m: 0, s: 0, total: 0 });

    useEffect(() => {
        const calc = () => {
            const waitingRoomOpens = new Date(scheduledAt).getTime() - 5 * 60 * 1000;
            const diff = Math.max(0, waitingRoomOpens - Date.now());
            const total = Math.floor(diff / 1000);
            setTimeLeft({
                h: Math.floor(total / 3600),
                m: Math.floor((total % 3600) / 60),
                s: total % 60,
                total,
            });
        };
        calc();
        const t = setInterval(calc, 1000);
        return () => clearInterval(t);
    }, [scheduledAt]);

    const pad = (n: number) => String(n).padStart(2, '0');

    return (
        <div className="h-screen bg-[#111827] text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background shimmer */}
            <div className="absolute inset-0" style={{
                background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(30,58,138,0.3) 0%, transparent 70%)',
            }} />

            {/* Lock icon */}
            <div className="text-8xl mb-6 animate-pulse">🔒</div>

            <h1 className="text-2xl font-black text-white text-center mb-1" style={{ fontFamily: 'Russo One, sans-serif' }}>
                Auction Not Open Yet
            </h1>
            <p className="text-gray-400 text-sm text-center mb-8 max-w-xs">
                <span className="text-yellow-400 font-semibold">{auctionName}</span> hasn't opened its waiting room yet.
                You can join when there are 5 minutes left.
            </p>

            {/* Countdown */}
            <div className="bg-gray-900/80 border border-gray-700 rounded-2xl px-8 py-5 mb-8 text-center">
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-3 font-mono">Waiting Room Opens In</p>
                {timeLeft.total > 0 ? (
                    <div className="flex items-center gap-3">
                        {timeLeft.h > 0 && (
                            <>
                                <div className="text-center">
                                    <p className="text-4xl font-black font-mono text-white">{pad(timeLeft.h)}</p>
                                    <p className="text-[9px] text-gray-500 uppercase tracking-widest">hrs</p>
                                </div>
                                <span className="text-2xl text-gray-600 font-black">:</span>
                            </>
                        )}
                        <div className="text-center">
                            <p className="text-4xl font-black font-mono text-white">{pad(timeLeft.m)}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">min</p>
                        </div>
                        <span className="text-2xl text-gray-600 font-black">:</span>
                        <div className="text-center">
                            <p className={`text-4xl font-black font-mono ${timeLeft.total <= 30 ? 'text-yellow-400 animate-pulse' : 'text-white'}`}>{pad(timeLeft.s)}</p>
                            <p className="text-[9px] text-gray-500 uppercase tracking-widest">sec</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-green-400 font-black text-lg animate-pulse">Opening soon...</p>
                )}
            </div>

            <p className="text-gray-600 text-xs text-center mb-6">
                This page will automatically redirect you when the waiting room opens.
            </p>

            <button
                onClick={onGoHome}
                className="px-8 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-semibold rounded-xl text-sm transition active:scale-95"
            >
                ← Back to Home
            </button>

            {/* Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
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
                                    <img src={compressImageUrl(a.artifact.imageUrl)} alt="" className="h-20 w-20 object-contain drop-shadow-2xl"
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
    // Too-early guard
    const [tooEarly, setTooEarly] = useState(false);
    const [scheduledAt, setScheduledAt] = useState<string>('');

    // Animation timers
    const [lockCountdown, setLockCountdown] = useState(10);
    const [shutterCountdown, setShutterCountdown] = useState(5);
    // bidCountdown: null = hasn't started yet (no bids placed), number = counting down
    const [bidCountdown, setBidCountdown] = useState<number | null>(null);

    // Refs
    const serverStartTime = useRef<number | null>(null);
    const tickerRef = useRef<NodeJS.Timeout | null>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    // Keep currentUser in a ref so Pusher handlers always have the latest value
    const currentUserRef = useRef<{ id: string; username: string } | null>(null);
    // Track who placed the last bid (to block re-bidding)
    const [lastBidderId, setLastBidderId] = useState<string | null>(null);
    // Deduplicate bids: track IDs we've already added optimistically
    const seenBidIds = useRef<Set<string>>(new Set());
    // Stable channel ref so we never re-subscribe on StrictMode double-mount
    const channelRef = useRef<any>(null);
    const globalChannelRef = useRef<any>(null);
    // Debug logger — logs to console only (debug panel removed)
    const addLog = (msg: string) => {
        console.log('[BidPage]', msg);
    };

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
                    const user = { id: userData.user.id, username: userData.user.username };
                    setCurrentUser(user);
                    currentUserRef.current = user;
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

                // Block access if auction is still SCHEDULED (waiting room not open yet)
                if (auction.status === 'SCHEDULED') {
                    setScheduledAt(auction.scheduledAt);
                    setTooEarly(true);
                    setLoading(false);
                    return;
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
                    // Sort ascending by timestamp for chat display
                    const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);
                    setBids(sorted);
                    // Set last bidder from highest bid (first in desc-sorted list)
                    if (messages.length > 0) {
                        const highestBid = bidsJson.bids[0]; // already sorted desc by amount
                        const highestBidderId = highestBid.user?.id ?? highestBid.bidderId;
                        setLastBidderId(highestBidderId ?? null);
                    }
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

        // Immediately reflect current connection state
        const initialState = pusher.connection.state;
        setIsConnected(initialState === 'connected');
        addLog(`Connection state on mount: ${initialState}`);

        // Re-fetch latest state from server whenever Pusher reconnects
        // This catches any events missed during a 1006 disconnect window
        const refreshStateFromServer = async () => {
            addLog('🔄 Reconnected — refreshing state from server...');
            try {
                const currentUserId = currentUserRef.current?.id ?? null;

                // Re-fetch auction (status, currentPrice)
                const auctionRes = await fetch(`/api/auctions/${auctionId}`);
                if (auctionRes.ok) {
                    const { auction } = await auctionRes.json();
                    const cp = Number(auction.currentPrice || auction.startingPrice);
                    setCurrentPrice(cp);

                    if (auction.status === 'COMPLETED') {
                        setSoldInfo({
                            winnerId: auction.winnerId,
                            winnerUsername: auction.winner?.username ?? null,
                            finalPrice: cp,
                            auctionName: auction.name,
                        });
                        setPhase('SOLD');
                        return;
                    }
                }

                // Re-fetch bids
                const bidsRes = await fetch(`/api/auctions/${auctionId}/bids`);
                if (bidsRes.ok) {
                    const { bids } = await bidsRes.json();
                    const messages: BidMessage[] = bids.map((b: any) => ({
                        id: b.id,
                        username: b.user?.username ?? b.bidder?.username ?? 'Unknown',
                        amount: Number(b.amount),
                        isMine: currentUserId === (b.userId ?? b.bidderId),
                        timestamp: new Date(b.createdAt ?? b.timestamp).getTime(),
                        isCustom: false,
                    }));
                    const sorted = [...messages].sort((a, b) => a.timestamp - b.timestamp);
                    // Add any bids we don't already have (by id)
                    setBids(prev => {
                        const existingIds = new Set(prev.map(b => b.id));
                        const newOnes = sorted.filter(b => !existingIds.has(b.id));
                        if (newOnes.length > 0) {
                            addLog(`🔄 Added ${newOnes.length} missed bid(s) from server`);
                        }
                        return newOnes.length > 0 ? [...prev, ...newOnes] : prev;
                    });
                    // Update lastBidderId from highest bid
                    if (bids.length > 0) {
                        const highest = bids[0];
                        setLastBidderId(highest.user?.id ?? highest.bidderId ?? null);
                    }
                }
            } catch (e) {
                addLog(`🔄 Refresh error: ${e}`);
            }
        };

        pusher.connection.bind('state_change', (states: any) => {
            setIsConnected(states.current === 'connected');
            addLog(`Connection: ${states.previous} → ${states.current}`);
            // Reconnected after a drop — catch up on missed events
            if (states.current === 'connected' && states.previous !== 'connecting') {
                refreshStateFromServer();
            }
        });
        pusher.connection.bind('error', (err: any) => {
            addLog(`Connection ERROR: ${JSON.stringify(err)}`);
        });

        // ── Helper to bind all handlers onto a channel ──
        // Called on initial subscribe AND after StrictMode cleanup re-mount
        const bindAuctionHandlers = (ch: any) => {
            ch.unbind_all(); // clear any stale handlers first

            ch.bind('pusher:subscription_succeeded', () => {
                addLog(`✅ Subscribed to auction-${auctionId}`);
            });
            ch.bind('pusher:subscription_error', (err: any) => {
                addLog(`❌ Subscription error: ${JSON.stringify(err)}`);
            });

            ch.bind('status-change', (data: any) => {
                addLog(`status-change: ${data.status}`);
                if (data.status === 'LIVE' && data.startedAt) {
                    serverStartTime.current = new Date(data.startedAt).getTime();
                    setAuctionData((prev: any) => ({ ...prev, status: 'LIVE', startedAt: data.startedAt }));
                }
                if (data.status === 'COMPLETED' || data.status === 'ENDED') {
                    setPhase('SOLD');
                    serverStartTime.current = null;
                }
            });

            ch.bind('new-bid', (data: any) => {
                const me = currentUserRef.current;
                const bidId = data.bidId || `pusher-${Date.now()}`;
                addLog(`new-bid from ${data.username} ₹${data.amount} (id:${bidId.slice(-6)})`);

                // Skip if we already added this bid optimistically (for the bidder themselves)
                if (seenBidIds.current.has(bidId)) {
                    addLog(`  → skipped (already seen optimistically)`);
                    // Still sync price/countdown/lastBidder for accuracy
                    setCurrentPrice(data.amount);
                    setBidCountdown(10);
                    setLastBidderId(data.userId ?? null);
                    return;
                }
                seenBidIds.current.add(bidId);

                setCurrentPrice(data.amount);
                setBidCountdown(10);
                setLastBidderId(data.userId ?? null);

                const newBid: BidMessage = {
                    id: bidId,
                    username: data.username ?? 'Unknown',
                    amount: data.amount,
                    isMine: me ? data.userId === me.id : false,
                    timestamp: Date.now(),
                    isCustom: !!data.isCustom,
                };
                setBids(prev => [...prev, newBid]);
            });

            ch.bind('auction-ended', (data: any) => {
                addLog(`auction-ended: winner=${data.winnerUsername} ₹${data.finalPrice}`);
                setSoldInfo({
                    winnerId: data.winnerId ?? null,
                    winnerUsername: data.winnerUsername ?? null,
                    finalPrice: data.finalPrice ?? 0,
                    auctionName: data.auctionName ?? 'This Shutter',
                });
                setPhase('SOLD');
                serverStartTime.current = null;
            });

            // Test event — fired by /api/pusher/test to verify delivery
            ch.bind('test-event', (data: any) => {
                addLog(`🧪 TEST EVENT RECEIVED: ${data.message}`);
            });
        };

        const bindGlobalHandlers = (ch: any) => {
            ch.unbind_all();
            ch.bind('auction-waiting-room', (data: any) => {
                if (data.id === auctionId) window.location.reload();
            });
            ch.bind('auction-started', (data: any) => {
                if (data.id === auctionId) window.location.reload();
            });
        };

        // Subscribe once, store in ref. On re-mount (StrictMode), re-use existing channel.
        if (!channelRef.current) {
            channelRef.current = pusher.subscribe(`auction-${auctionId}`);
        }
        if (!globalChannelRef.current) {
            globalChannelRef.current = pusher.subscribe('global-auctions');
        }

        // Always re-bind handlers (they were cleared by previous cleanup)
        bindAuctionHandlers(channelRef.current);
        bindGlobalHandlers(globalChannelRef.current);

        return () => {
            // Only unbind handlers — keep channels subscribed so Pusher stays connected
            if (channelRef.current) channelRef.current.unbind_all();
            if (globalChannelRef.current) globalChannelRef.current.unbind_all();
            pusher.connection.unbind('state_change');
            pusher.connection.unbind('error');
        };
    }, [auctionId]);

    // ── 2b. Polling fallback ───────────────────────────────────────────────────
    // Polls the DB every 2s as a guaranteed fallback when Pusher fails.
    // Pusher still runs in parallel for instant updates when it works.
    useEffect(() => {
        if (!auctionId || phase === 'SOLD') return;

        let lastPollTime = Date.now() - 5000; // start 5s back to catch recent bids

        const poll = async () => {
            try {
                const res = await fetch(`/api/auctions/${auctionId}/poll?since=${lastPollTime}`);
                if (!res.ok) return;
                const data = await res.json();

                // Update server time reference for next poll
                lastPollTime = data.serverTime ?? Date.now();

                // Handle new bids — filter BEFORE entering setBids to avoid stale-state race
                if (data.newBids && data.newBids.length > 0) {
                    const me = currentUserRef.current;

                    // Use seenBidIds ref (always current) to pre-filter BEFORE touching state
                    const genuinelyNew = data.newBids.filter((b: any) => !seenBidIds.current.has(b.id));

                    if (genuinelyNew.length > 0) {
                        // Mark all as seen immediately so parallel polls/pusher can't double-add
                        genuinelyNew.forEach((b: any) => seenBidIds.current.add(b.id));
                        addLog(`📡 Poll: +${genuinelyNew.length} new bid(s)`);

                        setBids(prev => {
                            // Secondary guard inside updater against React batching races
                            const existingIds = new Set(prev.map((b: BidMessage) => b.id));
                            const fresh = genuinelyNew.filter((b: any) => !existingIds.has(b.id));
                            if (fresh.length === 0) return prev;
                            const newMessages: BidMessage[] = fresh.map((b: any) => ({
                                id: b.id,
                                username: b.username,
                                amount: b.amount,
                                isMine: me ? b.userId === me.id : false,
                                timestamp: new Date(b.createdAt).getTime(),
                                isCustom: false,
                            }));
                            return [...prev, ...newMessages];
                        });
                    }
                }

                // Sync current price
                if (data.currentPrice && data.currentPrice > 0) {
                    setCurrentPrice(data.currentPrice);
                }

                // ── Sync leading state & countdown timer from server ──
                // This is the KEY fix: polling must update lastBidderId and
                // bidCountdown so the "Leading" button and timer stay in sync.
                if (data.lastBidderId) {
                    setLastBidderId(data.lastBidderId);
                }
                if (data.lastBidAt && data.serverTime) {
                    // Compute remaining countdown from server timestamps
                    // This ensures all clients show the same countdown
                    const elapsedSinceBid = (data.serverTime - data.lastBidAt) / 1000;
                    const remaining = Math.max(0, Math.ceil(10 - elapsedSinceBid));
                    setBidCountdown(remaining);
                }

                if (data.status === 'LIVE' && data.startedAt) {
                    if (phase === 'WAITING') {
                        addLog('📡 Poll: auction LIVE');
                        serverStartTime.current = new Date(data.startedAt).getTime();
                        setAuctionData((prev: any) => ({ ...prev, status: 'LIVE', startedAt: data.startedAt }));
                    }
                }

                // Handle auction ended
                if (data.status === 'COMPLETED') {
                    addLog(`📡 Poll: auction COMPLETED`);
                    setSoldInfo({
                        winnerId: data.winnerId ?? null,
                        winnerUsername: data.winnerUsername ?? null,
                        finalPrice: data.finalPrice ?? data.currentPrice ?? 0,
                        auctionName: data.auctionName ?? 'This Auction',
                    });
                    setPhase('SOLD');
                }
            } catch (e) {
                addLog(`⚠️ Poll error: ${e}`);
            }
        };

        // Poll immediately, then every 1 second for faster updates
        poll();
        const interval = setInterval(poll, 5000);
        return () => clearInterval(interval);
    }, [auctionId, phase]);

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

    // ── 4. Bid countdown (only runs after first bid) ─────────────────────────────────
    useEffect(() => {
        if (phase !== 'BIDDING') return;
        if (bidCountdown === null) return; // No bids yet — don't count down

        if (bidCountdown > 0) {
            const t = setTimeout(() => setBidCountdown(p => (p !== null ? Math.max(0, p - 1) : null)), 1000);
            return () => clearTimeout(t);
        } else {
            // Countdown hit zero — call end API and use response for soldInfo
            // Don't set phase=SOLD yet; wait for the API to return winner data
            // so the dialog has the right info immediately
            const endAuction = async () => {
                try {
                    const res = await fetch(`/api/auctions/${auctionId}/end`, { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        // Set soldInfo from API response so dialog shows correctly
                        setSoldInfo({
                            winnerId: data.winnerId ?? null,
                            winnerUsername: data.winnerUsername ?? null,
                            finalPrice: data.finalPrice ?? currentPrice,
                            auctionName: data.auctionName ?? auctionData?.name ?? 'This Auction',
                        });
                    }
                } catch (e) {
                    console.error('[BidPage] End auction error:', e);
                } finally {
                    // Always show SOLD phase regardless of API success
                    setPhase('SOLD');
                }
            };
            endAuction();
        }
    }, [phase, bidCountdown, auctionId, currentPrice, auctionData]);

    // ── Handlers ───────────────────────────────────────────────────────────────
    const placeBid = async (amount: number) => {
        if (bidding || phase !== 'BIDDING') return;
        if (amount > balance) { alert('Insufficient balance!'); return; }
        const me = currentUserRef.current;
        if (!me) { alert('Not logged in'); return; }

        setBidding(true);
        try {
            const res = await fetch('/api/bid/place', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ auctionId, amount }),
            });

            if (!res.ok) {
                const err = await res.json();
                if (err.minimum) {
                    // Server told us the real minimum — update our price state
                    setCurrentPrice(Number(err.minimum) - 1);
                }
                alert(err.error || 'Failed to place bid');
                return;
            }

            const data = await res.json();

            // ── OPTIMISTIC UPDATE ──
            // Don't wait for Pusher — update UI immediately from API response
            const bidId = data.bidId;
            const newPrice = data.newPrice ?? amount;

            // Mark this bid as seen so Pusher doesn't double-add it
            seenBidIds.current.add(bidId);

            // Update price, balance, countdown, leading state
            setCurrentPrice(newPrice);
            setBalance(data.newBalance);
            setBidCountdown(10);
            setLastBidderId(me.id);

            // Add chat bubble immediately — but only if poll hasn't already added it
            setBids(prev => {
                if (prev.some(b => b.id === bidId)) return prev; // poll beat us, skip
                const optimisticBid: BidMessage = {
                    id: bidId,
                    username: me.username,
                    amount: newPrice,
                    isMine: true,
                    timestamp: Date.now(),
                    isCustom: amount !== (currentPrice + 1000),
                };
                return [...prev, optimisticBid];
            });

            setShowCustomInput(false);
            setCustomBidAmount('');
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

    if (!auctionData && !tooEarly) {
        return (
            <div className="h-screen bg-[#111827] text-white flex items-center justify-center">
                <div className="text-red-400">Auction not found</div>
            </div>
        );
    }

    // Too early — show guard screen
    if (tooEarly) {
        return (
            <TooEarlyScreen
                auctionName={auctionData?.name ?? 'This Auction'}
                scheduledAt={scheduledAt}
                onGoHome={() => router.push('/home')}
            />
        );
    }

    if (auctionData.status === 'WAITING_ROOM') {
        return <WaitingRoom auction={auctionData} />;
    }

    const tierInfo = getTierIcon(auctionData.rankTier);
    const quickBidAmount = currentPrice + 1000;
    const isLeading = !!(currentUser && lastBidderId && lastBidderId === currentUser.id);
    const canBid = phase === 'BIDDING' && isConnected && !isLeading;

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
            <header className="bg-[#1E3A8A] bg-opacity-95 shadow-lg z-40 pb-4 pt-5 rounded-b-3xl flex justify-between items-center px-4 relative">
                <div className="flex flex-col gap-1 w-1/3">
                    <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 w-fit whitespace-nowrap">
                        <span className="material-icons-round text-[#FBBF24] drop-shadow-md leading-none" style={{ fontSize: '14px' }}>currency_rupee</span>
                        <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide max-w-[70px] truncate">{balance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded-full border border-white/10 w-fit">
                        <span className="material-icons-round text-blue-400 drop-shadow-md leading-none" style={{ fontSize: '14px' }}>military_tech</span>
                        <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide truncate">{rankPoints}</span>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2">
                    <img src="https://res.cloudinary.com/dzsr4olmn/image/upload/q_auto:eco,f_auto,w_400/ui/bid-wars-logo" alt="Bid Wars" className="object-contain drop-shadow-lg h-14 w-auto" />
                </div>

                <div className="flex items-center justify-end gap-2 w-1/3">
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
                    <span className={`text-xs font-black uppercase tracking-wider ${tierInfo.color}`}>{auctionData.rankTier} Rank</span>
                </div>

                <div className="text-right">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider">{getInfoLabel()}</p>
                    <p className="text-xl font-black text-cyan-400 font-['Russo_One'] tracking-wide">₹{currentPrice.toLocaleString()}</p>
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
                {/* Leading banner */}
                {isLeading && phase === 'BIDDING' && (
                    <div className="sticky bottom-0 flex justify-center py-1">
                        <div className="flex items-center gap-2 bg-green-900/80 border border-green-600/50 rounded-full px-4 py-1.5 backdrop-blur-sm">
                            <span className="text-green-400 text-xs">🏆</span>
                            <span className="text-green-300 text-xs font-bold">You're leading! Wait for someone to outbid you.</span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* ── ACTION BUTTONS ── */}
            <div className="shrink-0 p-4 bg-gray-900 border-t border-gray-800 safe-area-bottom">

                {/* Custom Bid Panel (replaces standard input) */}
                {showCustomInput ? (
                    <div className="animate-in slide-in-from-bottom-5 fade-in duration-200">
                        {/* Header: Label + Close */}
                        <div className="flex justify-between items-center mb-3">
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Custom Bid Amount</span>
                            <button
                                onClick={() => { setShowCustomInput(false); setCustomBidAmount(''); }}
                                className="bg-gray-800 p-1 rounded-full hover:bg-gray-700 text-gray-400"
                            >
                                <span className="material-icons-round text-sm">close</span>
                            </button>
                        </div>

                        {/* Main Input + Place Button Row */}
                        <div className="flex gap-3 mb-3 h-14">
                            <div className="relative flex-1 bg-gray-950 rounded-xl border border-gray-700 flex items-center px-4 focus-within:border-cyan-500 focus-within:ring-1 focus-within:ring-cyan-500 transition-all">
                                <span className="text-gray-500 text-lg mr-1">₹</span>
                                <input
                                    type="number"
                                    value={customBidAmount}
                                    onChange={(e) => setCustomBidAmount(e.target.value)}
                                    placeholder={currentPrice.toString()}
                                    className="bg-transparent w-full text-2xl font-bold text-white outline-none placeholder:text-gray-700 font-['Russo_One']"
                                />
                                {/* Inline Undo Button */}
                                {customBidAmount !== '' && customBidAmount !== currentPrice.toString() && (
                                    <button
                                        onClick={() => setCustomBidAmount(currentPrice.toString())}
                                        className="absolute right-3 p-1 rounded-full bg-gray-800 text-gray-400 hover:text-white"
                                    >
                                        <span className="material-icons-round text-sm">undo</span>
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleCustomBid}
                                disabled={!customBidAmount || parseInt(customBidAmount) <= currentPrice || !isConnected}
                                className={`px-6 rounded-xl font-bold uppercase tracking-wide flex items-center gap-2 transition-all ${!customBidAmount || parseInt(customBidAmount) <= currentPrice
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20 active:scale-95'
                                    }`}
                            >
                                <span className="material-icons-round">gavel</span>
                                Place
                            </button>
                        </div>

                        {/* Quick Add Buttons (Bento Styling) */}
                        <div className="grid grid-cols-3 gap-2">
                            {[1000, 5000, 10000].map((inc) => (
                                <button
                                    key={inc}
                                    onClick={() => {
                                        const base = customBidAmount ? parseInt(customBidAmount) : currentPrice;
                                        setCustomBidAmount((base + inc).toString());
                                    }}
                                    className="bg-gray-800 hover:bg-gray-700 border border-gray-700 hover:border-gray-500 rounded-lg py-3 flex flex-col items-center justify-center transition-all active:scale-95"
                                >
                                    <span className="text-[10px] text-gray-400 uppercase font-bold">Add</span>
                                    <span className="text-white font-bold font-['Russo_One']">+₹{(inc / 1000)}k</span>
                                </button>
                            ))}
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

                        {/* Quick Bid — shows actual bid amount, or leading state */}
                        <button
                            disabled={!canBid || bidding || isLeading}
                            onClick={() => placeBid(quickBidAmount)}
                            className={`h-14 rounded-xl flex flex-col items-center justify-center gap-0.5 shadow-lg active:scale-95 transition ${isLeading
                                ? 'bg-gradient-to-b from-green-700 to-green-900 opacity-80 cursor-not-allowed'
                                : 'bg-gradient-to-b from-red-500 to-red-700 hover:from-red-400 hover:to-red-600 disabled:opacity-30 disabled:grayscale shadow-red-900/40'
                                }`}
                        >
                            <span className="text-lg">{isLeading ? '🏆' : '⚡'}</span>
                            <span className="text-[9px] font-black text-white uppercase tracking-wide leading-none">
                                {isLeading ? 'Leading' : bidding ? '...' : `₹${quickBidAmount.toLocaleString()}`}
                            </span>
                        </button>

                        {/* Custom Bid */}
                        <button
                            disabled={!canBid || isLeading}
                            onClick={() => {
                                setCustomBidAmount(currentPrice.toString()); // Pre-fill with current price
                                setShowCustomInput(true);
                            }}
                            className="h-14 bg-gray-800 hover:bg-gray-700 disabled:opacity-30 rounded-xl flex flex-col items-center justify-center gap-0.5 transition active:scale-95"
                        >
                            <span className="text-xl">✍️</span>
                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Custom</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Connection lost banner */}
            {
                !isConnected && (
                    <div className="fixed top-20 left-4 right-4 bg-red-900/80 border border-red-500 rounded-xl p-3 z-40 backdrop-blur-md text-center text-sm text-red-300 font-semibold">
                        🔌 Connection Lost — Reconnecting...
                    </div>
                )
            }




            {/* Google Fonts */}
            <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </div >
    );
}
