'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Package, SlidersHorizontal, TrendingUp, Calendar } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import ArtifactCard from '@/components/ArtifactCard';

type SortOption = 'date' | 'value' | 'name';
type FilterOption = 'ALL' | 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';

export default function InventoryPage() {
    const [sortBy, setSortBy] = useState<SortOption>('date');
    const [filterBy, setFilterBy] = useState<FilterOption>('ALL');

    // Mock inventory data
    const inventoryItems = [
        {
            id: '1',
            name: 'Ancient Vase',
            imageUrl: '/artifacts/vase.jpg',
            rarity: 'RARE' as const,
            currentValue: 15000,
            acquiredDate: '2024-01-15',
        },
        {
            id: '2',
            name: 'Gold Coin',
            imageUrl: '/artifacts/coin.jpg',
            rarity: 'EPIC' as const,
            currentValue: 25000,
            acquiredDate: '2024-01-20',
        },
        {
            id: '3',
            name: 'Antique Watch',
            imageUrl: '/artifacts/watch.jpg',
            rarity: 'LEGENDARY' as const,
            currentValue: 50000,
            acquiredDate: '2024-01-25',
        },
    ];

    const totalValue = inventoryItems.reduce((sum, item) => sum + item.currentValue, 0);

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-[200] bg-slate-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-xl font-bold text-gray-100">My Inventory</h1>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition">
                        <SlidersHorizontal className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Stats Bar */}
                <div className="flex gap-3">
                    <div className="flex-1 card p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <Package className="w-4 h-4 text-cyan-500" />
                            <span className="text-xs text-gray-400">Total Items</span>
                        </div>
                        <span className="text-lg font-bold text-gray-100">{inventoryItems.length}</span>
                    </div>
                    <div className="flex-1 card p-3">
                        <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-500" />
                            <span className="text-xs text-gray-400">Total Value</span>
                        </div>
                        <span className="text-lg font-bold text-gray-100">₹{totalValue.toLocaleString()}</span>
                    </div>
                </div>
            </header>

            {/* Content */}
            <main className="px-6 py-4">
                {/* Filters */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {(['ALL', 'COMMON', 'RARE', 'EPIC', 'LEGENDARY'] as FilterOption[]).map((filter) => (
                        <button
                            key={filter}
                            onClick={() => setFilterBy(filter)}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${filterBy === filter
                                    ? 'bg-cyan-500 text-white'
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>

                {/* Inventory Grid */}
                {inventoryItems.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {inventoryItems.map((item) => (
                            <div key={item.id} className="card cursor-pointer hover:shadow-xl transition-all">
                                <div className="aspect-square bg-gray-800 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                                    <div className="text-4xl">🏺</div>
                                </div>
                                <h3 className="font-bold text-gray-100 mb-1 text-sm">{item.name}</h3>
                                <div className="flex items-center justify-between">
                                    <span className={`text-xs font-semibold ${item.rarity === 'LEGENDARY' ? 'text-yellow-400' :
                                            item.rarity === 'EPIC' ? 'text-purple-400' :
                                                item.rarity === 'RARE' ? 'text-blue-400' :
                                                    'text-gray-400'
                                        }`}>
                                        {item.rarity}
                                    </span>
                                    <span className="text-xs text-gray-400">₹{item.currentValue.toLocaleString()}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState />
                )}
            </main>

            <BottomNav />
        </div>
    );
}

function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Package className="w-10 h-10 text-gray-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-300 mb-2">No Artifacts Yet</h3>
            <p className="text-sm text-gray-500 mb-6 max-w-xs">
                Win auctions to start building your collection
            </p>
            <button className="btn btn-primary">
                Browse Auctions
            </button>
        </div>
    );
}
