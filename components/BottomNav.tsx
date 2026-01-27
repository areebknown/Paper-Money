
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Send, History, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { name: 'Home', href: '/dashboard', icon: Home },
        { name: 'Send', href: '/send', icon: Send },
        { name: 'History', href: '/history', icon: History },
        { name: 'Profile', href: '/profile', icon: User },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-2 px-6 flex justify-between items-center z-50 pb-safe">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                    <Link
                        key={item.name}
                        href={item.href}
                        className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                            isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-900"
                        )}
                    >
                        <Icon size={24} />
                        <span className="text-xs font-medium">{item.name}</span>
                    </Link>
                );
            })}
        </div>
    );
}
