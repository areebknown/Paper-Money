'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Image as ImageIcon, Trophy, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function NewArtifactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        rarity: 'COMMON',
        basePrice: '',
        marketPrice: '',
        displayPrice: '',
        pawnShopPrice: '',
    });

    const total Value =
        parseFloat(formData.basePrice || '0') +
        parseFloat(formData.marketPrice || '0') +
        parseFloat(formData.displayPrice || '0') +
        parseFloat(formData.pawnShopPrice || '0');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/artifacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    basePrice: parseFloat(formData.basePrice),
                    marketPrice: parseFloat(formData.marketPrice),
                    displayPrice: parseFloat(formData.displayPrice),
                    pawnShopPrice: parseFloat(formData.pawnShopPrice),
                }),
            });

            if (res.ok) {
                alert('Artifact created successfully!');
                router.push('/admin/artifacts');
            } else {
                const data = await res.json();
                alert(data.error || 'Failed to create artifact');
            }
        } catch (e) {
            alert('Network error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 py-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <Link href="/admin/artifacts" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition">
                    <ChevronLeft className="w-4 h-4" />
                    Back to Artifacts
                </Link>

                <h1 className="text-2xl font-bold text-gray-100 mb-6">Create New Artifact</h1>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Artifact Name</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ancient Vase"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    {/* Description */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500 resize-none"
                            rows={4}
                            placeholder="Describe the artifact..."
                            required
                        />
                    </div>

                    {/* Image URL */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            <ImageIcon className="w-4 h-4 inline mr-2" />
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            placeholder="https://example.com/artifact.jpg"
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    {/* Rarity */}
                    <div className="card">
                        <label className="block text-sm font-semibold text-gray-300 mb-2">
                            <Trophy className="w-4 h-4 inline mr-2" />
                            Rarity
                        </label>
                        <select
                            value={formData.rarity}
                            onChange={(e) => setFormData({ ...formData, rarity: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                        >
                            <option value="COMMON">Common</option>
                            <option value="RARE">Rare</option>
                            <option value="EPIC">Epic</option>
                            <option value="LEGENDARY">Legendary</option>
                        </select>
                    </div>

                    {/* Prices Grid */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="card">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Base Price (BP)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    value={formData.basePrice}
                                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                    placeholder="5000"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="card">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Market Price (MP)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    value={formData.marketPrice}
                                    onChange={(e) => setFormData({ ...formData, marketPrice: e.target.value })}
                                    placeholder="3000"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="card">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Display Price (DP)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    value={formData.displayPrice}
                                    onChange={(e) => setFormData({ ...formData, displayPrice: e.target.value })}
                                    placeholder="1500"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="card">
                            <label className="block text-sm font-semibold text-gray-300 mb-2">Pawn Shop Price (PSP)</label>
                            <div className="relative">
                                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="number"
                                    value={formData.pawnShopPrice}
                                    onChange={(e) => setFormData({ ...formData, pawnShopPrice: e.target.value })}
                                    placeholder="500"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 outline-none focus:ring-2 focus:ring-red-500"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Total Value Display */}
                    <div className="card bg-green-500/10 border-green-500/20">
                        <div className="flex items-center justify-between">
                            <span className="text-sm font-semibold text-green-400">Total Artifact Value</span>
                            <span className="text-2xl font-bold text-green-400">₹{totalValue.toLocaleString()}</span>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-red-600 text-white py-4 rounded-lg font-bold text-lg hover:bg-red-700 transition disabled:opacity-50"
                    >
                        {loading ? 'Creating...' : 'Create Artifact'}
                    </button>
                </form>
            </div>
        </div>
    );
}
