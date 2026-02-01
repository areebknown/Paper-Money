
'use client';
import React from 'react';
import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Check, X, Eye, EyeOff, LogOut, Users, DollarSign, ShieldAlert, RefreshCcw, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function AdminPage() {
    const router = useRouter();
    const { data, error, isLoading } = useSWR('/api/admin/users', fetcher);

    const [editingId, setEditingId] = useState<string | null>(null);
    const [editBalance, setEditBalance] = useState('');
    const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});
    const [broadcastAmount, setBroadcastAmount] = useState('');
    const [broadcastLoading, setBroadcastLoading] = useState(false);
    const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
    const [selectedAssetId, setSelectedAssetId] = useState('ALL');
    const [crashMagnitude, setCrashMagnitude] = useState('20');
    const [crashLoading, setCrashLoading] = useState(false);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
    };

    const handleScheduleCrash = async () => {
        if (!crashMagnitude || isNaN(parseFloat(crashMagnitude))) return;
        const mag = parseFloat(crashMagnitude);
        if (mag < 0 || mag > 100) return alert('Enter a value between 0-100');

        const assetName = selectedAssetId === 'ALL' ? 'the ENTIRE market' : selectedAssetId;
        if (!confirm(`Schedule a ${mag}% crash for ${assetName}? This will execute at the next 12:00 AM update.`)) return;

        setCrashLoading(true);
        try {
            const res = await fetch('/api/admin/market/crash', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ assetId: selectedAssetId, magnitude: mag }),
            });
            const result = await res.json();
            if (res.ok) {
                alert(result.message);
                setCrashMagnitude('20');
            } else {
                alert(result.error || 'Failed to schedule crash');
            }
        } catch (e) {
            alert('Scheduling failed');
        } finally {
            setCrashLoading(false);
        }
    };

    const deleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user? All their transaction history will also be removed. Continue?')) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                mutate('/api/admin/users');
            } else {
                const data = await res.json();
                alert(`Error: ${data.error || 'Failed to delete user'}`);
            }
        } catch (e) {
            alert('Failed to delete: Network error');
        }
    };

    const startEdit = (user: any) => {
        setEditingId(user.id);
        setEditBalance(user.balance.toString());
    };

    const saveEdit = async (id: string) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, balance: editBalance }),
            });
            setEditingId(null);
            mutate('/api/admin/users');
        } catch (e) {
            alert('Failed to update');
        }
    };

    const togglePassword = (id: string) => {
        setShowPasswords(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSuspension = async (id: string, currentStatus: boolean) => {
        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isSuspended: !currentStatus }),
            });
            mutate('/api/admin/users');
        } catch (e) {
            alert('Failed to toggle suspension');
        }
    };

    const handleBroadcast = async () => {
        if (!broadcastAmount || isNaN(parseFloat(broadcastAmount))) return;
        if (!confirm(`Give ₹${broadcastAmount} to ALL users?`)) return;

        setBroadcastLoading(true);
        try {
            await fetch('/api/admin/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ broadcast: true, amountToAdd: broadcastAmount }),
            });
            setBroadcastAmount('');
            mutate('/api/admin/users');
            alert('Broadcast successful!');
        } catch (e) {
            alert('Broadcast failed');
        } finally {
            setBroadcastLoading(false);
        }
    };

    if (error) return <div className="p-8 text-center text-red-500">Failed to load users (Access Denied?)</div>;
    if (isLoading) return <div className="p-8 text-center">Loading Admin Panel...</div>;

    return (
        <div className="min-h-screen bg-gray-100 p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                            <Users className="text-indigo-600" /> Admin Panel
                        </h1>
                        <p className="text-gray-500">Manage users and finances</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg shadow-sm hover:bg-red-50 transition"
                    >
                        <LogOut size={18} /> Logout
                    </button>
                </div>

                {/* Market Control & Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Airdrop Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <DollarSign size={20} className="text-emerald-600" /> Airdrop Money
                        </h2>
                        <div className="flex gap-4 items-end mt-auto">
                            <div className="flex-1">
                                <label className="block text-xs font-medium text-gray-400 mb-1">Amount to give everyone</label>
                                <input
                                    type="number"
                                    value={broadcastAmount}
                                    onChange={(e) => setBroadcastAmount(e.target.value)}
                                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 ring-emerald-500 outline-none text-gray-900"
                                    placeholder="100"
                                />
                            </div>
                            <button
                                onClick={handleBroadcast}
                                disabled={broadcastLoading}
                                className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-emerald-700 transition disabled:opacity-50"
                            >
                                {broadcastLoading ? 'Processing...' : 'Send All'}
                            </button>
                        </div>
                    </div>

                    {/* Market Crash Scheduler Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <h2 className="text-lg font-semibold mb-4 text-gray-800 flex items-center gap-2">
                            <ShieldAlert size={20} className="text-red-500" /> Market Control
                        </h2>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-4">Schedule Next Day Crash</p>

                        <div className="space-y-4 mt-auto">
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Asset</label>
                                    <select
                                        value={selectedAssetId}
                                        onChange={(e) => setSelectedAssetId(e.target.value)}
                                        className="w-full px-2 py-1.5 bg-gray-50 border rounded-lg text-xs font-bold text-gray-900 outline-none focus:ring-2 ring-red-100"
                                    >
                                        <option value="ALL">ALL MINERALS</option>
                                        <option value="IRON">IRON</option>
                                        <option value="COPPER">COPPER</option>
                                        <option value="SILVER">SILVER</option>
                                        <option value="GOLD">GOLD</option>
                                        <option value="LITHIUM">LITHIUM</option>
                                        <option value="OIL">CRUDE OIL</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[8px] font-black text-gray-400 uppercase mb-1">Loss %</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={crashMagnitude}
                                            onChange={(e) => setCrashMagnitude(e.target.value)}
                                            className="w-full px-2 py-1.5 bg-gray-50 border rounded-lg text-xs font-black text-gray-900 outline-none focus:ring-2 ring-red-100"
                                            placeholder="20"
                                        />
                                        <span className="absolute right-2 top-1.5 text-[10px] font-black text-gray-400">%</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={handleScheduleCrash}
                                disabled={crashLoading}
                                className="w-full bg-red-600 text-white py-2 rounded-lg font-black text-xs uppercase tracking-widest hover:bg-red-700 transition shadow-lg shadow-red-100 disabled:opacity-50"
                            >
                                {crashLoading ? 'Scheduling...' : 'Schedule Crash'}
                            </button>
                        </div>
                    </div>

                    {/* Market Management Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCcw size={20} className="text-emerald-600" />
                                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Market Sync</h2>
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Force trigger 12:00 AM update. Execute any scheduled crashes now.
                            </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-auto">
                            <button
                                onClick={async () => {
                                    if (!confirm('Force a market update? This will change all prices and add to history.')) return;
                                    try {
                                        const res = await fetch('/api/market/sync', { method: 'POST' });
                                        if (res.ok) {
                                            alert('Market updated successfully!');
                                            router.refresh();
                                        }
                                    } catch (e) { alert('Sync failed'); }
                                }}
                                className="bg-gray-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-black transition flex items-center justify-center gap-2 text-xs"
                            >
                                <RefreshCcw size={14} /> Next Day
                            </button>
                            <button
                                onClick={async () => {
                                    if (!confirm('EXTREME WARNING: This will reset all prices to Day 1 AND DELETE ALL USER PORTFOLIOS. Continue?')) return;
                                    try {
                                        const res = await fetch('/api/market/reset', { method: 'POST' });
                                        if (res.ok) {
                                            alert('Market reset to Day 1 successfully!');
                                            router.refresh();
                                        }
                                    } catch (e) { alert('Reset failed'); }
                                }}
                                className="bg-red-50 text-red-600 border border-red-100 px-4 py-2 rounded-lg font-medium hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2 text-xs"
                            >
                                <X size={14} /> Reset
                            </button>
                        </div>
                    </div>
                </div>

                {/* User Table */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                                <th className="p-4 font-semibold text-gray-600">Username</th>
                                <th className="p-4 font-semibold text-gray-600">Password</th>
                                <th className="p-4 font-semibold text-gray-600">Role</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Status</th>
                                <th className="p-4 font-semibold text-gray-600">Balance</th>
                                <th className="p-4 font-semibold text-gray-600">Invested</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.users?.map((user: any) => (
                                <React.Fragment key={user.id}>
                                    <tr className="hover:bg-gray-50 transition border-b border-gray-100 last:border-0">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setExpandedUserId(expandedUserId === user.id ? null : user.id)}
                                                    className="p-1 hover:bg-gray-200 rounded-md transition text-gray-400"
                                                >
                                                    {expandedUserId === user.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                                </button>
                                                <span className="font-medium text-gray-900">{user.username}</span>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-gray-600 bg-gray-100 px-2 py-1 rounded text-sm">
                                                    {showPasswords[user.id] ? user.password : '••••••••'}
                                                </span>
                                                <button onClick={() => togglePassword(user.id)} className="text-gray-400 hover:text-indigo-600">
                                                    {showPasswords[user.id] ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            {user.isAdmin ? (
                                                <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">Admin</span>
                                            ) : (
                                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">User</span>
                                            )}
                                        </td>
                                        <td className="p-4 text-center">
                                            {user.isSuspended ? (
                                                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter shadow-sm border border-red-200">Suspended</span>
                                            ) : (
                                                <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border border-emerald-200">Active</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-semibold text-gray-900">
                                            {editingId === user.id ? (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="number"
                                                        value={editBalance}
                                                        onChange={(e) => setEditBalance(e.target.value)}
                                                        className="w-24 px-2 py-1 border rounded text-right text-gray-900"
                                                    />
                                                    <button onClick={() => saveEdit(user.id)} className="text-green-600"><Check size={18} /></button>
                                                    <button onClick={() => setEditingId(null)} className="text-gray-400"><X size={18} /></button>
                                                </div>
                                            ) : (
                                                <span>₹{Number(user.balance).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                            )}
                                        </td>
                                        <td className="p-4 font-semibold text-indigo-600">
                                            ₹{user.totalInvested?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex justify-center gap-4">
                                                {!user.isAdmin && (
                                                    <button
                                                        onClick={() => toggleSuspension(user.id, user.isSuspended)}
                                                        className={cn(
                                                            "p-2 rounded-full transition-all border",
                                                            user.isSuspended
                                                                ? "bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-600 hover:text-white"
                                                                : "bg-red-50 text-red-600 border-red-200 hover:bg-red-600 hover:text-white"
                                                        )}
                                                        title={user.isSuspended ? "Reactivate User" : "Suspend User"}
                                                    >
                                                        {user.isSuspended ? <Check size={18} /> : <EyeOff size={18} />}
                                                    </button>
                                                )}
                                                <button onClick={() => startEdit(user)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-full transition">
                                                    <Edit2 size={18} />
                                                </button>
                                                {!user.isAdmin && (
                                                    <button onClick={() => deleteUser(user.id)} className="text-red-600 hover:bg-red-50 p-2 rounded-full transition">
                                                        <Trash2 size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedUserId === user.id && (
                                        <tr className="bg-indigo-50/30">
                                            <td colSpan={7} className="p-0">
                                                <div className="px-14 py-6 animate-in slide-in-from-top-2 duration-300">
                                                    <div className="bg-white rounded-2xl border border-indigo-100 shadow-sm overflow-hidden">
                                                        <div className="bg-indigo-50/50 px-4 py-2 border-b border-indigo-100 flex justify-between items-center">
                                                            <span className="text-xs font-black text-indigo-900 uppercase tracking-widest">User Portfolio Snapshot</span>
                                                            <span className="text-[10px] font-bold text-indigo-400 uppercase">Holdings as of Today</span>
                                                        </div>
                                                        <table className="w-full text-left text-sm">
                                                            <thead>
                                                                <tr className="border-b border-gray-50">
                                                                    <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Asset Name</th>
                                                                    <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Units Owned</th>
                                                                    <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Avg Cost</th>
                                                                    <th className="px-4 py-3 font-bold text-gray-400 uppercase text-[10px]">Market Price</th>
                                                                    <th className="px-4 py-3 text-right font-bold text-gray-400 uppercase text-[10px]">Current Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody className="divide-y divide-gray-50 font-medium">
                                                                {user.portfolios && user.portfolios.length > 0 ? (
                                                                    user.portfolios.map((p: any) => {
                                                                        const currentValue = p.units * Number(p.asset.currentPrice);
                                                                        const avgCost = Number(p.totalCost) / p.units;
                                                                        return (
                                                                            <tr key={p.id} className="hover:bg-gray-50/50">
                                                                                <td className="px-4 py-3 text-gray-900 font-bold">{p.asset.name}</td>
                                                                                <td className="px-4 py-3 text-gray-600">{p.units.toLocaleString()} <span className="text-[10px] opacity-60 lowercase">{p.asset.unit.split(' ')[1]}s</span></td>
                                                                                <td className="px-4 py-3 text-gray-500">₹{avgCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                                <td className="px-4 py-3 text-gray-500">₹{Number(p.asset.currentPrice).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                                <td className="px-4 py-3 text-right font-bold text-indigo-600">₹{currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                                                            </tr>
                                                                        );
                                                                    })
                                                                ) : (
                                                                    <tr>
                                                                        <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic font-medium">
                                                                            No active investments found for this user.
                                                                        </td>
                                                                    </tr>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

