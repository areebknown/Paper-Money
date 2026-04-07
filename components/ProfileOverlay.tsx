import React from 'react';
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
        { label: 'Public Profile', path: `/profile/${user?.id}`, color: 'text-blue-400' },
        { label: 'Edit Profile', path: '/profile/edit', color: 'text-blue-400' },
        { label: 'Rank Rewards', path: '/rank', color: 'text-[#FBBF24]' },
        { label: 'Friends', path: '/friends', color: 'text-blue-400' },
        { label: 'Settings', path: '/settings', color: 'text-slate-400' },
        { label: 'Switch Account', path: '/api/auth/switch', color: 'text-emerald-400' },
    ];

    const handleLogout = async () => {
        const res = await fetch('/api/auth/logout', { method: 'POST' });
        if (res.ok) router.push('/login');
    };

    const TenLines = () => (
        <div className="flex gap-0.5 justify-center py-1.5 opacity-20 group-hover:opacity-40 transition-opacity">
            {[...Array(10)].map((_, i) => (
                <div key={i} className="w-1.5 h-[1.5px] bg-slate-400 rounded-full" />
            ))}
        </div>
    );

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
                initial={{ opacity: 0, scale: 0, originX: 1, originY: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                transition={{ type: 'spring', damping: 22, stiffness: 220 }}
                className="relative w-full max-w-[260px] bg-[#0f172a] border border-white/10 shadow-2xl rounded-[2.5rem] overflow-hidden pointer-events-auto origin-top-right"
            >
                {/* Header Context Line */}
                <div className="h-1 w-full bg-gradient-to-r from-transparent via-[#FBBF24] to-transparent" />

                <div className="p-5">
                    <div className="flex flex-col items-center text-center mb-6 pt-2">
                        <div className="w-14 h-14 rounded-full shadow-xl mb-3">
                            <div className="w-full h-full rounded-full border border-white/20 bg-gray-700 overflow-hidden flex items-center justify-center">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt="PFP" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="text-white w-6 h-6" />
                                )}
                            </div>
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-base font-bold text-white font-['Russo_One'] truncate tracking-tight uppercase leading-none mb-1">
                                {user?.username || 'GUEST USER'}
                            </h2>
                            <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase truncate max-w-[180px]">
                                {user?.email || user?.phoneNumber || 'Identity Not Linked'}
                            </p>
                        </div>
                        <button onClick={onClose} className="absolute top-6 right-6 p-1 hover:bg-white/10 rounded-full text-slate-500">
                            <X size={16} />
                        </button>
                    </div>

                    {/* Menu List */}
                    <nav className="space-y-0.5">
                        {menuOptions.map((option, idx) => (
                            <React.Fragment key={option.label}>
                                <button
                                    onClick={() => {
                                        router.push(option.path);
                                        onClose();
                                    }}
                                    className="w-full text-center py-2.5 rounded-xl hover:bg-white/5 text-slate-400 hover:text-white transition-all active:scale-[0.96] group"
                                >
                                    <span className="text-[11px] font-black uppercase tracking-[0.15em]">{option.label}</span>
                                </button>
                                {idx < menuOptions.length - 1 && <TenLines />}
                            </React.Fragment>
                        ))}

                        {/* Special Logout Option */}
                        <div className="pt-2 mt-4 border-t border-white/5">
                            <button
                                onClick={handleLogout}
                                className="w-full flex items-center justify-center gap-2 p-3 rounded-2xl hover:bg-red-500/10 text-red-500 transition-all active:scale-[0.98] group"
                            >
                                <LogOut size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Logout System</span>
                            </button>
                        </div>
                    </nav>
                </div>
                
                {/* Footer Status Bar */}
                <div className="bg-black/40 px-6 py-2 flex justify-between items-center text-[9px] text-slate-600 font-mono font-bold uppercase tracking-widest">
                    <span className="flex items-center gap-1.5 ">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        online
                    </span>
                    <span className="opacity-30">v2.4.0</span>
                </div>
            </motion.div>
        </div>
    );
}
