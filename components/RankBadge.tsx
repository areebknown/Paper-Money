import React from 'react';

interface RankBadgeProps {
    tier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
    points?: number;
    size?: 'sm' | 'md' | 'lg';
    showPoints?: boolean;
}

const TIER_CONFIG = {
    BRONZE: {
        icon: '🥉',
        className: 'badge-bronze',
        label: 'Bronze',
    },
    SILVER: {
        icon: '🥈',
        className: 'badge-silver',
        label: 'Silver',
    },
    GOLD: {
        icon: '🥇',
        className: 'badge-gold',
        label: 'Gold',
    },
    PLATINUM: {
        icon: '💎',
        className: 'badge-gold', // Reuse gold styling for now
        label: 'Platinum',
    },
};

export default function RankBadge({
    tier,
    points,
    size = 'md',
    showPoints = false
}: RankBadgeProps) {
    const config = TIER_CONFIG[tier];

    const sizeClasses = {
        sm: 'text-xs px-2 py-0.5',
        md: 'text-sm px-3 py-1',
        lg: 'text-base px-4 py-1.5',
    };

    return (
        <div className={`badge ${config.className} ${sizeClasses[size]} inline-flex items-center gap-1`}>
            <span>{config.icon}</span>
            <span className="font-semibold">{config.label}</span>
            {showPoints && points !== undefined && (
                <span className="opacity-80">· {points.toLocaleString()}</span>
            )}
        </div>
    );
}
