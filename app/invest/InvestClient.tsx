i w'use client';

import { useState, useEffect } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Briefcase, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { getPusherClient } from '@/lib/pusher-client';
import { LOGO_URL } from '@/lib/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface InvestClientProps {
    initialAssets: any[];
}

export default function InvestClient({ initialAssets }: InvestClientProps) {
    const { mutate } = useSWRConfig();
    const [focusedStat, setFocusedStat] = useState<'balance' | 'invested' | null>(null);

    const { data: userData } = useSWR('/api/user', fetcher);
    const { data: marketData } = useSWR('/api/market/sync', fetcher, {
        fallbackData: { assets: initialAssets }
    });

    useEffect(() => {
        const pusher = getPusherClient();
        const channel = pusher.subscribe('market-updates');

        channel.bind('prices-updated', () => {
            console.log('[Pusher] Market prices updated! Re-fetching...');
            mutate('/api/market/sync');
            mutate('/api/user');
        });

        return () => {
            pusher.unsubscribe('market-updates');
            channel.unbind_all();
        };
    }, [mutate]);

    const assets = marketData?.assets || initialAssets;
    const user = userData?.user;

    return (
        <main className="min-h-screen bg-[#111827] text-[#F9FAFB] relative pb-24 lg:pb-0 overflow-x-hidden selection:bg-[#FBBF24] selection:text-white">

            <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-6 space-y-6 pt-0 px-0 md:px-6">
                <Header />

                <div className="px-4 space-y-6">
                    {/* Dashboard Stats */}
                    <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-40">
                        <motion.div
                            layoutId="balance-card"
                            onClick={() => setFocusedStat('balance')}
                            className="bg-[#1e293b] border border-white/10 hover:border-[#FBBF24]/50 shadow-lg p-4 md:p-5 rounded-2xl md:rounded-3xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
                        >
                            <motion.div layoutId="balance-title" className="flex items-center gap-2 text-gray-400 mb-2 relative z-10">
                                <Wallet size={16} className="text-[#FBBF24]" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Available Cash</span>
                            </motion.div>
                            <motion.p layoutId="balance-value" className="text-xl md:text-2xl font-black text-white relative z-10 font-mono tracking-tight truncate">
                                ₹{Number(user?.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '...'}
                            </motion.p>
                        </motion.div>

                        <motion.div
                            layoutId="invested-card"
                            onClick={() => setFocusedStat('invested')}
                            className="bg-[#1e293b] border border-white/10 hover:border-[#FBBF24]/50 shadow-lg p-4 md:p-5 rounded-2xl md:rounded-3xl relative overflow-hidden group cursor-pointer active:scale-95 transition-all"
                        >
                            <motion.div layoutId="invested-title" className="flex items-center gap-2 text-gray-400 mb-2 relative z-10">
                                <Briefcase size={16} className="text-red-500" />
                                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Invested Value</span>
                            </motion.div>
                            <motion.p layoutId="invested-value" className="text-xl md:text-2xl font-black text-white relative z-10 font-mono tracking-tight truncate">
                                ₹{Number(user?.totalInvested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* Portfolio Summary Section */}
                    {user?.portfolios?.filter((p: any) => p.units > 0).length > 0 && (
                        <section className="space-y-4">
                            <div className="flex items-center gap-2 px-1">
                                <div className="w-1.5 h-6 bg-[#FBBF24] rounded-full"></div>
                                <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Your Portfolio</h2>
                            </div>

                            <div className="flex overflow-x-auto snap-x gap-3 pb-4 hidden-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
                                {user.portfolios.filter((p: any) => p.units > 0).map((p: any) => {
                                    const currentValue = p.units * Number(p.asset.currentPrice);
                                    const profit = currentValue - Number(p.totalCost);
                                    const isProfit = profit >= 0;

                                    return (
                                        <Link
                                            href={`/invest/${p.assetId}`}
                                            key={p.id}
                                            className="min-w-[75vw] sm:min-w-[280px] bg-[#1e293b] p-4 rounded-3xl border border-white/10 hover:border-red-500/50 shadow-lg transition-all flex flex-col gap-3 group relative overflow-hidden snap-start"
                                        >
                                            {/* Glow effect on hover */}
                                            <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="flex justify-between items-start relative z-10">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p.asset.name}</p>
                                                <div className={cn(
                                                    "text-[9px] font-black px-2 py-1 rounded-md border",
                                                    isProfit
                                                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                        : "bg-red-500/10 text-red-500 border-red-500/20"
                                                )}>
                                                    {isProfit ? 'PROFIT' : 'LOSS'}
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <div className="flex items-baseline gap-1">
                                                    <p className="text-xl font-black text-white font-mono">{p.units.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                                                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">{p.asset.unit.split(' ')[1]}s</span>
                                                </div>
                                                <p className="text-sm font-medium text-gray-400 mt-1">Value: <span className="text-white font-mono">₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></p>
                                            </div>

                                            <div className="mt-2 pt-3 border-t border-white/5 flex justify-between items-center relative z-10">
                                                <span className="text-[10px] font-bold text-gray-500 tracking-widest uppercase">P/L</span>
                                                <span className={cn(
                                                    "text-xs font-black font-mono",
                                                    isProfit ? "text-emerald-400" : "text-red-500"
                                                )}>
                                                    {isProfit ? '+' : '-'}₹{Math.abs(profit).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                </span>
                                            </div>
                                        </Link>
                                    )
                                })}
                            </div>
                        </section>
                    )}

                    {/* Asset Market Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-6 bg-[#FBBF24] rounded-full"></div>
                            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Market Assets</h2>
                        </div>

                        <div className="grid grid-cols-2 gap-3 md:gap-4 md:grid-cols-3">
                            {assets.map((asset: any) => {
                                const isPositive = asset.change24h >= 0;
                                return (
                                    <Link
                                        key={asset.id}
                                        href={`/invest/${asset.id}`}
                                        className="bg-[#1e293b] p-4 rounded-2xl md:rounded-3xl border border-white/10 hover:border-red-500/50 shadow-lg transition-all flex flex-col gap-3 group relative overflow-hidden"
                                    >
                                        {/* Hover Gradient */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex justify-between items-start relative z-10">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-colors shadow-inner">
                                                <Activity size={16} />
                                            </div>
                                            <div className={cn(
                                                "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-md border shadow-sm",
                                                isPositive
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                                    : "bg-red-500/10 text-red-500 border-red-500/20"
                                            )}>
                                                {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                                {Math.abs(asset.change24h).toFixed(2)}%
                                            </div>
                                        </div>

                                        <div className="relative z-10">
                                            <h3 className="text-lg font-bold text-white tracking-tight">{asset.name}</h3>
                                            <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">{asset.unit}</p>
                                        </div>

                                        <div className="mt-2 pt-3 border-t border-white/5 flex flex-col items-start gap-1 relative z-10 pb-1">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Price</span>
                                            <p className="text-lg font-black text-white font-mono break-all leading-tight">₹{Number(asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    <div className="pt-6 pb-20 text-center">
                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex flex-col items-center justify-center gap-1">
                            <div className="flex items-center gap-2">
                                <Activity size={12} className="text-red-500/50" />
                                <span>Market updates daily at 12:00 AM IST.</span>
                            </div>
                            <span>Investing involves risk.</span>
                        </div>
                    </div>
                </div>

                {/* Full Value Modal */}
                <AnimatePresence>
                    {focusedStat && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
                            onClick={() => setFocusedStat(null)}
                        >
                            <motion.div
                                layoutId={focusedStat === 'balance' ? 'balance-card' : 'invested-card'}
                                className="bg-[#1e293b] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative overflow-hidden cursor-default"
                                onClick={e => e.stopPropagation()}
                            >
                                <motion.div layoutId={focusedStat === 'balance' ? 'balance-title' : 'invested-title'} className="flex items-center gap-2 text-gray-400 mb-4 relative z-10">
                                    {focusedStat === 'balance' ? <Wallet size={20} className="text-red-500" /> : <Briefcase size={20} className="text-orange-500" />}
                                    <span className="text-xs md:text-sm font-bold uppercase tracking-widest">
                                        {focusedStat === 'balance' ? 'Available Cash' : 'Invested Value'}
                                    </span>
                                </motion.div>
                                <motion.p layoutId={focusedStat === 'balance' ? 'balance-value' : 'invested-value'} className="text-2xl md:text-3xl font-black text-white relative z-10 font-mono break-all leading-tight">
                                    ₹{Number(focusedStat === 'balance' ? user?.balance : user?.totalInvested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                </motion.p>

                                {/* Decorative background glow using radial gradient for performance */}
                                <div
                                    className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full pointer-events-none"
                                    style={{
                                        background: `radial-gradient(circle, ${focusedStat === 'balance' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(249, 115, 22, 0.15)'} 0%, transparent 70%)`
                                    }}
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>


        </main>
    );
}
