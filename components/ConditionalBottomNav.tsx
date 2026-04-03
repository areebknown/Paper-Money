'use client';

import { usePathname } from 'next/navigation';
import BottomNav from '@/components/BottomNav';

// Pages that should NOT show the global bottom nav
// (they have their own UI or are non-app pages)
// Pages that should NOT show the global bottom nav
const EXCLUDED_PREFIXES = [
    '/admin',
    '/login',
    '/signup',
    '/forgot-password',
    '/reset-password',
    '/bid',       // live auction pages
    '/invest/',   // asset specific market pages
    '/privacy',
    '/terms',
];

export default function ConditionalBottomNav() {
    const pathname = usePathname();
    
    // Hide ONLY on the exact landing page root
    if (pathname === '/') return null;
    
    // Hide on other specific excluded areas
    const shouldHide = EXCLUDED_PREFIXES.some(prefix => pathname.startsWith(prefix));
    if (shouldHide) return null;
    
    return <BottomNav />;
}
