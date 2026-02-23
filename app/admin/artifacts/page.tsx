'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Package, Layers, RefreshCw, AlertCircle, Trash2 } from 'lucide-react';

interface Artifact {
    id: string;
    name: string;
    imageUrl?: string;
    basePoints: number;
    rarity?: string;
    description?: string;
}

export default function ArtifactsListPage() {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchArtifacts = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/artifacts');
            if (res.ok) {
                const data = await res.json();
                setArtifacts(data.artifacts || []);
            } else {
                setError('Failed to fetch artifacts');
            }
        } catch (err) {
            setError('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm(`Are you sure you want to PERMANENTLY delete artifact "${name}"? This will also remove it from any existing auctions.`)) {
            return;
        }

        try {
            const res = await fetch(`/api/artifacts/${id}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                alert('Artifact deleted successfully.');
                fetchArtifacts();
            } else {
                const data = await res.json();
                alert(`Failed to delete: ${data.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert('A network error occurred while deleting.');
        }
    };

    useEffect(() => {
        fetchArtifacts();
    }, []);

    return (
        <div className="px-6 py-6 min-h-screen bg-[#0a0a0a]">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-100">Manage Artifacts</h1>
                    <p className="text-gray-400 text-sm mt-1">Mint and manage your digital assets.</p>
                </div>
                <Link href="/admin/artifacts/new" className="btn btn-primary flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition shadow-lg shadow-purple-900/20">
                    <Plus className="w-5 h-5" />
                    Mint Artifact
                </Link>
            </div>

            {/* Error Banner */}
            {error && (
                <div className="mb-6 p-4 bg-red-900/20 border border-red-800 rounded-lg flex items-center justify-between text-red-200">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                    <button onClick={fetchArtifacts} className="p-2 hover:bg-red-900/40 rounded-full transition">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Artifacts Grid */}
            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="aspect-square bg-gray-900/50 rounded-xl animate-pulse" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {artifacts.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-gray-900/30 rounded-2xl border border-gray-800/50 border-dashed">
                            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                                <Package className="w-10 h-10 text-gray-600" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-300 mb-2">No Artifacts Yet</h3>
                            <p className="text-sm text-gray-500">Mint your first artifact to get started</p>
                        </div>
                    ) : (
                        artifacts.map((artifact) => (
                            <div key={artifact.id} className="group bg-gray-900/40 border border-gray-800/60 hover:border-purple-500/30 rounded-xl p-4 transition-all hover:bg-gray-900/60 flex flex-col">
                                <div className="aspect-square bg-gray-950 rounded-lg mb-4 flex items-center justify-center overflow-hidden relative border border-gray-800 group-hover:border-purple-500/20 transition-colors">
                                    {artifact.imageUrl ? (
                                        <img src={artifact.imageUrl} alt={artifact.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-4xl">🏺</div>
                                    )}
                                </div>
                                <h3 className="font-bold text-gray-100 mb-1 truncate">{artifact.name}</h3>
                                <div className="flex items-center justify-between mb-4 mt-auto">
                                    <span className="text-xs font-medium text-gray-400 bg-gray-800/50 px-2 py-1 rounded">
                                        BP: {artifact.basePoints}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <Link href={`/admin/artifacts/${artifact.id}`} className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition text-center block">
                                        Edit Details
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={(e) => handleDelete(e, artifact.id, artifact.name)}
                                        className="p-2 text-red-500 bg-red-500/10 hover:bg-red-500 hover:text-white rounded-lg transition border border-red-500/20 flex-shrink-0"
                                        title="Delete Artifact"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
