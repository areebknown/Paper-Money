import React from 'react';
import { Eye } from 'lucide-react';

interface ArtifactCardProps {
    name: string;
    imageUrl?: string;
    basePoints: number;
    materialPoints?: number;
    demandPoints?: number;
    pawnPoints?: number;
    viewCount?: number;
    onClick?: () => void;
}

// ─── Image compression utility ──────────────────────────────────────────────────
function compressImageUrl(url: string) {
    if (!url || typeof url !== 'string') return url;
    if (url.includes('res.cloudinary.com') && !url.includes('q_auto:eco')) {
        return url.replace('/upload/', '/upload/q_auto:eco,f_auto,w_400/');
    }
    return url;
}

export default function ArtifactCard({
    name,
    imageUrl,
    basePoints,
    materialPoints = 0,
    demandPoints = 0,
    pawnPoints = 0,
    viewCount = 0,
    onClick,
}: ArtifactCardProps) {
    const totalValue = basePoints + materialPoints + demandPoints + pawnPoints;

    return (
        <div
            className="card cursor-pointer overflow-hidden"
            onClick={onClick}
        >
            {/* Image */}
            <div className="relative w-full aspect-square bg-gradient-subtle rounded-lg mb-3 overflow-hidden">
                {imageUrl ? (
                    <img src={compressImageUrl(imageUrl)} alt={name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                        📦
                    </div>
                )}

                {/* View Count Badge */}
                {viewCount > 0 && (
                    <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 bg-black/60 backdrop-blur-sm rounded-full text-white text-xs">
                        <Eye className="w-3 h-3" />
                        <span>{viewCount}</span>
                    </div>
                )}
            </div>

            {/* Info */}
            <div className="space-y-2">
                <h3 className="font-bold text-lg text-primary truncate">{name}</h3>

                {/* Valuation Breakdown */}
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between text-secondary">
                        <span>Base Value</span>
                        <span className="font-medium">₹{basePoints.toLocaleString()}</span>
                    </div>

                    {materialPoints > 0 && (
                        <div className="flex justify-between text-info">
                            <span>Material</span>
                            <span className="font-medium">+₹{materialPoints.toLocaleString()}</span>
                        </div>
                    )}

                    {demandPoints > 0 && (
                        <div className="flex justify-between text-warning">
                            <span>Demand</span>
                            <span className="font-medium">+₹{demandPoints.toLocaleString()}</span>
                        </div>
                    )}

                    {pawnPoints > 0 && (
                        <div className="flex justify-between text-success">
                            <span>Pawn Boost</span>
                            <span className="font-medium">+₹{pawnPoints.toLocaleString()}</span>
                        </div>
                    )}
                </div>

                {/* Total Value */}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                    <span className="font-semibold text-primary">Total Value</span>
                    <span className="font-bold text-xl text-yellow-700">
                        ₹{totalValue.toLocaleString()}
                    </span>
                </div>
            </div>
        </div>
    );
}
