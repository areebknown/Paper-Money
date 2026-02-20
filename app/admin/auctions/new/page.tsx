'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Calendar, Clock, DollarSign, Trophy, AlertCircle, Check } from 'lucide-react';
import Link from 'next/link';

interface Artifact {
    id: string;
    name: string;
    description: string;
    rarity?: string; // Might be part of description in current schema, but good to have
}

export default function NewAuctionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [fetchingArtifacts, setFetchingArtifacts] = useState(true);
    const [error, setError] = useState('');

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        scheduledAt: '',
        rankTier: 'BRONZE',
        startingPrice: '',
        artifactId: '',
    });

    // Fetch artifacts on mount
    useEffect(() => {
        const fetchArtifacts = async () => {
            try {
                const res = await fetch('/api/artifacts');
                if (res.ok) {
                    const data = await res.json();
                    setArtifacts(data.artifacts || []);
                } else {
                    console.error('Failed to fetch artifacts');
                }
            } catch (err) {
                console.error('Error fetching artifacts:', err);
            } finally {
                setFetchingArtifacts(false);
            }
        };
        fetchArtifacts();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate before sending
            if (!formData.name || !formData.scheduledAt || !formData.startingPrice || !formData.artifactId) {
                setError('Please fill in all required fields.');
                setLoading(false);
                return;
            }

            const payload = {
                name: formData.name,
                description: formData.description,
                scheduledAt: new Date(formData.scheduledAt).toISOString(),
                rankTier: formData.rankTier,
                startingPrice: parseFloat(formData.startingPrice),
                artifactIds: [formData.artifactId], // Wrap in array as expected by API
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
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <Link href="/admin/auctions" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition group">
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

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Auction Title</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Weekly Legendary Vault"
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            placeholder="Describe the items and rules..."
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition resize-none h-32"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Start Time */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Calendar className="w-4 h-4" /> Start Time
                            </label>
                            <input
                                type="datetime-local"
                                value={formData.scheduledAt}
                                onChange={(e) => setFormData({ ...formData, scheduledAt: e.target.value })}
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition [color-scheme:dark]"
                                required
                            />
                        </div>

                        {/* Starting Price */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <DollarSign className="w-4 h-4" /> Starting Price
                            </label>
                            <input
                                type="number"
                                value={formData.startingPrice}
                                onChange={(e) => setFormData({ ...formData, startingPrice: e.target.value })}
                                placeholder="5000"
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Rank Requirement */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Trophy className="w-4 h-4" /> Rank Requirement
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.rankTier}
                                    onChange={(e) => setFormData({ ...formData, rankTier: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition appearance-none cursor-pointer"
                                >
                                    <option value="BRONZE">Bronze</option>
                                    <option value="SILVER">Silver</option>
                                    <option value="GOLD">Gold</option>
                                    <option value="DIAMOND">Diamond</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                            </div>
                        </div>

                        {/* Artifact Selection */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                                <Trophy className="w-4 h-4" /> Artifact
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.artifactId}
                                    onChange={(e) => setFormData({ ...formData, artifactId: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition appearance-none cursor-pointer disabled:opacity-50"
                                    required
                                    disabled={fetchingArtifacts}
                                >
                                    <option value="">Select an artifact...</option>
                                    {artifacts.map((artifact) => (
                                        <option key={artifact.id} value={artifact.id}>
                                            {artifact.name}
                                        </option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">▼</div>
                            </div>
                            {fetchingArtifacts && <p className="text-xs text-gray-500">Loading artifacts...</p>}
                            {artifacts.length === 0 && !fetchingArtifacts && (
                                <p className="text-xs text-yellow-500">⚠️ No artifacts found. Create one first.</p>
                            )}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-red-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                    >
                        {loading ? (
                            <>
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check className="w-5 h-5" />
                                Create Auction
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
