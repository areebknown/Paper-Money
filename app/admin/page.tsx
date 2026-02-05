'use client';

import React from 'react';
import { Users, Gavel, Package, FileText, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    // Mock stats
    const stats = {
        totalUsers: 1247,
        activeAuctions: 5,
        totalArtifacts: 38,
        activeContracts: 12,
    };

    const recentActivity = [
        { id: '1', type: 'bid', user: 'user123', message: 'Placed bid on Shutter #127', time: '2 mins ago' },
        { id: '2', type: 'win', user: 'player456', message: 'Won Ancient Vase', time: '15 mins ago' },
        { id: '3', type: 'signup', user: 'newbie789', message: 'New user registered', time: '1 hour ago' },
    ];

    return (
        <div className="px-6 py-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard
                    icon={<Users className="w-6 h-6 text-blue-400" />}
                    label="Total Users"
                    value={stats.totalUsers.toString()}
                    bgColor="bg-blue-500/10"
                />
                <StatCard
                    icon={<Gavel className="w-6 h-6 text-green-400" />}
                    label="Active Auctions"
                    value={stats.activeAuctions.toString()}
                    bgColor="bg-green-500/10"
                />
                <StatCard
                    icon={<Package className="w-6 h-6 text-purple-400" />}
                    label="Total Artifacts"
                    value={stats.totalArtifacts.toString()}
                    bgColor="bg-purple-500/10"
                />
                <StatCard
                    icon={<FileText className="w-6 h-6 text-yellow-400" />}
                    label="Active Contracts"
                    value={stats.activeContracts.toString()}
                    bgColor="bg-yellow-500/10"
                />
            </div>

            {/* Quick Actions */}
            <div className="card mb-8">
                <h2 className="text-lg font-bold text-gray-100 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                    <Link href="/admin/auctions/new" className="btn btn-primary py-4">
                        <Gavel className="w-5 h-5" />
                        Create Auction
                    </Link>
                    <Link href="/admin/artifacts/new" className="btn btn-secondary py-4">
                        <Package className="w-5 h-5" />
                        Add Artifact
                    </Link>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="card">
                <h2 className="text-lg font-bold text-gray-100 mb-4">Recent Activity</h2>
                <div className="space-y-3">
                    {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                            <div className="w-2 h-2 bg-green-400 rounded-full mt-2" />
                            <div className="flex-1">
                                <p className="text-sm text-gray-100">{activity.message}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {activity.user} •{activity.time}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon, label, value, bgColor }: {
    icon: React.ReactNode;
    label: string;
    value: string;
    bgColor: string;
}) {
    return (
        <div className="card">
            <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center mb-3`}>
                {icon}
            </div>
            <div className="text-3xl font-bold text-gray-100 mb-1">{value}</div>
            <div className="text-sm text-gray-400">{label}</div>
        </div>
    );
}
