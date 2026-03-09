'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Activity, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

interface AssetClientProps {
    asset: any;
    userUnits: number;
    userBalance: number;
    isSuspended: boolean;
}

export default function AssetClient({ asset, userUnits, userBalance, isSuspended }: AssetClientProps) {
    const router = useRouter();
    const [isInvesting, setIsInvesting] = useState(false);
    const [isCashingOut, setIsCashingOut] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tradeAmount, setTradeAmount] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const isPositive = asset.change24h >= 0;

    // Format chart data
    const chartData = asset.history.map((h: any) => ({
        time: new Date(h.timestamp).toLocaleDateString(undefined, { weekday: 'short' }),
        price: h.price
    }));

    const handleTrade = async (type: 'BUY' | 'SELL', all = false) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch('/api/market/trade', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    assetId: asset.id,
                    type,
                    units: all ? userUnits : Math.floor(parseFloat(tradeAmount)),
                    all
                })
            });

            const data = await res.json();
            if (res.ok) {
                router.refresh();
                setIsInvesting(false);
                setIsCashingOut(false);
                setShowConfirm(false);
                setTradeAmount('1');
            } else {
                setError(data.error || 'Transaction failed');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-slate-950 text-white relative pb-24 lg:pb-0 overflow-x-hidden selection:bg-red-500/30 selection:text-red-200">
            {/* Background Effects */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-red-900/10 rounded-full blur-[100px] mix-blend-screen transform translate-x-1/3 -translate-y-1/3"></div>
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-orange-900/10 rounded-full blur-[100px] mix-blend-screen transform -translate-x-1/3 translate-y-1/3"></div>
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-5 [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]"></div>
            </div>

            <div className="relative z-10 max-w-4xl mx-auto p-4 md:p-6 lg:p-8 flex flex-col min-h-screen">

                {/* Header Navbar */}
                <header className="flex items-center justify-between sticky top-4 z-50 bg-slate-900/60 backdrop-blur-xl border border-white/5 p-4 rounded-2xl shadow-xl shadow-black/20 mb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/invest" className="p-2 hover:bg-white/10 rounded-xl transition-colors active:scale-95 group">
                            <ArrowLeft size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                        </Link>
                        <div>
                            <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">{asset.name}</h1>
                            <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-widest">{asset.unit}</p>
                        </div>
                    </div>
                    <div className={cn(
                        "flex items-center gap-1.5 font-black px-3 py-1.5 rounded-lg text-xs border backdrop-blur-xl",
                        isPositive
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]"
                            : "bg-red-500/10 text-red-400 border-red-500/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]"
                    )}>
                        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        {Math.abs(asset.change24h).toFixed(2)}%
                    </div>
                </header>

                <div className="space-y-4 flex-1">

                    {/* Suspension Warning */}
                    {isSuspended && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex items-center gap-4 animate-in fade-in zoom-in-95 duration-300">
                            <div className="w-12 h-12 rounded-xl bg-red-500/20 flex flex-col items-center justify-center text-red-400 shrink-0">
                                <Activity size={24} className="mb-0.5" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-red-400">Trading Restricted</p>
                                <p className="text-[10px] md:text-xs font-medium text-red-500/80 mt-1 uppercase tracking-widest">Your account is currently suspended. Please contact standard support.</p>
                            </div>
                        </div>
                    )}

                    {/* Stats Summary Panel */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-5 md:p-6 rounded-3xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-colors"></div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-1.5">
                                <Activity size={14} className="text-indigo-400" /> Your Holdings
                            </p>
                            <p className="text-2xl md:text-3xl font-black text-white relative z-10 font-mono tracking-tight">
                                {userUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{asset.unit.split(' ')[1]}s</span>
                            </p>
                        </div>

                        <div className="bg-slate-900/50 backdrop-blur-sm border border-white/5 p-5 md:p-6 rounded-3xl relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-1.5">
                                <DollarSign size={14} className="text-emerald-400" /> Current Value
                            </p>
                            <p className="text-2xl md:text-3xl font-black text-emerald-400 relative z-10 font-mono tracking-tight">
                                ₹{(userUnits * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                        </div>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-slate-900/50 backdrop-blur-md border border-white/5 p-5 md:p-6 rounded-3xl relative h-72 md:h-80 flex flex-col group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-3xl"></div>

                        <div className="flex justify-between flex-wrap items-center gap-2 mb-4 relative z-10">
                            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2 tracking-tight">
                                <TrendingUp size={18} className="text-red-500" /> 7-Day Performance Metric
                            </h2>
                            <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                Market Price: <span className="text-white font-mono">₹{asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                            </p>
                        </div>

                        <div className="flex-1 w-full mt-2 relative z-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                            <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" strokeOpacity={0.5} />
                                    <XAxis
                                        dataKey="time"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                        dy={10}
                                    />
                                    <YAxis hide={true} domain={['auto', 'auto']} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '16px',
                                            border: '1px solid rgba(255,255,255,0.1)',
                                            background: 'rgba(15,23,42,0.9)',
                                            backdropFilter: 'blur(8px)',
                                            boxShadow: '0 10px 25px -5px rgb(0 0 0 / 0.5)'
                                        }}
                                        labelStyle={{ fontWeight: 800, color: '#9ca3af' }}
                                        itemStyle={{ fontWeight: 800, color: 'white' }}
                                        formatter={(value: any) => [`₹${parseFloat(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 'Price']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke={isPositive ? "#10b981" : "#ef4444"}
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPrice)"
                                        animationDuration={1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Information Module */}
                    <div className="bg-orange-950/20 p-5 rounded-3xl border border-orange-500/20 flex gap-4 backdrop-blur-sm">
                        <div className="bg-orange-500/10 p-2.5 rounded-xl h-fit border border-orange-500/20">
                            <Lightbulb size={22} className="text-orange-400" />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-orange-400 mb-1.5 tracking-wide">
                                Market Insight
                            </h4>
                            <p className="text-[11px] md:text-xs text-orange-200/70 leading-relaxed font-medium">
                                {asset.description || "Steady growth asset with historically low volatility."} <br />
                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-2 block">Prices fluctuate daily at 12:00 AM IST.</span>
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            {/* Trading Input Bar */}
            <div className="fixed sm:sticky bottom-0 left-0 right-0 z-40 p-4 md:p-6 bg-gradient-to-t from-slate-950 via-slate-950 to-transparent pt-12">
                <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3 md:gap-4">
                    <button
                        onClick={() => setIsInvesting(true)}
                        disabled={isSuspended}
                        className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-black py-4 md:py-5 rounded-2xl transition shadow-[0_0_20px_rgba(220,38,38,0.3)] disabled:opacity-50 disabled:grayscale disabled:hover:bg-red-600 text-sm md:text-base"
                    >
                        <ShoppingCart size={18} /> Invest
                    </button>
                    <button
                        onClick={() => setIsCashingOut(true)}
                        disabled={userUnits <= 0 || isSuspended}
                        className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold py-4 md:py-5 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base backdrop-blur-md"
                    >
                        <DollarSign size={18} /> Cash Out
                    </button>
                </div>
            </div>

            {/* Main Trading Modal Overlay */}
            {(isInvesting || isCashingOut) && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-md animate-in fade-in duration-300">

                    <div className="absolute inset-0" onClick={() => { setIsInvesting(false); setIsCashingOut(false); setError(''); setShowConfirm(false) }} />

                    <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom-20 duration-500 relative z-10 shadow-2xl">

                        {!showConfirm ? (
                            <>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl md:text-2xl font-black text-white">{isInvesting ? 'Acquire' : 'Liquidate'} {asset.name}</h2>
                                    <button
                                        onClick={() => { setIsInvesting(false); setIsCashingOut(false); setError(''); }}
                                        className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 transition"
                                    >
                                        <ArrowLeft className="rotate-90" size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest text-center block w-full">Quantity ({asset.unit.split(' ')[1]}s)</label>
                                        <div className="flex justify-center">
                                            <div className="flex items-center gap-3 w-full max-w-[280px]">
                                                <input
                                                    type="number"
                                                    value={tradeAmount}
                                                    onChange={(e) => setTradeAmount(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/10 focus:border-red-500 rounded-2xl p-4 text-2xl font-black text-white outline-none transition-all text-center placeholder:text-gray-700"
                                                    min="1"
                                                    step="1"
                                                />
                                                {isInvesting && (
                                                    <button
                                                        onClick={() => setTradeAmount(Math.floor(userBalance / asset.currentPrice).toString())}
                                                        className="bg-red-500/10 border border-red-500/20 text-red-500 px-5 py-4 rounded-2xl text-xs font-black hover:bg-red-500/20 transition whitespace-nowrap"
                                                    >
                                                        MAX
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/30 border border-white/5 p-6 rounded-3xl space-y-4">
                                        <div className="flex justify-between text-sm md:text-base font-bold items-center">
                                            <span className="text-gray-500 uppercase tracking-widest text-[10px]">Rate</span>
                                            <span className="text-gray-300 font-mono">₹{asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                        </div>
                                        <div className="flex justify-between text-lg md:text-xl font-black pt-4 border-t border-white/10 items-end">
                                            <span className="text-gray-300 uppercase tracking-widest text-xs">Total {isInvesting ? 'Cost' : 'Yield'}</span>
                                            <span className={cn(
                                                "font-mono",
                                                isInvesting ? "text-red-500" : "text-emerald-500"
                                            )}>
                                                ₹{(parseFloat(tradeAmount || '0') * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                            </span>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-center">
                                            {error}
                                        </div>
                                    )}

                                    <div className="space-y-3 pt-2">
                                        {loading ? (
                                            <div className="w-full py-5 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10 animate-pulse">
                                                <Activity className="animate-spin text-gray-400" size={24} />
                                            </div>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleTrade(isInvesting ? 'BUY' : 'SELL')}
                                                    className={cn(
                                                        "w-full py-5 rounded-2xl font-black text-sm md:text-base uppercase tracking-widest transition-all active:scale-95 shadow-lg",
                                                        isInvesting
                                                            ? "bg-red-600 text-white hover:bg-red-500 shadow-red-500/20"
                                                            : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20"
                                                    )}
                                                >
                                                    {isInvesting ? 'Execute Acquisition' : 'Liquidate Position'}
                                                </button>

                                                {isCashingOut && (
                                                    <button
                                                        onClick={() => setShowConfirm(true)}
                                                        disabled={userUnits <= 0}
                                                        className="w-full py-4 mt-2 bg-transparent text-red-500 border border-red-500/30 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition"
                                                    >
                                                        Liquidate All Holdings
                                                    </button>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Sub-Modal: Cash Out All Confirmation */
                            <div className="flex flex-col items-center text-center animate-in zoom-in-95 duration-300 py-4">
                                <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 mb-6 relative">
                                    <div className="absolute inset-0 bg-red-500/20 rounded-full animate-ping"></div>
                                    <Activity size={32} />
                                </div>
                                <h3 className="text-xl md:text-2xl font-black text-white mb-2 tracking-tight">Are you absolutely sure?</h3>
                                <p className="text-gray-400 text-xs md:text-sm font-medium mb-8 leading-relaxed max-w-[280px]">
                                    You are about to completely exit your position in <span className="text-white font-bold">{asset.name}</span>.
                                </p>

                                <div className="w-full space-y-3">
                                    <button
                                        onClick={() => handleTrade('SELL', true)}
                                        className="w-full py-4 bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-red-500 transition shadow-lg shadow-red-500/20 active:scale-95"
                                    >
                                        Confirm Liquidation
                                    </button>
                                    <button
                                        onClick={() => setShowConfirm(false)}
                                        className="w-full py-4 bg-white/5 text-gray-300 text-xs font-bold uppercase tracking-widest rounded-2xl hover:bg-white/10 hover:text-white transition"
                                    >
                                        Cancel Action
                                    </button>
                                </div>
                            </div>
                        )}

                    </div>
                </div>
            )}
        </main>
    );
}
