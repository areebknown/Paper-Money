'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';
import { LOGO_URL } from '@/lib/cloudinary';

// ─── Tier Styling ─────────────────────────────────────────────────────────────
const TIER_CONFIG: Record<string, {
    bgColor: string;          // card background (subtle tint)
    badgeClass: string;       // inline style for the tier badge text
    borderColor: string;
}> = {
    'E':    { bgColor: 'radial-gradient(circle at top right, #242c41 0%, #1a1f2e 100%)',      badgeClass: 'text-gray-400',                                                   borderColor: '#4b5563' },
    'D':    { bgColor: 'radial-gradient(circle at top right, #1d3321 0%, #162318 100%)',      badgeClass: 'text-emerald-400',                                                borderColor: '#10b981' },
    'C':    { bgColor: 'radial-gradient(circle at top right, #1a2a47 0%, #111b2e 100%)',      badgeClass: 'text-blue-400',                                                   borderColor: '#3b82f6' },
    'B':    { bgColor: 'radial-gradient(circle at top right, #2c2445 0%, #1a1528 100%)',      badgeClass: 'bg-gradient-to-r from-slate-300 to-white bg-clip-text text-transparent', borderColor: '#94a3b8' },
    'A':    { bgColor: 'radial-gradient(circle at top right, #383018 0%, #1e1a10 100%)',      badgeClass: 'bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent', borderColor: '#f59e0b' },
    'S':    { bgColor: 'radial-gradient(circle at top right, #451b0f 0%, #20100a 100%)',      badgeClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent', borderColor: '#f97316' },
    'SS':   { bgColor: 'radial-gradient(circle at top right, #400d1e 0%, #200a12 100%)',      badgeClass: 'bg-gradient-to-r from-pink-400 via-red-500 to-rose-600 bg-clip-text text-transparent', borderColor: '#ef4444' },
    'SSS':  { bgColor: 'radial-gradient(circle at top right, #271a54 0%, #14102a 100%)',      badgeClass: 'bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent', borderColor: '#8b5cf6' },
    'SSS+': { bgColor: 'radial-gradient(circle at top right, #34122d 0%, #1a1014 100%)',      badgeClass: 'bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-yellow-300 bg-clip-text text-transparent', borderColor: '#e879f9' },
};

function TierBadge({ tier }: { tier: string }) {
    const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG['E'];
    const isGradient = cfg.badgeClass.includes('bg-gradient');
    return (
        <span
            className={`text-[10px] font-black tracking-widest uppercase ${isGradient ? cfg.badgeClass : cfg.badgeClass}`}
            style={isGradient ? {} : undefined}
        >
            Tier — {tier}
        </span>
    );
}

// Helpers
function getMaterials(comp: any) {
    if (!comp || typeof comp !== 'object') return null;
    const entries = Object.entries(comp);
    if (entries.length === 0) return null;
    return entries;
}

function compressExpandedUrl(url: string | null | undefined) {
    if (!url) return null;
    // Cap expanded images to 800px width with generic auto-compression
    // Easily adequate for modern mobile screens while shredding download bandwidth constraints!
    if (url.includes('res.cloudinary.com') && !url.includes('q_auto')) {
        return url.replace('/upload/', '/upload/q_auto:good,f_auto,w_800/');
    }
    return url;
}

function ActionButton({ label, topColor, shadowColor }: { label: string; topColor: string; shadowColor: string }) {
    return (
        <button className="flex-1 relative rounded-[14px] cursor-pointer" style={{ height: '46px' }}>
            {/* The shadowed base */}
            <div 
                className="absolute top-1.5 left-0 right-0 bottom-[-6px] rounded-[14px]"
                style={{ backgroundColor: shadowColor }}
            />
            {/* The actual button face */}
            <div 
                className="absolute inset-0 rounded-[14px] flex items-center justify-center font-black text-[13px] uppercase tracking-widest text-white transition-transform duration-75 active:translate-y-1.5"
                style={{ backgroundColor: topColor }}
            >
                {label}
            </div>
        </button>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface ArtifactCardProps {
    artifact: any;
    ownerUsername?: string;
    onClose: () => void;
}

export default function ArtifactCard({ artifact, ownerUsername, onClose }: ArtifactCardProps) {
    const [rotation, setRotation] = useState(0);
    const tier = artifact.tier ?? 'E';
    const cfg = TIER_CONFIG[tier] ?? TIER_CONFIG['E'];

    function handleDragEnd(_: any, info: any) {
        // Require a deliberate swipe: either a long drag (> 80px) or a fast flick
        if (Math.abs(info.offset.x) > 80 || Math.abs(info.velocity.x) > 400) {
            if (info.offset.x > 0 || info.velocity.x > 0) {
                setRotation(r => r + 180); // swiped right
            } else {
                setRotation(r => r - 180); // swiped left
            }
        }
    }

    const materials = getMaterials(artifact.materialComposition);

    return (
        <AnimatePresence>
            {/* Dark overlay */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/90"
                onClick={onClose}
            />

            {/* Card + actions container */}
            <motion.div
                key="card-container"
                initial={{ opacity: 0, scale: 0.85, y: 60 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85, y: 60 }}
                transition={{ type: 'spring', stiffness: 280, damping: 26 }}
                className="fixed inset-0 z-50 flex flex-col items-center justify-center pointer-events-none px-6"
            >
                {/* Card flip area */}
                <div
                    className="pointer-events-auto w-full max-w-[280px] aspect-[5/7]"
                    style={{ perspective: '1200px' }}
                >
                    <motion.div
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0} // Disables physical dragging to purely capture gestures
                        onDragEnd={handleDragEnd}
                        style={{ transformStyle: 'preserve-3d', cursor: 'grab' }}
                        animate={{ rotateY: rotation }}
                        transition={{ type: 'spring', stiffness: 220, damping: 24, mass: 1 }}
                        className="relative w-full h-full"
                    >
                        {/* ── FRONT ──────────────────────────────────────────── */}
                        <div
                            className="absolute inset-0 rounded-3xl overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'translateZ(1px)',
                                background: cfg.bgColor,
                                border: `1.5px solid ${cfg.borderColor}40`,
                                display: 'flex',
                                flexDirection: 'column'
                            }}
                        >
                            {/* Header row */}
                            <div className="flex items-center justify-between px-4 pt-3 pb-2 z-10">
                                <span className="text-[11px] font-black text-white/50 font-mono tracking-widest">
                                    #{artifact.productId}
                                </span>
                                <TierBadge tier={tier} />
                            </div>

                            {/* Image Container */}
                            <div
                                className="mx-3 rounded-[1.25rem] overflow-hidden flex-shrink-0"
                                style={{
                                    background: `${cfg.bgColor}`,
                                    border: `1px solid ${cfg.borderColor}30`,
                                    height: '38%' // Takes up upper part
                                }}
                            >
                                {artifact.imageUrl ? (
                                    <img
                                        src={compressExpandedUrl(artifact.imageUrl) || artifact.imageUrl}
                                        alt={artifact.name}
                                        className="w-full h-full object-contain p-2"
                                        draggable={false}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="material-icons-round text-5xl text-white/10">image_not_supported</span>
                                    </div>
                                )}
                            </div>

                            {/* Body Content */}
                            <div className="px-4 pt-2 pb-1.5 z-10 flex-1 flex flex-col min-h-0">
                                <h3 className="text-[17px] font-black text-white font-['Russo_One'] tracking-wide leading-tight mb-1 shrink-0">
                                    {artifact.name}
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar min-h-0 pb-1">
                                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                                        {artifact.description || 'No description available.'}
                                    </p>
                                </div>
                            </div>

                            {/* Secondary Information (Composition) */}
                            <div className="mx-3 mb-2 shrink-0 flex gap-2">
                                {/* Dimensions */}
                                <div
                                    className="flex-1 rounded-xl px-2 py-1.5 flex flex-col justify-center items-center text-center"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <p className="text-[7.5px] font-bold uppercase tracking-widest text-[#FBBF24]/80 mb-0.5">
                                        Dimensions
                                    </p>
                                    <p className="text-[8.5px] text-white/80 font-mono leading-tight">
                                        L:{artifact.width ?? '-'} W:{artifact.depth ?? '-'} H:{artifact.height ?? '-'} cm
                                    </p>
                                </div>
                                {/* Materials */}
                                <div
                                    className="flex-1 rounded-xl px-2 py-1.5 flex flex-col justify-center"
                                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                                >
                                    <p className="text-[7.5px] font-bold uppercase tracking-widest text-[#FBBF24]/80 mb-0.5">
                                        Materials
                                    </p>
                                    {materials ? (
                                        <div className="flex flex-col">
                                            {materials.slice(0, 2).map(([k, v]) => (
                                                <p key={k} className="text-[8.5px] text-white/80 font-mono flex justify-between leading-snug">
                                                    <span className="capitalize truncate pr-1">{k}:</span>
                                                    <span>{String(v)}g</span>
                                                </p>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-[8.5px] text-white/30 font-mono">—</p>
                                    )}
                                </div>
                            </div>

                            {/* Footer Information */}
                            <div
                                className="px-5 pb-3 shrink-0 flex flex-col gap-0.5"
                            >
                                <p className="text-[9px] text-white/30 font-mono flex justify-between">
                                    <span>LAST SOLD:</span>
                                    <span className="text-white/50">—</span>
                                </p>
                                <p className="text-[9px] text-white/30 font-mono flex justify-between">
                                    <span>CURRENT OWNER:</span>
                                    <span className="text-white/50">{ownerUsername ?? 'You'}</span>
                                </p>
                            </div>
                        </div>

                        {/* ── BACK ───────────────────────────────────────────── */}
                        <div
                            className="absolute inset-0 rounded-3xl flex items-center justify-center overflow-hidden shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]"
                            style={{
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden',
                                transform: 'rotateY(180deg) translateZ(1px)',
                                background: 'radial-gradient(circle at top right, #1e3a7a 0%, #13234C 100%)',
                                border: '2px solid rgba(255,255,255,0.05)',
                            }}
                        >
                            {/* Inner Yellow Border */}
                            <div
                                className="absolute inset-4 rounded-xl pointer-events-none"
                                style={{ border: '4px solid #FBBF24' }}
                            />
                            
                            {/* BidWars Logo */}
                            <img
                                src={LOGO_URL}
                                alt="Bid Wars"
                                className="w-40 h-auto drop-shadow-[0_0_15px_rgba(251,191,36,0.3)] select-none"
                                draggable={false}
                            />
                        </div>
                    </motion.div>
                </div>

                {/* ── ACTION BUTTONS ─────────────────────────────────────── */}
                <div className="pointer-events-auto w-full max-w-[280px] flex gap-3 mt-8">
                    <ActionButton label="Pawn"    topColor="#dc2626" shadowColor="#991b1b" />
                    <ActionButton label="Sell"    topColor="#16a34a" shadowColor="#14532d" />
                    <ActionButton label="Private" topColor="#4b5563" shadowColor="#1f2937" />
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
