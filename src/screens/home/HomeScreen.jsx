import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS, allApps } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SearchInput } from '../../components/common/SearchInput.jsx';
import { DropdownPortal } from '../../DropdownPortal.jsx';

const SmartSearch = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const [query, setQuery] = useState('');
    const [isFocused, setIsFocused] = useState(false);
    const [filtered, setFiltered] = useState([]);
    const anchorRef = useRef(null);
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 });

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
        const term = query.trim().toLowerCase();
        setFiltered(
            isFocused && term
                ? allApps.filter(a => a.name.toLowerCase().includes(term)).sort((a, b) => a.name.localeCompare(b.name))
                : []
        );
    }, [query, isFocused]);

    useEffect(() => {
        const close = (e) => {
            if (anchorRef.current && !anchorRef.current.contains(e.target)) setIsFocused(false);
        };
        document.addEventListener('mousedown', close);
        return () => document.removeEventListener('mousedown', close);
    }, []);

    const submit = (e) => {
        e.preventDefault();
        if (query.trim() && filtered.length === 0) {
            onAskAI(query);
            setQuery('');
            setIsFocused(false);
        }
    };

    const PILL = {
        backgroundColor: '#FFFFFF',
        border: `1px solid ${theme.colors.border}`,
        boxShadow: `0 8px 24px ${theme.colors.shadow}`,
        borderRadius: 9999,
        height: 56,
    };

    return (
        <div ref={anchorRef} className="relative">
            <div className="w-full flex items-center px-4" style={PILL}>
                <SearchInput
                    onSubmit={submit}
                    value={query}
                    onChange={(value) => setQuery(value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onVoiceClick={() => onVoiceActivate('Voice Activated')}
                    theme={theme}
                    className="w-full"
                />
            </div>

            {isFocused && filtered.length > 0 && (
                <DropdownPortal>
                    <div className="absolute" style={{ top: pos.top, left: pos.left, width: pos.width, zIndex: 10000 }}>
                        <GlassCard theme={theme} className="p-1">
                            <ul className="max-h-64 overflow-y-auto scrollbar-hide">
                                {filtered.map((app) => (
                                    <li
                                        key={app.route}
                                        onMouseDown={() => {
                                            onNavigate(app.route);
                                            setQuery('');
                                            setIsFocused(false);
                                        }}
                                        className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 transition-all active:scale-[0.99]"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        <app.icon className="w-[18px] h-[18px]" style={{ color: theme.colors.textSecondary }} />
                                        <span className="text-[15px]">{app.name}</span>
                                    </li>
                                ))}
                            </ul>
                        </GlassCard>
                    </div>
                </DropdownPortal>
            )}
        </div>
    );
};

export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate }) => {
    const FeedbackIcon = allApps.find(a => a.route === 'feedback')?.icon;

    const SURFACE_TILE = useMemo(() => ({
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: `0 8px 24px ${theme.colors.shadow}`
    }), [theme]);

    const PILL = useMemo(() => ({
        backgroundColor: theme.colors.surface,
        border: `1px solid ${theme.colors.border}`,
        boxShadow: `0 8px 24px ${theme.colors.shadow}`,
        borderRadius: 9999,
        height: 56
    }), [theme]);

    return (
        <div className="flex flex-col h-full">
            {/* More margin below search bar */}
            <div className="px-4 pt-3 pb-4">
                <SmartSearch
                    theme={theme}
                    onNavigate={onNavigate}
                    onAskAI={onAskAI}
                    onVoiceActivate={onVoiceActivate}
                />
            </div>

            <div className="flex-1 px-4 grid grid-cols-2 gap-3">
                {MENU_ITEMS.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onNavigate(item.id)}
                        className="p-4 rounded-[26px] flex flex-col items-start justify-between transition-all duration-200 hover:scale-[1.015] active:scale-[0.985]"
                        style={SURFACE_TILE}
                    >
                        <item.icon className="w-[22px] h-[22px] mb-1" style={{ color: theme.colors.accent }} strokeWidth={1.6} />
                        {/* label slightly bigger */}
                        <span className="text-[16px] font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="px-4 pt-3 pb-safe-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <button
                    onClick={() => onNavigate('feedback')}
                    className="w-full flex items-center justify-center space-x-3 px-5"
                    style={PILL}
                >
                    {FeedbackIcon && <FeedbackIcon className="w-[18px] h-[18px]" style={{ color: theme.colors.accent }} />}
                    <span className="text-[15px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                        Give Feedback
                    </span>
                </button>
            </div>
        </div>
    );
};
