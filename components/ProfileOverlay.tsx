import React from 'react';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { User, X, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import SwitchAccountModal from './SwitchAccountModal';

interface ProfileOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
}

export default function ProfileOverlay({ isOpen, onClose, user }: ProfileOverlayProps) {
    const router = useRouter();
    const [isSwitchModalOpen, setIsSwitchModalOpen] = useState(false);

    const menuOptions = [
        { label: 'MY PROFILE', path: `/profile/${user?.id ?? ''}` },
        { label: 'EDIT PROFILE', path: '/profile/edit' },
        { label: 'MY RANK', path: '/rank' },
        { label: 'MY STATS', path: '/stats' },
        { label: 'FRIENDS', path: '/friends' },
        { label: 'SETTINGS', path: '/settings' },
    ];

    const bottomOptions = [
        { label: 'SWITCH ACCOUNT', action: () => setIsSwitchModalOpen(true), color: 'text-slate-300' },
    ];

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) router.push('/login');
    };

    // Determine contact info based on account type
    const isMain = user?.isMainAccount;
    
    const formatContact = (type: 'main' | 'side') => {
        if (type === 'main') {
            if (user?.phoneNumber) return user.phoneNumber.startsWith('+') ? user.phoneNumber : `+91 ${user.phoneNumber}`;
            if (user?.email) return user.email;
            return 'No Phone Linked';
        } else {
            if (user?.email) return user.email;
            if (user?.phoneNumber) return user.phoneNumber.startsWith('+') ? user.phoneNumber : `+91 ${user.phoneNumber}`;
            return 'No Email Linked';
        }
    };
    
    const contactInfo = formatContact(isMain ? 'main' : 'side');

    return (
        // The outer div intercepts clicks without darkening the background
        <div className="fixed inset-0 z-[200] flex items-start justify-end p-3 pt-3" style={{ pointerEvents: 'none' }}>
            {/* Click catcher (transparent) */}
            <div 
                className="absolute inset-0" 
                style={{ pointerEvents: 'auto' }} 
                onClick={onClose} 
            />

            {/* Slide-in Panel */}
            <motion.div
                initial={{ x: '100%', opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: '100%', opacity: 0 }}
                transition={{ type: 'tween', duration: 0.25, ease: 'easeOut' }}
                style={{ pointerEvents: 'auto' }}
                className="relative w-full max-w-[255px] bg-gradient-to-b from-[#1a233a] to-[#0b1120] border border-white/10 flex flex-col rounded-[1.5rem] overflow-hidden"
            >
                <div className="p-4">
                    {/* Header: Profile picture and info side-by-side */}
                    <div className="flex items-center gap-4 mb-3 relative">
                        <div className="shrink-0 w-12 h-12 rounded-full border border-white/20 bg-gray-700 overflow-hidden flex items-center justify-center">
                            {user?.profileImage ? (
                                <img src={user?.profileImage} alt="PFP" className="w-full h-full object-cover" />
                            ) : (
                                <User className="text-white w-6 h-6" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-[17px] font-bold text-white font-['Russo_One'] truncate tracking-tight lowercase leading-none mb-1">
                                {user?.username || 'guest user'}
                            </h2>
                            <p className="text-[10px] text-slate-400 font-bold lowercase tracking-wide truncate flex items-center gap-1.5">
                                {user?.isGoogleAuth && (
                                    <svg viewBox="0 0 24 24" className="w-3 h-3 shrink-0" fill="currentColor">
                                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                                    </svg>
                                )}
                                <span>{contactInfo}</span>
                            </p>
                        </div>
                    </div>

                    {/* Thin horizontal line passing */}
                    <div className="h-px bg-white/5 mb-2 w-full" />

                    {/* Main Menu List */}
                    <nav className="flex flex-col gap-0.5">
                        {menuOptions.map((option) => (
                            <button
                                key={option.label}
                                onClick={() => {
                                    router.push(option.path);
                                    onClose();
                                }}
                                className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 text-slate-300 hover:text-white transition-colors active:scale-[0.98]"
                            >
                                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">{option.label}</span>
                            </button>
                        ))}
                    </nav>

                    {/* Thin horizontal line before footer controls */}
                    <div className="h-px bg-white/10 my-2 w-full" />

                    {/* Bottom Options */}
                    <div className="flex flex-col gap-0.5">
                        {bottomOptions.map((option) => (
                            <button
                                key={option.label}
                                onClick={option.action}
                                className={`w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-colors active:scale-[0.98] ${option.color}`}
                            >
                                <span className="text-[12px] font-bold uppercase tracking-[0.1em]">{option.label}</span>
                            </button>
                        ))}

                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-500/10 text-red-500 transition-colors active:scale-[0.98] mt-1 group"
                        >
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="text-[12px] font-bold uppercase tracking-widest">LOGOUT</span>
                        </button>
                    </div>
                </div>
                
                {/* Footer Status Bar */}
                <div className="bg-black/40 px-5 py-2.5 shrink-0 flex justify-between items-center text-[9px] text-slate-500 font-mono font-bold uppercase tracking-widest border-t border-white/5">
                    <span className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        SYSTEM ONLINE
                    </span>
                    <span className="opacity-40">v2.5.0</span>
                </div>
            </motion.div>

            {/* Switch Account Modal rendering cleanly over the overlay */}
            <SwitchAccountModal 
                isOpen={isSwitchModalOpen} 
                onClose={() => setIsSwitchModalOpen(false)} 
            />
        </div>
    );
}
