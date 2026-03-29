'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import useSWR, { useSWRConfig } from 'swr';
import Link from 'next/link';
import { getPusherClient } from '@/lib/pusher-client';
import { LOGO_URL } from '@/lib/cloudinary';


const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Cloudinary Compression ───────────────────────────────────────────────────
function compressArtifactUrl(url: string | null | undefined) {
    if (!url) return null;
    if (url.includes('res.cloudinary.com') && !url.includes('q_auto')) {
        return url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_120/');
    }
    return url;
}

// ─── Tier Color Map ───────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    'E': { bg: 'bg-gray-700', text: 'text-gray-300', border: 'border-gray-500' },
    'D': { bg: 'bg-emerald-900/80', text: 'text-emerald-400', border: 'border-emerald-500' },
    'C': { bg: 'bg-blue-900/80', text: 'text-blue-400', border: 'border-blue-400' },
    'B': { bg: 'bg-purple-900/80', text: 'text-purple-400', border: 'border-purple-400' },
    'A': { bg: 'bg-yellow-900/80', text: 'text-yellow-400', border: 'border-yellow-400' },
    'S': { bg: 'bg-orange-900/80', text: 'text-orange-400', border: 'border-orange-400' },
    'SS': { bg: 'bg-red-900/80', text: 'text-red-400', border: 'border-red-400' },
    'SSS': { bg: 'bg-white/10', text: 'text-white', border: 'border-white' },
    'SSS+': { bg: 'bg-gradient-to-r from-yellow-500/20 to-pink-500/20', text: 'text-yellow-300', border: 'border-yellow-300' },
};

// ─── Rank Icon Map ─────────────────────────────────────────────────────────────
function getRankIconPath(iconName: string) {
    return `/rank-icons/${iconName}.svg`;
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHeading({ icon, label, children }: { icon: string; label: string; children?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-['Russo_One']">
                <div className="w-1 h-5 bg-[#FBBF24] rounded-full" />
                <span className="material-icons-round text-base text-blue-400">{icon}</span>
                {label}
            </h2>
            {children && <div className="flex items-center gap-3">{children}</div>}
        </div>
    );
}

// ─── Balance Card ─────────────────────────────────────────────────────────────
function BalanceCard({ user }: { user: any }) {
    const [expanded, setExpanded] = useState(false);
    const balance = Number(user?.balance ?? 0);
    const greenMoney = Number(user?.greenMoney ?? 0);
    const totalInvested = Number(user?.totalInvested ?? 0);
    const netWorth = Number(user?.netWorth ?? 0);
    const loanAmount = 0; // Not tracked in schema yet

    const fmt = (v: number) => '₹' + v.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

    const details = [
        { label: 'Loan Amount', value: loanAmount, icon: 'money_off', color: 'text-red-400' },
        { label: 'Green Money', value: greenMoney, icon: 'eco', color: 'text-emerald-400' },
        { label: 'Invested', value: totalInvested, icon: 'trending_up', color: 'text-blue-400' },
        { label: 'Net Worth', value: netWorth, icon: 'stars', color: 'text-yellow-400' },
    ].filter(d => d.value > 0);

    return (
        <div
            onClick={() => setExpanded(e => !e)}
            className="bg-[#1e293b] border border-white/10 hover:border-[#FBBF24]/40 rounded-2xl p-3 cursor-pointer active:scale-95 transition-all duration-200 select-none overflow-hidden self-start"
        >
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                <span className="material-icons-round text-emerald-400" style={{ fontSize: '14px' }}>account_balance_wallet</span>
                <span className="text-[9px] font-bold uppercase tracking-widest">Total Balance</span>
            </div>
            <p className="text-[15px] font-black text-white font-mono tracking-tight">
                ₹{balance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>

            {/* Expandable section */}
            <div
                style={{ maxHeight: expanded ? '240px' : '0', opacity: expanded ? 1 : 0 }}
                className="overflow-hidden transition-all duration-300 ease-in-out"
            >
                {details.length > 0 ? (
                    <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-2">
                        {details.map(item => (
                            <div key={item.label}>
                                <div className="flex items-center gap-1">
                                    <span className={`material-icons-round ${item.color}`} style={{ fontSize: '11px' }}>{item.icon}</span>
                                    <span className="text-[9px] text-gray-500 uppercase font-bold tracking-wider">{item.label}</span>
                                </div>
                                <p className="text-[12px] font-black text-white font-mono ml-4 leading-tight">{fmt(item.value)}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-[10px] text-gray-600 mt-2 pt-2 border-t border-white/10">No detailed breakdown available</p>
                )}
            </div>

            {!expanded && (
                <p className="text-[9px] text-gray-600 text-right mt-1">Tap for details</p>
            )}
        </div>
    );
}

// ─── Rank Card ────────────────────────────────────────────────────────────────
function RankCard({ user, rank, couponsCount = 0 }: { user: any; rank: any; couponsCount?: number }) {
    const [expanded, setExpanded] = useState(false);

    if (!rank) return null;
    const { tier, iconName, progress, nextThreshold } = rank;
    // tier.name is already the full label e.g. "Rookie I", "Tycoon III", "Crown"

    const RANK_PERKS: Record<string, string[]> = {
        'Rookie I':      ['1 Loan Token (Weekly)'],
        'Rookie II':     ['1 Loan Token', 'Lesser Interest on Loans'],
        'Rookie III':    ['1 Loan Token', 'Lesser Interest on Loans'],
        'Dealer I':      ['2 Loan Tokens (Weekly)'],
        'Dealer II':     ['2 Loan Tokens', 'Weekly Cashback Coupon'],
        'Dealer III':    ['2 Loan Tokens', 'Weekly Discount Coupon'],
        'Financier I':   ['3 Loan Tokens', 'Special Shutters'],
        'Financier II':  ['3 Loan Tokens', 'Weekly Bid Pull'],
        'Financier III': ['3 Loan Tokens', 'Better Discount Coupon'],
        'Tycoon I':      ['4 Loan Tokens', 'No Contract Fee'],
        'Tycoon II':     ['4 Loan Tokens', '200% Loan at 18% CI rate'],
        'Tycoon III':    ['4 Loan Tokens', 'Better Cashback Coupon'],
        'Crown':         ['5 Loan Tokens', '200% Loan at 15% CI rate'],
        'Crown+':        ['6 Loan Tokens', '220% Loan at 15% CI rate'],
        'Monarch':       ['8 Loan Tokens', 'Premium Coupon'],
    };
    const perks = RANK_PERKS[tier.name] ?? [];

    return (
        <div
            onClick={() => setExpanded(e => !e)}
            className="bg-[#1e293b] border border-white/10 hover:border-[#FBBF24]/40 rounded-2xl p-3 cursor-pointer active:scale-95 transition-all duration-200 select-none overflow-hidden"
        >
            <div className="flex items-center gap-1.5 text-gray-400 mb-1.5">
                <span className="material-icons-round text-blue-400" style={{ fontSize: '14px' }}>military_tech</span>
                <span className="text-[9px] font-bold uppercase tracking-widest">Rank</span>
            </div>

            <div className="flex items-center gap-2">
                {/* Rank icon */}
                <Link href="/rank" onClick={e => e.stopPropagation()}>
                    <img
                        src={getRankIconPath(iconName)}
                        alt={tier.name}
                        className="w-12 h-12 object-contain drop-shadow-lg flex-shrink-0 active:scale-90 transition-transform"
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                </Link>
                <div className="min-w-0">
                    <p className="text-sm font-black text-white font-['Russo_One'] tracking-wider truncate">{tier.name}</p>
                    <p className="text-[10px] text-blue-400 font-bold font-mono">{user?.rankPoints ?? 0} RP</p>
                    <div className="mt-1 w-20 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#FBBF24] to-yellow-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
                    </div>
                    {nextThreshold && (
                        <p className="text-[9px] text-gray-600 mt-0.5">{nextThreshold - (user?.rankPoints ?? 0)} RP to next</p>
                    )}
                </div>
            </div>

            <div
                style={{ maxHeight: expanded ? '180px' : '0', opacity: expanded ? 1 : 0 }}
                className="overflow-hidden transition-all duration-300 ease-in-out"
            >
                <div className="mt-2.5 pt-2.5 border-t border-white/10 space-y-1.5">
                    <div className="flex items-center gap-1.5">
                        <span className="material-icons-round text-yellow-400" style={{ fontSize: '13px' }}>confirmation_number</span>
                        <span className="text-[10px] text-gray-300">Loan Tokens: <strong className="text-white">{user?.loanTokens ?? 1}</strong></span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="material-icons-round text-blue-400" style={{ fontSize: '13px' }}>card_giftcard</span>
                        <span className="text-[10px] text-gray-300">Coupons: <strong className="text-white">{couponsCount}</strong></span>
                    </div>
                    {perks.map(perk => (
                        <div key={perk} className="flex items-center gap-1.5">
                            <span className="material-icons-round text-emerald-400" style={{ fontSize: '13px' }}>check_circle</span>
                            <span className="text-[10px] text-gray-400">{perk}</span>
                        </div>
                    ))}
                    <Link href="/rank" className="block text-[10px] text-[#FBBF24] font-bold mt-1 hover:underline" onClick={e => e.stopPropagation()}>
                        See all perks →
                    </Link>
                </div>
            </div>
            {!expanded && <p className="text-[9px] text-gray-600 text-right mt-1">Tap for perks</p>}
        </div>
    );
}

// ─── Resource Icon map ─────────────────────────────────────────────────────────
const RESOURCE_ICONS: Record<string, { icon: string; color: string; bg: string }> = {
    default:   { icon: 'inventory_2',   color: 'text-gray-400',   bg: 'bg-gray-800/60' },
    gold:      { icon: 'view_day',      color: 'text-yellow-400', bg: 'bg-yellow-900/40' },
    silver:    { icon: 'view_day',      color: 'text-white',      bg: 'bg-slate-500/80' },
    crudeoil:  { icon: 'oil_barrel',    color: 'text-red-700',    bg: 'bg-red-900/40' },
    copper:    { icon: 'electrical_services', color: 'text-orange-400', bg: 'bg-orange-900/30' },
    lithium:   { icon: 'bolt',          color: 'text-cyan-400',   bg: 'bg-cyan-900/30' },
    iron:      { icon: 'hardware',      color: 'text-zinc-300',   bg: 'bg-zinc-900' },
    steel:     { icon: 'construction',  color: 'text-slate-300',  bg: 'bg-slate-700/50' },
    diamond:   { icon: 'diamond',       color: 'text-blue-400',   bg: 'bg-blue-900/30' },
    platinum:  { icon: 'star',          color: 'text-purple-400', bg: 'bg-purple-900/30' },
    wheat:     { icon: 'grass',         color: 'text-yellow-600', bg: 'bg-yellow-900/20' },
    wood:      { icon: 'park',          color: 'text-green-400',  bg: 'bg-green-900/30' },
    stone:     { icon: 'layers',        color: 'text-gray-400',   bg: 'bg-gray-800/60' },
};
function getResourceStyle(name: string) {
    const key = name.toLowerCase().replace(/\s+/g, '');
    return RESOURCE_ICONS[key] ?? RESOURCE_ICONS.default;
}

// ─── Artifact Card ────────────────────────────────────────────────────────────
function ArtifactTile({ artifact }: { artifact: any }) {
    const tier = artifact.tier ?? 'E';
    const colors = TIER_COLORS[tier] ?? TIER_COLORS['E'];
    const imgUrl = compressArtifactUrl(artifact.imageUrl);

    return (
        <div className="aspect-square bg-[#1e293b] rounded-xl overflow-hidden relative group cursor-pointer hover:scale-105 transition-transform border border-white/10 shadow-md">
            {imgUrl ? (
                <img src={imgUrl} alt={artifact.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="material-icons-round text-gray-700 text-3xl">image_not_supported</span>
                </div>
            )}
            {/* Dark gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            {/* Bottom info */}
            <div className="absolute bottom-0.5 left-0 right-0 px-0.5 text-center">
                <p className="text-[7px] font-bold text-gray-300 truncate font-mono">#{artifact.productId}</p>
                <span className={`text-[6px] font-black uppercase px-1 py-0.5 rounded-sm border ${colors.text} ${colors.border} bg-black/70`}>
                    {tier}
                </span>
            </div>
        </div>
    );
}

// ─── Filter Bottom Sheet ──────────────────────────────────────────────────────
function FilterSheet({
    open,
    onClose,
    sortTier,
    setSortTier,
}: {
    open: boolean;
    onClose: () => void;
    sortTier: string;
    setSortTier: (t: string) => void;
}) {
    const tiers = ['ALL', 'E', 'D', 'C', 'B', 'A', 'S', 'SS', 'SSS', 'SSS+'];
    return (
        <>
            {/* Backdrop */}
            {open && (
                <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            )}
            {/* Sheet */}
            <div
                className={`fixed bottom-0 left-0 right-0 z-50 bg-[#1e293b] border-t border-white/10 rounded-t-3xl p-6 transition-transform duration-300 ease-in-out ${open ? 'translate-y-0' : 'translate-y-full'}`}
            >
                <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5" />
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4 font-['Russo_One']">Filter Artifacts</h3>
                <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-2">Tier</p>
                <div className="flex flex-wrap gap-2 mb-6">
                    {tiers.map(t => {
                        const colors = TIER_COLORS[t];
                        const isSelected = sortTier === t;
                        return (
                            <button
                                key={t}
                                onClick={() => { setSortTier(t); onClose(); }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${isSelected
                                    ? 'bg-[#FBBF24] text-gray-900 border-[#FBBF24]'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20'}`}
                            >
                                {t}
                            </button>
                        );
                    })}
                </div>
                <button
                    onClick={onClose}
                    className="w-full py-3 bg-white/10 text-white font-bold rounded-2xl text-sm transition hover:bg-white/20 active:scale-95"
                >
                    Done
                </button>
            </div>
        </>
    );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export default function InventoryPage() {
    const { mutate } = useSWRConfig();
    const { data, isLoading } = useSWR('/api/inventory', fetcher, {
        revalidateOnFocus: false,
    });

    // Real-time updates
    useEffect(() => {
        const pusher = getPusherClient();
        const marketCh = pusher.subscribe('market-updates');
        marketCh.bind('prices-updated', () => mutate('/api/inventory'));

        // Listen for auction-won events to refresh artifacts
        const globalCh = pusher.subscribe('global');
        globalCh.bind('auction-completed', () => mutate('/api/inventory'));

        return () => {
            pusher.unsubscribe('market-updates');
            pusher.unsubscribe('global');
        };
    }, [mutate]);

    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [sortTier, setSortTier] = useState('ALL');
    const [visibleCount, setVisibleCount] = useState(12);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    // Infinite scroll for artifacts
    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisibleCount(c => c + 12); },
            { rootMargin: '100px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [data?.ownedArtifacts]);

    const user = data?.user;
    const rank = data?.rank;
    const portfolios: any[] = data?.portfolios ?? [];
    const ownedEstates: any[] = data?.ownedEstates ?? [];
    const ownedVehicles: any[] = data?.ownedVehicles ?? [];
    const allArtifacts: any[] = data?.ownedArtifacts ?? [];
    const coupons: any[] = data?.coupons ?? [];

    // Filter and search artifacts
    const filteredArtifacts = allArtifacts.filter(a => {
        const matchesTier = sortTier === 'ALL' || a.tier === sortTier;
        const matchesSearch = !searchQuery || String(a.productId).includes(searchQuery) || a.name?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesTier && matchesSearch;
    });
    const visibleArtifacts = filteredArtifacts.slice(0, visibleCount);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#111827] flex items-center justify-center">
                <p className="text-white font-['Russo_One'] animate-pulse">Loading Inventory...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] font-['Inter'] antialiased flex flex-col pb-24 selection:bg-[#FBBF24] selection:text-white bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">

            {/* ── STANDARD HEADER ── */}
            <header className="relative z-40 pt-4 pb-2 border-b border-[#FBBF24] bg-gradient-to-b from-[#14254f] via-[#101d3f] to-[#0b1328] shadow-[0_18px_38px_rgba(0,0,0,0.45)] overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-black/25 pointer-events-none" />
                <div className="flex justify-between items-center px-4 mb-2 relative">
                    {/* Left: Balance + Rank Points */}
                    <div className="flex flex-col gap-1 w-auto">
                        <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                            <span className="material-icons-round text-[#FBBF24] drop-shadow-md leading-none" style={{ fontSize: '14px' }}>currency_rupee</span>
                            <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">
                                {(user?.balance ?? 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded-full border border-white/10">
                            <span className="material-icons-round text-blue-400 drop-shadow-md leading-none" style={{ fontSize: '14px' }}>military_tech</span>
                            <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">{user?.rankPoints ?? 0}</span>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <img src={LOGO_URL} alt="Bid Wars Logo" className="drop-shadow-lg object-contain h-[50px] w-auto" />
                    </div>

                    {/* Right: Notifications + Profile */}
                    <div className="flex items-center gap-3 w-24 justify-end">
                        <button className="relative w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
                            <span className="material-icons-round text-white">notifications</span>
                        </button>
                        <Link href="/profile">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBBF24] to-orange-500 p-0.5 shadow-lg cursor-pointer">
                                <div className="w-full h-full rounded-full border-2 border-white bg-gray-700 flex items-center justify-center">
                                    <span className="material-icons-round text-white text-xl">person</span>
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>
            </header>

            {/* ── INVENTORY TITLE ── */}
            <div className="px-5 pt-5 pb-1">
                <h1 className="text-base font-bold text-gray-300 uppercase tracking-widest font-['Russo_One'] truncate drop-shadow-md">
                    {user?.username ? `${user.username}'s Inventory` : 'My Inventory'}
                </h1>
            </div>

            {/* ── BODY ── */}
            <main className="flex-1 px-4 py-5 space-y-6">

                {/* ── BALANCE + RANK (2-col, natural heights) ── */}
                <div className="grid grid-cols-2 gap-3 items-start">
                    <BalanceCard user={user} />
                    <RankCard user={user} rank={rank} couponsCount={coupons.length} />
                </div>

                <hr className="border-t border-white/10" />

                {/* ── ESTATES + VEHICLES (2-col) ── */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Owned Estate */}
                    <section>
                        <SectionHeading icon="domain" label="Estate" />
                        {ownedEstates.length > 0 ? (
                            <div className="space-y-2">
                                {ownedEstates.map((e: any) => (
                                    <div key={e.id}
                                        className="aspect-square bg-[#1e293b] rounded-xl border border-white/10 flex flex-col items-center justify-center p-3 cursor-pointer hover:scale-105 transition-transform">
                                        <span className="material-icons-round text-blue-400 text-5xl mb-1">villa</span>
                                        <p className="font-bold text-white font-['Russo_One'] text-sm text-center">{e.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-600 text-[11px] font-medium mt-1">No Owned Estate</div>
                        )}
                    </section>

                    {/* Owned Vehicles */}
                    <section>
                        <SectionHeading icon="directions_car" label="Vehicle" />
                        {ownedVehicles.length > 0 ? (
                            <div className="space-y-2">
                                {ownedVehicles.map((v: any) => (
                                    <div key={v.id}
                                        className="aspect-square bg-[#1e293b] rounded-xl border border-white/10 flex flex-col items-center justify-center p-3 cursor-pointer hover:scale-105 transition-transform">
                                        <span className="material-icons-round text-purple-400 text-5xl mb-1">local_shipping</span>
                                        <p className="font-bold text-white font-['Russo_One'] text-sm text-center">{v.name}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-gray-600 text-[11px] font-medium mt-1">No Owned Vehicle</div>
                        )}
                    </section>
                </div>

                <hr className="border-t border-white/10" />

                {/* ── OWNED RESOURCES ── */}
                <section>
                    <SectionHeading icon="inventory_2" label="Owned Resources" />
                    {portfolios.length > 0 ? (
                        <div className="grid grid-cols-3 gap-2">
                            {portfolios.map(p => {
                                const style = getResourceStyle(p.name);
                                return (
                                    <Link key={p.assetId} href={`/invest/${p.assetId}`}
                                        className="bg-[#1e293b] border border-white/10 hover:border-[#FBBF24]/40 rounded-xl p-2.5 flex flex-col items-center justify-center gap-1.5 aspect-square text-center active:scale-95 transition-transform">
                                        <div className={`w-10 h-10 rounded-lg ${style.bg} flex items-center justify-center`}>
                                            <span className={`material-icons-round text-xl ${style.color}`}>{style.icon}</span>
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-white uppercase tracking-wide leading-none mb-0.5">{p.name}</p>
                                            <p className="font-black text-sm leading-none text-white font-['Russo_One']">
                                                {p.units >= 1000 ? `${(p.units / 1000).toFixed(1)}k` : p.units.toFixed(p.units < 10 ? 2 : 0)}
                                            </p>
                                            <p className="text-[8px] text-gray-500 mt-0.5">{p.unit}</p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <p className="text-gray-600 text-[11px] font-medium mt-1">No Owned Resources</p>
                    )}
                </section>

                <hr className="border-t border-white/10" />

                {/* ── OWNED ARTIFACTS ── */}
                <section>
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1.5 font-['Russo_One']">
                            <div className="w-1 h-5 bg-[#FBBF24] rounded-full" />
                            <span className="material-icons-round text-base text-blue-400">hardware</span>
                            Owned Artifacts
                            {filteredArtifacts.length > 0 && (
                                <span className="text-[10px] text-gray-500 font-['Inter'] font-normal ml-1">({filteredArtifacts.length})</span>
                            )}
                        </h2>
                        <div className="flex items-center gap-3">
                            <button onClick={() => setShowSearch(s => !s)} className="active:scale-90 transition-transform">
                                <span className="material-icons-round text-blue-400 text-xl">search</span>
                            </button>
                            <button onClick={() => setFilterOpen(true)} className="active:scale-90 transition-transform relative">
                                <span className={`material-icons-round text-xl ${sortTier !== 'ALL' ? 'text-[#FBBF24]' : 'text-blue-400'}`}>tune</span>
                                {sortTier !== 'ALL' && <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#FBBF24] rounded-full" />}
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div style={{ maxHeight: showSearch ? '50px' : '0', opacity: showSearch ? 1 : 0, marginBottom: showSearch ? '12px' : '0' }}
                        className="overflow-hidden transition-all duration-200">
                        <input
                            type="text"
                            placeholder="Search by PID or name..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#FBBF24]/40 font-mono"
                        />
                    </div>

                    {filteredArtifacts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-4 gap-1.5">
                                {visibleArtifacts.map(artifact => (
                                    <ArtifactTile key={artifact.id} artifact={artifact} />
                                ))}
                            </div>
                            {/* Load more trigger */}
                            {visibleCount < filteredArtifacts.length && (
                                <div ref={loadMoreRef} className="w-full py-4 flex items-center justify-center">
                                    <button
                                        onClick={() => setVisibleCount(c => c + 12)}
                                        className="px-5 py-2 bg-white/10 hover:bg-white/20 text-gray-400 text-sm font-bold rounded-xl transition flex items-center gap-1"
                                    >
                                        Show More <span className="material-icons-round text-sm">expand_more</span>
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mb-3 border border-white/10">
                                <span className="material-icons-round text-gray-700 text-3xl">hardware</span>
                            </div>
                            <p className="text-sm font-bold text-gray-500 mb-1">
                                {sortTier !== 'ALL' || searchQuery ? 'No artifacts match your filters' : 'No Artifacts Owned'}
                            </p>
                            {!sortTier && !searchQuery && (
                                <Link href="/home" className="mt-3 px-5 py-2 bg-[#FBBF24] text-gray-900 font-black text-sm rounded-xl active:scale-95 transition">
                                    Browse Auctions
                                </Link>
                            )}
                        </div>
                    )}
                </section>
            </main>

            {/* ── FILTER SHEET ── */}
            <FilterSheet
                open={filterOpen}
                onClose={() => setFilterOpen(false)}
                sortTier={sortTier}
                setSortTier={setSortTier}
            />


        </div>
    );
}
