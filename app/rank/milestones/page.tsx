'use client';

import React from 'react';
import useSWR from 'swr';
import Header from '@/components/Header';
import { motion } from 'framer-motion';
import { CheckCircle2, Lock } from 'lucide-react';
import { MILESTONES } from '@/lib/rankData';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function MilestonesPage() {
    const { data, isLoading } = useSWR('/api/rank/milestones', fetcher);
    const completed: string[] = data?.completed ?? [];

    const completedCount = completed.length;
    const totalPoints = MILESTONES.filter(m => completed.includes(m.id)).reduce((s, m) => s + m.points, 0);

    return (
        <div className="min-h-screen bg-[#080d16] text-white font-['Inter'] pb-40">
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;900&display=swap" rel="stylesheet" />
            <Header />

            <main className="px-4 pt-4 max-w-2xl mx-auto">
                <h1 className="text-[18px] font-black text-white font-['Russo_One'] mb-1 flex items-center gap-2">
                    <span className="material-icons-round text-emerald-400">verified</span>
                    Milestones
                </h1>
                <p className="text-[11px] text-white/30 mb-5">Each milestone can only be earned once.</p>

                {/* Summary */}
                <div className="flex gap-3 mb-5">
                    <div className="flex-1 bg-[#1e293b] border border-white/5 rounded-2xl p-3 text-center">
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">Completed</p>
                        <p className="text-[18px] font-black text-white">{completedCount} / {MILESTONES.length}</p>
                    </div>
                    <div className="flex-1 bg-[#1e293b] border border-white/5 rounded-2xl p-3 text-center">
                        <p className="text-[9px] text-white/30 font-black uppercase tracking-widest mb-1">RP Earned</p>
                        <p className="text-[18px] font-black text-emerald-400">{totalPoints} RP</p>
                    </div>
                </div>

                {isLoading && (
                    <div className="flex justify-center py-16">
                        <div className="w-8 h-8 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                <div className="space-y-2">
                    {MILESTONES.map((milestone, idx) => {
                        const isDone = completed.includes(milestone.id);
                        return (
                            <motion.div
                                key={milestone.id}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.03 }}
                                className={`flex items-center gap-3 px-4 py-3.5 border rounded-2xl transition-all ${
                                    isDone
                                        ? 'bg-emerald-500/5 border-emerald-500/20'
                                        : 'bg-[#1e293b] border-white/5 opacity-60'
                                }`}
                            >
                                {/* Status icon */}
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-emerald-500/15' : 'bg-white/5'}`}>
                                    {isDone
                                        ? <CheckCircle2 size={18} className="text-emerald-400" />
                                        : <Lock size={16} className="text-white/20" />
                                    }
                                </div>

                                {/* Description */}
                                <p className={`flex-1 text-[13px] font-semibold ${isDone ? 'text-white' : 'text-white/40'}`}>
                                    {milestone.description}
                                </p>

                                {/* RP badge */}
                                <div className={`px-2.5 py-1 rounded-full text-[10px] font-black flex-shrink-0 ${isDone ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                                    +{milestone.points} RP
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
