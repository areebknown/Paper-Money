'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function getTileGradient(position: number) {
    if (position === 1) return 'bg-gradient-to-r from-yellow-600 to-yellow-400 border-[#facc15]/60';
    if (position === 2) return 'bg-gradient-to-r from-gray-700 to-gray-400 border-[#9ca3af]/60';
    if (position === 3) return 'bg-gradient-to-r from-amber-800 to-amber-600 border-[#b45309]/50';
    return 'bg-[#1e293b] border-white/5';
}

function getPositionBadge(position: number) {
    if (position === 1) return 'bg-[#fbbf24] text-black';
    if (position === 2) return 'bg-[#9ca3af] text-black';
    if (position === 3) return 'bg-[#b45309] text-white';
    return 'bg-white/10 text-white/60';
}

function UserTile({ entry, isMe = false }: { entry: any; isMe?: boolean }) {
    return (
        <Link href={`/profile/${entry.id}`} className={`flex items-center gap-3 px-4 py-3 border rounded-2xl transition-all active:scale-[0.98] ${getTileGradient(entry.position)} ${isMe ? 'ring-1 ring-[#FBBF24]/40' : ''}`}>
            {/* Position */}
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[11px] font-black flex-shrink-0 ${getPositionBadge(entry.position)}`}>
                {entry.position}
            </div>

            {/* PFP */}
            <div className="w-9 h-9 rounded-full bg-white/10 overflow-hidden border border-white/10 flex-shrink-0">
                {entry.profileImage ? (
                    <img src={entry.profileImage} alt={entry.username} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-round text-white/40 text-xl">person</span>
                    </div>
                )}
            </div>

            {/* Username */}
            <p className="flex-1 text-[13px] font-bold text-white truncate">@{entry.username}</p>

            {/* Rank icon */}
            <img
                src={`/rank-icons/${entry.rank?.iconName}.svg`}
                alt={entry.rank?.name}
                className="w-7 h-7 object-contain flex-shrink-0"
            />

            {/* RP */}
            <p className="text-[12px] font-black text-white font-mono flex-shrink-0 w-16 text-right">{entry.rankPoints.toLocaleString()} RP</p>
        </Link>
    );
}

function WinnerPodium({ entries }: { entries: any[] }) {
    if (!entries || entries.length < 1) return null;

    const first = entries[0];
    const second = entries.length > 1 ? entries[1] : null;
    const third = entries.length > 2 ? entries[2] : null;

    const getRingColorStyle = (pos: number) => {
        if (pos === 1) return '#facc15';
        if (pos === 2) return '#9ca3af';
        if (pos === 3) return '#b45309';
        return '#ffffff';
    };

    const getPfp = (entry: any) => {
        if (!entry) return null;
        return (
            <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: entry.position * 0.4 }}
                className="w-14 h-14 rounded-full border-[3px] bg-[#0f172a] shadow-lg flex-shrink-0 flex items-center justify-center relative z-10 overflow-hidden"
                style={{ borderColor: getRingColorStyle(entry.position) }}
            >
                {entry.profileImage ? (
                    <img src={entry.profileImage} className="w-full h-full object-cover" alt={entry.username} />
                ) : (
                    <span className="material-icons-round text-white/40 text-[28px]">person</span>
                )}
            </motion.div>
        );
    }

    return (
        <div className="flex items-end justify-center gap-3 mt-8 mb-10 h-64 px-2 max-w-lg mx-auto">
            {/* 2nd place */}
            <div className={`flex flex-col items-center w-1/3 max-w-[90px] ${!second ? 'opacity-0' : ''}`}>
                {getPfp(second)}
                <div className="w-full bg-gradient-to-t from-gray-700 to-gray-400 h-32 rounded-t-xl mt-3 flex justify-center text-gray-900 font-black text-2xl pt-2 shadow-[0_-5px_15px_rgba(156,163,175,0.2)]">
                    2
                </div>
                {second && (
                    <img src={`/rank-icons/${second.rank?.iconName}.svg`} className="w-10 h-10 mt-3" alt="rank" />
                )}
            </div>

            {/* 1st place */}
            <div className={`flex flex-col items-center w-1/3 max-w-[100px] ${!first ? 'opacity-0' : ''}`}>
                {getPfp(first)}
                <div className="w-full bg-gradient-to-t from-yellow-600 to-yellow-300 h-40 rounded-t-xl mt-3 flex justify-center text-yellow-900 font-black text-3xl pt-2 shadow-[0_-5px_20px_rgba(250,204,21,0.3)]">
                    1
                </div>
                {first && (
                    <img src={`/rank-icons/${first.rank?.iconName}.svg`} className="w-12 h-12 mt-3" alt="rank" />
                )}
            </div>

            {/* 3rd place */}
            <div className={`flex flex-col items-center w-1/3 max-w-[90px] ${!third ? 'opacity-0' : ''}`}>
                {getPfp(third)}
                <div className="w-full bg-gradient-to-t from-amber-800 to-amber-600 h-24 rounded-t-xl mt-3 flex justify-center text-amber-950 font-black text-2xl pt-2 shadow-[0_-5px_15px_rgba(180,83,9,0.2)]">
                    3
                </div>
                {third && (
                    <img src={`/rank-icons/${third.rank?.iconName}.svg`} className="w-10 h-10 mt-3" alt="rank" />
                )}
            </div>
        </div>
    );
}

export default function LeaderboardPage() {
    const [page, setPage] = useState(1);
    const { data, isLoading } = useSWR(`/api/rank/leaderboard?page=${page}`, fetcher);

    const entries = data?.entries ?? [];
    const myEntry = data?.myEntry;
    const totalPages = data?.totalPages ?? 1;

    return (
        <div className="min-h-screen bg-[#080d16] text-white font-['Inter'] pb-48">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
            <Header />

            <main className="px-4 pt-4 max-w-2xl mx-auto flex-1 flex flex-col">
                <div className="flex items-center justify-between bg-[#1e293b] border border-white/10 p-4 rounded-2xl shadow-xl shadow-black/40 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/rank" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all outline-none border border-white/5">
                            <ChevronLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white flex items-center gap-2">
                                Leaderboard
                            </h1>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && page === 1 && entries.length > 0 && (
                    <WinnerPodium entries={entries.slice(0, 3)} />
                )}

                <div className="space-y-2">
                    {entries.map((entry: any) => (
                        <motion.div
                            key={entry.id}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(entry.position * 0.02, 0.4) }}
                        >
                            <UserTile entry={entry} isMe={entry.id === myEntry?.id} />
                        </motion.div>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                        <button
                            disabled={page <= 1}
                            onClick={() => setPage(p => p - 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 disabled:opacity-30"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-[12px] text-white/50 font-mono">{page} / {totalPages}</span>
                        <button
                            disabled={page >= totalPages}
                            onClick={() => setPage(p => p + 1)}
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 disabled:opacity-30"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </main>

            {/* ── Sticky own-tile at bottom with fade vignette ── */}
            {myEntry && (
                <div className="fixed bottom-[70px] left-0 right-0 z-40 pointer-events-none">
                    {/* Upward fade vignette */}
                    <div className="h-12 bg-gradient-to-t from-[#080d16] to-transparent" />
                    {/* Tile */}
                    <div className="bg-[#080d16] px-4 pb-4 pt-2 pointer-events-auto max-w-2xl mx-auto">
                        <p className="text-[8px] font-black uppercase tracking-widest text-white/30 mb-1.5 text-center">Your Position</p>
                        <UserTile entry={myEntry} isMe={true} />
                    </div>
                </div>
            )}
        </div>
    );
}
