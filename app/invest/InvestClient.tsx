'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Briefcase, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface InvestClientProps {
    initialAssets: any[];
}

export default function InvestClient({ initialAssets }: InvestClientProps) {
    const { data: userData } = useSWR('/api/user', fetcher, { refreshInterval: 5000 });
    const { data: marketData } = useSWR('/api/market/sync', fetcher, {
        refreshInterval: 30000,
        fallbackData: { assets: initialAssets }
    });

    const assets = marketData?.assets || initialAssets;
    const user = userData?.user;

    return (
        <main className="min-h-screen bg-slate-950 text-white relative pb-24 lg:pb-0 overflow-x-hidden selection:bg-red-500/30 selection:text-red-200">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] mix-blend-screen transform translate-x-1/3 -translate-y-1/3 animate-pulse-slow"></div>
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-orange-900/10 rounded-full blur-[100px] mix-blend-screen transform -translate-x-1/3 translate-y-1/3"></div>

                {/* Subtle Grid Overlay */}
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="relative z-10 max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-8">
                {/* Header Navbar */}
                <header className="flex items-center justify-between sticky top-4 z-50 bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-xl shadow-black/20">
                    <div className="flex items-center gap-4 text-white">
                        <Link href="/home" className="p-2 hover:bg-white/10 rounded-xl transition-colors active:scale-95 group">
                            <ArrowLeft size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                        </Link>
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent flex justify-center items-center gap-2">
                                <Activity className="text-red-500 w-5 h-5" />
                                Global Market
                            </h1>
                            <p className="text-[10px] md:text-xs text-red-500/80 font-medium uppercase tracking-widest mt-0.5">Live Trading Exchange</p>
                        </div>
                    </div>
                </header>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-5 md:p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-red-500/10 rounded-full blur-2xl group-hover:bg-red-500/20 transition-colors"></div>
                        <div className="flex items-center gap-2 text-gray-400 mb-2 relative z-10">
                            <Wallet size={16} className="text-red-500" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Available Cash</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white relative z-10 font-mono tracking-tight">
                            ₹{Number(user?.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '...'}
                        </p>
                    </div>

                    <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-5 md:p-6 rounded-3xl relative overflow-hidden group">
                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-colors"></div>
                        <div className="flex items-center gap-2 text-gray-400 mb-2 relative z-10">
                            <Briefcase size={16} className="text-orange-500" />
                            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">Invested Value</span>
                        </div>
                        <p className="text-2xl md:text-3xl font-black text-white relative z-10 font-mono tracking-tight">
                            ₹{Number(user?.totalInvested).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                        </p>
                    </div>
                </div>

                {/* Portfolio Summary Section */}
                {user?.portfolios?.filter((p: any) => p.units > 0).length > 0 && (
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                            <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Your Portfolio</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {user.portfolios.filter((p: any) => p.units > 0).map((p: any) => {
                                const currentValue = p.units * Number(p.asset.currentPrice);
                                const profit = currentValue - Number(p.totalCost);
                                const isProfit = profit >= 0;

                                return (
                                    <Link
                                        href={`/invest/${p.assetId}`}
                                        key={p.id}
                                        className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-white/5 hover:border-red-500/30 transition-all flex flex-col gap-3 group relative overflow-hidden"
                                    >
                                        {/* Glow effect on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                        <div className="flex justify-between items-start relative z-10">
                                            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{p.asset.name}</p>
                                            <div className={cn(
                                                "text-[9px] font-black px-2 py-1 rounded-md border backdrop-blur-xl",
                                                isProfit
                                                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                                                    : "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.2)]"
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
                                                isProfit ? "text-emerald-400" : "text-red-400"
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
                        <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
                        <h2 className="text-lg md:text-xl font-bold text-white tracking-tight">Market Assets</h2>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {assets.map((asset: any) => {
                            const isPositive = asset.change24h >= 0;
                            return (
                                <Link
                                    key={asset.id}
                                    href={`/invest/${asset.id}`}
                                    className="bg-slate-900/40 backdrop-blur-md p-5 rounded-3xl border border-white/5 hover:border-red-500/30 transition-all flex flex-col gap-4 group relative overflow-hidden"
                                >
                                    {/* Hover Gradient */}
                                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="flex justify-between items-start relative z-10">
                                        <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-red-400 group-hover:border-red-500/30 transition-colors shadow-inner">
                                            <Activity size={20} />
                                        </div>
                                        <div className={cn(
                                            "flex items-center gap-1 text-[10px] font-black px-2.5 py-1 rounded-md border backdrop-blur-xl shadow-lg",
                                            isPositive
                                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                                                : "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                                        )}>
                                            {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                            {Math.abs(asset.change24h).toFixed(2)}%
                                        </div>
                                    </div>

                                    <div className="relative z-10">
                                        <h3 className="text-lg font-bold text-white tracking-tight">{asset.name}</h3>
                                        <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase mt-0.5">{asset.unit}</p>
                                    </div>

                                    <div className="mt-2 pt-3 border-t border-white/5 flex justify-between items-end relative z-10">
                                        <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Current Price</span>
                                        <p className="text-xl font-black text-white font-mono">₹{Number(asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                </section>

                <div className="pt-8 pb-4 text-center">
                    <p className="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                        <Activity size={12} className="text-red-500/50" />
                        Market updates daily at 12:00 AM IST. Investing involves risk.
                    </p>
                </div>
            </div>
        </main>
    );
}
