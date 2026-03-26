'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

// Pages that should NOT show the global bottom nav
// (they have their own UI or are non-app pages)
const EXCLUDED_PREFIXES = [
    '/admin',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/bid',       // live auction pages
];

export default function ConditionalBottomNav() {
    const pathname = usePathname();
    const shouldHide = EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix));
    if (shouldHide) return null;
    return <BottomNav />;
}
