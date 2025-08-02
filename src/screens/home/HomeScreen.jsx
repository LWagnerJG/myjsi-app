import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Search, Mic } from 'lucide-react';
import { MENU_ITEMS, allApps } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';

const SmartSearch = ({
    theme,
    onNavigate,
    onAskAI,
    onVoiceActivate
}) => {
    const [query, setQuery] = useState('');
    const [filteredApps, setFilteredApps] = useState([]);
    const [isFocused, setIsFocused] = useState(false);
    const searchContainerRef = useRef(null);

    useEffect(() => {
        if (!isFocused) {
            setFilteredApps([]);
            return;
        }
        const term = query.trim().toLowerCase();
        if (term.length >= 1) {
            const results = allApps
                .filter(app => app.name.toLowerCase().includes(term))
                .sort((a, b) => a.name.localeCompare(b.name));
            setFilteredApps(results);
        } else {
            setFilteredApps([]);
        }
    }, [query, isFocused]);

    useEffect(() => {
        const handleClickOutside = e => {
            if (
                searchContainerRef.current &&
                !searchContainerRef.current.contains(e.target)
            ) {
                setIsFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleNavigation = route => {
        onNavigate(route);
        setQuery('');
        setFilteredApps([]);
        setIsFocused(false);
    };

    const handleFormSubmit = e => {
        e.preventDefault();
        if (query.trim() && filteredApps.length === 0) {
            onAskAI(query);
            setQuery('');
            setIsFocused(false);
        }
    };

    const handleVoiceClick = () => {
        onVoiceActivate('Voice Activated');
    };

    return (
        <div ref={searchContainerRef} className="relative z-20">
            <form onSubmit={handleFormSubmit} className="relative">
                <Search
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5"
                    style={{ color: theme.colors.textSecondary }}
                />
                <input
                    type="text"
                    placeholder="Ask me anything..."
                    value={query}
                    onChange={e => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    className="w-full pl-12 pr-12 py-4 rounded-full text-base outline-none"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary,
                        boxShadow: `0 6px 24px ${theme.colors.shadow}`,
                        height: '68px'
                    }}
                />
                <button
                    type="button"
                    onClick={handleVoiceClick}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1"
                >
                    <Mic
                        className="h-5 w-5"
                        style={{ color: theme.colors.textSecondary }}
                    />
                </button>
            </form>

            {isFocused && filteredApps.length > 0 && (
                <GlassCard theme={theme} className="absolute top-full mt-2 w-full p-2 z-50">
                    <ul className="max-h-60 overflow-y-auto scrollbar-hide">
                        {filteredApps.map(app => (
                            <li
                                key={app.route}
                                onMouseDown={() => handleNavigation(app.route)}
                                className="flex items-center gap-3 cursor-pointer px-3 py-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                <app.icon
                                    className="w-4 h-4"
                                    style={{ color: theme.colors.textSecondary }}
                                />
                                {app.name}
                            </li>
                        ))}
                    </ul>
                </GlassCard>
            )}
        </div>
    );
};

export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const FeedbackIcon = allApps.find(app => app.route === 'feedback')?.icon;

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-4 pb-3">
                <SmartSearch 
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    onVoiceActivate={onVoiceActivate}
                />
            </div>

            <div className="flex-1 grid grid-cols-2 gap-3 px-4">
                {MENU_ITEMS.map(item => (
                    <button 
                        key={item.id} 
                        onClick={() => onNavigate(item.id)} 
                        className="p-4 rounded-[28px] flex flex-col items-start justify-between transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] w-full h-full" 
                        style={{ 
                            backgroundColor: theme.colors.surface, 
                            border: 'none', 
                            boxShadow: `0 6px 24px ${theme.colors.shadow}`
                        }}
                    >
                        <item.icon 
                            className="w-6 h-6 mb-1" 
                            style={{ color: theme.colors.accent }} 
                            strokeWidth={1.5} 
                        />
                        <span 
                            className="text-base font-semibold tracking-tight leading-tight" 
                            style={{ color: theme.colors.textPrimary }}
                        >
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="px-4 pt-3 pb-safe-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <button 
                    onClick={() => onNavigate('feedback')} 
                    className="w-full p-5 rounded-[28px] flex items-center justify-center space-x-3 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]" 
                    style={{ 
                        backgroundColor: theme.colors.surface, 
                        border: 'none', 
                        boxShadow: `0 6px 24px ${theme.colors.shadow}` 
                    }}
                >
                    {FeedbackIcon && (
                        <FeedbackIcon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                    )}
                    <span 
                        className="text-base font-semibold" 
                        style={{ color: theme.colors.textPrimary }}
                    >
                        Give Feedback
                    </span>
                </button>
            </div>
        </div>
    );
};