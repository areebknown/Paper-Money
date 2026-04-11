'use client';

import React, { useState, useEffect, useRef } from 'react';
import useSWR from 'swr';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

function getTileGradient(position: number) {
    if (position === 1) return 'bg-gradient-to-r from-[#78350f] via-[#92400e] to-[#78350f] border-[#fbbf24]/60';
    if (position === 2) return 'bg-gradient-to-r from-[#374151] via-[#4b5563] to-[#374151] border-[#9ca3af]/60';
    if (position === 3) return 'bg-gradient-to-r from-[#3b1f0a] via-[#4a2708] to-[#3b1f0a] border-[#b45309]/50';
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
            <p className="text-[12px] font-black text-[#FBBF24] font-mono flex-shrink-0 w-16 text-right">{entry.rankPoints.toLocaleString()} RP</p>
        </Link>
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

            <main className="px-4 pt-4 max-w-2xl mx-auto">
                <h1 className="text-[18px] font-black text-white font-['Russo_One'] mb-4 flex items-center gap-2">
                    <span className="material-icons-round text-[#FBBF24]">emoji_events</span>
                    Leaderboard
                </h1>

                {isLoading && (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                    </div>
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
                <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none pb-[80px]">
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
