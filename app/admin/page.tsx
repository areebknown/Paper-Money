'use client';

import React from 'react';
import { Users, Gavel, Package, FileText, Plus, TrendingUp, Shield } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-10">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-orange-500 mb-2">
                    Command Center
                </h1>
                <p className="text-gray-400">Manage your Bid Wars empire.</p>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <QuickActionCard
                    href="/admin/auctions/new"
                    icon={<Gavel className="w-8 h-8 text-red-400" />}
                    title="Create Auction"
                    description="Schedule a new bidding event."
                    gradient="from-red-900/40 to-red-900/10"
                    borderColor="border-red-800/50"
                />
                <QuickActionCard
                    href="/admin/artifacts/new"
                    icon={<Package className="w-8 h-8 text-purple-400" />}
                    title="Mint Artifact"
                    description="Create new rare items."
                    gradient="from-purple-900/40 to-purple-900/10"
                    borderColor="border-purple-800/50"
                />
                <QuickActionCard
                    href="/admin/contracts"
                    icon={<FileText className="w-8 h-8 text-blue-400" />}
                    title="Manage Contracts"
                    description="View player agreements."
                    gradient="from-blue-900/40 to-blue-900/10"
                    borderColor="border-blue-800/50"
                />
            </div>

            {/* Stats Overview */}
            <h2 className="text-xl font-bold text-gray-200 mb-6 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                Live Overview
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard
                    icon={<Users className="w-5 h-5 text-blue-400" />}
                    label="Total Users"
                    value="1,247"
                    trend="+12%"
                />
                <StatCard
                    icon={<Gavel className="w-5 h-5 text-green-400" />}
                    label="Active Auctions"
                    value="5"
                    trend="+2"
                />
                <StatCard
                    icon={<Package className="w-5 h-5 text-purple-400" />}
                    label="Artifacts"
                    value="38"
                    trend="+5"
                />
                <StatCard
                    icon={<Shield className="w-5 h-5 text-yellow-400" />}
                    label="Revenue"
                    value="₹1.2M"
                    trend="+8%"
                />
            </div>
        </div>
    );
}

function QuickActionCard({ href, icon, title, description, gradient, borderColor }: any) {
    return (
        <Link href={href} className={`group relative p-6 rounded-2xl border ${borderColor} bg-gradient-to-br ${gradient} hover:scale-[1.02] transition-all duration-300 overflow-hidden`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                {icon}
            </div>
            <div className="relative z-10">
                <div className="p-3 bg-gray-950/50 rounded-xl w-fit mb-4 backdrop-blur-sm border border-white/5 group-hover:border-white/20 transition-colors">
                    {icon}
                </div>
                <h3 className="text-xl font-bold text-gray-100 mb-1">{title}</h3>
                <p className="text-sm text-gray-400">{description}</p>
            </div>
        </Link>
    );
}

function StatCard({ icon, label, value, trend }: any) {
    return (
        <div className="p-5 bg-[#0a0a0a] border border-gray-800 rounded-xl hover:border-gray-700 transition-colors">
            <div className="flex items-start justify-between mb-4">
                <div className="p-2 bg-gray-900 rounded-lg">{icon}</div>
                <span className="text-xs font-medium text-green-400 bg-green-900/20 px-2 py-1 rounded-full">{trend}</span>
            </div>
            <div className="text-2xl font-bold text-gray-100 mb-1">{value}</div>
            <div className="text-xs text-gray-500">{label}</div>
        </div>
    );
}
