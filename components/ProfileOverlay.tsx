import React from 'react';
import { motion } from 'framer-motion';
import { User, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ProfileOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function ProfileOverlay({ isOpen, onClose, user }: ProfileOverlayProps) {
    const router = useRouter();

    const menuOptions = [
        { label: 'MY PROFILE', path: `/profile/${user?.id}` },
        { label: 'EDIT PROFILE', path: '/profile/edit' },
        { label: 'MY RANK', path: '/rank' },
        { label: 'MY STATS', path: '/stats' }, // New stats page path assumed
        { label: 'FRIENDS', path: '/friends' },
        { label: 'SETTINGS', path: '/settings' },
    ];

    const bottomOptions = [
        { label: 'SWITCH ACCOUNT', path: '/api/auth/switch', color: 'text-slate-300' },
    ];

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) router.push('/login');
    };

    // Determine contact info based on account type
    const isMain = user?.isMainAccount;
    const contactInfo = isMain 
        ? (user?.phoneNumber || user?.email || 'No Phone Linked')
        : (user?.email || user?.phoneNumber || 'No Email Linked');

    return (
        // The outer div intercepts clicks without darkening the background
        <div className="fixed inset-0 z-[200] flex justify-end" style={{ pointerEvents: 'none' }}>
            {/* Click catcher (transparent) */}
            <div 
                className="absolute inset-0" 
                style={{ pointerEvents: 'auto' }} 
                onClick={onClose} 
            />

            {/* Slide-in Panel */}
            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                style={{ pointerEvents: 'auto' }}
                className="relative w-full max-w-[320px] h-full bg-gradient-to-b from-[#1a233a] to-[#0b1120] border-l border-white/10 shadow-2xl flex flex-col"
            >
                {/* Header Context Line */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent shrink-0" />

                <div className="p-5 flex-1 overflow-y-auto">
                    {/* Header: Profile picture and info side-by-side */}
                    <div className="flex items-center gap-4 mb-5 relative">
                        <div className="shrink-0 w-16 h-16 rounded-full shadow-lg border border-white/20 bg-gray-700 overflow-hidden flex items-center justify-center">
                            {user?.profileImage ? (
                                <img src={user?.profileImage} alt="PFP" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-white w-7 h-7" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0 pr-6">
                            <h2 className="text-[18px] font-bold text-white font-['Russo_One'] truncate tracking-tight lowercase leading-none mb-1.5">
                                {user?.username || 'guest user'}
                            </h2>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wide truncate">
                                {contactInfo}
                            </p>
                        </div>
                        {/* Close button top right of header */}
                        <button onClick={onClose} className="absolute -top-1 -right-1 p-2 bg-white/5 hover:bg-white/10 rounded-full text-slate-400 transition-colors">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Thin horizontal line passing */}
                    <div className="h-px bg-white/5 mb-4 w-full" />

                    {/* Main Menu List */}
                    <nav className="flex flex-col gap-1">
                        {menuOptions.map((option) => (
                            <button
                                key={option.label}
                                onClick={() => {
                                    router.push(option.path);
                                    onClose();
                                }}
                                className="w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors active:scale-[0.98]"
                            >
                                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">{option.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Thin horizontal line before footer controls */}
                    <div className="h-px bg-white/10 my-4 w-full" />

                    {/* Bottom Options */}
                    <div className="flex flex-col gap-1">
                        {bottomOptions.map((option) => (
                            <button
                                key={option.label}
                                onClick={() => {
                                    router.push(option.path);
                                    onClose();
                                }}
                                className={`w-full text-left px-3 py-3 rounded-xl hover:bg-white/5 transition-colors active:scale-[0.98] ${option.color}`}
                            >
                                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">{option.label}</span>
                            </button>
                        ))}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors active:scale-[0.98] mt-2 group"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[12px] font-bold uppercase tracking-widest">LOGOUT</span>
                        </button>
                    </div>
                </div>
                
                {/* Footer Status Bar */}
                <div className="bg-black/40 px-6 py-3 shrink-0 flex justify-between items-center text-[10px] text-slate-500 font-mono font-bold uppercase tracking-widest border-t border-white/5">
                    <span className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        SYSTEM ONLINE
                    </span>
                    <span className="opacity-40">v2.5.0</span>
                </div>
            </motion.div>
        </div>
    );
}
