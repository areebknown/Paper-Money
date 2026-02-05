'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Briefcase, QrCode, Vault, MessageCircle } from 'lucide-react';

const NAV_ITEMS = [
    { href: '/home', icon: Home, label: 'Home' },
    { href: '/inventory', icon: Briefcase, label: 'Inventory' },
    { href: '/payment', icon: QrCode, label: 'Payment', isCenter: true },
    { href: '/vault', icon: Vault, label: 'Vault' },
    { href: '/chat', icon: MessageCircle, label: 'Chat' },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[200] bg-slate-900 border-t border-gray-800 pb-safe">
            <div className="container">
                <div className="flex items-center justify-around py-2">
                    {NAV_ITEMS.map((item) => {
                        const Icon = item.icon;
                        const isActive = pathname === item.href;

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-all ${item.isCenter ? 'relative -mt-6' : ''
                                    } ${isActive ? 'text-cyan-500' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                {item.isCenter ? (
                                    <div className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30">
                                        <Icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                    </div>
                                ) : (
                                    <>
                                        <Icon className="w-6 h-6" strokeWidth={isActive ? 2.5 : 2} />
                                        <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
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
