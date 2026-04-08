'use client';

import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import Header from '@/components/Header';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, Send, UserMinus, Check, X, UserPlus, Search, ArrowRight } from 'lucide-react';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then(r => r.json());

// ─── Relative time helper ────────────────────────────────────────────────────────
function relativeTime(dateStr: string | null) {
    if (!dateStr) return 'a long time ago';
    const diff = Date.now() - new Date(dateStr).getTime();
    if (diff < 0) return 'just now'; // sanity check

    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.floor(days / 30);
    if (months < 12) return `${months}mo ago`;
    return `${Math.floor(months / 12)}y ago`;
}

// ─── Last seen small text helper ──────────────────────────────────────────────
function getShortOfflineText(dateStr: string | null) {
    if (!dateStr) return 'Offline';
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '1M';
    if (mins < 60) return `${mins}M`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}H`;
    const days = Math.floor(hrs / 24);
    if (days < 365) return `${days}D`;
    return `${Math.floor(days / 365)}Y`;
}

// ─── Small UI Components ──────────────────────────────────────────────────────
const SectionHeader = ({ title, count }: { title: string; count: number }) => (
    <h3 className="text-[10px] text-slate-500 font-bold uppercase tracking-widest px-2 mb-2 flex items-center gap-2">
        {title} <span className="bg-white/10 text-white rounded px-1.5 py-0.5">{count}</span>
    </h3>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function FriendsPage() {
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    
    // Search overlay state
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    
    const { data, isLoading } = useSWR('/api/friends', fetcher, { revalidateOnFocus: true });
    
    const friends = data?.friends ?? [];
    const receivedRequests = data?.receivedRequests ?? [];
    const sentRequests = data?.sentRequests ?? [];
    
    const hasRequests = receivedRequests.length > 0 || sentRequests.length > 0;
    
    // API action handlers using the profile endpoint
    const handleAddOrAccept = async (id: string) => {
        try {
            await fetch(`/api/profile/${id}`, { method: 'POST' });
            mutate('/api/friends'); // Refresh SWR
        } catch (e) {
            console.error('Failed to accept request:', e);
        }
    };

    const handleRemoveOrReject = async (id: string) => {
        try {
            await fetch(`/api/profile/${id}`, { method: 'DELETE' });
            mutate('/api/friends'); // Refresh SWR
            if (showSearch) performSearch(searchQuery); // Update search results if open
        } catch (e) {
            console.error('Failed to remove/reject:', e);
        }
    };

    // User Search feature
    const performSearch = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }
        setIsSearching(true);
        try {
            const res = await fetch(`/api/friends/search?q=${encodeURIComponent(query)}`);
            const json = await res.json();
            setSearchResults(json.results || []);
        } catch (e) {
            console.error(e);
        } finally {
            setIsSearching(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            performSearch(searchQuery);
        }, 500); // debounce
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    const EmptyState = ({ message }: { message: string }) => (
        <div className="flex flex-col items-center justify-center py-16 text-center text-slate-500">
            <UserMinus size={32} className="mb-4 opacity-50" />
            <p className="font-medium text-sm">{message}</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] font-['Inter'] antialiased pb-24">
            <Header />

            <main className="px-4 pt-4 max-w-2xl mx-auto space-y-5">
                
                {/* ── TOGGLE MENU ── */}
                <div className="flex p-1 bg-[#1e293b] rounded-2xl border border-white/5 shadow-inner">
                    <button
                        onClick={() => setActiveTab('friends')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                            activeTab === 'friends' ? 'bg-[#FBBF24] text-gray-900 shadow-md' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Friends
                    </button>
                    <button
                        onClick={() => setActiveTab('requests')}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest relative transition-all ${
                            activeTab === 'requests' ? 'bg-[#FBBF24] text-gray-900 shadow-md' : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        Requests
                        {/* Notification dot for unread requests */}
                        {receivedRequests.length > 0 && activeTab !== 'requests' && (
                            <span className="absolute top-2.5 right-6 w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                        )}
                    </button>
                </div>

                {isLoading && (
                    <div className="flex justify-center 10 py-20">
                        <div className="w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {!isLoading && (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            {/* ── FRIENDS TAB ── */}
                            {activeTab === 'friends' && (
                                <div>
                                    {friends.length === 0 ? (
                                        <EmptyState message="You have no friends yet. Add some to get started!" />
                                    ) : (
                                        <div className="flex flex-col gap-2">
                                            {friends.map((friend: any) => (
                                                <div key={friend.id} className="flex items-center gap-3 bg-[#1e293b] p-3 rounded-2xl border border-white/5 active:scale-[0.98] transition-transform">
                                                    
                                                    {/* PFP & Status */}
                                                    <Link href={`/profile/${friend.id}`} className="relative shrink-0 w-11 h-11">
                                                        <img
                                                            src={friend.profileImage ?? '/default-avatar.png'}
                                                            alt={friend.username}
                                                            className="w-full h-full object-cover rounded-xl bg-gray-800"
                                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                        />
                                                        {friend.isOnline ? (
                                                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-[2px] border-[#1e293b] rounded-full" />
                                                        ) : (
                                                            <div className="absolute -bottom-1 -right-1.5 px-1 py-[1.5px] bg-rose-500 border border-[#1e293b] rounded-full flex items-center justify-center">
                                                                <span className="text-[6px] font-black leading-none text-white">{getShortOfflineText(friend.lastSeenAt)}</span>
                                                            </div>
                                                        )}
                                                    </Link>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <Link href={`/profile/${friend.id}`}>
                                                            <h4 className="text-sm font-bold text-white truncate leading-tight tracking-tight hover:underline">
                                                                {friend.realName || friend.username}
                                                            </h4>
                                                        </Link>
                                                        <p className="text-[10px] text-slate-500 font-medium">Friend since {relativeTime(friend.updatedAt)}</p>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex gap-1.5 shrink-0">
                                                        <Link href={`/messages/${friend.id}`} className="w-8 h-8 rounded text-blue-400 bg-blue-500/20 hover:bg-blue-500/30 flex items-center justify-center transition-colors">
                                                            <MessageCircle size={15} className="fill-blue-500/10" />
                                                        </Link>
                                                        <Link href={`/pay/${friend.id}`} className="w-8 h-8 rounded text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center transition-colors">
                                                            <Send size={15} />
                                                        </Link>
                                                        <button onClick={() => handleRemoveOrReject(friend.id)} className="w-8 h-8 rounded text-rose-400 bg-rose-500/20 hover:bg-rose-500/30 flex items-center justify-center transition-colors">
                                                            <UserMinus size={15} />
                                                        </button>
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── REQUESTS TAB ── */}
                            {activeTab === 'requests' && (
                                <div className="space-y-6">
                                    
                                    {!hasRequests && (
                                        <EmptyState message="No pending requests at the moment." />
                                    )}

                                    {/* Received Requests */}
                                    {receivedRequests.length > 0 && (
                                        <div>
                                            <SectionHeader title="Received Requests" count={receivedRequests.length} />
                                            <div className="flex flex-col gap-2">
                                                {receivedRequests.map((req: any) => (
                                                    <div key={req.id} className="flex items-center gap-3 bg-[#1e293b] p-3 rounded-2xl border border-white/5 active:scale-[0.98] transition-transform">
                                                        
                                                        {/* PFP */}
                                                        <Link href={`/profile/${req.id}`} className="relative shrink-0 w-11 h-11">
                                                            <img
                                                                src={req.profileImage ?? '/default-avatar.png'}
                                                                alt={req.username}
                                                                className="w-full h-full object-cover rounded-xl bg-gray-800"
                                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        </Link>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <Link href={`/profile/${req.id}`}>
                                                                <h4 className="text-sm font-bold text-white truncate leading-tight tracking-tight hover:underline">
                                                                    {req.realName || req.username}
                                                                </h4>
                                                            </Link>
                                                            <p className="text-[10px] text-slate-500 font-medium tracking-wide">Received {relativeTime(req.updatedAt)}</p>
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex gap-1.5 shrink-0">
                                                            <button 
                                                                onClick={() => handleAddOrAccept(req.id)}
                                                                className="w-8 h-8 rounded text-emerald-400 bg-emerald-500/20 hover:bg-emerald-500/30 flex items-center justify-center transition-colors"
                                                            >
                                                                <Check size={18} strokeWidth={3} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handleRemoveOrReject(req.id)}
                                                                className="w-8 h-8 rounded text-rose-400 bg-rose-500/20 hover:bg-rose-500/30 flex items-center justify-center transition-colors"
                                                            >
                                                                <X size={18} strokeWidth={3} />
                                                            </button>
                                                        </div>

                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sent Requests */}
                                    {sentRequests.length > 0 && (
                                        <div>
                                            <SectionHeader title="Sent Requests" count={sentRequests.length} />
                                            <div className="flex flex-col gap-2">
                                                {sentRequests.map((req: any) => (
                                                    <div key={req.id} className="flex items-center gap-3 bg-[#1e293b]/50 p-3 rounded-2xl border border-white/5 opacity-80 hover:opacity-100 transition-opacity">
                                                        
                                                        {/* PFP */}
                                                        <Link href={`/profile/${req.id}`} className="relative shrink-0 w-11 h-11">
                                                            <img
                                                                src={req.profileImage ?? '/default-avatar.png'}
                                                                alt={req.username}
                                                                className="w-full h-full object-cover rounded-xl bg-gray-800 grayscale-[20%]"
                                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                            />
                                                        </Link>

                                                        {/* Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <Link href={`/profile/${req.id}`}>
                                                                <h4 className="text-sm font-bold text-white truncate leading-tight tracking-tight hover:underline">
                                                                    {req.realName || req.username}
                                                                </h4>
                                                            </Link>
                                                        </div>

                                                        {/* Context */}
                                                        <div className="shrink-0 text-right">
                                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pending</p>
                                                            <p className="text-[9px] text-slate-600 mt-0.5">Sent {relativeTime(req.updatedAt)}</p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                )}

                {/* Floating Add Friend Button (visible on requests tab) */}
                <AnimatePresence>
                    {activeTab === 'requests' && !showSearch && (
                        <motion.button
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            onClick={() => setShowSearch(true)}
                            className="fixed bottom-24 right-5 w-14 h-14 bg-[#FBBF24] rounded-full shadow-[0_4px_20px_rgba(251,191,36,0.4)] flex items-center justify-center text-slate-900 active:scale-90 transition-transform z-40"
                        >
                            <UserPlus size={24} strokeWidth={2.5} />
                        </motion.button>
                    )}
                </AnimatePresence>
            </main>

            {/* Search Overlay */}
            <AnimatePresence>
                {showSearch && (
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed inset-0 z-[200] bg-[#0b1120] flex flex-col"
                    >
                        <div className="px-4 pt-6 pb-4 bg-[#111827] border-b border-white/10 flex items-center gap-3">
                            <button 
                                onClick={() => { setShowSearch(false); setSearchQuery(''); setSearchResults([]); }}
                                className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 text-gray-400 active:scale-95"
                            >
                                <ArrowRight size={20} className="rotate-180" />
                            </button>
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
                                <input 
                                    type="text" 
                                    autoFocus
                                    placeholder="Search username or name..." 
                                    value={searchQuery}
                                    onChange={e => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 outline-none focus:border-[#FBBF24]/50"
                                />
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto px-4 py-4">
                            {isSearching ? (
                                <div className="flex justify-center py-10">
                                    <div className="w-8 h-8 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="flex flex-col gap-2">
                                    {searchResults.map((user: any) => (
                                        <div key={user.id} className="flex items-center gap-3 bg-[#1e293b] p-3 rounded-2xl border border-white/5">
                                            {/* PFP */}
                                            <div className="relative shrink-0 w-11 h-11">
                                                <img
                                                    src={user.profileImage ?? '/default-avatar.png'}
                                                    alt={user.username}
                                                    className="w-full h-full object-cover rounded-xl bg-gray-800"
                                                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                />
                                            </div>

                                            {/* Info */}
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-white truncate leading-tight tracking-tight">
                                                    {user.realName || user.username}
                                                </h4>
                                                {user.realName && <p className="text-[10px] text-slate-500 font-medium">@{user.username}</p>}
                                            </div>

                                            {/* Actions */}
                                            <div className="flex gap-2 shrink-0">
                                                <Link 
                                                    href={`/profile/${user.id}`} 
                                                    onClick={() => setShowSearch(false)}
                                                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-300 uppercase tracking-wider"
                                                >
                                                    View
                                                </Link>
                                                {user.friendshipStatus === 'NONE' || user.friendshipStatus === 'PENDING_RECEIVED' ? (
                                                    <button 
                                                        onClick={() => { handleAddOrAccept(user.id); performSearch(searchQuery); }}
                                                        className="px-3 py-1.5 rounded-lg bg-[#FBBF24] text-slate-900 text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95"
                                                    >
                                                        <UserPlus size={12} strokeWidth={3} />
                                                        Add
                                                    </button>
                                                ) : user.friendshipStatus === 'FRIENDS' ? (
                                                    <button disabled className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                        <Check size={12} strokeWidth={3} /> Friends
                                                    </button>
                                                ) : (
                                                    <button disabled className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-500 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                        Sent
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : searchQuery.length > 0 ? (
                                <div className="text-center py-10 text-slate-500 text-sm">
                                    No users found matching "{searchQuery}"
                                </div>
                            ) : (
                                <div className="text-center py-16 text-slate-600 flex flex-col items-center">
                                    <Search size={40} className="opacity-20 mb-4" />
                                    <p className="text-sm font-medium">Search for friends to add</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
