import React from 'react';
import { ArrowLeft, User, Search } from 'lucide-react';
import { logoLight } from '../../data.jsx';
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

    const glassBg = dark
        ? 'rgba(26,26,26,0.78)'
        : 'rgba(255,255,255,0.78)';
    const glassGradient = dark
        ? 'linear-gradient(180deg, rgba(30,30,30,0.86) 0%, rgba(22,22,22,0.72) 100%)'
        : 'linear-gradient(180deg, rgba(255,255,255,0.86) 0%, rgba(255,255,255,0.72) 100%)';
    const glassShadow = dark
        ? '0 4px 20px rgba(0,0,0,0.3)'
        : '0 4px 20px rgba(53,53,53,0.06)';

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="px-4 sm:px-5 pt-3 pb-1 fixed top-0 left-0 right-0 z-30 pointer-events-none bg-transparent">
            <div
                className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 sm:px-5 h-14 pointer-events-auto transition-all duration-300 overflow-hidden"
                style={{
                    borderRadius: 9999,
                    backgroundColor: glassBg,
                    backgroundImage: glassGradient,
                    boxShadow: glassShadow,
                    backdropFilter: 'blur(22px) saturate(140%)',
                    WebkitBackdropFilter: 'blur(22px) saturate(140%)',
                    border: dark ? '1px solid rgba(255,255,255,0.08)' : 'none'
                }}
            >
                <div className="flex items-center">
                    <button
                        aria-label="Go back"
                        aria-hidden={!showBack}
                        onClick={handleBack}
                        className={`transition-all duration-300 overflow-hidden flex items-center justify-center rounded-full ${dark ? 'hover:bg-white/10' : 'hover:bg-black/5'} active:scale-90 ${showBack ? 'w-10 h-10 -ml-2 mr-2 opacity-100' : 'w-0 h-10 ml-0 mr-0 opacity-0 pointer-events-none'}`}
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
    );
});

