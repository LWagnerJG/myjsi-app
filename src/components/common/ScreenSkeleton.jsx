import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * Skeleton loading screen shown while lazy-loaded routes resolve.
 * Matches actual card surface colors so there's no jarring color shift.
 */
export const ScreenSkeleton = ({ theme }) => {
    const dark = isDarkTheme(theme);
    const bg = theme?.colors?.background || (dark ? '#161616' : '#F0EDE8');

    // Match GlassCard's actual dark surface: rgba(255,255,255,0.08)
    const cardSurface = dark ? 'rgba(255,255,255,0.08)' : (theme?.colors?.surface || '#FFFFFF');
    const borderColor = dark ? 'rgba(255,255,255,0.12)' : (theme?.colors?.border || '#E3E0D8');

    // Shimmer highlight color — just slightly lighter than the card surface
    const shimmerHigh = dark ? 'rgba(255,255,255,0.13)' : 'rgba(255,255,255,0.9)';
    const shimmerBase = dark ? 'rgba(255,255,255,0.08)' : (theme?.colors?.surface || '#FFFFFF');

    const shimmer = {
        background: `linear-gradient(90deg, ${shimmerBase} 25%, ${shimmerHigh} 50%, ${shimmerBase} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'jsi-shimmer 1.4s infinite ease-in-out',
    };

    return (
        <div
            className="flex flex-col h-full overflow-hidden app-header-offset px-4 sm:px-6 lg:px-8 pt-4 max-w-content mx-auto w-full"
            style={{ backgroundColor: bg }}
        >
            <style>{`
                @keyframes jsi-shimmer {
                    0%   { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            {/* Search bar skeleton — matches 56px SearchInput */}
            <div className="h-14 rounded-full mb-4" style={{ ...shimmer, border: `1px solid ${borderColor}` }} />

            {/* Card skeletons */}
            <div className="space-y-4">
                <div
                    className="rounded-2xl p-5 space-y-3"
                    style={{ backgroundColor: cardSurface, border: `1px solid ${borderColor}` }}
                >
                    <div className="h-4 w-1/3 rounded-full" style={shimmer} />
                    <div className="h-8 w-2/3 rounded-full" style={shimmer} />
                    <div className="h-28 w-full rounded-2xl mt-2" style={shimmer} />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4].map(i => (
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
            </div>
        </div>
    );
};

export default ScreenSkeleton;
