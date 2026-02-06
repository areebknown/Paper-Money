'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Image as ImageIcon, Trophy, AlertCircle, Layers, Check } from 'lucide-react';
import Link from 'next/link';

export default function NewArtifactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Form matches Prisma Schema: Name, Description, ImageUrl, BasePoints, PawnPoints, Dimensions
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        imageUrl: '',
        basePoints: '',
        pawnPoints: '',
        width: '',
        height: '',
        depth: '',
        materialSilver: '',
        materialGold: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate required
            if (!formData.name || !formData.basePoints) {
                setError('Name and Base Points are required.');
                setLoading(false);
                return;
            }

            // Construct payload matching API expectation
            const materialComposition: Record<string, number> = {};
            if (formData.materialSilver) materialComposition['silver'] = Number(formData.materialSilver);
            if (formData.materialGold) materialComposition['gold'] = Number(formData.materialGold);

            const payload = {
                name: formData.name,
                description: formData.description,
                imageUrl: formData.imageUrl,
                basePoints: Number(formData.basePoints),
                pawnPoints: formData.pawnPoints ? Number(formData.pawnPoints) : 0,
                width: formData.width ? Number(formData.width) : undefined,
                height: formData.height ? Number(formData.height) : undefined,
                depth: formData.depth ? Number(formData.depth) : undefined,
                materialComposition,
            };

            const res = await fetch('/api/artifacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (res.ok) {
                router.push('/admin/artifacts');
                router.refresh();
            } else {
                setError(data.error || data.details || 'Failed to create artifact');
            }
        } catch (e: any) {
            setError(e.message || 'Network error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="px-6 py-6 min-h-screen bg-[#0a0a0a] text-gray-100">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <Link href="/admin/artifacts" className="flex items-center gap-2 text-gray-400 hover:text-gray-200 mb-6 transition group">
                    <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Back to Artifacts
                </Link>

                <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
                    Mint New Artifact
                </h1>

                {error && (
                    <div className="mb-6 p-4 bg-red-900/30 border border-red-800 rounded-lg flex items-center gap-3 text-red-200">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Artifact Name</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ancient Vase"
                                className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-400">Image URL</label>
                            <div className="relative">
                                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="url"
                                    value={formData.imageUrl}
                                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    placeholder="https://"
                                    className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Description</label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition resize-none h-24"
                            placeholder="Lore and details..."
                        />
                    </div>

                    {/* Stats */}
                    <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4">
                        <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            Points & Value
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Base Points (BP)</label>
                                <input
                                    type="number"
                                    value={formData.basePoints}
                                    onChange={(e) => setFormData({ ...formData, basePoints: e.target.value })}
                                    placeholder="1000"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                    required
                                />
                                <p className="text-xs text-gray-500">Fundamental value of the item.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-400">Pawn Points (Optional)</label>
                                <input
                                    type="number"
                                    value={formData.pawnPoints}
                                    onChange={(e) => setFormData({ ...formData, pawnPoints: e.target.value })}
                                    placeholder="500"
                                    className="w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition"
                                />
                                <p className="text-xs text-gray-500">Quick-sell value at Pawn Shop.</p>
                            </div>
                        </div>
                    </div>

                    {/* Dimensions & Composition */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4">
                            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-blue-500" />
                                Dimensions
                            </h3>
                            <div className="grid grid-cols-3 gap-2">
                                <input type="number" placeholder="W" value={formData.width} onChange={e => setFormData({ ...formData, width: e.target.value })} className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm" />
                                <input type="number" placeholder="H" value={formData.height} onChange={e => setFormData({ ...formData, height: e.target.value })} className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm" />
                                <input type="number" placeholder="D" value={formData.depth} onChange={e => setFormData({ ...formData, depth: e.target.value })} className="bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm" />
                            </div>
                        </div>

                        <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl space-y-4">
                            <h3 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <Layers className="w-4 h-4 text-purple-500" />
                                Composition (Grams)
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="text-xs text-gray-500">Gold</label>
                                    <input type="number" value={formData.materialGold} onChange={e => setFormData({ ...formData, materialGold: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500">Silver</label>
                                    <input type="number" value={formData.materialSilver} onChange={e => setFormData({ ...formData, materialSilver: e.target.value })} className="w-full bg-gray-900 border border-gray-800 rounded px-3 py-2 text-sm" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                    >
                        {loading ? 'Minting...' : 'Mint Artifact'}
                    </button>
                </form>
            </div>
        </div>
    );
}
