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

    return (
        <div className="px-4 pt-4 pb-4 fixed top-0 left-0 right-0 z-20">
            <div 
                style={{ 
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    boxShadow: `0 6px 24px ${theme.colors.shadow}`
                }} 
                className="w-full px-6 py-4 flex justify-between items-center rounded-full"
            >
                <div className="flex items-center">
                    <button 
                        aria-label="Go back" 
                        onClick={handleBack} 
                        className={`transition-all duration-300 overflow-hidden p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 ${
                            showBack ? 'w-9 -ml-2 mr-2 opacity-100' : 'w-0 ml-0 mr-0 opacity-0'
                        }`} 
                        disabled={!showBack}
                    >
                        <ArrowLeft className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                    </button>
                    <button 
                        aria-label="Go to homepage" 
                        onClick={onHomeClick} 
                        className="hover:opacity-80 transition-opacity"
                    >
                        <img src={logoLight} alt="MyJSI Logo" className="h-10 w-auto" style={{ filter: filterStyle }} />
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <div 
                        className={`transition-all duration-300 ease-in-out text-base font-normal leading-tight whitespace-nowrap overflow-hidden ${
                            isHome ? 'max-w-[150px] opacity-100' : 'max-w-0 opacity-0'
                        }`} 
                        style={{ color: theme.colors.textPrimary }} 
                        aria-hidden={!isHome}
                    >
                        Hello, {userName}!
                    </div>
                    <button 
                        aria-label="Open profile menu" 
                        onClick={onProfileClick} 
                        className="w-9 h-9 rounded-full flex items-center justify-center border transition-colors hover:bg-black/5 dark:hover:bg-white/5" 
                        style={{ 
                            backgroundColor: theme.colors.subtle, 
                            borderColor: theme.colors.border 
                        }}
                    >
                        <User className="w-5 h-5" style={{ color: theme.colors.secondary }} />
                    </button>
                </div>
            </div>
        </div>
    );
});