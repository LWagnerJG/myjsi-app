import React from 'react';
import { ArrowLeft, User } from 'lucide-react';
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

    const PILL = {
        backgroundColor: theme.colors.surface,
        border: 'none',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        borderRadius: 9999,
        height: 56
    };

    return (
        <div className="px-4 pt-4 pb-1 fixed top-0 left-0 right-0 z-20">
            <div className="w-full flex items-center justify-between px-5" style={PILL}>
                <div className="flex items-center">
                    <button
                        aria-label="Go back"
                        onClick={handleBack}
                        className={`transition-all duration-300 overflow-hidden p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${showBack ? 'w-9 -ml-2 mr-1.5 opacity-100' : 'w-0 ml-0 mr-0 opacity-0'
                            }`}
                        disabled={!showBack}
                    >
                        <ArrowLeft className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                    </button>

                    <button
                        aria-label="Go to homepage"
                        onClick={onHomeClick}
                        className="hover:opacity-90 transition-opacity"
                    >
                        {/* 15% larger logo */}
                        <img src={logoLight} alt="MyJSI Logo" className="h-8 w-auto" style={{ filter: filterStyle }} />
                    </button>
                </div>

                <div className="flex items-center space-x-2">
                    <div
                        className={`transition-all duration-300 ease-in-out text-[15px] leading-tight whitespace-nowrap overflow-hidden ${isHome ? 'max-w-[170px] opacity-100' : 'max-w-0 opacity-0'
                            }`}
                        style={{ color: theme.colors.textPrimary }}
                        aria-hidden={!isHome}
                    >
                        Hello, {userName}!
                    </div>

                    <button
                        aria-label="Open profile menu"
                        onClick={onProfileClick}
                        className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg:white/5"
                        style={{ backgroundColor: theme.colors.surface, boxShadow: '0 2px 8px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)' }}
                    >
                        <User className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                    </button>
                </div>
            </div>
        </div>
    );
});
