'use client';

import React from 'react';
import { User, TrendingUp, Award, ShoppingBag, Settings, LogOut, ChevronRight, Edit } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import RankBadge from '@/components/RankBadge';

export default function ProfilePage() {
    // Mock user data
    const userData = {
        username: 'bidmaster123',
        email: 'user@example.com',
        memberSince: new Date('2024-01-01'),
        balance: 34000,
        rankPoints: 340,
        rankTier: 'GOLD' as const,
        stats: {
            totalBids: 47,
            auctionsWon: 12,
            totalSpent: 450000,
            winRate: 25.5,
        },
    };

    const rankProgress = (userData.rankPoints % 500) / 500 * 100; // Assuming 500 points per tier

    return (
        <div className="min-h-screen bg-slate-950 pb-24">
            {/* Header */}
            <header className="sticky top-0 z-[200] bg-slate-900 border-b border-gray-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-100">Profile</h1>
                    <button className="p-2 hover:bg-gray-800 rounded-lg transition">
                        <Settings className="w-5 h-5 text-gray-400" />
                    </button>
                </div>
            </header>

            {/* Content */}
            <main className="px-6 py-6">
                {/* Profile Header */}
                <div className="card text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-100 mb-1">{userData.username}</h2>
                    <p className="text-sm text-gray-400 mb-3">{userData.email}</p>
                    <p className="text-xs text-gray-500">
                        Member since {userData.memberSince.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </p>
                    <button className="mt-4 btn btn-secondary w-full flex items-center justify-center gap-2">
                        <Edit className="w-4 h-4" />
                        Edit Profile
                    </button>
                </div>

                {/* Rank Progress */}
                <div className="card mb-6">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-300">Current Rank</span>
                        <RankBadge tier={userData.rankTier} size="sm" />
                    </div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-gray-500">{userData.rankPoints} pts</span>
                        <span className="text-xs text-gray-500">{userData.rankPoints + (500 - (userData.rankPoints % 500))} pts</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 transition-all duration-500"
                            style={{ width: `${rankProgress}%` }}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                        {500 - (userData.rankPoints % 500)} points to next tier
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5 text-blue-400" />}
                        label="Total Bids"
                        value={userData.stats.totalBids.toString()}
                    />
                    <StatCard
                        icon={<Award className="w-5 h-5 text-yellow-400" />}
                        label="Auctions Won"
                        value={userData.stats.auctionsWon.toString()}
                    />
                    <StatCard
                        icon={<ShoppingBag className="w-5 h-5 text-purple-400" />}
                        label="Total Spent"
                        value={`₹${(userData.stats.totalSpent / 1000).toFixed(0)}K`}
                    />
                    <StatCard
                        icon={<TrendingUp className="w-5 h-5 text-green-400" />}
                        label="Win Rate"
                        value={`${userData.stats.winRate}%`}
                    />
                </div>

                {/* Quick Actions */}
                <div className="space-y-2 mb-6">
                    <ActionButton icon={<ShoppingBag />} label="Transaction History" />
                    <ActionButton icon={<Award />} label="Achievements" />
                    <ActionButton icon={<Settings />} label="Settings" />
                </div>

                {/* Logout */}
                <button className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-red-500/20 transition">
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </main>

            <BottomNav />
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="card text-center">
            <div className="flex justify-center mb-2">{icon}</div>
            <div className="text-2xl font-bold text-gray-100 mb-1">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}

function ActionButton({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <button className="w-full card p-4 flex items-center justify-between hover:shadow-lg transition-all">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-gray-400">
                    {icon}
                </div>
                <span className="text-sm font-semibold text-gray-100">{label}</span>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
    );
}
