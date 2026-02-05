'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Package } from 'lucide-react';

export default function ArtifactsListPage() {
    // Mock data
    const artifacts = [
        {
            id: '1',
            name: 'Ancient Vase',
            rarity: 'RARE',
            totalValue: 10000,
            imageUrl: '/artifacts/vase.jpg',
        },
        {
            id: '2',
            name: 'Gold Coin',
            rarity: 'EPIC',
            totalValue: 25000,
            imageUrl: '/artifacts/coin.jpg',
        },
        {
            id: '3',
            name: 'Antique Watch',
            rarity: 'LEGENDARY',
            totalValue: 50000,
            imageUrl: '/artifacts/watch.jpg',
        },
    ];

    return (
        <div className="px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-100">Manage Artifacts</h1>
                <Link href="/admin/artifacts/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Add Artifact
                </Link>
            </div>

            {/* Artifacts Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {artifacts.map((artifact) => (
                    <div key={artifact.id} className="card hover:shadow-lg transition-all cursor-pointer">
                        <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                            <div className="text-4xl">🏺</div>
                        </div>
                        <h3 className="font-bold text-gray-100 mb-1">{artifact.name}</h3>
                        <div className="flex items-center justify-between mb-3">
                            <span className={`text-xs font-bold ${artifact.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                                    artifact.rarity === 'EPIC' ? 'text-purple-400' :
                                        artifact.rarity === 'RARE' ? 'text-blue-400' :
                                            'text-gray-400'
                                }`}>
                                {artifact.rarity}
                            </span>
                            <span className="text-xs text-gray-400">₹{artifact.totalValue.toLocaleString()}</span>
                        </div>
                        <Link href={`/admin/artifacts/${artifact.id}`} className="btn btn-secondary w-full text-xs py-2">
                            Edit
                        </Link>
                    </div>
                ))}
            </div>

            {artifacts.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Package className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No Artifacts Yet</h3>
                    <p className="text-sm text-gray-500 mb-6">Add your first artifact to get started</p>
                    <Link href="/admin/artifacts/new" className="btn btn-primary inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Add Artifact
                    </Link>
                </div>
            )}
        </div>
    );
}
