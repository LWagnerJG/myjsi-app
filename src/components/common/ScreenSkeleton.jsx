import React from 'react';

/**
 * Branded skeleton loading screen for lazy-loaded routes.
 * Shows a pulse animation that matches the app's visual style.
 */
export const ScreenSkeleton = ({ theme }) => {
    const bg = theme?.colors?.background || '#F0EDE8';
    const surface = theme?.colors?.surface || '#FFFFFF';
    const border = theme?.colors?.border || '#E3E0D8';

    const shimmer = {
        background: `linear-gradient(90deg, ${surface} 25%, ${border}40 50%, ${surface} 75%)`,
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite ease-in-out',
    };

    return (
        <div className="flex flex-col h-full overflow-hidden app-header-offset px-4 sm:px-6 lg:px-8 pt-6 max-w-5xl mx-auto w-full" style={{ backgroundColor: bg }}>
            <style>{`
                @keyframes shimmer {
                    0% { background-position: 200% 0; }
                    100% { background-position: -200% 0; }
                }
            `}</style>

            {/* Title skeleton */}
            <div className="h-7 w-48 rounded-full mb-6" style={shimmer} />

            {/* Card skeletons */}
            <div className="space-y-4">
                <div className="rounded-2xl p-5 space-y-3" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
                    <div className="h-4 w-3/4 rounded-full" style={shimmer} />
                    <div className="h-4 w-1/2 rounded-full" style={shimmer} />
                    <div className="h-32 w-full rounded-xl mt-2" style={shimmer} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="rounded-2xl p-4 space-y-2" style={{ backgroundColor: surface, border: `1px solid ${border}` }}>
                            <div className="h-20 w-full rounded-xl" style={shimmer} />
                            <div className="h-3 w-2/3 rounded-full" style={shimmer} />
                            <div className="h-3 w-1/2 rounded-full" style={shimmer} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScreenSkeleton;
