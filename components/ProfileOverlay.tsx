'use client';

import { motion } from 'framer-motion';
import { 
    User, 
    Edit2, 
    Award, 
    Users, 
    Settings, 
    RefreshCcw, 
    LogOut, 
    X,
    ShieldCheck
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function ProfileOverlay({ isOpen, onClose, user }: ProfileOverlayProps) {
    const router = useRouter();

    const menuOptions = [
        { label: 'Public Profile', icon: User, path: `/profile/${user?.id}`, color: 'text-cyan-400' },
        { label: 'Edit Profile', icon: Edit2, path: '/profile/edit', color: 'text-blue-400' },
        { label: 'Rank Rewards', icon: Award, path: '/rank', color: 'text-[#FBBF24]' },
        { label: 'Friends', icon: Users, path: '/friends', color: 'text-indigo-400' },
        { label: 'Settings', icon: Settings, path: '/settings', color: 'text-slate-400' },
        { label: 'Switch Account', icon: RefreshCcw, path: '/api/auth/switch', color: 'text-emerald-400' },
    ];

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) router.push('/login');
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-start justify-end p-4 pointer-events-none">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="fixed inset-0 bg-black/60 pointer-events-auto"
            />

            {/* Content Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -20, x: 20 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-[320px] bg-[#0f172a] border border-white/10 shadow-2xl rounded-3xl overflow-hidden pointer-events-auto"
            >
                {/* Header Context Line */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent" />

                <div className="p-6 space-y-6">
                    {/* Identity Header */}
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#FBBF24] to-orange-500 p-0.5 shadow-xl">
                            <div className="w-full h-full rounded-full border-2 border-white bg-gray-700 overflow-hidden flex items-center justify-center">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt="PFP" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-white w-8 h-8" />
                                )}
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-lg font-bold text-white font-['Russo_One'] truncate leading-tight">
                                {user?.username || 'GUEST USER'}
                            </h2>
                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                {user?.isMainAccount && <ShieldCheck size={12} className="text-[#FBBF24]" />}
                                {user?.email || user?.phoneNumber || 'Identity Not Linked'}
                            </p>
                            {/* PMUID Display */}
                            <div className="mt-1 flex items-center gap-1">
                                <span className="bg-white/5 text-[9px] px-2 py-0.5 rounded border border-white/10 text-white font-mono uppercase tracking-tighter">
                                    {user?.publicId || 'ID-FETCHING...'}
                                </span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full text-slate-500 transition-colors">
                            <X size={18} />
                        </button>
                    </div>

                    {/* Menu List */}
                    <nav className="space-y-1">
                        {menuOptions.map((option) => (
                            <button
                                key={option.label}
                                onClick={() => {
                                    router.push(option.path);
                                    onClose();
                                }}
                                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-white/5 text-slate-300 transition-all active:scale-[0.98] group"
                            >
                                <div className={`p-2 rounded-xl bg-white/5 group-hover:bg-white/10 transition-colors ${option.color}`}>
                                    <option.icon size={18} />
                                </div>
                                <span className="text-sm font-semibold tracking-wide">{option.label}</span>
                            </button>
                        ))}

                        {/* Special Logout Option */}
                        <div className="pt-2 mt-2 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center gap-4 p-3 rounded-2xl hover:bg-red-500/10 text-red-400 transition-all active:scale-[0.98] group"
                            >
                                <div className="p-2 rounded-xl bg-red-500/5 group-hover:bg-red-500/10 transition-colors">
                                    <LogOut size={18} />
                                </div>
                                <span className="text-sm font-bold uppercase tracking-widest">Logout System</span>
                            </button>
                        </div>
                    </nav>
                </div>
                
                {/* Footer Status Bar */}
                <div className="bg-black/40 px-6 py-3 flex justify-between items-center text-[10px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1 italic lowercase">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Server Link Active
                    </span>
                    <span className="opacity-50">v2.4.0</span>
                </div>
            </motion.div>
        </div>
    );
}
