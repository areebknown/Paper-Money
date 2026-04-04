'use client';

import { useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { LOGO_URL } from '@/lib/cloudinary';
import ProfileOverlay from '@/components/ProfileOverlay';
import { AnimatePresence } from 'framer-motion';

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export default function Header() {
    const { data: userData } = useSWR('/api/user', fetcher);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    
    const user = userData?.user;

    return (
        <>
            <header className="relative z-[100] pt-4 pb-2 border-b border-[#FBBF24] sticky top-0 bg-gradient-to-b from-[#14254f] via-[#101d3f] to-[#0b1328] shadow-[0_18px_38px_rgba(0,0,0,0.45)] overflow-visible">
                {/* Visual Polish Lines */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent pointer-events-none" />
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-b from-transparent to-black/25 pointer-events-none" />
                
                <div className="flex justify-between items-center px-4 mb-2 relative">
                    {/* Left: Balance + Rank Points */}
                    <div className="flex flex-col gap-1 w-auto min-w-[80px]">
                        <div className="flex items-center gap-1 bg-black/30 px-2 py-0.5 rounded-full border border-white/10 whitespace-nowrap">
                            <span className="material-icons-round text-[#FBBF24] drop-shadow-md leading-none" style={{ fontSize: '14px' }}>currency_rupee</span>
                            <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">
                                {(user?.balance ? Number(user.balance) : 0).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded-full border border-white/10">
                            <span className="material-icons-round text-blue-400 drop-shadow-md leading-none" style={{ fontSize: '14px' }}>military_tech</span>
                            <span className="text-white text-[10px] font-bold font-['Russo_One'] tracking-wide">{user?.rankPoints || 0}</span>
                        </div>
                    </div>

                    {/* Center: Logo */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 top-1/2 -translate-y-1/2">
                        <Link href="/home">
                            <img
                                src={LOGO_URL}
                                alt="Bid Wars Logo"
                                className="drop-shadow-lg object-contain h-[50px] w-auto cursor-pointer active:scale-95 transition-transform"
                            />
                        </Link>
                    </div>

                    {/* Right: Notifications + Profile */}
                    <div className="flex items-center gap-3 w-24 justify-end">
                        <button className="relative w-10 h-10 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 transition active:scale-95">
                            <span className="material-icons-round text-white">notifications</span>
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-blue-400"></span>
                        </button>
                        
                        {/* Profile Trigger */}
                        <button 
                            onClick={() => setIsProfileOpen(true)}
                            className="w-10 h-10 rounded-full bg-gradient-to-br from-[#FBBF24] to-orange-500 p-0.5 shadow-lg cursor-pointer active:scale-90 transition-transform"
                        >
                            <div className="w-full h-full rounded-full border-2 border-white bg-gray-700 overflow-hidden flex items-center justify-center">
                                {user?.profileImage ? (
                                    <img src={user.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <span className="material-icons-round text-white text-xl">person</span>
                                )}
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            {/* Profile Overlay Portal-like Container */}
            <AnimatePresence>
                {isProfileOpen && (
                    <ProfileOverlay 
                        isOpen={isProfileOpen} 
                        onClose={() => setIsProfileOpen(false)} 
                        user={user}
                    />
                )}
            </AnimatePresence>
        </>
    );
}
