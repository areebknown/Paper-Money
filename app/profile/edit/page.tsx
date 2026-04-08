'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { useSWRConfig } from 'swr';
import Header from '@/components/Header';
import { Camera, ArrowLeft, Loader2, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ImageCropper from '@/components/ImageCropper';

const fetcher = (url: string) => fetch(url).then(r => r.json());

export default function EditProfilePage() {
    const router = useRouter();
    const { mutate } = useSWRConfig();
    const { data, isLoading } = useSWR('/api/user', fetcher);

    const [username, setUsername] = useState('');
    const [realName, setRealName] = useState('');
    const [about, setAbout] = useState('');
    const [profileImage, setProfileImage] = useState<string | null>(null);

    const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
    const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'done' | 'error'>('idle');

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        if (data?.user) {
            setUsername(data.user.username || '');
            setRealName(data.user.realName || '');
            // NOTE: the standard /api/user might not return about text currently, let's fetch from profile endpoint if missing
            // Wait, we need the `about` field. Let's trigger a fetch to `/api/profile/[id]`
            fetch(`/api/profile/${data.user.id}`)
                .then(r => r.json())
                .then(d => {
                    if (d.profile) {
                        setAbout(d.profile.about || '');
                        setRealName(d.profile.realName || ''); // Catching realName if not in /api/user
                    }
                });
            setProfileImage(data.user.profileImage || null);
        }
    }, [data?.user]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-[#111827] flex flex-col">
                <Header />
                <div className="flex-1 flex items-center justify-center">
                    <div className="w-10 h-10 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    const user = data?.user;
    if (!user) {
        return <div className="min-h-screen bg-[#111827] flex items-center justify-center text-white">Please login.</div>;
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCropImageSrc(url);
        e.target.value = '';
    };

    const handleCropDone = async (croppedFile: File) => {
        setCropImageSrc(null);
        setUploadState('uploading');
        setError('');
        try {
            const publicId = `PM-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
            const fd = new FormData();
            fd.append('file', croppedFile);
            fd.append('folder', 'user_pfps');
            fd.append('public_id', publicId);
            
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            if (!res.ok) throw new Error();
            const data = await res.json();
            setProfileImage(data.url);
            setUploadState('done');
        } catch {
            setUploadState('error');
            setError('Image upload failed. Try again.');
        }
    };

    const handleSave = async () => {
        setError('');
        setSuccessMsg('');
        
        if (username.length < 3) return setError('Username must be at least 3 characters');
        if (username.endsWith('.')) return setError('Username cannot end with a period');
        
        if (user.isMainAccount) {
            if (realName.trim().split(' ').filter(Boolean).length < 2) {
                return setError('Real Name must contain at least two separate words');
            }
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username,
                    about,
                    profileImage,
                    ...(user.isMainAccount && { realName })
                })
            });

            const result = await res.json();
            if (!res.ok) {
                setError(result.error || 'Failed to update profile');
            } else {
                setSuccessMsg('Profile updated successfully!');
                mutate('/api/user');
                setTimeout(() => {
                    router.push(`/profile/${user.id}`);
                }, 1500);
            }
        } catch {
            setError('Connection error');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#111827] text-[#F9FAFB] font-['Inter'] antialiased pb-24">
            <Header />

            <main className="max-w-xl mx-auto px-4 pt-6 space-y-6">
                <div className="flex items-center gap-3 mb-8">
                    <button onClick={() => router.back()} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 active:scale-95 transition-all">
                        <ArrowLeft size={16} />
                    </button>
                    <h1 className="text-xl font-black text-white tracking-tight uppercase">Edit <span className="text-[#FBBF24]">Profile</span></h1>
                </div>

                {/* Profile Pic Upload */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                        <div className="w-28 h-28 rounded-3xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center overflow-hidden relative shadow-lg">
                            {profileImage ? (
                                <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Camera size={32} className={`transition-colors ${uploadState === 'uploading' ? 'animate-pulse text-[#FBBF24]' : 'text-slate-600'}`} />
                            )}
                            {uploadState === 'uploading' && (
                                <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center">
                                    <Loader2 size={24} className="animate-spin text-[#FBBF24]" />
                                </div>
                            )}
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange} 
                                disabled={uploadState === 'uploading'} 
                                className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed" 
                            />
                        </div>
                    </div>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tap to change avatar</p>
                </div>

                {/* Form Fields */}
                <div className="space-y-5 bg-slate-900/50 p-5 rounded-3xl border border-slate-800/50">
                    
                    {/* Username */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
                            className="w-full bg-slate-900/80 border border-slate-800 px-4 py-3.5 rounded-xl text-white font-mono text-sm outline-none focus:border-[#FBBF24] transition-colors"
                            placeholder="username"
                        />
                        <p className="text-[9px] text-slate-500 mt-1 pl-1">Lowercase letters, numbers, underscores, and periods.</p>
                    </div>

                    {/* Real Name (Main Account Only) */}
                    {user.isMainAccount && (
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">Real Name</label>
                            <input
                                type="text"
                                value={realName}
                                onChange={(e) => {
                                    const val = e.target.value.replace(/[^A-Za-z\s]/g, '').replace(/\s+/g, ' ');
                                    const formatted = val.split(' ').map(word => Math.max(word.length, 0) ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase() : '').join(' ');
                                    setRealName(formatted);
                                }}
                                className="w-full bg-slate-900/80 border border-slate-800 px-4 py-3.5 rounded-xl text-white outline-none focus:border-[#FBBF24] transition-colors"
                                placeholder="Areeb Ghous"
                            />
                            <p className="text-[9px] text-slate-500 mt-1 pl-1">Must contain at least two separate words.</p>
                        </div>
                    )}

                    {/* About */}
                    <div>
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1 mb-1.5 block">About (Bio)</label>
                        <textarea
                            value={about}
                            onChange={(e) => setAbout(e.target.value)}
                            maxLength={160}
                            className="w-full bg-slate-900/80 border border-slate-800 px-4 py-3.5 rounded-xl text-white text-sm outline-none focus:border-[#FBBF24] transition-colors resize-none h-24"
                            placeholder="Tell everyone a bit about yourself..."
                        />
                        <p className="text-[9px] text-slate-500 mt-1 pl-1 text-right">{about.length}/160</p>
                    </div>

                </div>

                <button
                    onClick={handleSave}
                    disabled={isSaving || uploadState === 'uploading' || username.endsWith('.')}
                    className="w-full bg-[#FBBF24] text-slate-950 font-black py-4 rounded-2xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg shadow-[#FBBF24]/20 disabled:opacity-50"
                >
                    {isSaving ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} /> Save Changes</>}
                </button>

            </main>

            {/* Notifications */}
            <AnimatePresence>
                {error && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-6 left-6 right-6 bg-rose-500/10 border border-rose-500/20 backdrop-blur-xl p-4 rounded-2xl shadow-2xl z-50 border-l-4 border-l-rose-500">
                        <p className="text-rose-500 font-black text-[10px] uppercase tracking-widest mb-1">Error</p>
                        <p className="text-rose-400 text-[11px] font-mono leading-tight">{error}</p>
                    </motion.div>
                )}
                {successMsg && (
                    <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-6 left-6 right-6 bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl p-4 rounded-2xl shadow-2xl z-50 border-l-4 border-l-emerald-500">
                        <p className="text-emerald-500 font-black text-[10px] uppercase tracking-widest mb-1">Success</p>
                        <p className="text-emerald-400 text-[11px] font-mono leading-tight">{successMsg}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cropper Overlay */}
            <AnimatePresence>
                {cropImageSrc && (
                    <ImageCropper
                        imageSrc={cropImageSrc}
                        onCropDone={handleCropDone}
                        onCropCancel={() => setCropImageSrc(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
