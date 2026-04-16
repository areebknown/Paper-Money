'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Lock, Loader2, Key, ChevronRight, AlertCircle } from 'lucide-react';

interface SwitchAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function SwitchAccountModal({ isOpen, onClose }: SwitchAccountModalProps) {
    const [accounts, setAccounts] = useState<any[]>([]);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [passwordPromptAccount, setPasswordPromptAccount] = useState<any | null>(null);
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            try {
                const stored = JSON.parse(localStorage.getItem('pm_accounts') || '[]');
                setAccounts(stored);
            } catch {
                setAccounts([]);
            }
            setPasswordPromptAccount(null);
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    const doSwitch = async (account: any, explicitPassword?: string) => {
        setLoadingId(account.id);
        setError('');

        try {
            const body = explicitPassword
                ? { userId: account.id, password: explicitPassword }
                : { switchToken: account.switchToken };

            const res = await fetch('/api/auth/switch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            const data = await res.json();

            if (res.ok) {
                // Save updated switchToken & lastActive 
                const updatedAccounts = accounts.map(a =>
                    a.id === (data.user?.id || account.id)
                        ? { ...a, switchToken: data.switchToken, lastActive: Date.now() }
                        : a
                );
                localStorage.setItem('pm_accounts', JSON.stringify(updatedAccounts));
                // Hard navigate — replaces current history entry so back button works cleanly
                const dest = data.user?.isAdmin ? '/admin' : '/home';
                window.location.replace(dest);
            } else {
                if (res.status === 401) {
                    setPasswordPromptAccount(account);
                    setError(data.error || 'Authentication required.');
                } else {
                    setError(data.error || 'Switch failed. Try again.');
                }
                setLoadingId(null);
            }
        } catch {
            setError('Network error. Please try again.');
            setLoadingId(null);
        }
    };

    const handleAccountTap = (account: any) => {
        if (loadingId) return;

        // Shadow account — no switchToken, redirect to login with pre-filled username
        if (!account.switchToken) {
            onClose();
            // Use replace so middleware doesn't bounce back based on stale cookie
            // We blank the cookie by navigating to a logout-like URL first isn't needed
            // Instead we post to the login page with preset_username
            // Middleware bounces /login when user already has a valid session cookie.
            // Solution: use /login with a special flag to bypass redirect.
            // Actually we redirect to login with ?preset_username AND ?bypass=1 so middleware allows it
            window.location.href = `/login?preset_username=${encodeURIComponent(account.username)}&bypass=1`;
            return;
        }

        // Check 30-day inactivity
        const isInactive = account.lastActive
            ? (Date.now() - account.lastActive) > 30 * 24 * 60 * 60 * 1000
            : false;

        if (isInactive) {
            setPasswordPromptAccount(account);
            return;
        }

        doSwitch(account);
    };

    const submitPassword = () => {
        if (!password || !passwordPromptAccount) return;
        doSwitch(passwordPromptAccount, password);
    };

    // Group accounts: root accounts (main or unparented) + their children
    const rootAccounts = accounts.filter(a => !a.parentAccountId);
    const getChildren = (parentId: string) => accounts.filter(a => a.parentAccountId === parentId);

    // Also collect any accounts whose parent is NOT in our list (orphaned finance accounts)
    const knownRootIds = new Set(rootAccounts.map(a => a.id));
    const orphanedChildren = accounts.filter(a => a.parentAccountId && !knownRootIds.has(a.parentAccountId));

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[300] flex items-end sm:items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Panel */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 40 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                        className="relative w-full max-w-sm bg-gradient-to-b from-[#1a233a] to-[#0c1120] border border-white/10 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                            <h2 className="text-[13px] font-black text-white uppercase tracking-[0.15em]">
                                Switch Account
                            </h2>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                            >
                                <X size={16} strokeWidth={2.5} />
                            </button>
                        </div>

                        {/* Account List */}
                        <div className="p-3 overflow-y-auto max-h-[65vh] space-y-2">
                            {accounts.length === 0 ? (
                                <div className="py-10 text-center text-slate-500 text-[11px] font-bold uppercase tracking-widest">
                                    No saved accounts on this device
                                </div>
                            ) : (
                                <>
                                    {/* Root accounts + their linked children */}
                                    {rootAccounts.map(root => {
                                        const children = getChildren(root.id);
                                        return (
                                            <div
                                                key={root.id}
                                                className="bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden"
                                            >
                                                <AccountRow
                                                    account={root}
                                                    onTap={() => handleAccountTap(root)}
                                                    isLoading={loadingId === root.id}
                                                />
                                                {children.length > 0 && (
                                                    <div className="border-t border-white/[0.04] bg-black/20">
                                                        {children.map(child => (
                                                            <div key={child.id} className="pl-3 pr-1">
                                                                <div className="border-l-2 border-white/10 pl-3 my-1">
                                                                    <AccountRow
                                                                        account={child}
                                                                        onTap={() => handleAccountTap(child)}
                                                                        isLoading={loadingId === child.id}
                                                                        isChild
                                                                    />
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    {/* Orphaned children (parent not on device) */}
                                    {orphanedChildren.length > 0 && (
                                        <div className="bg-white/[0.04] rounded-2xl border border-white/[0.06] overflow-hidden">
                                            {orphanedChildren.map(child => (
                                                <AccountRow
                                                    key={child.id}
                                                    account={child}
                                                    onTap={() => handleAccountTap(child)}
                                                    isLoading={loadingId === child.id}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Password Prompt — overlays the panel */}
                        <AnimatePresence>
                            {passwordPromptAccount && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 10 }}
                                    className="absolute inset-0 bg-[#0c1120] p-6 flex flex-col justify-center rounded-3xl border border-white/10 z-20"
                                >
                                    <div className="w-14 h-14 bg-[#FBBF24]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                        <Lock size={26} className="text-[#FBBF24]" />
                                    </div>
                                    <h3 className="text-center text-white font-black uppercase text-base mb-1 tracking-widest">
                                        Verify Identity
                                    </h3>
                                    <p className="text-center text-slate-400 text-[11px] mb-1">
                                        Switching to{' '}
                                        <span className="text-[#FBBF24] font-bold">
                                            @{passwordPromptAccount.username}
                                        </span>
                                    </p>
                                    <p className="text-center text-slate-500 text-[10px] mb-6">
                                        Your session has expired or this account needs verification.
                                    </p>

                                    <div className="relative mb-3">
                                        <Key size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                        <input
                                            type="password"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            placeholder="Enter account password"
                                            className="w-full bg-[#1e293b] border border-white/10 rounded-xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 outline-none focus:border-[#FBBF24]/60 transition-colors"
                                            autoFocus
                                            onKeyDown={e => e.key === 'Enter' && submitPassword()}
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-rose-400 text-[10px] font-bold uppercase mb-3 bg-rose-500/10 px-3 py-2 rounded-lg border border-rose-500/20">
                                            <AlertCircle size={12} />
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => {
                                                setPasswordPromptAccount(null);
                                                setPassword('');
                                                setError('');
                                            }}
                                            className="flex-1 py-3.5 bg-slate-800 text-slate-300 rounded-xl font-bold text-xs uppercase hover:bg-slate-700 transition"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={submitPassword}
                                            disabled={loadingId !== null || password.length === 0}
                                            className="flex-1 py-3.5 bg-[#FBBF24] text-slate-900 rounded-xl font-black text-xs uppercase hover:bg-[#f59e0b] shadow-lg disabled:opacity-50 flex items-center justify-center transition"
                                        >
                                            {loadingId ? <Loader2 size={16} className="animate-spin" /> : 'Confirm'}
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}

function AccountRow({
    account,
    onTap,
    isLoading,
    isChild = false,
}: {
    account: any;
    onTap: () => void;
    isLoading: boolean;
    isChild?: boolean;
}) {
    const isShadow = !account.switchToken;

    return (
        <div
            onClick={isLoading ? undefined : onTap}
            className={`
                flex items-center gap-3 p-3 rounded-xl cursor-pointer select-none
                transition-all duration-150 active:scale-[0.97]
                ${isChild ? 'hover:bg-white/10' : 'hover:bg-white/6'}
                ${isShadow ? 'opacity-50' : ''}
            `}
        >
            {/* Avatar */}
            <div className={`${isChild ? 'w-8 h-8' : 'w-10 h-10'} shrink-0 rounded-full bg-slate-800 border border-white/15 overflow-hidden flex items-center justify-center relative`}>
                {account.profileImage ? (
                    <img src={account.profileImage} alt="pfp" className={`w-full h-full object-cover ${isShadow ? 'grayscale' : ''}`} />
                ) : (
                    <User size={16} className="text-white/50" />
                )}
                {isShadow && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
                        <Lock size={10} className="text-white/80" />
                    </div>
                )}
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate leading-tight">
                    @{account.username}
                </p>
                <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                    {isShadow
                        ? 'Tap to unlock'
                        : isChild
                        ? 'Finance Account'
                        : account.isMainAccount
                        ? 'Main Account'
                        : 'Account'}
                </p>
            </div>

            {/* Chevron / Loader */}
            <div className="shrink-0">
                {isLoading ? (
                    <Loader2 size={17} className="animate-spin text-[#FBBF24]" />
                ) : (
                    <ChevronRight size={17} className={`${isShadow ? 'text-slate-600' : 'text-slate-500'}`} />
                )}
            </div>
        </div>
    );
}
