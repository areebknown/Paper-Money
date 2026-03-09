'use client';

import React, { useState, useEffect } from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/navigation';
import {
    ShieldAlert,
    RefreshCcw,
    Activity,
    TrendingUp,
    X,
    BarChart3
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminMarketPage() {
    const router = useRouter();

    // Market Control State
    const [selectedAssetId, setSelectedAssetId] = useState('ALL');
    const [crashMagnitude, setCrashMagnitude] = useState('20');
    const [crashLoading, setCrashLoading] = useState(false);
    const [eventType, setEventType] = useState('CRASH');

    // Event History State
    const [marketEventHistory, setMarketEventHistory] = useState<any[]>([]);

    // Analytics State
    const [trackerAssetId, setTrackerAssetId] = useState('GOLD');
    const [analyticsData, setAnalyticsData] = useState<any>(null);
    const [analyticsLoading, setAnalyticsLoading] = useState(false);

    const fetchEventHistory = async () => {
        try {
            const res = await fetch('/api/admin/market/events');
            if (res.ok) {
                const data = await res.json();
                setMarketEventHistory(data.events || []);
            }
        } catch (e) {
            console.error('Failed to fetch event history');
        }
    };

    useEffect(() => {
        fetchEventHistory();
    }, []);

    const fetchAnalytics = async (id: string) => {
        setAnalyticsLoading(true);
        try {
            const res = await fetch(`/api/admin/market/analytics?assetId=${id}`);
            if (res.ok) {
                const data = await res.json();
                setAnalyticsData(data);
            }
        } catch (e) {
            console.error('Failed to fetch analytics');
        } finally {
            setAnalyticsLoading(false);
        }
    };

    useEffect(() => {
        fetchAnalytics(trackerAssetId);
    }, [trackerAssetId]);

    const handleScheduleEvent = async () => {
        if (!crashMagnitude || isNaN(parseFloat(crashMagnitude))) return;
        const mag = parseFloat(crashMagnitude);
        if (mag < 0 || mag > 100) return alert('Enter a value between 0-100');

        const assetName = selectedAssetId === 'ALL' ? 'the ENTIRE market' : selectedAssetId;
        if (!confirm(`Schedule a ${mag}% ${eventType} for ${assetName}? This will execute at the next 12:00 AM update.`)) return;

        setCrashLoading(true);
        try {
            const res = await fetch('/api/admin/market/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: selectedAssetId, magnitude: mag, type: eventType }),
            });
            const result = await res.json();
            if (res.ok) {
                alert(result.message);
                setCrashMagnitude('20');
                fetchEventHistory();
            } else {
                alert(result.error || 'Failed to schedule event');
            }
        } catch (e) {
            alert('Scheduling failed');
        } finally {
            setCrashLoading(false);
        }
    };

    const cancelEvent = async (id: string) => {
        if (!confirm('Cancel this scheduled event?')) return;
        try {
            const res = await fetch(`/api/admin/market/events?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchEventHistory();
            } else {
                alert('Failed to cancel event');
            }
        } catch (e) {
            alert('Failed to cancel event');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-[#1e293b] p-6 rounded-2xl shadow-sm border border-gray-800">
                <div>
                    <h1 className="text-2xl font-bold text-white">Market Management</h1>
                    <p className="text-sm text-gray-400 mt-1">Control paper money trading assets, schedule events and view analytics.</p>
                </div>
            </div>

            {/* Top Grid: Controls & Sync */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Event Scheduler */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 flex flex-col h-full">
                    <h2 className="text-lg font-bold mb-1 text-white flex items-center gap-2">
                        <ShieldAlert size={20} className={cn(eventType === 'CRASH' ? "text-red-500" : "text-emerald-500")} /> Market Control Override
                    </h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-6">Schedule Next Day Event</p>

                    <div className="space-y-5 mt-auto">
                        <div className="flex p-1 bg-gray-900/50 border border-gray-800 rounded-xl">
                            <button
                                onClick={() => setEventType('CRASH')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all",
                                    eventType === 'CRASH' ? "bg-red-500 text-white shadow-md shadow-red-500/20" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Crash
                            </button>
                            <button
                                onClick={() => setEventType('BOOM')}
                                className={cn(
                                    "flex-1 py-2 rounded-lg text-xs font-black uppercase transition-all",
                                    eventType === 'BOOM' ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20" : "text-gray-400 hover:text-gray-600"
                                )}
                            >
                                Boom
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Target Asset</label>
                                <select
                                    value={selectedAssetId}
                                    onChange={(e) => setSelectedAssetId(e.target.value)}
                                    className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                                >
                                    <option value="ALL">ALL ASSETS (GLOBAL)</option>
                                    <option value="IRON">IRON</option>
                                    <option value="COPPER">COPPER</option>
                                    <option value="SILVER">SILVER</option>
                                    <option value="GOLD">GOLD</option>
                                    <option value="LITHIUM">LITHIUM</option>
                                    <option value="OIL">CRUDE OIL</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Magnitude %</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        step="0.0001"
                                        value={crashMagnitude}
                                        onChange={(e) => setCrashMagnitude(e.target.value)}
                                        className="w-full px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-xl text-sm font-black text-white outline-none focus:ring-2 ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                        placeholder="20"
                                    />
                                    <span className="absolute right-3 top-2.5 text-xs font-black text-gray-400">%</span>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleScheduleEvent}
                            disabled={crashLoading}
                            className={cn(
                                "w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-widest transition shadow-lg disabled:opacity-50 text-white",
                                eventType === 'CRASH' ? "bg-red-500 hover:bg-red-600 shadow-red-500/20" : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20"
                            )}
                        >
                            {crashLoading ? 'Scheduling...' : `Schedule ${eventType}`}
                        </button>
                    </div>
                </div>

                {/* Direct Action Sync */}
                <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800 flex flex-col h-full">
                    <div className="mb-6">
                        <div className="flex items-center gap-2 mb-1">
                            <Activity size={20} className="text-indigo-500" />
                            <h2 className="text-lg font-bold text-white">Forced System Sync</h2>
                        </div>
                        <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-sm">
                            Manually trigger the 12:00 AM Cron job. This updates all prices and processes any pending BOOM/CRASH events immediately.
                        </p>
                    </div>

                    <div className="flex flex-col gap-3 mt-auto">
                        <button
                            onClick={async () => {
                                if (!confirm('Force a market update? This will change all asset prices and add to history.')) return;
                                try {
                                    const res = await fetch('/api/market/sync', { method: 'POST' });
                                    const data = await res.json();
                                    if (res.ok) {
                                        alert('Market updated successfully!');
                                        router.refresh();
                                        fetchEventHistory();
                                        fetchAnalytics(trackerAssetId);
                                    } else {
                                        alert(`Sync failed: ${data.error || 'Unknown error'}`);
                                    }
                                } catch (e) {
                                    alert('Sync failed - Network Error');
                                }
                            }}
                            className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 text-sm shadow-md shadow-gray-900/10"
                        >
                            <RefreshCcw size={16} /> Execute Daily Sync Now
                        </button>

                        <div className="p-4 bg-red-900/20 rounded-xl border border-red-900/50 flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-red-500 uppercase tracking-wide">Danger Zone</p>
                                <p className="text-[10px] font-medium text-red-400/80">This action requires direct database access in V2.</p>
                            </div>
                            <button
                                disabled
                                className="bg-white border border-red-200 text-red-400 px-3 py-1.5 rounded-lg text-xs font-bold opacity-50 cursor-not-allowed"
                            >
                                Reset Market
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mineral Analytics */}
            <div className="bg-[#1e293b] p-6 rounded-2xl border border-gray-800">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <BarChart3 size={20} className="text-indigo-400" />
                            Asset Analytics
                        </h2>
                        <p className="text-xs text-gray-500 font-medium mt-1">Real-time lifetime performance tracking across all synchronized data points.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-900 py-1.5 px-2 rounded-xl border border-gray-800">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-2">Select</label>
                        <select
                            value={trackerAssetId}
                            onChange={(e) => setTrackerAssetId(e.target.value)}
                            className="bg-gray-800 border border-gray-700 px-3 py-1.5 rounded-lg text-xs font-bold text-white outline-none shadow-sm cursor-pointer hover:bg-gray-700 transition min-w-[120px]"
                        >
                            <option value="IRON">IRON</option>
                            <option value="COPPER">COPPER</option>
                            <option value="SILVER">SILVER</option>
                            <option value="GOLD">GOLD</option>
                            <option value="LITHIUM">LITHIUM</option>
                            <option value="OIL">CRUDE OIL</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Stats Module */}
                    <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 gap-4">
                        <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 relative overflow-hidden group">
                            <TrendingUp className="absolute -right-2 -bottom-2 text-indigo-100/50 group-hover:scale-110 transition-transform" size={80} />
                            <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1 relative z-10">All-Time High</p>
                            <p className="text-xl font-black text-indigo-950 relative z-10">
                                ₹{analyticsData?.stats?.ath?.toLocaleString(undefined, { minimumFractionDigits: 2 }) || '0.00'}
                            </p>
                        </div>
                        <div className={cn(
                            "p-5 rounded-2xl border relative overflow-hidden group",
                            (analyticsData?.stats?.lifetimeGrowth || 0) >= 0
                                ? "bg-emerald-50/50 border-emerald-100 text-emerald-950"
                                : "bg-red-50/50 border-red-100 text-red-950"
                        )}>
                            <Activity className="absolute -right-2 -bottom-2 opacity-10" size={80} />
                            <p className="text-[10px] font-black uppercase tracking-widest mb-1 opacity-60">Lifetime Growth</p>
                            <p className="text-xl font-black">
                                {(analyticsData?.stats?.lifetimeGrowth || 0).toFixed(2)}%
                            </p>
                        </div>
                        <div className="bg-gray-800/50 p-5 rounded-2xl border border-gray-700/50 relative overflow-hidden">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 relative z-10">Data Snapshots</p>
                            <p className="text-xl font-black text-white relative z-10">
                                {analyticsData?.stats?.dataPoints || 0} <span className="text-[10px] font-bold text-gray-500 lowercase ml-1">total days tracking</span>
                            </p>
                        </div>
                    </div>

                    {/* Chart Container */}
                    <div className="lg:col-span-3 h-[300px] relative bg-gray-900/50 rounded-2xl p-5 border border-gray-800/50">
                        {analyticsLoading && (
                            <div className="absolute inset-0 z-10 bg-[#1e293b]/80 flex items-center justify-center rounded-2xl">
                                <Activity className="text-indigo-500 animate-spin" size={24} />
                            </div>
                        )}

                        {!analyticsData || analyticsData.history.length === 0 ? (
                            <div className="w-full h-full flex flex-col items-center justify-center italic text-gray-400 text-sm font-medium gap-2">
                                <BarChart3 size={32} className="opacity-20 mb-1" />
                                No historical data available for {trackerAssetId}
                            </div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={analyticsData.history.map((h: any) => ({
                                    time: new Date(h.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                                    price: Number(h.price)
                                }))}>
                                    <defs>
                                        <linearGradient id="colorPriceAdmin" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
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
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }}
                                        tickFormatter={(val) => `₹${val}`}
                                        width={60}
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #374151',
                                            background: '#1e293b',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.5)',
                                            padding: '12px 16px'
                                        }}
                                        itemStyle={{ fontWeight: 800, fontSize: '14px', color: '#4f46e5' }}
                                        labelStyle={{ fontWeight: 600, color: '#9ca3af', marginBottom: '4px', fontSize: '10px', textTransform: 'uppercase' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="price"
                                        stroke="#4f46e5"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorPriceAdmin)"
                                        animationDuration={1000}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </div>
            </div>

            {/* Event History Dictionary */}
            <div className="bg-[#1e293b] rounded-2xl overflow-hidden border border-gray-800">
                <div className="p-5 border-b border-gray-800 flex justify-between items-center bg-gray-900/50">
                    <h2 className="font-bold text-white text-sm">Action History Dictionary</h2>
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Showing Last 50 Events</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Timestamp</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Event Type</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Target</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider">Mag / Force</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-center">Status</th>
                                <th className="px-5 py-3 text-[10px] font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {marketEventHistory.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-5 py-10 text-center text-sm font-medium text-gray-400 italic">No scheduled actions found.</td>
                                </tr>
                            ) : (
                                marketEventHistory.map((event) => (
                                    <tr key={event.id} className="hover:bg-gray-50/50 transition">
                                        <td className="px-5 py-3">
                                            <div className="text-xs font-bold text-white">{new Date(event.createdAt).toLocaleDateString()}</div>
                                            <div className="text-[10px] font-medium text-gray-500">{new Date(event.createdAt).toLocaleTimeString()}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={cn(
                                                "px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest",
                                                event.type === 'BOOM' ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                                            )}>
                                                {event.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 font-bold text-gray-300 text-xs">
                                            {event.assetId === 'ALL' ? 'GLOBAL MARKET' : event.assetId}
                                        </td>
                                        <td className="px-5 py-3 text-xs font-black text-white">
                                            {(Number(event.magnitude) * 100).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}%
                                        </td>
                                        <td className="px-5 py-3 text-center">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                                                event.status === 'PENDING' ? "bg-indigo-500/20 text-indigo-400 border border-indigo-500/20" :
                                                    event.status === 'EXECUTED' ? "bg-gray-800 text-gray-400" : "bg-amber-900/30 text-amber-500 border border-amber-900/50"
                                            )}>
                                                {event.status}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">
                                            {event.status === 'PENDING' && (
                                                <button
                                                    onClick={() => cancelEvent(event.id)}
                                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 transition"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                            {event.status === 'EXECUTED' && (
                                                <div className="text-[10px] font-medium text-gray-400">
                                                    Processed
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
