import React from 'react';
import { DESIGN_TOKENS } from '../../design-system/tokens.js';

/**
 * JSI Label Tags - Style Guide Page 18
 * Complete label tag system with all variants from Digital Style Guide 1.0
 */

// Label Tag - Basic Text Label
export const LabelTag = ({
    children,
    variant = 'default', // 'default' | 'outline' | 'filled' | 'dark'
    size = 'default', // 'small' | 'default' | 'large'
    theme,
    className = ''
}) => {
    const sizeClasses = {
        small: 'px-3 py-1.5 text-xs',
        default: 'px-4 py-2 text-sm',
        large: 'px-5 py-2.5 text-base'
    };

    const variants = {
        default: {
            backgroundColor: theme.colors.surface,
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`
        },
        outline: {
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            border: `1.5px solid ${theme.colors.textPrimary}`
        },
        filled: {
            backgroundColor: theme.colors.accent,
            color: '#FFFFFF',
            border: 'none'
        },
        dark: {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none'
        }
    };

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold ${sizeClasses[size]} ${className}`}
            style={{
                ...variants[variant],
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
            }}
        >
            {children}
        </span>
    );
};

// NEW! Badge
export const NewBadge = ({ theme, className = '' }) => (
    <span
        className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase ${className}`}
        style={{
            backgroundColor: theme.colors.accent,
            color: '#FFFFFF',
            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif',
            letterSpacing: '0.05em'
        }}
    >
        NEW!
    </span>
);

// Quickship Badge with Icon
export const QuickshipBadge = ({ theme, className = '' }) => (
    <span
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${className}`}
        style={{
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            borderColor: theme.colors.border,
            fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
        }}
    >
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
            <path d="M12.5 3.5a1 1 0 110 2 1 1 0 010-2zm1.5 1a.5.5 0 00-.5-.5h-1a.5.5 0 000 1h1a.5.5 0 00.5-.5z"/>
            <path d="M8 2a2 2 0 00-2 2v1.5H5A1.5 1.5 0 003.5 7v6A1.5 1.5 0 005 14.5h6a1.5 1.5 0 001.5-1.5V7A1.5 1.5 0 0011 5.5h-1V4a2 2 0 00-2-2z"/>
        </svg>
        Quickship Products
    </span>
);

// Cart/Shopping Badge with Icon
export const CartBadge = ({ count, theme, variant = 'default', className = '' }) => {
    const variants = {
        default: {
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`
        },
        filled: {
            backgroundColor: theme.colors.accent,
            color: '#FFFFFF',
            border: 'none'
        },
        outline: {
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            border: `1.5px solid ${theme.colors.textPrimary}`
        },
        dark: {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none'
        }
    };

    return (
        <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold ${className}`}
            style={{
                ...variants[variant],
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
            }}
        >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2a1 1 0 00-.894 1.447L3.72 6H1.5A.5.5 0 001 6.5v1a.5.5 0 00.5.5h.72l1.614 2.553A1 1 0 004.72 11H11.28a1 1 0 00.894-.553L13.78 8h.72a.5.5 0 00.5-.5v-1a.5.5 0 00-.5-.5h-2.22l1.614-2.553A1 1 0 0013 2H3z"/>
            </svg>
            {count ? `Label Tag (${count})` : 'Label Tag'}
        </span>
    );
};

// 360 View Badge with Icon
export const View360Badge = ({ theme, variant = 'default', className = '' }) => {
    const variants = {
        default: {
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`
        },
        filled: {
            backgroundColor: theme.colors.accent,
            color: '#FFFFFF',
            border: 'none'
        },
        outline: {
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            border: `1.5px solid ${theme.colors.textPrimary}`
        },
        dark: {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none'
        }
    };

    return (
        <button
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105 ${className}`}
            style={{
                ...variants[variant],
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
            }}
        >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                <path d="M8 2v12M2 8h12"/>
            </svg>
        </button>
    );
};

// Favorite/Heart Badge with Icon
export const FavoriteBadge = ({ theme, variant = 'default', isActive = false, onClick, className = '' }) => {
    const variants = {
        default: {
            backgroundColor: 'transparent',
            color: isActive ? '#DC2626' : theme.colors.textPrimary,
            border: `1px solid ${theme.colors.border}`
        },
        filled: {
            backgroundColor: theme.colors.accent,
            color: '#FFFFFF',
            border: 'none'
        },
        outline: {
            backgroundColor: 'transparent',
            color: theme.colors.textPrimary,
            border: `1.5px solid ${theme.colors.textPrimary}`
        },
        dark: {
            backgroundColor: '#000000',
            color: '#FFFFFF',
            border: 'none'
        }
    };

    return (
        <button
            onClick={onClick}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold transition-all hover:scale-105 ${className}`}
            style={{
                ...variants[variant],
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
            }}
        >
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill={isActive ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
                <path d="M8 14.25s6-4.5 6-8.5A3.5 3.5 0 0010.5 2 3.5 3.5 0 008 3.5 3.5 3.5 0 005.5 2 3.5 3.5 0 002 5.75c0 4 6 8.5 6 8.5z"/>
            </svg>
        </button>
    );
};

// Combined Badge Group (NEW! + Icon + Cart)
export const BadgeGroup = ({ theme, badges = [], className = '' }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {badges.map((badge, idx) => {
                switch (badge.type) {
                    case 'new':
                        return <NewBadge key={idx} theme={theme} />;
                    case 'view360':
                        return <View360Badge key={idx} theme={theme} variant={badge.variant} />;
                    case 'favorite':
                        return <FavoriteBadge key={idx} theme={theme} variant={badge.variant} isActive={badge.isActive} onClick={badge.onClick} />;
                    case 'cart':
                        return <CartBadge key={idx} theme={theme} variant={badge.variant} count={badge.count} />;
                    case 'label':
                        return <LabelTag key={idx} theme={theme} variant={badge.variant}>{badge.label}</LabelTag>;
                    default:
                        return null;
                }
            })}
        </div>
    );
};

// Status Badge (for project stages, etc.)
export const StatusBadge = ({
    status,
    label,
    theme,
    size = 'default',
    className = ''
}) => {
    const sizeClasses = {
        small: 'px-2.5 py-1 text-xs',
        default: 'px-3 py-1.5 text-sm',
        large: 'px-4 py-2 text-base'
    };

    const statusColors = {
        success: { bg: '#4A7C5915', color: '#4A7C59', border: '#4A7C5930' },
        warning: { bg: '#C4956A15', color: '#C4956A', border: '#C4956A30' },
        error: { bg: '#B85C5C15', color: '#B85C5C', border: '#B85C5C30' },
        info: { bg: '#5B7B8C15', color: '#5B7B8C', border: '#5B7B8C30' },
        neutral: { bg: theme.colors.subtle, color: theme.colors.textPrimary, border: theme.colors.border }
    };

    const colors = statusColors[status] || statusColors.neutral;

    return (
        <span
            className={`inline-flex items-center rounded-full font-semibold border ${sizeClasses[size]} ${className}`}
            style={{
                backgroundColor: colors.bg,
                color: colors.color,
                borderColor: colors.border,
                fontFamily: 'Neue Haas Grotesk Display Pro, sans-serif'
            }}
        >
            {label}
        </span>
    );
};
