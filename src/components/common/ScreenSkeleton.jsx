import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * Skeleton loading screen shown while lazy-loaded routes resolve.
 * variant: 'default' | 'list' | 'scan' | 'toolbar'
 * Matches the layout archetype of the destination screen.
 */
export const ScreenSkeleton = ({ theme, variant = 'default' }) => {
    const dark = isDarkTheme(theme);
    const bg = theme?.colors?.background || (dark ? '#161616' : '#F0EDE8');

    const cardSurface = dark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)';
    const borderColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)';

    const shimmerHigh = dark ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.55)';
    const shimmerBase = dark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.04)';

    const shimmer = {
        background: `linear-gradient(90deg, ${shimmerBase} 25%, ${shimmerHigh} 50%, ${shimmerBase} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'jsi-shimmer 1.4s infinite ease-in-out',
    };

    const keyframes = (
        <style>{`
            @keyframes jsi-shimmer {
                0%   { background-position: 200% 0; }
                100% { background-position: -200% 0; }
            }
        `}</style>
    );

    const titleBar = (
        <div className="mb-3 space-y-2">
            <div className="h-7 w-36 rounded-full" style={shimmer} />
            <div className="h-3 w-48 rounded-full" style={shimmer} />
        </div>
    );

    const searchBar = (
        <div className="h-11 rounded-full mb-4" style={{ ...shimmer, border: `1px solid ${borderColor}` }} />
    );

    const listRows = (
        <div className="space-y-2.5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl px-4 py-3.5 flex items-center gap-3"
                    style={{ backgroundColor: cardSurface, border: `1px solid ${borderColor}`, minHeight: 64 }}
                >
                    <div className="w-14 h-14 rounded-xl flex-shrink-0" style={shimmer} />
                    <div className="flex-1 space-y-2 min-w-0">
                        <div className="h-4 w-2/3 rounded-full" style={shimmer} />
                        <div className="h-3 w-1/2 rounded-full" style={shimmer} />
                    </div>
                </div>
            ))}
        </div>
    );

    const scanCards = (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl p-5 space-y-3"
                    style={{ backgroundColor: cardSurface, border: `1px solid ${borderColor}` }}
                >
                    <div className="h-4 w-1/3 rounded-full" style={shimmer} />
                    <div className="h-5 w-2/3 rounded-full" style={shimmer} />
                    <div className="h-16 w-full rounded-xl" style={shimmer} />
                    <div className="h-12 w-full rounded-full" style={shimmer} />
                </div>
            ))}
        </div>
    );

    const gridCards = (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                    key={i}
                    className="rounded-2xl p-4 space-y-2.5"
                    style={{ backgroundColor: cardSurface, border: `1px solid ${borderColor}` }}
                >
                    <div className="h-5 w-1/2 rounded-full" style={shimmer} />
                    <div className="h-16 w-full rounded-xl" style={shimmer} />
                    <div className="h-3 w-2/3 rounded-full" style={shimmer} />
                </div>
            ))}
        </div>
    );

    let body = gridCards;
    if (variant === 'list' || variant === 'toolbar') body = listRows;
    if (variant === 'scan') body = scanCards;

    return (
        <div
            className="flex flex-col h-full overflow-hidden app-header-offset px-4 sm:px-6 lg:px-8 pt-4 max-w-content mx-auto w-full"
            style={{ backgroundColor: bg }}
        >
            {keyframes}
            {titleBar}
            {(variant === 'list' || variant === 'toolbar' || variant === 'scan' || variant === 'default') ? searchBar : null}
            {body}
        </div>
    );
};

export default ScreenSkeleton;
