import React from 'react';
import { ArrowLeft, User, Search } from 'lucide-react';
import { logoLight } from '../../data/theme/themeData.js';
import { isDarkTheme } from '../../design-system/tokens.js';

export const AppHeader = React.memo(({
    onHomeClick,
    isDarkMode,
    theme,
    onProfileClick,
    handleBack,
    showBack,
    userName,
    profileBtnRef
}) => {
    const filterStyle = isDarkMode ? 'brightness(0) invert(1)' : 'none';
    const isHome = !showBack;
    const dark = isDarkMode || isDarkTheme(theme);

    // Semi-transparent so blurred background content shows through (frosted glass)
    const glassBg = dark ? 'rgba(42,42,42,0.88)' : 'rgba(255,255,255,0.88)';
    // Gradient overlay for the blur scrim: most opaque at very top (near status bar clock),
    // still semi-opaque through the pill, then fades to fully transparent below.
    // This sits on top of the backdrop-filter layer to give the "fades as it descends" look.
    const scrimGradient = dark
        ? 'linear-gradient(to bottom, rgba(26,26,26,0.92) 0%, rgba(26,26,26,0.55) 50%, transparent 100%)'
        : 'linear-gradient(to bottom, rgba(240,237,232,0.92) 0%, rgba(240,237,232,0.55) 50%, transparent 100%)';

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Blur scrim zone height: safe-area + pt-3 + pill + fade below pill
    const scrimHeight = 140;

    return (
        <>
            {/* Layer 1: backdrop-filter blur — covers the full scrim zone.
                mask-image is intentionally NOT used here; iOS Safari drops backdrop-filter
                when mask-image is applied to the same element. */}
            <div
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 pointer-events-none"
                style={{
                    height: scrimHeight,
                    zIndex: 28,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                }}
            />

            {/* Layer 2: gradient overlay — sits on top of the blur layer and fades it out
                from mostly-opaque at the very top (strongest visual "grounding" near the
                status bar) to fully transparent below the pill. */}
            <div
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 pointer-events-none"
                style={{
                    height: scrimHeight,
                    zIndex: 29,
                    background: scrimGradient,
                }}
            />

            {/* Layer 3: pill header */}
            <div className="px-4 sm:px-5 pt-3 pb-1 fixed top-0 left-0 right-0 z-30 pointer-events-none">
            <div
                className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 sm:px-5 h-14 pointer-events-auto transition-all duration-300 overflow-hidden"
                style={{
                    borderRadius: 9999,
                    backgroundColor: glassBg,
                    backdropFilter: 'blur(24px)',
                    WebkitBackdropFilter: 'blur(24px)',
                    border: dark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.08)',
                }}
            >
                <div className="flex items-center">
                    <button
                        aria-label="Go back"
                        aria-hidden={!showBack}
                        onClick={handleBack}
                        className={`transition-all duration-300 overflow-hidden flex items-center justify-center rounded-full ${dark ? 'hover:bg-white/10' : 'hover:bg-black/5 dark:hover:bg-white/5'} active:scale-90 ${showBack ? 'w-10 h-10 -ml-2 mr-2 opacity-100' : 'w-0 h-10 ml-0 mr-0 opacity-0 pointer-events-none'}`}
                        disabled={!showBack}
                        tabIndex={showBack ? 0 : -1}
                    >
                        <ArrowLeft className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.textPrimary }} />
                    </button>

                    <button
                        aria-label="Go to homepage"
                        onClick={onHomeClick}
                        className="hover:opacity-60 transition-all active:scale-95"
                    >
                        <img src={logoLight} alt="MyJSI Logo" className="h-7 w-auto" style={{ filter: filterStyle }} />
                    </button>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    <div
                        data-greeting-anchor
                        className={`flex items-baseline justify-end transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${isHome ? 'max-w-[250px] opacity-100 mr-1' : 'max-w-0 opacity-0'}`}
                        style={{ color: theme.colors.textPrimary }}
                    >
                        <span className="text-sm font-medium">{getTimeGreeting()},</span>
                        <span className="text-sm font-medium ml-1 md:ml-1.5">{userName}</span>
                    </div>

                    <button
                        ref={profileBtnRef}
                        aria-label="Open profile menu"
                        onClick={onProfileClick}
                        className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all active:scale-90 ${dark ? 'bg-white/10 hover:bg-white/20' : 'bg-white/30 hover:bg-white/50'}`}
                    >
                        <User className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                </div>
            </div>
            </div>
        </>
    );
});

