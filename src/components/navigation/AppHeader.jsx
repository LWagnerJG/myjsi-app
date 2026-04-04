import React, { useEffect, useState } from 'react';
import { ArrowLeft, User } from 'lucide-react';
import { logoLight } from '../../data/theme/themeData.js';
import { getHomeChromeIconButtonStyles, getHomeChromePillStyles } from '../../design-system/homeChrome.js';
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
    const [scrollDepth, setScrollDepth] = useState(0);
    const homeChromePillStyles = getHomeChromePillStyles(dark);
    const homeChromeIconButtonStyles = getHomeChromeIconButtonStyles(dark);

    const bgR = dark ? '26,26,26' : '240,237,232';
    const homeScrimHeight = 88;
    const innerScrimHeight = 96;
    const scrimProgress = isHome ? Math.min(Math.max((scrollDepth - 2) / 36, 0), 1) : 0;
    const scrimOpacity = scrimProgress * 0.92;
    const gradientOpacity = scrimProgress * 0.9;

    useEffect(() => {
        if (!isHome) {
            setScrollDepth(0);
            return undefined;
        }

        let removeListener = () => {};
        let rafId = 0;
        let attachFrame = 0;
        let observer = null;

        const attachScrollListener = () => {
            const scrollContainer = document.querySelector('[data-home-scroll-container="true"]');
            if (!scrollContainer) return false;

            const getScrollTop = () => scrollContainer.scrollTop;
            const onScroll = () => {
                const nextDepth = getScrollTop();
                if (rafId) window.cancelAnimationFrame(rafId);
                rafId = window.requestAnimationFrame(() => setScrollDepth(nextDepth));
            };

            onScroll();
            scrollContainer.addEventListener('scroll', onScroll, { passive: true });
            removeListener = () => scrollContainer.removeEventListener('scroll', onScroll);
            return true;
        };

        const startListening = () => {
            if (attachScrollListener()) return;

            observer = new MutationObserver(() => {
                if (!attachScrollListener()) return;
                observer?.disconnect();
                observer = null;
            });

            if (document.body) {
                observer.observe(document.body, { childList: true, subtree: true });
            }
        };

        attachFrame = window.requestAnimationFrame(startListening);

        return () => {
            window.cancelAnimationFrame(attachFrame);
            if (rafId) window.cancelAnimationFrame(rafId);
            observer?.disconnect();
            removeListener();
        };
    }, [isHome]);

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <>
            {isHome && (
                <>
                    <div
                        aria-hidden="true"
                        className="fixed top-0 left-0 right-0 pointer-events-none transition-opacity duration-200 ease-out"
                        style={{
                            height: homeScrimHeight,
                            zIndex: 29,
                            opacity: scrimOpacity,
                            backdropFilter: 'blur(20px) saturate(1.6)',
                            WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                            maskImage: 'linear-gradient(to bottom, black 0%, black 58%, rgba(0,0,0,0.42) 74%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 58%, rgba(0,0,0,0.42) 74%, transparent 100%)',
                        }}
                    />

                    <div
                        aria-hidden="true"
                        className="fixed top-0 left-0 right-0 pointer-events-none transition-opacity duration-200 ease-out"
                        style={{
                            height: homeScrimHeight,
                            zIndex: 29,
                            opacity: gradientOpacity,
                            background: `linear-gradient(to bottom,
                                rgba(${bgR},0.30) 0%,
                                rgba(${bgR},0.16) 30%,
                                rgba(${bgR},0.06) 56%,
                                rgba(${bgR},0.015) 74%,
                                rgba(${bgR},0) 100%)`,
                        }}
                    />
                </>
            )}

            {!isHome && (
                <>
                    <div
                        aria-hidden="true"
                        className="fixed top-0 left-0 right-0 pointer-events-none"
                        style={{
                            height: innerScrimHeight,
                            zIndex: 29,
                            backgroundColor: `rgba(${bgR},0.15)`,
                            backdropFilter: 'blur(20px) saturate(1.6)',
                            WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                            maskImage: 'linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.42) 76%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.42) 76%, transparent 100%)',
                        }}
                    />

                    <div
                        aria-hidden="true"
                        className="fixed top-0 left-0 right-0 pointer-events-none"
                        style={{
                            height: innerScrimHeight,
                            zIndex: 29,
                            background: `linear-gradient(to bottom,
                                rgba(${bgR},0.38) 0%,
                                rgba(${bgR},0.22) 34%,
                                rgba(${bgR},0.09) 60%,
                                rgba(${bgR},0.018) 80%,
                                rgba(${bgR},0) 100%)`,
                        }}
                    />
                </>
            )}

            {/* ── Universal top-blur backing ──────────────────────────────────────────
                Single blur surface from the very top of the phone (behind the iOS
                status bar / safe-area) continuously through the header pill.
                z-27 = behind the per-screen scrims (z-29) and the pill (z-30).
                The mask gradient fades it out below the header so content shows. */}
            <div
                aria-hidden="true"
                className="fixed top-0 left-0 right-0 pointer-events-none"
                style={{
                    height: 'calc(env(safe-area-inset-top, 0px) + 80px)',
                    zIndex: 27,
                    backgroundColor: dark ? 'rgba(22,22,22,0.80)' : 'rgba(240,237,232,0.80)',
                    backdropFilter: 'blur(28px) saturate(1.8)',
                    WebkitBackdropFilter: 'blur(28px) saturate(1.8)',
                    maskImage: 'linear-gradient(to bottom, black 0%, black 58%, rgba(0,0,0,0.18) 82%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 58%, rgba(0,0,0,0.18) 82%, transparent 100%)',
                }}
            />

            <div className="px-4 sm:px-5 pt-3 pb-1 fixed top-0 left-0 right-0 z-30 pointer-events-none bg-transparent">
                <div
                    className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 sm:px-5 h-14 pointer-events-auto transition-all duration-300 overflow-hidden"
                    style={{
                        ...(isHome ? homeChromePillStyles : {
                            borderRadius: 9999,
                            backgroundColor: dark ? 'rgba(26,26,26,0.72)' : 'rgba(255,255,255,0.72)',
                            backdropFilter: 'blur(20px) saturate(1.6)',
                            WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
                            boxShadow: dark ? '0 4px 20px rgba(0,0,0,0.25)' : '0 4px 20px rgba(53,53,53,0.08)',
                            border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(255,255,255,0.70)',
                        }),
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
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all hover:opacity-90 active:scale-90"
                        style={{
                            ...homeChromeIconButtonStyles,
                            color: theme.colors.textPrimary,
                        }}
                    >
                        <User className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                    </div>
                </div>
            </div>
        </>
    );
});

