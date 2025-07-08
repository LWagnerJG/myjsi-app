import React, { useCallback } from 'react';
import { MessageSquare, Hourglass } from 'lucide-react';
import GlassCard from './GlassCard';


const HomeScreen = ({ onNavigate, theme, onAskAI, searchTerm, onSearchTermChange, showAIDropdown, aiResponse, isAILoading, onCloseAIDropdown, showAlert }) => {
    const handleFeedbackClick = useCallback(() => {
        onNavigate('feedback');
    }, [onNavigate]);

    return (
        <div className="flex flex-col h-full rounded-t-[40px] -mt-8 pt-8" style={{ backgroundColor: theme.colors.background }}>
            <div className="px-4 pt-4 pb-2 relative z-10">
                <SmartSearch
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    showAlert={showAlert}
                />
                {showAIDropdown && (
                    <GlassCard theme={theme} className="absolute top-full w-full mt-2 p-4">
                        {isAILoading ? (
                            <div className="flex items-center justify-center p-4">
                                <Hourglass className="w-6 h-6 animate-spin" style={{ color: theme.colors.accent }} />
                                <p className="ml-3" style={{ color: theme.colors.textPrimary }}>Thinking...</p>
                            </div>
                        ) : (
                            <p style={{ color: theme.colors.textPrimary }}>{aiResponse}</p>
                        )}
                    </GlassCard>
                )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                <div className="grid grid-cols-2 gap-4">
                    {MENU_ITEMS.map((item) => (
                        <GlassCard
                            key={item.id}
                            theme={theme}
                            className="
                                group relative p-4 h-32 flex flex-col justify-between 
                                cursor-pointer transition-all duration-300 hover:border-white/20
                            "
                            onClick={() => onNavigate(item.id)}
                        >
                            <div
                                className="absolute top-0 left-0 w-full h-full rounded-[1.75rem] opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                                style={{ background: `radial-gradient(circle at 20% 25%, ${theme.colors.subtle}00 0%, ${theme.colors.subtle} 100%)` }}
                            ></div>

                            <div className="relative">
                                <item.icon className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={2} />
                            </div>

                            <div className="relative">
                                <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <GlassCard theme={theme} className="p-1">
                    <button onClick={handleFeedbackClick} className="w-full h-20 p-3 rounded-xl flex items-center justify-center space-x-4">
                        <MessageSquare className="w-7 h-7" style={{ color: theme.colors.textSecondary }} strokeWidth={2} />
                        <span className="text-xl font-bold tracking-tight" style={{ color: theme.colors.textPrimary }}>Give Feedback</span>
                    </button>
                </GlassCard>
            </div>

            {showAIDropdown && (<div className="absolute inset-0 bg-transparent z-0" onClick={onCloseAIDropdown} />)}
        </div>
    );
};

export default HomeScreen;