'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, ChevronRight, Lock, Loader2, Key } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SwitchAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentUserPublicId?: string; // To highlight active account
}

export default function SwitchAccountModal({ isOpen, onClose }: SwitchAccountModalProps) {
    const router = useRouter();
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [passwordPromptId, setPasswordPromptId] = useState<string | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            try {
                const stored = JSON.parse(localStorage.getItem('pm_accounts') || '[]');
                setAccounts(stored);
            } catch (e) {
                setAccounts([]);
            }
            setPasswordPromptId(null);
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const handleSwitch = async (account: any, explicitPassword?: string) => {
        if (!account.switchToken && !explicitPassword) {
            onClose();
            router.push(`/login?preset_username=${encodeURIComponent(account.username)}`);
            return;
        }

        setLoadingId(account.id);
        setError('');

        const isInactive = (Date.now() - (account.lastActive || 0)) > 30 * 24 * 60 * 60 * 1000;
        
        if (isInactive && !explicitPassword) {
            setLoadingId(null);
            setPasswordPromptId(account.id);
            return;
        }

        try {
            const body = explicitPassword 
                ? { userId: account.id, password: explicitPassword }
                : { switchToken: account.switchToken };

            const res = await fetch('/api/auth/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (res.ok) {
                // Update local storage to renew tokens and lastActive
                const updatedAccounts = accounts.map(a => 
                    a.id === data.user.id 
                        ? { ...a, switchToken: data.switchToken, lastActive: Date.now() }
                        : a
                );
                localStorage.setItem('pm_accounts', JSON.stringify(updatedAccounts));
                window.location.href = '/home'; // full reload to reset global states safely
            } else {
                if (res.status === 401 && !explicitPassword) {
                    // Switch token failed (likely password changed)
                    setPasswordPromptId(account.id);
                } else {
                    if (!explicitPassword) {
                        setPasswordPromptId(account.id); // Open prompt so user actually sees the error UI
                    }
                    setError(data.error || 'Failed to switch account');
                }
            }
        } catch (err) {
            if (!explicitPassword) setPasswordPromptId(account.id);
            setError('Network error. Try again.');
        } finally {
            setLoadingId(null);
        }
    };

    const submitPassword = () => {
        if (!password) return;
        const targetAccount = accounts.find(a => a.id === passwordPromptId);
        if (targetAccount) {
            handleSwitch(targetAccount, password);
        }
    };

    if (!isOpen) return null;

    // Grouping
    const mainAccounts = accounts.filter(a => a.isMainAccount || !a.parentAccountId);
    const sideAccounts = accounts.filter(a => !a.isMainAccount && a.parentAccountId);

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
                onClick={onClose} 
            />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                className="relative w-full max-w-sm bg-gradient-to-b from-[#1a233a] to-[#0b1120] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
            >
                <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/5">
                    <h2 className="text-[15px] font-black text-white uppercase tracking-widest">Switch Account</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors">
                        <X size={18} strokeWidth={2.5} />
                    </button>
                </div>

                <div className="p-2 overflow-y-auto max-h-[60vh] space-y-2">
                    {accounts.length === 0 ? (
                        <div className="py-10 text-center text-slate-500 text-xs font-bold uppercase">
                            No saved accounts on device
                        </div>
                    ) : (
                        mainAccounts.map(main => {
                            const children = sideAccounts.filter(s => s.parentAccountId === main.id);
                            return (
                                <div key={main.id} className="bg-white/5 rounded-2xl border border-white/5 overflow-hidden">
                                    <AccountRow 
                                        account={main} 
                                        onSwitch={() => handleSwitch(main)} 
                                        isLoading={loadingId === main.id} 
                                    />
                                    {children.length > 0 && (
                                        <div className="bg-black/20 border-t border-white/5 pl-4 py-1">
                                            {children.map(child => (
                                                <div key={child.id} className="border-l-2 border-white/10 pl-2 my-1">
                                                    <AccountRow 
                                                        account={child} 
                                                        onSwitch={() => handleSwitch(child)} 
                                                        isLoading={loadingId === child.id}
                                                        isChild 
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {passwordPromptId && (
                     <div className="absolute inset-0 bg-[#0b1120] p-5 flex flex-col justify-center z-10 border border-white/10 rounded-3xl">
                        <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center text-rose-500 mb-4 mx-auto">
                            <Lock size={24} />
                        </div>
                        <h3 className="text-center text-white font-black uppercase text-lg mb-1">Passcode Required</h3>
                        <p className="text-center text-slate-400 text-xs mb-6 px-4">
                            For your security, please verify your identity to access this session.
                        </p>
                        
                        <div className="relative mb-4">
                            <Key size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                            <input 
                                type="password" 
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Enter account password"
                                className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#FBBF24]/50"
                                autoFocus
                                onKeyDown={e => e.key === 'Enter' && submitPassword()}
                            />
                        </div>

                        {error && (
                            <div className="text-rose-400 text-[10px] uppercase font-bold text-center mb-4 bg-rose-500/10 py-2 rounded-lg border border-rose-500/20">
                                {error}
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button onClick={() => { setPasswordPromptId(null); setPassword(''); setError(''); }} className="flex-1 py-3.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs uppercase hover:bg-slate-700 transition">
                                Cancel
                            </button>
                            <button onClick={submitPassword} disabled={loadingId !== null || password.length === 0} className="flex-1 py-3.5 bg-[#FBBF24] text-slate-900 rounded-xl font-black text-xs uppercase hover:bg-[#f59e0b] shadow-lg disabled:opacity-50 flex items-center justify-center transition">
                                {loadingId ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
                            </button>
                        </div>
                     </div>
                )}
            </motion.div>
        </div>
    );
}

function AccountRow({ account, onSwitch, isLoading, isChild = false }: { account: any, onSwitch: () => void, isLoading: boolean, isChild?: boolean }) {
    const isShadow = !account.switchToken;
    return (
        <div 
            onClick={isLoading ? undefined : onSwitch}
            className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isChild ? 'hover:bg-white/10' : 'hover:bg-white/5 active:scale-[0.98]'} ${isShadow ? 'opacity-40 grayscale hover:opacity-70' : ''}`}
        >
            <div className={`${isChild ? 'w-8 h-8' : 'w-10 h-10'} shrink-0 rounded-full bg-gray-800 border border-white/20 overflow-hidden flex items-center justify-center relative`}>
                {account.profileImage ? (
                    <img src={account.profileImage} alt="PFP" className="w-full h-full object-cover" />
                ) : (
                    <User size={16} className="text-white/50" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate leading-none mb-1 flex items-center gap-2">
                    {account.username}
                </h4>
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                    {isChild ? 'Finance Node' : 'Main Authority'}
                </p>
            </div>
            <div className="shrink-0 text-slate-500">
                {isLoading ? <Loader2 size={18} className="animate-spin text-[#FBBF24]" /> : <ChevronRight size={18} />}
            </div>
        </div>
    );
}
