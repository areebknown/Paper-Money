'use client';

import React from 'react';
import Link from 'next/link';
import { Plus, Clock, TrendingUp, CheckCircle } from 'lucide-react';

export default function AuctionsListPage() {
    // Mock data
    const auctions = [
        {
            id: '1',
            title: 'Shutter #127',
            status: 'LIVE',
            startingPrice: 10000,
            currentBid: 15000,
            startsAt: new Date('2024-02-10T14:00:00'),
            artifact: { name: 'Ancient Vase', rarity: 'RARE' },
        },
        {
            id: '2',
            title: 'Shutter #128',
            status: 'SCHEDULED',
            startingPrice: 20000,
            currentBid: 0,
            startsAt: new Date('2024-02-12T16:00:00'),
            artifact: { name: 'Gold Coin', rarity: 'EPIC' },
        },
    ];

    return (
        <div className="px-6 py-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-100">Manage Auctions</h1>
                <Link href="/admin/auctions/new" className="btn btn-primary flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    Create Auction
                </Link>
            </div>

            {/* Auctions List */}
            <div className="space-y-4">
                {auctions.map((auction) => (
                    <div key={auction.id} className="card hover:shadow-lg transition-all cursor-pointer">
                        <div className="flex items-start justify-between">
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-lg font-bold text-gray-100">{auction.title}</h3>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${auction.status === 'LIVE' ? 'bg-green-500/10 text-green-400' :
                                            auction.status === 'SCHEDULED' ? 'bg-blue-500/10 text-blue-400' :
                                                'bg-gray-500/10 text-gray-400'
                                        }`}>
                                        {auction.status}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">
                                    {auction.artifact.name} • {auction.artifact.rarity}
                                </p>
                                <div className="flex items-center gap-6 text-sm">
                                    <div className="flex items-center gap-2">
                                        <TrendingUp className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-300">Start: ₹{auction.startingPrice.toLocaleString()}</span>
                                    </div>
                                    {auction.status === 'LIVE' && (
                                        <div className="flex items-center gap-2">
                                            <CheckCircle className="w-4 h-4 text-green-400" />
                                            <span className="text-green-400 font-bold">Current: ₹{auction.currentBid.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-gray-500" />
                                        <span className="text-gray-400 text-xs">
                                            {auction.startsAt.toLocaleDateString()} {auction.startsAt.toLocaleTimeString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Link href={`/admin/auctions/${auction.id}`} className="btn btn-secondary px-4 py-2 text-sm">
                                    Edit
                                </Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {auctions.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-4 mx-auto">
                        <Clock className="w-10 h-10 text-gray-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-300 mb-2">No Auctions Yet</h3>
                    <p className="text-sm text-gray-500 mb-6">Create your first auction to get started</p>
                    <Link href="/admin/auctions/new" className="btn btn-primary inline-flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Create Auction
                    </Link>
                </div>
            )}
        </div>
    );
}
