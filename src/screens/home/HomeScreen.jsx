// Enhanced HomeScreen with improved dashboard design
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS, allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
import { DropdownPortal } from '../../DropdownPortal.jsx';
import { DESIGN_TOKENS, JSI_TYPOGRAPHY } from '../../design-system/tokens.js';

// Smart Search Component - Memoized for performance
const SmartSearch = React.memo(({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const anchorRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

    const filtered = useMemo(() => {
        if (!query.trim()) return [];
        const q = query.toLowerCase();
        return allApps
            .filter(app => app.name.toLowerCase().includes(q) || (app.keywords || []).some(k => k.toLowerCase().includes(q)))
            .slice(0, 6);
    }, [query]);

    const updatePos = useCallback(() => {
        if (!anchorRef.current) return;
        const r = anchorRef.current.getBoundingClientRect();
        setPos({ top: r.bottom + window.scrollY + 8, left: r.left + window.scrollX, width: r.width });
    }, []);

    useEffect(() => {
        if (!isFocused) return;
        updatePos();
        const onResize = () => updatePos();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, [isFocused, updatePos]);

    useEffect(() => {
        const close = (e) => {
            if (anchorRef.current && !anchorRef.current.contains(e.target)) setIsFocused(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const submit = useCallback((e) => {
        e.preventDefault();
        if (query.trim() && filtered.length === 0) {
            onAskAI(query);
            setQuery('');
            setIsFocused(false);
        }
    }, [query, filtered, onAskAI]);

    const handleNavigate = useCallback((route) => {
        onNavigate(route);
        setQuery('');
        setIsFocused(false);
    }, [onNavigate]);

    return (
        <div ref={anchorRef} className="relative mb-6">
            <GlassCard
                theme={theme}
                variant="elevated"
                className="w-full px-5"
                style={{
                    borderRadius: 9999,
                    paddingTop: 0,
                    paddingBottom: 0,
                    height: 56,
                    backgroundColor: theme.colors.surface,
                    boxShadow: DESIGN_TOKENS.shadows.md,
                    border: `1px solid ${theme.colors.border}`
                }}
            >
                <HomeSearchInput
                    onSubmit={submit}
                    value={query}
                    onChange={setQuery}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onVoiceClick={() => onVoiceActivate('Voice Activated')}
                    theme={theme}
                    className="w-full"
                />
            </GlassCard>

            {isFocused && filtered.length > 0 && (
                <DropdownPortal>
                    <div className="absolute" style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 10000 }}>
                        <GlassCard theme={theme} className="p-1" variant="elevated">
                            <ul className="max-h-64 overflow-y-auto scrollbar-hide">
                                {filtered.map((app) => (
                                    <li
                                        key={app.route}
                                        onMouseDown={() => handleNavigate(app.route)}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.99]"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        <app.icon className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        <span className="text-sm">{app.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
}, (prevProps, nextProps) => {
    return prevProps.theme === nextProps.theme;
});
SmartSearch.displayName = 'SmartSearch';

// Enhanced Home Grid with consistent styling
const HomeGrid = React.memo(({ theme, tiles, onNavigate }) => {
    return (
        <div className="grid grid-cols-2 gap-3 lg:gap-4 mb-6">
            {tiles.map(item => (
                <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98] relative group"
                    style={{
                        backgroundColor: theme.colors.surface,
                        boxShadow: `0 2px 8px ${theme.colors.shadow}`,
                        border: `1px solid ${theme.colors.border}`,
                        minHeight: '110px'
                    }}
                >
                    {/* Centered icon */}
                    <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: `${theme.colors.accent}12` }}
                    >
                        <item.icon className="w-5 h-5" style={{ color: theme.colors.accent }} />
                    </div>

                    {/* App name */}
                    <span
                        className="text-xs font-medium text-center leading-tight line-clamp-1"
                        style={{ color: theme.colors.textPrimary }}
                    >
                        {item.label}
                    </span>
                </button>
            ))}
        </div>
    );
}, (prevProps, nextProps) => {
    return (
        prevProps.tiles === nextProps.tiles &&
        prevProps.theme === nextProps.theme
    );
});
HomeGrid.displayName = 'HomeGrid';

export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate, homeApps }) => {
    const FeedbackIcon = allApps.find(a => a.route === 'feedback')?.icon;

    const tiles = useMemo(() => {
        let selection = Array.isArray(homeApps) ? homeApps : DEFAULT_HOME_APPS;
        if (selection.length !== 8) selection = DEFAULT_HOME_APPS;
        return selection.map(route => {
            const app = allApps.find(a => a.route === route);
            if (!app) return null;
            return { id: route, label: app.name, icon: app.icon };
        }).filter(Boolean);
    }, [homeApps]);

    return (
        <div className="flex flex-col h-full px-4 pt-3" style={{ paddingBottom: 'max(5rem, env(safe-area-inset-bottom))' }}>
            <SmartSearch
                theme={theme}
                onNavigate={onNavigate}
                onAskAI={onAskAI}
                onVoiceActivate={onVoiceActivate}
            />

            <HomeGrid
                theme={theme}
                tiles={tiles}
                onNavigate={onNavigate}
            />

            <div className="mt-auto">
                <GlassCard
                    theme={theme}
                    variant="elevated"
                    interactive
                    className="w-full flex items-center justify-center gap-3 px-5"
                    style={{
                        borderRadius: DESIGN_TOKENS.borderRadius.pill,
                        height: 56,
                        backgroundColor: theme.colors.surface,
                        boxShadow: DESIGN_TOKENS.shadows.md,
                        border: `1px solid ${theme.colors.border}`
                    }}
                    onClick={() => onNavigate('feedback')}
                >
                    {FeedbackIcon && <FeedbackIcon className="w-[18px] h-[18px]" style={{ color: theme.colors.accent }} />}
                    <span
                        className="text-[15px] font-semibold"
                        style={{
                            color: theme.colors.textPrimary,
                            fontFamily: JSI_TYPOGRAPHY.fontFamily,
                            fontWeight: JSI_TYPOGRAPHY.weights.semibold
                        }}
                    >
                        Give Feedback
                    </span>
                </GlassCard>
            </div>
        </div>
    );
};
