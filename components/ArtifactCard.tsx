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
    'E':    { bgColor: '#1a1f2e',      badgeClass: 'text-gray-400',                                                   borderColor: '#4b5563' },
    'D':    { bgColor: '#162318',      badgeClass: 'text-emerald-400',                                                borderColor: '#10b981' },
    'C':    { bgColor: '#111b2e',      badgeClass: 'text-blue-400',                                                   borderColor: '#3b82f6' },
    'B':    { bgColor: '#1a1528',      badgeClass: 'bg-gradient-to-r from-slate-300 to-white bg-clip-text text-transparent', borderColor: '#94a3b8' },
    'A':    { bgColor: '#1e1a10',      badgeClass: 'bg-gradient-to-r from-yellow-300 to-amber-500 bg-clip-text text-transparent', borderColor: '#f59e0b' },
    'S':    { bgColor: '#20100a',      badgeClass: 'bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent', borderColor: '#f97316' },
    'SS':   { bgColor: '#200a12',      badgeClass: 'bg-gradient-to-r from-pink-400 via-red-500 to-rose-600 bg-clip-text text-transparent', borderColor: '#ef4444' },
    'SSS':  { bgColor: '#14102a',      badgeClass: 'bg-gradient-to-r from-violet-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent', borderColor: '#8b5cf6' },
    'SSS+': { bgColor: '#1a1014',      badgeClass: 'bg-gradient-to-r from-cyan-300 via-fuchsia-400 to-yellow-300 bg-clip-text text-transparent', borderColor: '#e879f9' },
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

// ─── Material Composition Formatter ──────────────────────────────────────────
function formatComposition(materialComposition: any, width: any, height: any, depth: any): string {
    const parts: string[] = [];

    // Dimensions
    if (width || height || depth) {
        const dims = [width, height, depth].filter(Boolean).map(Number);
        if (dims.length > 0) parts.push(`${dims.join(' × ')} units`);
    }

    // Materials
    if (materialComposition && typeof materialComposition === 'object') {
        const mats = Object.entries(materialComposition)
            .map(([k, v]) => `${v}g ${k}`)
            .join(', ');
        if (mats) parts.push(mats);
    }

    return parts.join(' · ') || 'No composition data';
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

    const composition = formatComposition(
        artifact.materialComposition,
        artifact.width,
        artifact.height,
        artifact.depth,
    );

    return (
        <AnimatePresence>
            {/* Dark overlay */}
            <motion.div
                key="overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
                style={{ backdropFilter: 'blur(4px)' }}
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
                                backgroundColor: cfg.bgColor,
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
                                    height: '45%' // Takes up upper half
                                }}
                            >
                                {artifact.imageUrl ? (
                                    <img
                                        src={artifact.imageUrl}
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
                            <div className="px-4 pt-4 pb-2 z-10 flex-1 flex flex-col justify-start">
                                <h3 className="text-lg font-black text-white font-['Russo_One'] tracking-wide leading-tight mb-2">
                                    {artifact.name}
                                </h3>
                                <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
                                    <p className="text-[11px] text-white/60 leading-relaxed font-sans">
                                        {artifact.description || 'No description available for this artifact.'}
                                    </p>
                                </div>
                            </div>

                            {/* Secondary Information (Composition) */}
                            <div
                                className="mx-3 mb-3 shrink-0 rounded-xl px-3 py-2.5"
                                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                            >
                                <p className="text-[9px] font-bold uppercase tracking-widest text-[#FBBF24]/80 mb-1">
                                    Composition
                                </p>
                                <p className="text-[11px] text-white/80 font-mono">{composition}</p>
                            </div>

                            {/* Footer Information */}
                            <div
                                className="px-5 pb-4 shrink-0 flex flex-col gap-1"
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
