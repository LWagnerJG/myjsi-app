import React from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { LogOut, Home } from 'lucide-react';

export const LogoutScreen = ({ theme, onNavigate }) => {
    const handleLogout = () => {
        // Here you would typically clear user session/tokens
        if (import.meta.env.DEV) console.log('User logged out');
        // For now, just navigate back to home
        onNavigate('home');
    };

    const handleCancel = () => {
        onNavigate('home');
    };

    return (
        <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <PageTitle title="Sign Out" theme={theme} />
            <div className="flex-1 flex items-center justify-center px-4">
                <GlassCard theme={theme} className="p-8 text-center w-full max-w-md">
                    <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.subtle }}>
                        <LogOut className="w-8 h-8" style={{ color: theme.colors.accent }} />
                    </div>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: theme.colors.textPrimary }}>
                        Sign Out
                    </h2>
                    <p className="text-sm mb-8" style={{ color: theme.colors.textSecondary }}>
                        Are you sure you want to sign out of your account?
                    </p>
                    
                    <div className="space-y-3">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-full font-semibold text-white transition-all duration-200 transform active:scale-95"
                            style={{ backgroundColor: 'var(--theme-error, #B85C5C)' }}
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Yes, Sign Out</span>
                        </button>
                        
                        <button
                            onClick={handleCancel}
                            className="w-full flex items-center justify-center space-x-2 py-3 px-6 rounded-full font-semibold transition-all duration-200 transform active:scale-95"
                            style={{ 
                                backgroundColor: theme.colors.subtle, 
                                color: theme.colors.textPrimary 
                            }}
                        >
                            <Home className="w-5 h-5" />
                            <span>Cancel</span>
                        </button>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};