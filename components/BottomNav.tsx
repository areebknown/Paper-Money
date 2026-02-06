'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, ScanLine, Box, MessageSquare } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/inventory', icon: Briefcase, label: 'Assets' },
    { href: '/payment', icon: ScanLine, label: 'Pay', isCenter: true },
    { href: '/vault', icon: Box, label: 'Vault' },
    { href: '/chat', icon: MessageSquare, label: 'Chat' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[190] pb-safe">
            {/* Glass Background */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl border-t border-white/5" />

            <div className="container relative">
                <div className="flex items-end justify-around pb-2 pt-3">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`
                                    flex flex-col items-center justify-center gap-1.5 transition-all duration-300
                                    ${item.isCenter ? '-mt-8' : ''}
                                    ${isActive ? 'text-cyan-400' : 'text-gray-500 hover:text-gray-300'}
                                `}
                            >
                                {item.isCenter ? (
                                    <div className="group relative">
                                        <div className="absolute inset-0 bg-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-60 transition-opacity" />
                                        <div className="relative w-14 h-14 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-xl border border-white/10 group-active:scale-95 transition-transform">
                                            <Icon className="w-7 h-7 text-white" strokeWidth={2} />
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-cyan-500/10' : 'bg-transparent'}`}>
                                            <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                        </div>
                                        <span className="text-[10px] font-medium tracking-wide">
                                            {item.label}
                                        </span>
                                    </>
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
