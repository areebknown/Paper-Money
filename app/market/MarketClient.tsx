'use client';

import { useState } from 'react';
import useSWR from 'swr';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Wallet, Briefcase, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

interface MarketClientProps {
    initialAssets: any[];
}

export default function MarketClient({ initialAssets }: MarketClientProps) {
    const { data: userData } = useSWR('/api/user', fetcher, { refreshInterval: 5000 });
    const { data: marketData } = useSWR('/api/market/sync', fetcher, {
        refreshInterval: 30000,
        fallbackData: { assets: initialAssets }
    });

    const assets = marketData?.assets || initialAssets;
    const user = userData?.user;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-10">
                <div className="flex items-center gap-4 mb-4">
                    <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 transition-colors">
                        <ArrowLeft size={24} />
                    </Link>
                    <h1 className="text-lg font-bold text-gray-900 tracking-tight">Commodity Market</h1>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
                        <div className="flex items-center gap-2 text-indigo-600/70 mb-1">
                            <Wallet size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Wallet Balance</span>
                        </div>
                        <p className="text-xl font-black text-indigo-900">₹{user?.balance?.toLocaleString() || '...'}</p>
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-2 text-emerald-600/70 mb-1">
                            <Briefcase size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Invested Value</span>
                        </div>
                        <p className="text-xl font-black text-emerald-900">₹{user?.totalInvested?.toLocaleString() || '0'}</p>
                    </div>
                </div>
            </div>

            {/* Portfolio Summary Section */}
            {user?.portfolios?.length > 0 && (
                <div className="px-4 py-6">
                    <h2 className="text-gray-800 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Briefcase size={16} className="text-indigo-600" /> Your Portfolio
                    </h2>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {user.portfolios.map((p: any) => (
                            <Link
                                href={`/market/${p.assetId}`}
                                key={p.id}
                                className="min-w-[160px] bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-1 active:scale-95 transition-transform"
                            >
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{p.asset.name}</p>
                                <p className="text-sm font-black text-gray-900">{p.units} <span className="text-[8px] opacity-40 uppercase">{p.asset.unit.split(' ')[1]}s</span></p>
                                <p className="text-xs font-bold text-emerald-600 mt-1">₹{(p.units * p.asset.currentPrice).toLocaleString()}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* Asset Market Section */}
            <div className="p-4 flex-1">
                <h2 className="text-gray-800 font-black text-xs uppercase tracking-widest mb-4 flex items-center gap-2 px-2">
                    <Activity size={16} className="text-indigo-600" /> Market Assets
                </h2>
                <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset: any) => {
                        const isPositive = asset.change24h >= 0;
                        return (
                            <Link
                                key={asset.id}
                                href={`/market/${asset.id}`}
                                className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all flex flex-col gap-3 group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="p-2 rounded-xl bg-gray-50 text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                        <Activity size={20} />
                                    </div>
                                    <div className={cn(
                                        "flex items-center gap-0.5 text-[10px] font-black px-2 py-0.5 rounded-full border",
                                        isPositive
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                            : "bg-red-50 text-red-600 border-red-100"
                                    )}>
                                        {isPositive ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                        {Math.abs(asset.change24h).toFixed(2)}%
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-bold text-gray-900">{asset.name}</h3>
                                    <p className="text-[10px] text-gray-400 font-medium">{asset.unit}</p>
                                </div>

                                <div className="mt-auto">
                                    <p className="text-lg font-black text-gray-900">₹{asset.currentPrice.toLocaleString()}</p>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>

            <p className="text-center text-[10px] text-gray-400 font-medium p-6 mt-auto">
                Market updates daily at 12:00 AM IST. Investing involves risk.
            </p>
        </div>
    );
}
