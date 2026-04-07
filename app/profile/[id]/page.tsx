'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import useSWR from 'swr';
import Link from 'next/link';
import Header from '@/components/Header';
import ArtifactCard from '@/components/ArtifactCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, MoreVertical, UserPlus, MessageCircle, Edit2, Send } from 'lucide-react';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Cloudinary thumb ─────────────────────────────────────────────────────────
function compressArtifactUrl(url: string | null | undefined) {
    if (!url) return null;
    if (url.includes('res.cloudinary.com') && !url.includes('q_auto')) {
        return url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_120/');
    }
    return url;
}

// ─── Tier colors ──────────────────────────────────────────────────────────────
const TIER_COLORS: Record<string, { text: string; border: string }> = {
    'E':    { text: 'text-gray-300',   border: 'border-gray-500' },
    'D':    { text: 'text-emerald-400', border: 'border-emerald-500' },
    'C':    { text: 'text-blue-400',   border: 'border-blue-400' },
    'B':    { text: 'text-purple-400', border: 'border-purple-400' },
    'A':    { text: 'text-yellow-400', border: 'border-yellow-400' },
    'S':    { text: 'text-orange-400', border: 'border-orange-400' },
    'SS':   { text: 'text-red-400',    border: 'border-red-400' },
    'SSS':  { text: 'text-white',      border: 'border-white' },
    'SSS+': { text: 'text-yellow-300', border: 'border-yellow-300' },
};

// ─── Ordinal helper ──────────────────────────────────────────────────────────
function ordinal(n: number) {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ─── Relative time ─────────────────────────────────────────────────────────
function relativeTime(dateStr: string | null) {
    if (!dateStr) return 'a long time ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

// ─── Artifact tile ────────────────────────────────────────────────────────────
function ArtifactTile({ artifact, onClick }: { artifact: any; onClick: () => void }) {
    const tier = artifact.tier ?? 'E';
    const colors = TIER_COLORS[tier] ?? TIER_COLORS['E'];
    const imgUrl = compressArtifactUrl(artifact.imageUrl);

    return (
        <div
            onClick={onClick}
            className="aspect-square bg-[#1e293b] rounded-xl overflow-hidden relative group cursor-pointer hover:scale-105 transition-transform border border-white/10 shadow-md"
        >
            {imgUrl ? (
                <img src={imgUrl} alt={artifact.name} className="w-full h-full object-cover" loading="lazy" />
            ) : (
                <div className="w-full h-full flex items-center justify-center">
                    <span className="material-icons-round text-gray-700 text-3xl">image_not_supported</span>
                </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
            <div className="absolute bottom-0.5 left-0 right-0 px-0.5 text-center">
                <p className="text-[7px] font-bold text-gray-300 truncate font-mono">#{artifact.productId}</p>
                <span className={`text-[6px] font-black uppercase px-1 py-0.5 rounded-sm border ${colors.text} ${colors.border} bg-black/70`}>
                    {tier}
                </span>
            </div>
        </div>
    );
}

// ─── Context menu (three bars button) ────────────────────────────────────────
function ContextMenu({ friendshipStatus, onRemoveFriend, onShareProfile, targetId }: {
    friendshipStatus: string;
    onRemoveFriend: () => void;
    onShareProfile: () => void;
    targetId: string;
}) {
    const [open, setOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={() => setOpen(o => !o)}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all"
            >
                <MoreVertical size={18} className="text-gray-400" />
            </button>
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: -4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: -4 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 z-50 min-w-[160px] bg-[#1e293b] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
                    >
                        {friendshipStatus === 'FRIENDS' && (
                            <button
                                onClick={() => { onRemoveFriend(); setOpen(false); }}
                                className="w-full text-left px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-red-400 hover:bg-red-500/10 transition-colors"
                            >
                                Remove Friend
                            </button>
                        )}
                        <button
                            onClick={() => { onShareProfile(); setOpen(false); }}
                            className="w-full text-left px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 transition-colors"
                        >
                            Share Profile
                        </button>
                        <Link
                            href={`/trades/${targetId}`}
                            className="block px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-slate-300 hover:bg-white/5 transition-colors"
                            onClick={() => setOpen(false)}
                        >
                            Our Trades
                        </Link>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function PublicProfilePage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const [friendshipStatus, setFriendshipStatus] = useState<string>('NONE');
    const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
    const [visibleCount, setVisibleCount] = useState(12);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const { data, isLoading } = useSWR(id ? `/api/profile/${id}` : null, fetcher, {
        revalidateOnFocus: false,
    });

    useEffect(() => {
        if (data?.friendshipStatus) setFriendshipStatus(data.friendshipStatus);
    }, [data?.friendshipStatus]);

    // Infinite scroll
    useEffect(() => {
        const node = loadMoreRef.current;
        if (!node) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setVisibleCount(c => c + 12); },
            { rootMargin: '100px' }
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, [data?.artifacts]);

    const handleFriendAction = useCallback(async () => {
        if (friendshipStatus === 'SELF') return;
        if (friendshipStatus === 'FRIENDS' || friendshipStatus === 'PENDING_SENT') {
            const res = await fetch(`/api/profile/${id}`, { method: 'DELETE' });
            const json = await res.json();
            setFriendshipStatus(json.friendshipStatus ?? 'NONE');
        } else {
            const res = await fetch(`/api/profile/${id}`, { method: 'POST' });
            const json = await res.json();
            setFriendshipStatus(json.friendshipStatus ?? 'PENDING_SENT');
        }
    }, [id, friendshipStatus]);

    const handleShareProfile = useCallback(() => {
        if (navigator.share) {
            navigator.share({ title: `${profile?.username}'s Profile`, url: window.location.href });
        } else {
            navigator.clipboard.writeText(window.location.href);
        }
    }, []);

    if (isLoading || !data) {
        return (
            <div className="min-h-screen bg-[#111827] flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (data.error) {
        return (
            <div className="min-h-screen bg-[#111827] flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center text-gray-500 text-sm">User not found</div>
            </div>
        );
    }

    const { profile, rank, artifacts } = data;
    const isSelf = friendshipStatus === 'SELF';
    const isFriends = friendshipStatus === 'FRIENDS';
    const isPendingSent = friendshipStatus === 'PENDING_SENT';
    const displayName = profile.realName || profile.username;
    const showSecondaryUsername = !!profile.realName;
    const visibleArtifacts = (artifacts ?? []).slice(0, visibleCount);

    return (
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] font-['Inter'] antialiased pb-24">
            <Header />

            <main className="px-4 pt-5 space-y-5 max-w-2xl mx-auto">

                {/* ── PROFILE HEADER ── */}
                <section>
                    {/* Avatar + Name row */}
                    <div className="flex items-center gap-4 mb-4">
                        {/* Avatar with online dot */}
                        <div className="relative shrink-0">
                            <div className="w-[72px] h-[72px] rounded-full border-2 border-white/10 bg-gray-700 overflow-hidden shadow-xl">
                                {profile.profileImage ? (
                                    <img src={profile.profileImage} alt={profile.username} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-icons-round text-gray-500 text-4xl">person</span>
                                    </div>
                                )}
                            </div>
                            {profile.isOnline && (
                                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#111827] shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                            )}
                        </div>

                        {/* Name + username + last seen */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-[20px] font-bold text-white font-['Russo_One'] truncate leading-tight">
                                {displayName}
                            </h1>
                            {showSecondaryUsername && (
                                <p className="text-[12px] text-slate-400 font-medium truncate mb-0.5">
                                    @{profile.username}
                                </p>
                            )}
                            {!profile.isOnline && (
                                <p className="text-[11px] text-slate-500 font-medium">
                                    Last seen {relativeTime(profile.lastSeenAt)}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* About text */}
                    {profile.about && (
                        <p className="text-[13px] text-slate-300 leading-relaxed mb-4 px-0.5">
                            {profile.about}
                        </p>
                    )}

                    {/* Rank + Leaderboard badges */}
                    <div className="flex gap-3 mb-4">
                        {/* Rank badge */}
                        <Link href="/rank" className="flex-1 flex items-center gap-2.5 bg-[#1e293b] border border-white/10 rounded-2xl px-3 py-2.5 hover:border-[#FBBF24]/30 transition active:scale-95">
                            <img
                                src={`/rank-icons/${rank?.iconName}.svg`}
                                alt={rank?.tier?.name}
                                className="w-9 h-9 object-contain drop-shadow"
                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                            />
                            <div className="min-w-0">
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Rank</p>
                                <p className="text-[13px] font-black text-white font-['Russo_One'] truncate">{rank?.tier?.name}</p>
                            </div>
                        </Link>

                        {/* Leaderboard position — placeholder */}
                        <div className="flex-1 flex items-center gap-2.5 bg-[#1e293b] border border-white/10 rounded-2xl px-3 py-2.5">
                            <div className="w-9 h-9 rounded-full bg-yellow-500/10 flex items-center justify-center shrink-0">
                                <span className="material-icons-round text-[#FBBF24] text-xl">emoji_events</span>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Leaderboard</p>
                                <p className="text-[13px] font-black text-slate-400 font-['Russo_One']">Coming Soon</p>
                            </div>
                        </div>
                    </div>

                    {/* Separator */}
                    <div className="h-px bg-white/5 mb-4" />

                    {/* Action buttons */}
                    <div className="flex gap-2">
                        {isSelf ? (
                            <>
                                <Link
                                    href="/profile/edit"
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FBBF24] text-gray-900 font-black text-[12px] uppercase tracking-wider rounded-xl active:scale-95 transition-all"
                                >
                                    <Edit2 size={14} />
                                    Edit Profile
                                </Link>
                                <button
                                    onClick={handleShareProfile}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-white/5 border border-white/10 text-slate-300 font-bold text-[12px] uppercase tracking-wider rounded-xl hover:bg-white/10 active:scale-95 transition-all"
                                >
                                    <Share2 size={14} />
                                    Share Profile
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Friend / Message button */}
                                {isFriends ? (
                                    <Link
                                        href={`/messages/${id}`}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-blue-500/20 border border-blue-500/30 text-blue-300 font-bold text-[12px] uppercase tracking-wider rounded-xl hover:bg-blue-500/30 active:scale-95 transition-all"
                                    >
                                        <MessageCircle size={14} />
                                        Message
                                    </Link>
                                ) : (
                                    <button
                                        onClick={handleFriendAction}
                                        disabled={isPendingSent}
                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold text-[12px] uppercase tracking-wider rounded-xl active:scale-95 transition-all
                                            ${isPendingSent
                                                ? 'bg-white/5 border border-white/10 text-slate-500 cursor-not-allowed'
                                                : 'bg-[#FBBF24] text-gray-900 font-black'}`}
                                    >
                                        <UserPlus size={14} />
                                        {isPendingSent ? 'Request Sent' : 'Add Friend'}
                                    </button>
                                )}

                                {/* Pay button */}
                                <Link
                                    href={`/pay/${id}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 font-bold text-[12px] uppercase tracking-wider rounded-xl hover:bg-emerald-500/30 active:scale-95 transition-all"
                                >
                                    <Send size={14} />
                                    Pay
                                </Link>

                                {/* Context menu */}
                                <ContextMenu
                                    friendshipStatus={friendshipStatus}
                                    onRemoveFriend={handleFriendAction}
                                    onShareProfile={handleShareProfile}
                                    targetId={id!}
                                />
                            </>
                        )}
                    </div>
                </section>

                {/* ── GALLERY: Estate + Vehicle ── */}
                {/* Placeholder — estates/vehicles not in schema yet; section hidden until data exists */}
                {/* When schema has estate/vehicle, conditionally render here */}

                {/* ── OWNED ARTIFACTS ── */}
                {(artifacts ?? []).length > 0 && (
                    <section>
                        <div className="flex items-center gap-1.5 mb-3">
                            <div className="w-1 h-5 bg-[#FBBF24] rounded-full" />
                            <span className="material-icons-round text-base text-blue-400">hardware</span>
                            <h2 className="text-sm font-bold text-blue-400 uppercase tracking-widest font-['Russo_One']">
                                Artifacts
                                <span className="text-[10px] text-gray-500 font-['Inter'] font-normal ml-1.5">({artifacts.length})</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-4 gap-1.5">
                            {visibleArtifacts.map((artifact: any) => (
                                <ArtifactTile
                                    key={artifact.id}
                                    artifact={artifact}
                                    onClick={() => setSelectedArtifact(artifact)}
                                />
                            ))}
                        </div>

                        {/* Infinite scroll trigger */}
                        {visibleCount < (artifacts ?? []).length && (
                            <div ref={loadMoreRef} className="w-full py-4 flex items-center justify-center">
                                <button
                                    onClick={() => setVisibleCount(c => c + 12)}
                                    className="px-5 py-2 bg-white/10 hover:bg-white/20 text-gray-400 text-sm font-bold rounded-xl transition flex items-center gap-1"
                                >
                                    Show More <span className="material-icons-round text-sm">expand_more</span>
                                </button>
                            </div>
                        )}
                    </section>
                )}

                {/* Empty artifacts state */}
                {!isLoading && (artifacts ?? []).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-[#1e293b] rounded-full flex items-center justify-center mb-3 border border-white/10">
                            <span className="material-icons-round text-gray-700 text-3xl">hardware</span>
                        </div>
                        <p className="text-sm font-bold text-gray-500">No Public Artifacts</p>
                    </div>
                )}
            </main>

            {/* Artifact detail overlay */}
            {selectedArtifact && (
                <ArtifactCard
                    artifact={selectedArtifact}
                    ownerUsername={profile?.username}
                    isOwner={isSelf}
                    onClose={() => setSelectedArtifact(null)}
                />
            )}
        </div>
    );
}
