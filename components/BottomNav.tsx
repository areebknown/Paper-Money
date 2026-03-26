'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_ITEMS = [
    { href: '/home', icon: 'home', label: 'Home' },
    { href: '/inventory', icon: 'backpack', label: 'Inventory' },
    { href: '/payment', icon: 'qr_code_scanner', label: 'Pay', isCenter: true },
    { href: '/vault', icon: 'inventory_2', label: 'Vault' },
    { href: '/chat', icon: 'chat_bubble', label: 'Chat' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[190] pb-safe">
            <div className="absolute inset-0 bg-slate-900/95 backdrop-blur-md border-t border-slate-800" />
            <div className="relative flex justify-around items-end pb-4 pt-2">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

                    if (item.isCenter) {
                        return (
                            <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1 w-1/5 -mt-6">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-b from-[#FBBF24] to-yellow-600 shadow-lg border-4 border-slate-900 flex items-center justify-center active:scale-95 transition-all duration-200">
                                    <span className="material-icons-round text-2xl text-white drop-shadow-md">{item.icon}</span>
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">{item.label}</span>
                            </Link>
                        );
                    }

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 w-1/5 transition-colors group ${isActive ? 'text-[#FBBF24]' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <span className={`material-icons-round text-2xl transition-transform group-hover:scale-110`}>
                                {item.icon}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
            <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Round" rel="stylesheet" />
        </nav>
    );
}
