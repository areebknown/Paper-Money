'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, ShoppingCart, DollarSign, Activity, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { getPusherClient } from '@/lib/pusher-client';
import { LOGO_URL } from '@/lib/cloudinary';
import { motion, AnimatePresence } from 'framer-motion';
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

export default function AssetClient({ asset, userUnits, userBalance, rankPoints, isSuspended }: AssetClientProps & { rankPoints: number }) {
    const router = useRouter();
    const [isInvesting, setIsInvesting] = useState(false);
    const [isCashingOut, setIsCashingOut] = useState(false);
    const [showValueModal, setShowValueModal] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [tradeAmount, setTradeAmount] = useState('1');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const pusher = getPusherClient();
        const channel = pusher.subscribe('market-updates');

        channel.bind('prices-updated', () => {
            console.log('[Pusher] Market prices updated via midnight trigger! Refreshing component...');
            router.refresh();
        });

        return () => {
            pusher.unsubscribe('market-updates');
            channel.unbind_all();
        };
    }, [router]);

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
        <main className="min-h-screen bg-[#111827] text-[#F9FAFB] relative flex flex-col pb-24 lg:pb-0 overflow-x-hidden selection:bg-[#FBBF24] selection:text-white">

            <div className="relative z-10 w-full max-w-4xl mx-auto flex flex-col flex-1 pt-0">
                {/* Header */}
                <header className="relative z-50 pt-4 pb-2 border-b border-[#FBBF24] sticky top-0 mb-4 bg-gradient-to-b from-[#14254f] via-[#101d3f] to-[#0b1328] shadow-[0_18px_38px_rgba(0,0,0,0.45)] overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                    <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-black/25 pointer-events-none" />
                    <div className="flex justify-between items-center px-4 mb-2 relative">
                        {/* Left: Balance + Rank Points */}
                        <div className="flex flex-col gap-1 w-auto">
                            <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                                <span className="material-icons-round text-[#FBBF24] drop-shadow-md leading-none" style={{ fontSize: '14px' }}>currency_rupee</span>
                                <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">
                                    {(userBalance || 0).toLocaleString()}
                                </span>
                            </div>
                            <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded-full border border-white/10">
                                <span className="material-icons-round text-blue-400 drop-shadow-md leading-none" style={{ fontSize: '14px' }}>military_tech</span>
                                <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">{rankPoints || 0}</span>
                            </div>
                        </div>

                        {/* Center: Logo */}
                        <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
                            <img
                                src={LOGO_URL}
                                alt="Bid Wars Logo"
                                className="drop-shadow-lg object-contain h-[50px] w-auto"
                            />
                        </div>

                        {/* Right: Notifications + Profile */}
                        <div className="flex items-center gap-3 w-24 justify-end">
                            <button className="relative w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
                                <span className="material-icons-round text-white">notifications</span>
                                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#1E3A8A]"></span>
                            </button>
                            <Link href="/profile">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBBF24] to-orange-500 p-0.5 shadow-lg cursor-pointer">
                                    <div className="w-full h-full rounded-full border-2 border-white bg-gray-700 flex items-center justify-center">
                                        <span className="material-icons-round text-white text-xl">person</span>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </header>

                <div className="px-4 pb-6 space-y-4 flex-1 w-full max-w-4xl mx-auto">
                    {/* Floating Asset Title Bar */}
                    <div className="flex items-center justify-between bg-[#1e293b] border border-white/10 p-4 rounded-2xl shadow-xl shadow-black/40">
                        <div className="flex items-center gap-3">
                            <Link href="/invest" className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 hover:scale-105 active:scale-95 transition-all outline-none border border-white/5">
                                <ArrowLeft size={18} />
                            </Link>
                            <div>
                                <h1 className="text-lg md:text-xl font-bold tracking-tight text-white">{asset.name}</h1>
                                <p className="text-[10px] md:text-xs text-[#FBBF24] font-bold uppercase tracking-widest">{asset.unit}</p>
                            </div>
                        </div>
                        <div className={cn(
                            "flex items-center gap-1.5 font-black px-3 py-1.5 rounded-lg text-xs border md:text-sm shadow-sm",
                            isPositive
                                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                : "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                            {Math.abs(asset.change24h).toFixed(2)}%
                        </div>
                    </div>

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
                    <div className="grid grid-cols-2 gap-3 md:gap-4 relative z-40">
                        <div className="bg-[#1e293b] border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl relative overflow-hidden group">
                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-1.5">
                                <Activity size={14} className="text-indigo-400" /> Your Units
                            </p>
                            <p className="text-xl md:text-2xl font-black text-white relative z-10 font-mono tracking-tight truncate">
                                {userUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                                <span className="text-[10px] md:text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">{asset.unit.split(' ')[1]}s</span>
                            </p>
                        </div>

                        <motion.div 
                            layoutId="current-val-card"
                            onClick={() => setShowValueModal(true)}
                            className="bg-[#1e293b] border border-white/5 p-4 md:p-5 rounded-2xl md:rounded-3xl relative overflow-hidden group cursor-pointer active:scale-95 transition-transform"
                        >
                            <motion.p layoutId="current-val-title" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 relative z-10 flex items-center gap-1.5">
                                <DollarSign size={14} className="text-emerald-400" /> Current Value
                            </motion.p>
                            <motion.p layoutId="current-val-value" className="text-xl md:text-2xl font-black text-emerald-400 relative z-10 font-mono tracking-tight truncate">
                                ₹{(userUnits * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </motion.p>
                        </motion.div>
                    </div>

                    {/* Performance Chart */}
                    <div className="bg-[#1e293b] border border-white/5 p-4 md:p-5 rounded-3xl relative h-72 md:h-80 flex flex-col group">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-3xl"></div>

                        <div className="flex justify-between flex-wrap items-center gap-2 mb-4 relative z-10">
                            <h2 className="text-sm md:text-base font-bold text-white flex items-center gap-2 tracking-tight">
                                <TrendingUp size={18} className="text-[#FBBF24]" /> 7-Day Performance
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
                                            background: 'rgba(15,23,42,0.95)',
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
                    <div className="bg-orange-950/20 p-4 md:p-5 rounded-3xl border border-orange-500/20 flex gap-4">
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
            <div className="fixed sm:sticky bottom-0 left-0 right-0 z-40 p-4 md:p-6 bg-gradient-to-t from-[#111827] via-[#111827]/90 to-transparent pt-12">
                <div className="max-w-4xl mx-auto grid grid-cols-2 gap-3 md:gap-4">
                    <button
                        onClick={() => setIsInvesting(true)}
                        disabled={isSuspended}
                        className="flex items-center justify-center gap-2 bg-[#FBBF24] hover:bg-yellow-400 text-blue-900 border border-[#FBBF24] font-black py-4 md:py-5 rounded-2xl transition shadow-[0_0_20px_rgba(251,191,36,0.3)] disabled:opacity-50 disabled:grayscale disabled:hover:bg-[#FBBF24] text-sm md:text-base active:scale-95"
                    >
                        <ShoppingCart size={18} /> Invest
                    </button>
                    <button
                        onClick={() => setIsCashingOut(true)}
                        disabled={userUnits <= 0 || isSuspended}
                        className="flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold py-4 md:py-5 rounded-2xl transition disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base shadow-lg"
                    >
                        <DollarSign size={18} /> Cash Out
                    </button>
                </div>
            </div>

            {/* Main Trading Modal Overlay */}
            {(isInvesting || isCashingOut) && (
                <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/90 animate-in fade-in duration-300">

                    <div className="absolute inset-0" onClick={() => { setIsInvesting(false); setIsCashingOut(false); setError(''); setShowConfirm(false) }} />

                    <div className="bg-slate-900 border border-white/10 w-full max-w-lg rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom-20 duration-500 relative z-10 shadow-2xl">

                        {!showConfirm ? (
                            <>
                                <div className="flex justify-between items-center mb-8">
                                    <h2 className="text-xl md:text-2xl font-black text-white">{isInvesting ? 'Invest in' : 'Cash Out'} {asset.name}</h2>
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
                                                        ? "bg-[#FBBF24] text-blue-900 hover:bg-yellow-400 shadow-[0_0_20px_rgba(251,191,36,0.2)]"
                                                        : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-emerald-500/20"
                                                )}
                                                >
                                                    {isInvesting ? 'Confirm Investment' : 'Confirm Cash Out'}
                                                </button>

                                                {isCashingOut && (
                                                    <button
                                                        onClick={() => setShowConfirm(true)}
                                                        disabled={userUnits <= 0}
                                                        className="w-full py-4 mt-2 bg-transparent text-red-500 border border-red-500/30 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-red-500/10 transition"
                                                    >
                                                        Cash Out All Units
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
                                    You are about to cash out all your units of <span className="text-white font-bold">{asset.name}</span>.
                                </p>

                                <div className="w-full space-y-3">
                                    <button
                                        onClick={() => handleTrade('SELL', true)}
                                        className="w-full py-4 bg-red-600 text-white font-black text-sm uppercase tracking-widest rounded-2xl hover:bg-red-500 transition shadow-lg shadow-red-500/20 active:scale-95"
                                    >
                                        Confirm Cash Out
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

            {/* Current Value Modal */}
            <AnimatePresence>
            {showValueModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
                    onClick={() => setShowValueModal(false)}
                >
                    <motion.div
                        layoutId="current-val-card"
                        className="bg-[#1e293b] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-sm shadow-2xl relative overflow-hidden cursor-default"
                        onClick={e => e.stopPropagation()}
                    >
                        <motion.div layoutId="current-val-title" className="flex items-center gap-2 text-gray-400 mb-4 relative z-10">
                            <DollarSign size={20} className="text-emerald-400" />
                            <span className="text-xs md:text-sm font-bold uppercase tracking-widest">
                                Current Value
                            </span>
                        </motion.div>
                        <motion.p layoutId="current-val-value" className="text-2xl md:text-3xl font-black text-emerald-400 relative z-10 font-mono break-all leading-tight">
                            ₹{(userUnits * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </motion.p>
                        
                        <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">Holdings</span>
                            <span className="text-sm font-bold text-white tracking-widest">{userUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })} {asset.unit}</span>
                        </div>

                        {/* Decorative background glow using radial gradient for performance */}
                        <div 
                            className="absolute -right-8 -bottom-8 w-40 h-40 rounded-full pointer-events-none"
                            style={{ 
                                background: 'radial-gradient(circle, rgba(16, 185, 129, 0.15) 0%, transparent 70%)' 
                            }} 
                        />
                    </motion.div>
                </motion.div>
            )}
            </AnimatePresence>

        </main>
    );
}

