'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, RefreshCw, Loader2, Calendar, User, Phone, CheckCircle, Search } from 'lucide-react';
import { format } from 'date-fns';

interface PlayerQuery {
    id: string;
    userId: string | null;
    username: string;
    contact: string;
    text: string;
    createdAt: string;
}

export default function PlayerQueriesPage() {
    const [queries, setQueries] = useState<PlayerQuery[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchQueries = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/queries');
            if (res.ok) {
                const data = await res.json();
                setQueries(data.queries || []);
            }
        } catch (error) {
            console.error('Failed to fetch queries', error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchQueries();
    }, [fetchQueries]);

    const filtered = queries.filter(q => 
        q.username.toLowerCase().includes(search.toLowerCase()) || 
        q.text.toLowerCase().includes(search.toLowerCase()) || 
        q.contact.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-500">
                        Player Queries
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Review messages and reports submitted by users via Telegram</p>
                </div>
                <button
                    onClick={fetchQueries}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 transition"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search queries by username, text, or contact..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {/* Content Area */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                    <Loader2 className="w-8 h-8 animate-spin mb-4 text-blue-500" />
                    <p className="font-semibold tracking-widest uppercase text-sm">Loading queries...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 bg-gray-900/50 border border-gray-800 rounded-2xl w-full">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4 border border-gray-700">
                        <CheckCircle className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-lg font-bold text-gray-300">Inbox Zero!</p>
                    <p className="text-gray-500 text-sm max-w-sm text-center mt-2">
                        {search ? 'No queries match your search filter.' : ' There are no incoming player queries at the moment.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {filtered.map(query => (
                        <div key={query.id} className="bg-gray-900 border border-gray-800 hover:border-gray-700 transition rounded-2xl p-5 flex flex-col items-start min-h-[160px] relative overflow-hidden group">
                           {/* Gradient Header Decorator */}
                           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-50 group-hover:opacity-100 transition" />
                           
                           <div className="flex items-center justify-between w-full mb-4">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <User className="w-4 h-4" />
                                    <span className="font-bold text-sm truncate max-w-[120px]">@{query.username}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-gray-500 bg-gray-800 px-2.5 py-1 rounded-lg">
                                    <Calendar className="w-3 h-3" />
                                    <span className="text-xs font-semibold uppercase tracking-wider">{format(new Date(query.createdAt), 'MMM dd, HH:mm')}</span>
                                </div>
                           </div>
                           
                           <p className="flex-1 text-gray-300 text-sm mb-4 leading-relaxed whitespace-pre-wrap break-words w-full selection:bg-blue-500/30">
                               "{query.text}"
                           </p>

                           <div className="w-full pt-3 mt-auto border-t border-gray-800 flex items-center justify-between text-xs font-mono text-gray-500 bg-gray-900/50">
                               <div className="flex items-center gap-1.5">
                                   <Phone className="w-3.5 h-3.5" />
                                   <span>{query.contact}</span>
                               </div>
                               <span className="text-gray-700">#{query.id.slice(-6)}</span>
                           </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
