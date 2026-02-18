'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Gavel, Package, FileText, ArrowLeft, Shield, Wallet } from 'lucide-react';

const ADMIN_NAV_ITEMS = [
    { href: '/admin', icon: LayoutDashboard, label: 'Dashboard', exact: true },
    { href: '/admin/auctions', icon: Gavel, label: 'Auctions' },
    { href: '/admin/artifacts', icon: Package, label: 'Artifacts' },
    { href: '/admin/contracts', icon: FileText, label: 'Contracts' },
    { href: '/admin/balance', icon: Wallet, label: 'Manage Balance' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Admin Header */}
            <header className="sticky top-0 z-[200] bg-red-900 border-b border-red-800 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Shield className="w-6 h-6 text-red-300" />
                        <h1 className="text-xl font-bold text-white">Admin Panel</h1>
                    </div>
                    <Link href="/home" className="text-sm text-red-200 hover:text-white transition flex items-center gap-2">
                        <ArrowLeft className="w-4 h-4" />
                        Back to App
                    </Link>
                </div>

                {/* Navigation Tabs */}
                <div className="flex gap-2 mt-4 overflow-x-auto">
                    {ADMIN_NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href) && item.href !== '/admin';

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${isActive
                                    ? 'bg-white text-red-900'
                                    : 'text-red-200 hover:bg-red-800'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </header>

            {/* Content */}
            <main>{children}</main>
        </div>
    );
}
