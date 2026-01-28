import React from 'react';
import { ArrowLeft, User, Search } from 'lucide-react';
import { logoLight } from '../../data.jsx';

export const AppHeader = React.memo(({
    onHomeClick,
    isDarkMode,
    theme,
    onProfileClick,
    handleBack,
    showBack,
    userName
}) => {
    const filterStyle = isDarkMode ? 'brightness(0) invert(1)' : 'none';
    const isHome = !showBack;

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 17) return 'Good Afternoon';
        return 'Good Evening';
    };

    return (
        <div className="px-4 sm:px-5 pt-3 pb-1 fixed top-0 left-0 right-0 z-30 pointer-events-none">
            <div
                className="max-w-5xl mx-auto w-full flex items-center justify-between px-4 sm:px-5 h-14 border pointer-events-auto"
                style={{
                    borderRadius: 9999,
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.18) 100%)',
                    borderColor: 'rgba(0, 0, 0, 0.05)',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.05)',
                    backdropFilter: 'blur(24px) saturate(120%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(120%)'
                }}
            >
                <div className="flex items-center">
                    <button
                        aria-label="Go back"
                        onClick={handleBack}
                        className={`transition-all duration-300 overflow-hidden flex items-center justify-center rounded-full hover:bg-black/5 active:scale-90 ${showBack ? 'w-10 h-10 -ml-2 mr-2 opacity-100' : 'w-0 h-10 ml-0 mr-0 opacity-0'}`}
                        disabled={!showBack}
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
                        className={`transition-all duration-300 ease-in-out whitespace-nowrap overflow-hidden ${isHome ? 'max-w-[220px] opacity-100 mr-1.5' : 'max-w-0 opacity-0'}`}
                        style={{ color: theme.colors.textPrimary }}
                    >
                        <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.18em] opacity-60 mr-2">{getTimeGreeting()}</span>
                        <span className="text-sm font-bold tracking-tight">{userName}</span>
                    </div>

                    <button
                        aria-label="Open profile menu"
                        onClick={onProfileClick}
                        className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all border bg-white/40 hover:bg-white/60 active:scale-90"
                        style={{ borderColor: 'rgba(0,0,0,0.06)' }}
                    >
                        <User className="w-5 h-5" style={{ color: theme.colors.textPrimary }} />
                    </button>
                </div>
            </div>
        </div>
    );
});

