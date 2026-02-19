'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Trophy, AlertCircle, Layers, Upload, X, ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function NewArtifactPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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

    // Image upload state
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');
    const [preview, setPreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Show preview immediately (local blob)
        const localUrl = URL.createObjectURL(file);
        setPreview(localUrl);
        setUploadState('uploading');
        setError('');

        try {
            const fd = new FormData();
            fd.append('file', file);
            fd.append('folder', 'artifacts');

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: fd,
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await res.json();
            setFormData(prev => ({ ...prev, imageUrl: data.url }));
            setUploadState('done');
        } catch (err: any) {
            setUploadState('error');
            setError(`Image upload failed: ${err.message}`);
        }
    };

    const clearImage = () => {
        setPreview(null);
        setUploadState('idle');
        setFormData(prev => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (uploadState === 'uploading') { setError('Please wait for the image to finish uploading.'); return; }
        setLoading(true);
        setError('');

        try {
            if (!formData.name || !formData.basePoints) {
                setError('Name and Base Points are required.');
                setLoading(false);
                return;
            }

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

    const inputCls = 'w-full px-4 py-3 bg-gray-900 border border-gray-800 rounded-lg focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none transition';

    return (
        <div className="px-6 py-6 min-h-screen bg-[#0a0a0a] text-gray-100">
            <div className="max-w-3xl mx-auto">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Name */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400">Artifact Name *</label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ancient Vase"
                            className={inputCls}
                            required
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-400 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            Artifact Image
                        </label>

                        {!preview ? (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className="border-2 border-dashed border-gray-700 hover:border-purple-500 rounded-xl p-10 text-center cursor-pointer transition group"
                            >
                                <Upload className="w-10 h-10 text-gray-600 group-hover:text-purple-400 mx-auto mb-3 transition" />
                                <p className="text-gray-400 group-hover:text-gray-200 transition font-medium">Click to upload image</p>
                                <p className="text-xs text-gray-600 mt-1">PNG, JPG, WEBP — auto-converted to WebP & compressed by Cloudinary</p>
                            </div>
                        ) : (
                            <div className="relative rounded-xl overflow-hidden border border-gray-800">
                                {/* Preview */}
                                <img src={preview} alt="Preview" className="w-full h-52 object-cover" />

                                {/* Status overlay */}
                                {uploadState === 'uploading' && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center gap-2">
                                        <Loader2 className="w-6 h-6 text-purple-400 animate-spin" />
                                        <span className="text-white font-semibold">Uploading to Cloudinary...</span>
                                    </div>
                                )}
                                {uploadState === 'done' && (
                                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-green-900/80 border border-green-600 rounded-full px-3 py-1">
                                        <CheckCircle2 className="w-4 h-4 text-green-400" />
                                        <span className="text-green-300 text-xs font-bold">Uploaded to Cloudinary ✓</span>
                                    </div>
                                )}

                                {/* Remove button */}
                                <button
                                    type="button"
                                    onClick={clearImage}
                                    className="absolute top-2 right-2 w-8 h-8 bg-black/70 hover:bg-red-900/80 rounded-full flex items-center justify-center transition"
                                >
                                    <X className="w-4 h-4 text-white" />
                                </button>
                            </div>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    {/* Description */}
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
                                <label className="text-sm font-medium text-gray-400">Base Points (BP) *</label>
                                <input
                                    type="number"
                                    value={formData.basePoints}
                                    onChange={(e) => setFormData({ ...formData, basePoints: e.target.value })}
                                    placeholder="1000"
                                    className={inputCls}
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
                                    className={inputCls}
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

                    <button
                        type="submit"
                        disabled={loading || uploadState === 'uploading'}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
                    >
                        {loading ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Minting...</>
                        ) : uploadState === 'uploading' ? (
                            <><Loader2 className="w-5 h-5 animate-spin" /> Uploading Image...</>
                        ) : (
                            'Mint Artifact'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
