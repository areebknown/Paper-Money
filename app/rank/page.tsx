'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Trophy, X, ChevronUp } from 'lucide-react';
import { RANKS, getRankFromPoints } from '@/lib/rankData';
import type { RankEntry } from '@/lib/rankData';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Rank card gradient styles ────────────────────────────────────────────────
function getRankCardStyles(name: string) {
    if (name.includes('Rookie'))    return 'bg-gradient-to-br from-[#4a2f1a] via-[#3b2213] to-[#241509] border-[#92400e]/40';
    if (name.includes('Dealer'))    return 'bg-gradient-to-br from-[#374151] via-[#1f2937] to-[#111827] border-[#6b7280]/40';
    if (name.includes('Financier')) return 'bg-gradient-to-br from-[#78350f] via-[#451a03] to-[#1c1000] border-[#d97706]/40';
    if (name.includes('Tycoon'))    return 'bg-gradient-to-br from-[#064e3b] via-[#065f46] to-[#022c22] border-[#10b981]/40 animate-shimmer-tycoon';
    if (name.includes('Crown'))     return 'bg-gradient-to-br from-[#0c4a6e] via-[#083344] to-[#020617] border-[#22d3ee]/40 animate-shimmer-crown';
    if (name.includes('Monarch'))   return 'bg-gradient-to-br from-[#3b0764] via-[#4a044e] to-[#1c0a3a] border-[#a78bfa]/50 animate-shimmer-monarch';
    return 'bg-[#1e293b] border-white/10';
}

// ─── Ring color per tier group ────────────────────────────────────────────────
function getRingColor(name: string) {
    if (name.includes('Rookie'))    return 'border-amber-700 shadow-amber-700/40';
    if (name.includes('Dealer'))    return 'border-slate-400 shadow-slate-400/40';
    if (name.includes('Financier')) return 'border-yellow-500 shadow-yellow-500/40';
    if (name.includes('Tycoon'))    return 'border-emerald-500 shadow-emerald-500/40';
    if (name.includes('Crown'))     return 'border-cyan-400 shadow-cyan-400/50';
    if (name.includes('Monarch'))   return 'border-purple-400 shadow-purple-400/50';
    return 'border-white/20';
}

// ─── Fill color for the progress bar ─────────────────────────────────────────
function getBarFillColor(name: string) {
    if (name.includes('Rookie'))    return 'from-amber-900 to-amber-700';
    if (name.includes('Dealer'))    return 'from-slate-600 to-slate-400';
    if (name.includes('Financier')) return 'from-yellow-800 to-yellow-500';
    if (name.includes('Tycoon'))    return 'from-emerald-900 to-emerald-500';
    if (name.includes('Crown'))     return 'from-cyan-900 to-cyan-400';
    if (name.includes('Monarch'))   return 'from-purple-900 to-purple-400';
    return 'from-amber-900 to-amber-600';
}

// ─── Expanded Rank Card Modal ─────────────────────────────────────────────────
function RankCardModal({ rank, onClose }: { rank: RankEntry; onClose: () => void }) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className={`w-full max-w-lg rounded-t-3xl border p-6 pb-[104px] relative overflow-hidden ${getRankCardStyles(rank.name)}`}
                >
                    {/* Close button */}
                    <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors">
                        <X size={16} className="text-white" />
                    </button>

                    <div className="flex items-start gap-5 mb-5">
                        <img
                            src={`/rank-icons/${rank.iconName}.svg`}
                            alt={rank.name}
                            className="w-20 h-20 object-contain drop-shadow-2xl flex-shrink-0"
                        />
                        <div>
                            <p className="text-[10px] text-white/40 font-black uppercase tracking-[0.3em] mb-1">Rank</p>
                            <h2 className="text-[22px] font-black text-white font-['Russo_One'] leading-tight">{rank.name}</h2>
                            <p className="text-[12px] text-white/50 font-mono mt-1">
                                {rank.maxPoints ? `${rank.minPoints} – ${rank.maxPoints} RP` : `${rank.minPoints}+ RP`}
                            </p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {/* Perks */}
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-2">Perks</p>
                            {rank.perks.map(p => (
                                <p key={p} className="text-[13px] text-white font-semibold">• {p}</p>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {/* Prize */}
                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Prize</p>
                                <p className="text-[12px] text-white font-semibold">{rank.prize}</p>
                            </div>
                            {/* 1 Point Price */}
                            <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                                <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">1 RP Price</p>
                                <p className="text-[12px] text-white font-semibold">₹{rank.pricePerPoint.toLocaleString('en-IN')}</p>
                            </div>
                        </div>

                        {/* Loan slots */}
                        <div className="bg-white/5 rounded-2xl p-3 border border-white/5">
                            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 mb-1">Max Parallel Loans</p>
                            <p className="text-[12px] text-white font-semibold">{rank.loanTokenCap}</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Buy Points Sheet ─────────────────────────────────────────────────────────
function BuyPointsSheet({ rankInfo, onClose, onSuccess }: {
    rankInfo: any;
    onClose: () => void;
    onSuccess: () => void;
}) {
    const [pts, setPts] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const cap = rankInfo?.remainingCap ?? 0;
    const pricePerPoint = rankInfo?.currentRank?.pricePerPoint ?? 1000;
    const total = pts * pricePerPoint;
    const balance = Number(rankInfo?.balance ?? 0);

    const handleBuy = useCallback(async () => {
        setError('');
        setLoading(true);
        try {
            const res = await fetch('/api/user/rank', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ points: pts }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Purchase failed');
            onSuccess();
            onClose();
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [pts, onSuccess, onClose]);

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ y: '100%' }}
                    animate={{ y: 0 }}
                    exit={{ y: '100%' }}
                    transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-lg bg-[#0f172a] border border-white/10 rounded-t-3xl p-6 pb-[104px]"
                >
                    <div className="flex items-center justify-between mb-5">
                        <h3 className="text-[16px] font-black text-white font-['Russo_One']">Buy Rank Points</h3>
                        <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10">
                            <X size={14} className="text-white" />
                        </button>
                    </div>

                    {/* Info row */}
                    <div className="flex gap-3 mb-5">
                        <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Current Rank</p>
                            <p className="text-[13px] font-black text-white">{rankInfo?.currentRank?.name ?? '—'}</p>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Price / RP</p>
                            <p className="text-[13px] font-black text-yellow-400">₹{pricePerPoint.toLocaleString('en-IN')}</p>
                        </div>
                        <div className="flex-1 bg-white/5 rounded-2xl p-3 border border-white/5 text-center">
                            <p className="text-[9px] text-white/40 font-black uppercase tracking-widest mb-1">Cap Left</p>
                            <p className="text-[13px] font-black text-white">{cap} RP</p>
                        </div>
                    </div>

                    {/* Input */}
                    <div className="mb-4">
                        <label className="text-[10px] text-white/40 font-black uppercase tracking-widest mb-2 block">Points to Buy</label>
                        <input
                            type="number"
                            min={1}
                            max={cap}
                            value={pts}
                            onChange={e => setPts(Math.min(cap, Math.max(1, parseInt(e.target.value) || 1)))}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-white text-[15px] font-black font-mono focus:outline-none focus:border-amber-400/50"
                        />
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] text-white/50">Total Cost</span>
                        <span className="text-[15px] font-black text-amber-400">₹{total.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex items-center justify-between mb-5">
                        <span className="text-[12px] text-white/50">Your Balance</span>
                        <span className={`text-[13px] font-bold ${balance >= total ? 'text-emerald-400' : 'text-red-400'}`}>
                            ₹{balance.toLocaleString('en-IN')}
                        </span>
                    </div>

                    {error && <p className="text-red-400 text-[11px] mb-3 text-center">{error}</p>}

                    <button
                        onClick={handleBuy}
                        disabled={loading || cap === 0 || balance < total}
                        className="w-full py-3.5 bg-[#FBBF24] text-gray-900 font-black text-[13px] uppercase tracking-widest rounded-2xl active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Processing…' : `Buy ${pts} RP`}
                    </button>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RankPage() {
    const { data, mutate } = useSWR('/api/user/rank', fetcher, { revalidateOnFocus: false });
    const ladderRef = useRef<HTMLDivElement>(null);
    const [selectedRank, setSelectedRank] = useState<RankEntry | null>(null);
    const [showBuy, setShowBuy] = useState(false);

    const userPoints: number = data?.rankPoints ?? 0;
    const currentRank: RankEntry = data?.currentRank ?? RANKS[0];
    const leaderboardPosition: number = data?.leaderboardPosition ?? 0;

    // Auto-scroll to current rank on load (bottom-to-top ladder, so current is near top)
    useEffect(() => {
        if (!data || !ladderRef.current) return;
        const el = ladderRef.current.querySelector(`[data-rank-id="${currentRank.id}"]`) as HTMLElement | null;
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [data, currentRank.id]);

    // Determine which segment of the bar is filled based on user's progress within the current rank
    function getSegmentFill(rank: RankEntry, idx: number, rankList: RankEntry[]): 'full' | 'partial' | 'empty' {
        const userRankIdx = rankList.findIndex(r => r.id === currentRank.id);
        if (idx < userRankIdx) return 'full';
        if (idx === userRankIdx) return 'partial';
        return 'empty';
    }

    // Keep original order: Rookie at idx 0, Monarch at last idx
    const rankList = [...RANKS];
    const currentRankIdx = rankList.findIndex(r => r.id === currentRank.id);

    function getRankStatus(rank: RankEntry): 'achieved' | 'current' | 'future' {
        const idx = rankList.findIndex(r => r.id === rank.id);
        if (idx < currentRankIdx) return 'achieved';
        if (idx === currentRankIdx) return 'current';
        return 'future';
    }


    return (
        <div className="h-screen flex flex-col bg-[#080d16] text-white overflow-hidden font-['Inter']">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Russo+One&family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
            <Header />

            {/* ── Top stats bar ── */}
            <div className="flex gap-3 px-4 py-3 flex-shrink-0">
                <div className="flex-1 bg-[#1e293b]/80 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-2">
                    <Trophy size={14} className="text-[#FBBF24]" />
                    <span className="text-[13px] font-black text-white font-mono">{userPoints.toLocaleString()} RP</span>
                </div>
                <div className="flex-1 bg-[#1e293b]/80 border border-white/10 rounded-2xl px-4 py-2 flex items-center gap-2 justify-end">
                    <span className="text-[13px] font-black text-white font-mono">#{leaderboardPosition.toLocaleString()}</span>
                    <span className="material-icons-round text-slate-400 text-lg">leaderboard</span>
                </div>
            </div>

            {/* ── Rank Ladder ── */}
            <div
                ref={ladderRef}
                className="flex-1 overflow-y-auto px-4 pb-4"
                style={{ display: 'flex', flexDirection: 'column-reverse' }}
            >
                <div className="flex flex-col-reverse relative z-0">
                    {rankList.map((rank, idx) => {
                        const status = getRankStatus(rank);
                        const isAchieved = status === 'achieved';
                        const isCurrent = status === 'current';
                        const isFuture = status === 'future';
                        const segFill = getSegmentFill(rank, idx, rankList);
                        const ringColor = getRingColor(rank.name);
                        const isLast = idx === rankList.length - 1;

                        return (
                            <div
                                key={rank.id}
                                data-rank-id={rank.id}
                                className="flex items-center relative h-[104px]"
                            >
                                {/* Left: rank name */}
                                <div className="w-[85px] flex justify-end pr-4 flex-shrink-0 relative z-10">
                                    <p className={`text-[12px] font-black leading-tight text-right ${isFuture ? 'text-white/20' : isAchieved ? 'text-white/40' : 'text-white'}`}>
                                        {rank.name}
                                    </p>
                                </div>

                                {/* Center: circle */}
                                <div className="flex flex-col items-center flex-shrink-0 w-[56px] relative z-20">
                                    <button
                                        onClick={() => setSelectedRank(rank)}
                                        className={`
                                            w-[56px] h-[56px] rounded-full border-2 flex items-center justify-center
                                            transition-all active:scale-90 flex-shrink-0 bg-[#0f172a] relative z-20
                                            ${isCurrent
                                                ? `${ringColor} shadow-[0_0_24px_4px] bg-[#1e293b]`
                                                : isAchieved
                                                    ? 'border-white/15 bg-[#1e293b]/60'
                                                    : 'border-white/5'
                                            }
                                        `}
                                    >
                                        <img
                                            src={`/rank-icons/${rank.iconName}.svg`}
                                            alt={rank.name}
                                            className={`w-[36px] h-[36px] object-contain transition-all ${isFuture ? 'opacity-20 grayscale' : isAchieved ? 'opacity-60 grayscale-[30%]' : 'opacity-100'}`}
                                        />
                                    </button>
                                </div>

                                {/* Right: points + perks + tick */}
                                <div className="flex-1 flex flex-col justify-center pl-4 min-w-0 relative z-10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className={`text-[14px] font-black font-mono ${isFuture ? 'text-white/20' : isAchieved ? 'text-white/40' : 'text-amber-400'}`}>
                                            {rank.maxPoints ? `${rank.minPoints}–${rank.maxPoints}` : `${rank.minPoints}+`}
                                        </p>
                                        {isAchieved && (
                                            <CheckCircle2 size={16} className="text-emerald-500/60 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className={`text-[10px] leading-relaxed line-clamp-2 ${isFuture ? 'text-white/20' : 'text-white/50'}`}>
                                        {rank.perks.join(' · ')}
                                    </p>
                                </div>

                                {/* Vertical line TO THE NEXT RANK (visuall ABOVE this one) */}
                                {!isLast && (
                                    <div className="absolute bottom-1/2 left-[85px] w-[56px] h-[104px] flex justify-center z-0 pointer-events-none">
                                        <div className="w-[4px] h-full bg-white/5 overflow-hidden">
                                            <div
                                                className={`w-full transition-all ${
                                                    segFill === 'full' 
                                                        ? `bg-gradient-to-t ${getBarFillColor(rank.name)} h-full` 
                                                        : 'h-0'
                                                }`}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Bottom action bar ── */}
            <div className="flex-shrink-0 px-4 pt-3 pb-[96px] border-t border-white/5 bg-[#080d16]">
                <div className="flex gap-2">
                    <Link href="/rank/leaderboard" className="flex-1 flex justify-center py-3.5 bg-red-600/90 border-[#b91c1c] border-b-[4px] active:border-b-0 active:translate-y-[4px] rounded-xl transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Leaderboard</span>
                    </Link>
                    <Link href="/rank/milestones" className="flex-1 flex justify-center py-3.5 bg-yellow-500/90 border-[#ca8a04] border-b-[4px] active:border-b-0 active:translate-y-[4px] rounded-xl transition-all">
                        <span className="text-[10px] font-black uppercase tracking-widest text-yellow-950 drop-shadow-sm">Milestones</span>
                    </Link>
                    <button
                        onClick={() => setShowBuy(true)}
                        className="flex-1 flex justify-center py-3.5 bg-blue-600/90 border-[#1d4ed8] border-b-[4px] active:border-b-0 active:translate-y-[4px] rounded-xl transition-all"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">Buy Points</span>
                    </button>
                </div>
            </div>

            {/* ── Modals ── */}
            {selectedRank && (
                <RankCardModal rank={selectedRank} onClose={() => setSelectedRank(null)} />
            )}
            {showBuy && (
                <BuyPointsSheet
                    rankInfo={data}
                    onClose={() => setShowBuy(false)}
                    onSuccess={() => mutate()}
                />
            )}
        </div>
    );
}
