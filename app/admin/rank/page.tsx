'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, TrendingUp, Search, RefreshCw,
    CheckCircle, AlertCircle, Loader2,
    Edit3, ChevronUp, ChevronDown, PlusCircle, MinusCircle
} from 'lucide-react';

interface User {
    id: string;
    username: string;
    email: string;
    balance: number;
    rankPoints: number;
    rankTier: string;
    loanTokens: number;
    isAdmin: boolean;
    isSuspended: boolean;
}

type SortKey = 'username' | 'rankPoints';
type SortDir = 'asc' | 'desc';

const RANK_TIERS = [
    { name: 'ROOKIE', minPoints: 0, maxPoints: 199 },
    { name: 'DEALER', minPoints: 200, maxPoints: 499 },
    { name: 'FINANCIER', minPoints: 500, maxPoints: 999 },
    { name: 'TYCOON', minPoints: 1000, maxPoints: 2499 },
    { name: 'CROWN', minPoints: 2500, maxPoints: 4999 },
    { name: 'CROWN+', minPoints: 5000, maxPoints: 9999 },
    { name: 'MONARCH', minPoints: 10000, maxPoints: Infinity },
];

function getRankForPoints(points: number): string {
    return RANK_TIERS.findLast(t => points >= t.minPoints)?.name ?? 'ROOKIE';
}

export default function ManageRankPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('rankPoints');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<'set' | 'add' | 'subtract'>('set');
    const [editAmount, setEditAmount] = useState('');
    const [editLoading, setEditLoading] = useState(false);
    const [editMsg, setEditMsg] = useState<{ id: string; type: 'success' | 'error'; text: string } | null>(null);

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/users');
            if (!res.ok) throw new Error('Failed to fetch');
            const data = await res.json();
            setUsers(data.users.map((u: any) => ({
                ...u,
                balance: Number(u.balance),
                rankPoints: Number(u.rankPoints ?? 0),
            })));
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    const handleEditSave = async (userId: string) => {
        const amount = parseInt(editAmount, 10);
        if (isNaN(amount)) return;
        setEditLoading(true);
        setEditMsg(null);
        try {
            let newPoints: number;
            const user = users.find(u => u.id === userId);
            if (!user) throw new Error('User not found');

            if (editMode === 'set') newPoints = Math.max(0, amount);
            else if (editMode === 'add') newPoints = Math.max(0, user.rankPoints + amount);
            else newPoints = Math.max(0, user.rankPoints - amount);

            const res = await fetch('/api/admin/rank', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, rankPoints: newPoints }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setEditMsg({ id: userId, type: 'success', text: `✅ Updated to ${newPoints} RP` });
            setEditingId(null);
            setEditAmount('');
            fetchUsers();
        } catch (e: any) {
            setEditMsg({ id: userId, type: 'error', text: e.message ?? 'Failed' });
        } finally {
            setEditLoading(false);
        }
    };

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const SortIcon = ({ k }: { k: SortKey }) => sortKey !== k ? null :
        sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;

    const TIER_COLORS: Record<string, string> = {
        ROOKIE: 'text-orange-400 bg-orange-900/30 border-orange-800',
        DEALER: 'text-blue-400 bg-blue-900/30 border-blue-800',
        FINANCIER: 'text-purple-400 bg-purple-900/30 border-purple-800',
        TYCOON: 'text-green-400 bg-green-900/30 border-green-800',
        CROWN: 'text-yellow-400 bg-yellow-900/30 border-yellow-800',
        'CROWN+': 'text-amber-300 bg-amber-900/30 border-amber-700',
        MONARCH: 'text-white bg-white/10 border-white/30',
    };

    const filtered = users
        .filter(u => u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortKey === 'username') return dir * a.username.localeCompare(b.username);
            return dir * (a.rankPoints - b.rankPoints);
        });

    const avgPoints = users.length ? Math.round(users.reduce((s, u) => s + u.rankPoints, 0) / users.length) : 0;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-orange-500">
                        Manage Rank Points
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Adjust and preview player rank progression</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 transition"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-blue-400" /></div>
                    <div className="text-2xl font-bold text-gray-100">{users.length}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Total Players</div>
                </div>
                <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-yellow-400" /></div>
                    <div className="text-2xl font-bold text-gray-100">{avgPoints} RP</div>
                    <div className="text-xs text-gray-500 mt-0.5">Average Rank Points</div>
                </div>
                <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
                    <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-purple-400" /></div>
                    <div className="text-2xl font-bold text-gray-100">
                        {users.filter(u => u.rankPoints >= 1000).length}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">Tycoon+ Players</div>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search by username or email..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
            </div>

            {/* Rank Reference */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Rank Thresholds</p>
                <div className="flex flex-wrap gap-2">
                    {RANK_TIERS.map(t => (
                        <div key={t.name} className={`px-3 py-1 rounded-full text-xs font-bold border ${TIER_COLORS[t.name] ?? 'text-gray-400 bg-gray-800 border-gray-700'}`}>
                            {t.name}: {t.minPoints}–{t.maxPoints === Infinity ? '∞' : t.maxPoints} RP
                        </div>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-900 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4 cursor-pointer hover:text-gray-300 transition" onClick={() => handleSort('username')}>
                        Player <SortIcon k="username" />
                    </div>
                    <div className="col-span-2 cursor-pointer hover:text-gray-300 transition" onClick={() => handleSort('rankPoints')}>
                        Rank Points <SortIcon k="rankPoints" />
                    </div>
                    <div className="col-span-2">Tier</div>
                    <div className="col-span-4 text-right">Actions</div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading players...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-600">No players found.</div>
                ) : (
                    filtered.map(user => {
                        const tierColor = TIER_COLORS[getRankForPoints(user.rankPoints)] ?? '';
                        return (
                            <div key={user.id} className="border-b border-gray-800/50 last:border-0">
                                <div className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-gray-800/30 transition">
                                    {/* Player */}
                                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {user.username[0]?.toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <div className="font-semibold text-gray-100 truncate">{user.username}</div>
                                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                        </div>
                                    </div>
                                    {/* RP */}
                                    <div className="col-span-2">
                                        <span className="text-yellow-400 font-bold font-mono">{user.rankPoints.toLocaleString()} RP</span>
                                    </div>
                                    {/* Tier badge */}
                                    <div className="col-span-2">
                                        <span className={`text-[11px] font-black px-2 py-1 rounded-full border ${tierColor}`}>
                                            {getRankForPoints(user.rankPoints)}
                                        </span>
                                    </div>
                                    {/* Actions */}
                                    <div className="col-span-4 flex items-center justify-end gap-2">
                                        {editMsg?.id === user.id && editingId !== user.id && (
                                            <span className={`text-xs font-medium ${editMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>{editMsg.text}</span>
                                        )}
                                        <button
                                            onClick={() => {
                                                setEditingId(editingId === user.id ? null : user.id);
                                                setEditMode('set');
                                                setEditAmount(String(user.rankPoints));
                                                setEditMsg(null);
                                            }}
                                            className="flex items-center gap-1 px-3 py-1.5 bg-yellow-900/40 hover:bg-yellow-800/60 border border-yellow-700/50 rounded-lg text-yellow-300 text-xs font-semibold transition"
                                        >
                                            <Edit3 className="w-3 h-3" /> Edit
                                        </button>
                                    </div>
                                </div>

                                {/* Inline Edit Panel */}
                                {editingId === user.id && (
                                    <div className="px-5 pb-4 bg-gray-900/60 border-t border-gray-800/50">
                                        <div className="flex items-center gap-3 mt-3 flex-wrap">
                                            {/* Mode Toggle */}
                                            <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
                                                {([
                                                    { mode: 'set', label: 'Set to', icon: null },
                                                    { mode: 'add', label: '+ Add', icon: <PlusCircle className="w-3 h-3 inline mr-1" /> },
                                                    { mode: 'subtract', label: '− Remove', icon: <MinusCircle className="w-3 h-3 inline mr-1" /> },
                                                ] as const).map(({ mode, label, icon }) => (
                                                    <button
                                                        key={mode}
                                                        onClick={() => { setEditMode(mode); setEditAmount(mode === 'set' ? String(user.rankPoints) : ''); }}
                                                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${editMode === mode ? 'bg-yellow-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                                    >
                                                        {icon}{label}
                                                    </button>
                                                ))}
                                            </div>

                                            {/* Input */}
                                            <input
                                                type="number"
                                                min="0"
                                                value={editAmount}
                                                onChange={e => setEditAmount(e.target.value)}
                                                placeholder={editMode === 'set' ? 'New RP value' : 'Amount of RP'}
                                                className="flex-1 min-w-[120px] px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                                autoFocus
                                            />

                                            <button
                                                onClick={() => handleEditSave(user.id)}
                                                disabled={editLoading || !editAmount}
                                                className="flex items-center gap-1.5 px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:opacity-40 rounded-lg text-white text-sm font-bold transition"
                                            >
                                                {editLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <CheckCircle className="w-3 h-3" />}
                                                Save
                                            </button>
                                            <button
                                                onClick={() => { setEditingId(null); setEditMsg(null); }}
                                                className="px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-400 text-sm transition"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                        {/* Preview new rank */}
                                        {editAmount && (
                                            <p className="mt-2 text-xs text-gray-500">
                                                Preview rank:{' '}
                                                <strong className="text-yellow-300">
                                                    {editMode === 'set'
                                                        ? getRankForPoints(Math.max(0, parseInt(editAmount, 10) || 0))
                                                        : editMode === 'add'
                                                            ? getRankForPoints(Math.max(0, user.rankPoints + (parseInt(editAmount, 10) || 0)))
                                                            : getRankForPoints(Math.max(0, user.rankPoints - (parseInt(editAmount, 10) || 0)))
                                                    }
                                                </strong>
                                            </p>
                                        )}
                                        {editMsg?.id === user.id && (
                                            <div className={`mt-2 text-xs font-medium ${editMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                                {editMsg.text}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <p className="text-center text-xs text-gray-600">{filtered.length} of {users.length} players shown</p>
        </div>
    );
}
