
'use client';

import { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/navigation';
import { Trash2, Edit2, Check, X, Eye, EyeOff, LogOut, Users, DollarSign, ShieldAlert, RefreshCcw } from 'lucide-react';
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

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
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

                {/* Global Actions Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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

                    {/* Market Management Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-full flex flex-col">
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <RefreshCcw size={20} className="text-emerald-600" />
                                <h2 className="text-lg font-semibold text-gray-800 tracking-tight">Market Management</h2>
                            </div>
                            <p className="text-xs text-gray-500 font-medium leading-relaxed">
                                Manually trigger the 12:00 AM market update. Roll the dice for all assets.
                            </p>
                        </div>
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
                            className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-black transition w-full mt-auto"
                        >
                            Trigger Next Day
                        </button>
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
                                <th className="p-4 font-semibold text-gray-600 text-right">Balance</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {data?.users?.map((user: any) => (
                                <tr key={user.id} className="hover:bg-gray-50 transition">
                                    <td className="p-4 font-medium text-gray-900">{user.username}</td>
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
                                    <td className="p-4 text-right">
                                        {editingId === user.id ? (
                                            <div className="flex items-center justify-end gap-2">
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
                                            <span className="font-semibold text-gray-900">₹{user.balance.toFixed(2)}</span>
                                        )}
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
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
