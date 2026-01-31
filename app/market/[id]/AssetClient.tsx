'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Info, ShoppingCart, DollarSign } from 'lucide-react';
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
}

export default function AssetClient({ asset, userUnits, userBalance }: AssetClientProps) {
    const router = useRouter();
    const [isInvesting, setIsInvesting] = useState(false);
    const [isCashingOut, setIsCashingOut] = useState(false);
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
                    units: all ? userUnits : parseFloat(tradeAmount),
                    all
                })
            });

            const data = await res.json();
            if (res.ok) {
                router.refresh();
                setIsInvesting(false);
                setIsCashingOut(false);
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

            <div className="p-6 space-y-6 flex-1">
                {/* Stats Summary */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Your Holdings</p>
                        <p className="text-xl font-black text-gray-900">{userUnits} <span className="text-[10px] font-medium text-gray-400 capitalize">{asset.unit.split(' ')[1]}s</span></p>
                    </div>
                    <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Current Value</p>
                        <p className="text-xl font-black text-indigo-600">₹{(userUnits * asset.currentPrice).toLocaleString()}</p>
                    </div>
                </div>

                {/* Performance Chart */}
                <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 h-64 flex flex-col">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                            <TrendingUp size={16} className="text-indigo-600" /> 7-Day Performance
                        </h2>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Market Price: ₹{asset.currentPrice}</p>
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
                <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100 flex gap-4">
                    <div className="bg-indigo-100/50 p-2 rounded-xl h-fit">
                        <Info size={20} className="text-indigo-600" />
                    </div>
                    <div>
                        <h4 className="text-sm font-bold text-indigo-900 mb-1">Market Insight</h4>
                        <p className="text-xs text-indigo-800/70 leading-relaxed font-medium">
                            {asset.id === 'OIL' ? "High volatility asset. Prices can swing wildly based on global demand." : "Steady growth asset with historically low volatility."} Current price is set at 12:00 AM daily.
                        </p>
                    </div>
                </div>
            </div>

            {/* Trading Bar */}
            <div className="bg-white p-6 pb-10 shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] rounded-t-[40px] sticky bottom-0 z-30">
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => setIsInvesting(true)}
                        className="flex items-center justify-center gap-2 bg-indigo-600 text-white font-black py-4 rounded-2xl hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                    >
                        <ShoppingCart size={18} /> Invest
                    </button>
                    <button
                        onClick={() => setIsCashingOut(true)}
                        disabled={userUnits <= 0}
                        className="flex items-center justify-center gap-2 bg-white text-gray-900 border-2 border-gray-100 font-bold py-4 rounded-2xl hover:bg-gray-50 transition disabled:opacity-50"
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
                                <div className="flex items-center gap-4">
                                    <input
                                        type="number"
                                        value={tradeAmount}
                                        onChange={(e) => setTradeAmount(e.target.value)}
                                        className="flex-1 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-2xl p-4 text-2xl font-black outline-none transition-all"
                                        min="0.1"
                                        step="0.1"
                                    />
                                    <button
                                        onClick={() => setTradeAmount(isInvesting ? (userBalance / asset.currentPrice).toFixed(1) : userUnits.toString())}
                                        className="bg-indigo-50 text-indigo-600 px-4 py-4 rounded-2xl font-bold hover:bg-indigo-100 transition"
                                    >
                                        MAX
                                    </button>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-3xl space-y-3">
                                <div className="flex justify-between text-sm font-bold">
                                    <span className="text-gray-400">Rate per {asset.unit.split(' ')[1]}</span>
                                    <span className="text-gray-900">₹{asset.currentPrice.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-xl font-black pt-3 border-t border-gray-200">
                                    <span className="text-gray-900">Total {isInvesting ? 'Cost' : 'Value'}</span>
                                    <span className={isInvesting ? "text-indigo-600" : "text-emerald-600"}>₹{(parseFloat(tradeAmount || '0') * asset.currentPrice).toLocaleString()}</span>
                                </div>
                            </div>

                            {error && <p className="text-red-500 text-sm font-bold text-center">{error}</p>}

                            <button
                                onClick={() => handleTrade(isInvesting ? 'BUY' : 'SELL')}
                                disabled={loading}
                                className={cn(
                                    "w-full py-5 rounded-3xl font-black text-xl shadow-xl transition-all active:scale-95",
                                    isInvesting
                                        ? "bg-indigo-600 text-white shadow-indigo-200 hover:bg-indigo-700"
                                        : "bg-emerald-600 text-white shadow-emerald-200 hover:bg-emerald-700"
                                )}
                            >
                                {loading ? 'Processing...' : isInvesting ? 'Confirm Purchase' : 'Confirm Cash Out'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
