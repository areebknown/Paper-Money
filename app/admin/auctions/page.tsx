'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Clock, TrendingUp, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

interface Auction {
    id: string;
    name: string;
    status: string;
    startingPrice: number;
    currentPrice: number;
    scheduledAt: string;
    rankTier: string;
    artifacts: {
        artifact: {
            name: string;
            rarity?: string;
        };
    }[];
}

export default function AuctionsListPage() {
    const [auctions, setAuctions] = useState<Auction[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchAuctions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/auctions');
            if (res.ok) {
                const data = await res.json();
                setAuctions(data.auctions || []);
            } else {
                setError('Failed to fetch auctions');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuctions();
    }, []);

    return (
        <div className="px-6 py-6 min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Manage Auctions</h1>
                    <p className="text-gray-400 text-sm mt-1">View and control all bidding events.</p>
                </div>
                <Link href="/admin/auctions/new" className="btn btn-primary flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition shadow-lg shadow-red-900/20">
                    <Plus className="w-5 h-5" />
                    Create Auction
                </Link>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center justify-between text-red-200">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                    <button onClick={fetchAuctions} className="p-2 hover:bg-red-900/40 rounded-full transition">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Auctions List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-32 bg-gray-900/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {auctions.length === 0 ? (
                        <div className="text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <Clock className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-300 mb-2">No Auctions Found</h3>
                            <p className="text-sm text-gray-500 mb-6">Create your first auction to get started</p>
                            <Link href="/admin/auctions/new" className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-semibold transition">
                                <Plus className="w-4 h-4" />
                                Create Auction
                            </Link>
                        </div>
                    ) : (
                        auctions.map((auction) => (
                            <div key={auction.id} className="group bg-gray-900/40 border border-gray-800/60 hover:border-red-500/30 rounded-xl p-5 transition-all hover:bg-gray-900/60">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-gray-100 group-hover:text-red-400 transition-colors">
                                                {auction.name}
                                            </h3>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold ring-1 inset-0 ${auction.status === 'LIVE' ? 'bg-green-500/10 text-green-400 ring-green-500/20' :
                                                auction.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400 ring-blue-500/20' :
                                                    auction.status === 'COMPLETED' ? 'bg-purple-500/10 text-purple-400 ring-purple-500/20' :
                                                        'bg-gray-500/10 text-gray-400 ring-gray-500/20'
                                                }`}>
                                                {auction.status}
                                            </span>
                                            <span className="px-2 py-1 rounded text-xs font-medium bg-gray-800 text-gray-400 border border-gray-700">
                                                {auction.rankTier}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-2 mb-4">
                                            {auction.artifacts.map((a, i) => (
                                                <span key={i} className="text-sm text-gray-400 flex items-center gap-2 bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-800">
                                                    <span className="w-2 h-2 rounded-full bg-yellow-500/50" />
                                                    {a.artifact.name}
                                                    {a.artifact.rarity && <span className="text-xs text-yellow-500/70">({a.artifact.rarity})</span>}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-center gap-6 text-sm">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-300">Start: <span className="font-mono text-red-300">₹{auction.startingPrice.toLocaleString()}</span></span>
                                            </div>
                                            {auction.status === 'LIVE' && (
                                                <div className="flex items-center gap-2">
                                                    <CheckCircle className="w-4 h-4 text-green-400" />
                                                    <span className="text-green-400 font-bold">Current: ₹{auction.currentPrice.toLocaleString()}</span>
                                                </div>
                                            )}
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-gray-500" />
                                                <span className="text-gray-400 text-xs">
                                                    {new Date(auction.scheduledAt).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {auction.status === 'SCHEDULED' && (
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();

                                                    console.log('[ADMIN] ========== START BUTTON CLICKED ==========');
                                                    console.log('[ADMIN] Auction:', auction.name, auction.id);

                                                    if (!confirm(`Start "${auction.name}" immediately?`)) {
                                                        console.log('[ADMIN] User cancelled');
                                                        return;
                                                    }

                                                    const btn = e.currentTarget;
                                                    btn.innerText = 'Starting...';
                                                    btn.disabled = true;

                                                    try {
                                                        console.log('[ADMIN] Sending POST to /api/auctions/' + auction.id + '/start');
                                                        const res = await fetch(`/api/auctions/${auction.id}/start`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' }
                                                        });

                                                        console.log('[ADMIN] Response status:', res.status);
                                                        const data = await res.json();
                                                        console.log('[ADMIN] Response data:', data);

                                                        if (res.ok && data.success) {
                                                            console.log('[ADMIN] ✅ SUCCESS! Refreshing list...');
                                                            await fetchAuctions();
                                                            alert('✅ Auction started!');
                                                        } else {
                                                            console.error('[ADMIN] ❌ API Error:', data);
                                                            alert(`Failed: ${data.error || 'Unknown error'}`);
                                                        }
                                                    } catch (err) {
                                                        console.error('[ADMIN] 💥 Network error:', err);
                                                        alert('Network error - check console');
                                                    } finally {
                                                        btn.innerText = 'Start Now';
                                                        btn.disabled = false;
                                                    }
                                                }}
                                                className="px-4 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-lg shadow-green-900/20 border-2 border-transparent hover:border-white"
                                            >
                                                Start Now
                                            </button>
                                        )}
                                        {auction.status === 'LIVE' && (
                                            <button
                                                type="button"
                                                onClick={async (e) => {
                                                    e.stopPropagation();
                                                    e.preventDefault();

                                                    console.log('[ADMIN] ========== END BUTTON CLICKED ==========');
                                                    console.log('[ADMIN] Auction:', auction.name, auction.id);

                                                    if (!confirm(`End "${auction.name}" now?`)) {
                                                        console.log('[ADMIN] User cancelled');
                                                        return;
                                                    }

                                                    const btn = e.currentTarget;
                                                    btn.innerText = 'Ending...';
                                                    btn.disabled = true;

                                                    try {
                                                        console.log('[ADMIN] Sending POST to /api/auctions/' + auction.id + '/end');
                                                        const res = await fetch(`/api/auctions/${auction.id}/end`, {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' }
                                                        });

                                                        console.log('[ADMIN] Response status:', res.status);
                                                        const data = await res.json();
                                                        console.log('[ADMIN] Response data:', data);

                                                        if (res.ok && data.success) {
                                                            console.log('[ADMIN] ✅ SUCCESS! Refreshing list...');
                                                            await fetchAuctions();
                                                            alert('✅ Auction ended!');
                                                        } else {
                                                            console.error('[ADMIN] ❌ API Error:', data);
                                                            alert(`Failed: ${data.error || data.message || 'Unknown error'}`);
                                                        }
                                                    } catch (err) {
                                                        console.error('[ADMIN] 💥 Network error:', err);
                                                        alert('Network error - check console');
                                                    } finally {
                                                        btn.innerText = 'End Now';
                                                        btn.disabled = false;
                                                    }
                                                }}
                                                className="px-4 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition shadow-lg shadow-red-900/20"
                                            >
                                                End Now
                                            </button>
                                        )}
                                        <Link href={`/admin/auctions/${auction.id}`} className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition">
                                            Edit
                                        </Link>
                                        <Link href={`/bid/${auction.id}`} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition shadow-lg shadow-red-900/20">
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
