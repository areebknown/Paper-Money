'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, DollarSign, Trophy, AlertCircle, Check, Search, Package, Loader2 } from 'lucide-react';
import Link from 'next/link';

interface Artifact {
    id: string;
    productId: number;
    name: string;
    imageUrl?: string;
    basePoints: number;
    tier: string;
}

export default function NewAuctionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Artifact Picker State
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [fetchingArtifacts, setFetchingArtifacts] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: 'SHUTTER #',
        scheduledAt: '',
        rankTier: 'BRONZE',
        startingPrice: '',
        artifactIds: [] as string[],
    });

    const fetchArtifacts = useCallback(async (pageNum: number, search: string, append: boolean = false) => {
        setFetchingArtifacts(true);
        try {
            const res = await fetch(`/api/artifacts?available=true&limit=15&page=${pageNum}&search=${encodeURIComponent(search)}`);
            if (res.ok) {
                const data = await res.json();
                const fetched: Artifact[] = data.artifacts || [];
                if (append) {
                    setArtifacts(prev => [...prev, ...fetched]);
                } else {
                    setArtifacts(fetched);
                }
                setHasMore(fetched.length === 15);
            }
        } catch (err) {
            console.error('Error fetching artifacts:', err);
        } finally {
            setFetchingArtifacts(false);
        }
    }, []);

    useEffect(() => {
        // Debounce search
        const timer = setTimeout(() => {
            setPage(1);
            fetchArtifacts(1, searchQuery, false);
        }, 400);
        return () => clearTimeout(timer);
    }, [searchQuery, fetchArtifacts]);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchArtifacts(nextPage, searchQuery, true);
    };

    const toggleArtifact = (id: string) => {
        setFormData(prev => {
            if (prev.artifactIds.includes(id)) {
                return { ...prev, artifactIds: prev.artifactIds.filter(aId => aId !== id) };
            } else {
                if (prev.artifactIds.length >= 10) {
                    setError('You can only select up to 10 artifacts.');
                    return prev;
                }
                setError('');
                return { ...prev, artifactIds: [...prev.artifactIds, id] };
            }
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (!formData.name || !formData.scheduledAt || !formData.startingPrice || formData.artifactIds.length === 0) {
                setError('Please fill in all required fields and select at least one artifact.');
                setLoading(false);
                return;
            }

            const localDate = new Date(formData.scheduledAt);

            const payload = {
                name: formData.name,
                rankTier: formData.rankTier,
                scheduledAt: localDate.toISOString(),
                startingPrice: parseFloat(formData.startingPrice),
                artifactIds: formData.artifactIds,
            };

            const res = await fetch('/api/auctions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin/auctions');
                router.refresh();
            } else {
                setError(data.error || data.details || 'Failed to create auction');
            }
        } catch (e: any) {
            setError(e.message || 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 py-6 min-h-screen bg-[#0a0a0a] text-gray-100">
            <div className="max-w-4xl mx-auto">
                <Link href="/admin/auctions" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition group w-fit">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Auctions
                </Link>

                <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500">
                    Create New Auction
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-3 text-red-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">

                    {/* Core Inputs Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-gray-900/50 border border-gray-800 rounded-2xl">
                        {/* Title */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Auction Title</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition uppercase font-bold tracking-wide"
                                required
                            />
                        </div>

                        {/* Starting Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-500" /> Starting Price (₹)
                            </label>
                            <input
                                type="number"
                                value={formData.startingPrice}
                                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                                placeholder="e.g. 50000"
                                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition font-['Russo_One'] text-yellow-400 text-lg"
                                required
                            />
                        </div>

                        {/* Rank Requirement */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-yellow-500" /> Rank Requirement
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.rankTier}
                                    onChange={(e) => setFormData({ ...formData, rankTier: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition appearance-none cursor-pointer"
                                >
                                    <option value="BRONZE">Bronze</option>
                                    <option value="SILVER">Silver</option>
                                    <option value="GOLD">Gold</option>
                                    <option value="DIAMOND">Diamond</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                            </div>
                        </div>

                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-blue-400" /> Schedule Start (IST)
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledAt}
                                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-950 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition [color-scheme:dark] text-gray-200 cursor-pointer"
                                required
                            />
                        </div>
                    </div>

                    {/* Artifact Selection Area */}
                    <div className="space-y-4 p-6 bg-gray-900/40 border border-gray-800 rounded-2xl">
                        <label className="text-sm font-bold text-gray-300 flex items-center justify-between pb-2 border-b border-gray-800">
                            <span className="flex items-center gap-2">
                                <Package className="w-5 h-5 text-purple-500" />
                                Include Artifacts (Select 1 to 10)
                            </span>
                            <span className={`text-sm font-bold px-3 py-1 rounded bg-gray-950 border ${formData.artifactIds.length > 0 ? 'text-green-400 border-green-900' : 'text-gray-500 border-gray-800'}`}>
                                {formData.artifactIds.length} Selected
                            </span>
                        </label>

                        <div className="relative max-w-sm mb-6">
                            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by PID (10001) or Name..."
                                className="w-full pl-10 pr-4 py-3 bg-black border border-gray-800 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition shadow-inner"
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                            {artifacts.map(a => {
                                const isSelected = formData.artifactIds.includes(a.id);
                                return (
                                    <div
                                        key={a.id}
                                        onClick={() => toggleArtifact(a.id)}
                                        className={`cursor-pointer rounded-xl border p-2 transition-all flex flex-col group relative overflow-hidden ${isSelected ? 'border-green-500 bg-green-500/10 scale-105 shadow-xl shadow-green-900/20' : 'border-gray-800 bg-gray-950 hover:border-purple-500/50'}`}
                                    >
                                        <div className="aspect-square rounded-lg bg-[#111] mb-2 flex flex-col items-center justify-center relative overflow-hidden">
                                            {a.imageUrl ? <img src={a.imageUrl} alt={a.name} className={`w-full h-full object-cover transition duration-300 ${isSelected ? 'opacity-50' : 'group-hover:scale-110'}`} /> : <Package className="w-8 h-8 text-gray-700" />}
                                            {isSelected && (
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="bg-green-500 text-black p-2 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.5)]">
                                                        <Check className="w-6 h-6 stroke-[3]" />
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-[10px] text-gray-500 font-mono mb-0.5">#{a.productId || 'SYS'}</div>
                                        <div className="text-xs font-bold text-gray-200 truncate pr-6">{a.name}</div>
                                        <div className="mt-1 flex items-center justify-between">
                                            <span className="text-[10px] bg-purple-900/30 text-purple-400 border border-purple-800/50 px-1.5 py-0.5 rounded font-bold">Tier {a.tier || 'E'}</span>
                                        </div>
                                        {/* Corner selection indicator */}
                                        <div className={`absolute top-1 right-1 w-4 h-4 rounded-full border flex items-center justify-center transition ${isSelected ? 'bg-green-500 border-green-400' : 'bg-transparent border-gray-700'}`}>
                                            {isSelected && <Check className="w-3 h-3 text-black stroke-[4]" />}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {artifacts.length === 0 && !fetchingArtifacts && (
                            <div className="text-center py-10 text-gray-500 bg-black rounded-lg border border-gray-800 border-dashed">
                                No available artifacts match your search.
                            </div>
                        )}

                        {fetchingArtifacts && (
                            <div className="flex justify-center py-6">
                                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
                            </div>
                        )}

                        {hasMore && !fetchingArtifacts && artifacts.length > 0 && (
                            <button type="button" onClick={loadMore} className="w-full mt-2 py-3 bg-gray-950 hover:bg-gray-900 border border-gray-800 rounded-lg text-gray-300 font-medium transition text-sm flex items-center justify-center gap-2">
                                <ChevronLeft className="w-4 h-4 -rotate-90" /> Load More Artifacts
                            </button>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading || formData.artifactIds.length === 0}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-5 rounded-2xl font-black tracking-wider text-xl shadow-lg hover:shadow-red-900/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 uppercase"
                    >
                        {loading ? (
                            <><Loader2 className="w-6 h-6 animate-spin" /> Preparing Shutter...</>
                        ) : (
                            <><Gavel className="w-6 h-6" /> Deploy Auction</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}

// Inline Gavel simple SVG since lucide import above is incomplete or missing Gavel from list
// Note: Changed Check to Gavel
function Gavel(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="m14 13-7.5 7.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L11 10" />
            <path d="m16 16 6-6" />
            <path d="m8 8 6-6" />
            <path d="m9 7 8 8" />
            <path d="m21 11-8-8" />
        </svg>
    )
}
