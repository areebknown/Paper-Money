'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Info, ShoppingCart, DollarSign, Activity, Lightbulb } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import {
    LineChart,
    Line,
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
        <div className="min-h-screen bg-gray-50 flex flex-col">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm sticky top-0 z-20 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link href="/market" className="text-gray-600">
                        <ArrowLeft size={24} />
                    </Link>
                    <div>
                        <h1 className="text-lg font-bold text-gray-900">{asset.name}</h1>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{asset.unit}</p>
                    </div>
                </div>
                <div className={cn(
                    "flex items-center gap-1 font-black px-3 py-1 rounded-full text-sm",
                    isPositive ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50"
                )}>
                    {isPositive ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {Math.abs(asset.change24h).toFixed(2)}%
                </div>
            </div>

            <div className="p-6 space-y-6 flex-1 relative">
                {/* Suspension Warning */}
                {isSuspended && (
                    <div className="absolute inset-x-6 top-0 z-10 bg-red-50 border border-red-200 p-4 rounded-3xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                            <Activity size={20} />
                        </div>
                        <div>
                            <p className="text-sm font-black text-red-900 leading-none">Account Suspended</p>
                            <p className="text-[10px] font-bold text-red-600/70 mt-1 uppercase tracking-tighter">Market access is restricted. Contact admin.</p>
                        </div>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Holdings</p>
                        <p className="text-xl font-black text-gray-900">{userUnits.toLocaleString(undefined, { maximumFractionDigits: 2 })} <span className="text-[10px] font-medium text-gray-400 capitalize">{asset.unit.split(' ')[1]}s</span></p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Value</p>
                        <p className="text-xl font-black text-indigo-600">₹{(userUnits * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 h-64 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={16} className="text-indigo-600" /> 7-Day Performance
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Price: ₹{asset.currentPrice.toFixed(2)}</p>
                    </div>

                    <div className="flex-1 w-full mt-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0.3} />
                                        <stop offset="95%" stopColor={isPositive ? "#10b981" : "#ef4444"} stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis
                                    dataKey="time"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                />
                                <YAxis
                                    hide={true}
                                    domain={['auto', 'auto']}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 800, color: '#4b5563' }}
                                    formatter={(value: any) => [`₹${parseFloat(value).toFixed(2)}`, 'Price']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="price"
                                    stroke={isPositive ? "#10b981" : "#ef4444"}
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorPrice)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Information Card */}
                <div className="bg-amber-50/50 p-4 rounded-2xl border border-amber-100 flex gap-4">
                    <div className="bg-amber-100/50 p-2 rounded-xl h-fit">
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-sm">
                            <Lightbulb size={20} fill="currentColor" fillOpacity={0.1} />
                        </div>
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-amber-900 mb-1 flex items-center gap-1.5">
                            Market Insight
                        </h4>
                        <p className="text-xs text-amber-800/70 leading-relaxed font-medium">
                            {asset.description || "Steady growth asset with historically low volatility."} <br />
                            <span className="text-[10px] opacity-60 italic mt-1 block">Current price is set at 12:00 AM daily.</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Trading Bar */}
            <div className="bg-white p-6 pb-10 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] rounded-t-[40px] sticky bottom-0 z-30">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsInvesting(true)}
                        disabled={isSuspended}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:grayscale"
                    >
                        <ShoppingCart size={18} /> Invest
                    </button>
                    <button
                        onClick={() => setIsCashingOut(true)}
                        disabled={userUnits <= 0 || isSuspended}
                        className="flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 font-bold py-4 rounded-2xl hover:bg-gray-50 transition disabled:opacity-50 disabled:grayscale"
                    >
                        <DollarSign size={18} /> Cash Out
                    </button>
                </div>
            </div>

            {/* Trading Modal */}
            {(isInvesting || isCashingOut) && (
                <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-lg rounded-t-[40px] p-8 pb-12 animate-in slide-in-from-bottom-20 duration-500">
                        <div className="flex justify-between items-center mb-8">
                            <h2 className="text-2xl font-black text-gray-900">{isInvesting ? 'Invest in' : 'Cash Out'} {asset.name}</h2>
                            <button onClick={() => { setIsInvesting(false); setIsCashingOut(false); setError(''); }} className="text-gray-400 hover:text-gray-600">
                                <ArrowLeft className="rotate-90" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Amount of {asset.unit.split(' ')[1]}s</label>
                                <div className="flex justify-center">
                                    <div className="flex items-center gap-4 w-full max-w-xs">
                                        <input
                                            type="number"
                                            value={tradeAmount}
                                            onChange={(e) => setTradeAmount(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-2xl font-black outline-none transition-all text-center"
                                            min="1"
                                            step="1"
                                        />
                                        <button
                                            onClick={() => setTradeAmount(isInvesting ? Math.floor(userBalance / asset.currentPrice).toString() : Math.floor(userUnits).toString())}
                                            className="bg-indigo-50 text-indigo-600 px-6 py-4 rounded-2xl font-bold hover:bg-indigo-100 transition whitespace-nowrap"
                                        >
                                            MAX
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-3xl space-y-3">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-400">Rate per {asset.unit.split(' ')[1]}</span>
                                    <span className="text-gray-900">₹{asset.currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-3 border-t border-gray-200">
                                    <span className="text-gray-900">Total {isInvesting ? 'Cost' : 'Value'}</span>
                                    <span className={isInvesting ? "text-indigo-600" : "text-emerald-600"}>₹{(parseFloat(tradeAmount || '0') * asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                            <div className="space-y-3">
                                {loading ? (
                                    <div className="w-full py-5 flex items-center justify-center bg-gray-100 rounded-3xl animate-pulse">
                                        <Activity className="animate-spin text-indigo-600" />
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => handleTrade(isInvesting ? 'BUY' : 'SELL')}
                                            className={cn(
                                                "w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95",
                                                isInvesting
                                                    ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
                                                    : "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                                            )}
                                        >
                                            {isInvesting ? 'Confirm Purchase' : 'Confirm Cash Out'}
                                        </button>

                                        {isCashingOut && (
                                            <button
                                                onClick={() => setShowConfirm(true)}
                                                disabled={userUnits <= 0}
                                                className="w-full py-4 bg-red-50 text-red-600 font-black rounded-2xl hover:bg-red-100 transition shadow-sm border border-red-100"
                                            >
                                                Cash Out All
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Custom Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
                    <div className="bg-white w-full max-w-sm rounded-[40px] p-8 shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center text-red-600 mb-6">
                            <Activity size={40} className="animate-pulse" />
                        </div>
                        <h3 className="text-xl font-black text-gray-900 mb-2">Are you sure?</h3>
                        <p className="text-gray-500 text-sm font-medium mb-8">
                            You are about to sell all your <b>{asset.name}</b> holdings. This action cannot be undone.
                        </p>

                        <div className="w-full space-y-3">
                            <button
                                onClick={() => handleTrade('SELL', true)}
                                className="w-full py-4 bg-red-600 text-white font-black rounded-2xl hover:bg-red-700 transition shadow-xl shadow-red-100"
                            >
                                Yes, Cash Out All
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="w-full py-4 bg-gray-50 text-gray-900 font-bold rounded-2xl hover:bg-gray-100 transition"
                            >
                                Keep My Investment
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
