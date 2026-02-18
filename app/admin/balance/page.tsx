'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    Users, Wallet, TrendingUp, Search, RefreshCw,
    CheckCircle, AlertCircle, Loader2, Megaphone,
    PlusCircle, Edit3, Trash2, ChevronUp, ChevronDown
} from 'lucide-react';

interface User {
    id: string;
    username: string;
    email: string;
    balance: number;
    totalInvested: number;
    isAdmin: boolean;
    isSuspended: boolean;
    createdAt: string;
}

type SortKey = 'username' | 'balance' | 'totalInvested';
type SortDir = 'asc' | 'desc';

export default function ManageBalancePage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [sortKey, setSortKey] = useState<SortKey>('balance');
    const [sortDir, setSortDir] = useState<SortDir>('desc');

    // Broadcast state
    const [broadcastAmount, setBroadcastAmount] = useState('');
    const [broadcastLoading, setBroadcastLoading] = useState(false);
    const [broadcastMsg, setBroadcastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    // Per-user edit state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editMode, setEditMode] = useState<'set' | 'add'>('set');
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
                totalInvested: Number(u.totalInvested ?? 0),
            })));
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Broadcast to all users
    const handleBroadcast = async () => {
        const amount = parseFloat(broadcastAmount);
        if (!amount || amount <= 0) return;
        setBroadcastLoading(true);
        setBroadcastMsg(null);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ broadcast: true, amountToAdd: amount }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setBroadcastMsg({ type: 'success', text: data.message ?? `✅ Added ₹${amount} to all users` });
            setBroadcastAmount('');
            fetchUsers();
        } catch (e: any) {
            setBroadcastMsg({ type: 'error', text: e.message ?? 'Failed' });
        } finally {
            setBroadcastLoading(false);
        }
    };

    // Edit individual user balance
    const handleEditSave = async (userId: string) => {
        const amount = parseFloat(editAmount);
        if (isNaN(amount)) return;
        setEditLoading(true);
        setEditMsg(null);
        try {
            const body = editMode === 'set'
                ? { id: userId, balance: amount }
                : { id: userId, amountToAdd: amount };
            const res = await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            setEditMsg({ id: userId, type: 'success', text: '✅ Updated' });
            setEditingId(null);
            setEditAmount('');
            fetchUsers();
        } catch (e: any) {
            setEditMsg({ id: userId, type: 'error', text: e.message ?? 'Failed' });
        } finally {
            setEditLoading(false);
        }
    };

    // Toggle suspend
    const handleToggleSuspend = async (userId: string, current: boolean) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: userId, isSuspended: !current }),
            });
            fetchUsers();
        } catch { /* silent */ }
    };

    // Sort
    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
    };

    const filtered = users
        .filter(u => u.username.toLowerCase().includes(search.toLowerCase()) ||
            u.email.toLowerCase().includes(search.toLowerCase()))
        .sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortKey === 'username') return dir * a.username.localeCompare(b.username);
            return dir * (a[sortKey] - b[sortKey]);
        });

    const totalBalance = users.reduce((s, u) => s + u.balance, 0);

    const SortIcon = ({ k }: { k: SortKey }) => sortKey !== k ? null :
        sortDir === 'asc' ? <ChevronUp className="w-3 h-3 inline ml-1" /> : <ChevronDown className="w-3 h-3 inline ml-1" />;

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-emerald-500">
                        Manage Balance
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Allocate, adjust, and broadcast player balances</p>
                </div>
                <button
                    onClick={fetchUsers}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-xl text-sm text-gray-300 transition"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <StatCard icon={<Users className="w-5 h-5 text-blue-400" />} label="Total Players" value={users.length.toString()} />
                <StatCard icon={<Wallet className="w-5 h-5 text-green-400" />} label="Total Balance in System" value={`₹${totalBalance.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`} />
                <StatCard icon={<TrendingUp className="w-5 h-5 text-purple-400" />} label="Avg Balance" value={users.length ? `₹${Math.round(totalBalance / users.length).toLocaleString('en-IN')}` : '—'} />
            </div>

            {/* Broadcast Bar */}
            <div className="bg-gradient-to-r from-green-900/30 to-emerald-900/20 border border-green-700/40 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                    <Megaphone className="w-5 h-5 text-green-400" />
                    <h2 className="text-lg font-bold text-green-300">Broadcast Allocation</h2>
                    <span className="text-xs text-gray-500 ml-auto">Adds ₹ to every player's balance</span>
                </div>
                <div className="flex gap-3 flex-wrap">
                    <div className="relative flex-1 min-w-[200px]">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
                        <input
                            type="number"
                            min="1"
                            value={broadcastAmount}
                            onChange={e => setBroadcastAmount(e.target.value)}
                            placeholder="Amount to add to ALL players"
                            className="w-full pl-8 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <button
                        onClick={handleBroadcast}
                        disabled={broadcastLoading || !broadcastAmount}
                        className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-500 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl font-bold text-white transition active:scale-95"
                    >
                        {broadcastLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Megaphone className="w-4 h-4" />}
                        Broadcast
                    </button>
                </div>
                {broadcastMsg && (
                    <div className={`mt-3 flex items-center gap-2 text-sm font-medium ${broadcastMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                        {broadcastMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                        {broadcastMsg.text}
                    </div>
                )}
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search players by username or email..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
            </div>

            {/* User Table */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-12 gap-2 px-5 py-3 bg-gray-900 border-b border-gray-800 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    <div className="col-span-4 cursor-pointer hover:text-gray-300 transition" onClick={() => handleSort('username')}>
                        Player <SortIcon k="username" />
                    </div>
                    <div className="col-span-2 cursor-pointer hover:text-gray-300 transition text-right" onClick={() => handleSort('balance')}>
                        Balance <SortIcon k="balance" />
                    </div>
                    <div className="col-span-2 cursor-pointer hover:text-gray-300 transition text-right" onClick={() => handleSort('totalInvested')}>
                        Invested <SortIcon k="totalInvested" />
                    </div>
                    <div className="col-span-4 text-right">Actions</div>
                </div>

                {/* Rows */}
                {loading ? (
                    <div className="flex items-center justify-center py-16 text-gray-500">
                        <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading players...
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="text-center py-16 text-gray-600">No players found.</div>
                ) : (
                    filtered.map(user => (
                        <div key={user.id} className="border-b border-gray-800/50 last:border-0">
                            {/* Main Row */}
                            <div className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-gray-800/30 transition">
                                {/* Player Info */}
                                <div className="col-span-4 flex items-center gap-3 min-w-0">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                        {user.username[0]?.toUpperCase()}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5 flex-wrap">
                                            <span className="font-semibold text-gray-100 truncate">{user.username}</span>
                                            {user.isAdmin && <span className="text-[10px] bg-red-900/50 text-red-400 border border-red-800 px-1.5 py-0.5 rounded-full font-bold">ADMIN</span>}
                                            {user.isSuspended && <span className="text-[10px] bg-yellow-900/50 text-yellow-400 border border-yellow-800 px-1.5 py-0.5 rounded-full font-bold">SUSPENDED</span>}
                                        </div>
                                        <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                    </div>
                                </div>

                                {/* Balance */}
                                <div className="col-span-2 text-right">
                                    <span className="text-green-400 font-bold">
                                        ₹{user.balance.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                                    </span>
                                </div>

                                {/* Invested */}
                                <div className="col-span-2 text-right">
                                    <span className="text-purple-400 text-sm">
                                        ₹{user.totalInvested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-4 flex items-center justify-end gap-2 flex-wrap">
                                    <button
                                        onClick={() => {
                                            setEditingId(editingId === user.id ? null : user.id);
                                            setEditMode('set');
                                            setEditAmount(user.balance.toFixed(2));
                                            setEditMsg(null);
                                        }}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/50 rounded-lg text-blue-300 text-xs font-semibold transition"
                                    >
                                        <Edit3 className="w-3 h-3" /> Edit
                                    </button>
                                    {!user.isAdmin && (
                                        <button
                                            onClick={() => handleToggleSuspend(user.id, user.isSuspended)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${user.isSuspended
                                                ? 'bg-green-900/40 hover:bg-green-800/60 border-green-700/50 text-green-300'
                                                : 'bg-yellow-900/40 hover:bg-yellow-800/60 border-yellow-700/50 text-yellow-300'
                                                }`}
                                        >
                                            {user.isSuspended ? '✅ Unsuspend' : '⛔ Suspend'}
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Inline Edit Panel */}
                            {editingId === user.id && (
                                <div className="px-5 pb-4 bg-gray-900/60 border-t border-gray-800/50">
                                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                                        {/* Mode Toggle */}
                                        <div className="flex bg-gray-800 rounded-lg p-0.5 border border-gray-700">
                                            <button
                                                onClick={() => { setEditMode('set'); setEditAmount(user.balance.toFixed(2)); }}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${editMode === 'set' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                            >
                                                Set Balance
                                            </button>
                                            <button
                                                onClick={() => { setEditMode('add'); setEditAmount(''); }}
                                                className={`px-3 py-1.5 rounded-md text-xs font-bold transition ${editMode === 'add' ? 'bg-green-600 text-white' : 'text-gray-400 hover:text-gray-200'}`}
                                            >
                                                <PlusCircle className="w-3 h-3 inline mr-1" />Add Amount
                                            </button>
                                        </div>

                                        {/* Amount Input */}
                                        <div className="relative flex-1 min-w-[150px]">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                                            <input
                                                type="number"
                                                value={editAmount}
                                                onChange={e => setEditAmount(e.target.value)}
                                                placeholder={editMode === 'set' ? 'New balance' : 'Amount to add'}
                                                className="w-full pl-7 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                autoFocus
                                            />
                                        </div>

                                        <button
                                            onClick={() => handleEditSave(user.id)}
                                            disabled={editLoading || !editAmount}
                                            className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 rounded-lg text-white text-sm font-bold transition"
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

                                    {editMsg?.id === user.id && (
                                        <div className={`mt-2 text-xs font-medium ${editMsg.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                                            {editMsg.text}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            <p className="text-center text-xs text-gray-600">{filtered.length} of {users.length} players shown</p>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className="p-5 bg-gray-900/50 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <div className="p-2 bg-gray-800 rounded-lg">{icon}</div>
            </div>
            <div className="text-2xl font-bold text-gray-100">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
        </div>
    );
}
