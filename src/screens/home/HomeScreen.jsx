// HomeScreen supports dynamic 8 (or legacy) home apps
import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { MENU_ITEMS, allApps, DEFAULT_HOME_APPS } from '../../data.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../components/common/SearchInput.jsx';
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

    return (
        <div ref={anchorRef} className="relative">
            <GlassCard theme={theme} variant="elevated" className="w-full px-4" style={{ borderRadius: 9999, paddingTop: 0, paddingBottom: 0 }}>
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

export const HomeScreen = ({ theme, onNavigate, onAskAI, onVoiceActivate, homeApps }) => {
    const FeedbackIcon = allApps.find(a => a.route === 'feedback')?.icon;

    const tiles = useMemo(() => {
        let selection = Array.isArray(homeApps) ? homeApps : DEFAULT_HOME_APPS;
        if (selection.length !== 8) selection = DEFAULT_HOME_APPS;
        return selection.map(route => {
            const app = allApps.find(a => a.route === route); if (!app) return null; return { id: route, label: app.name, icon: app.icon };
        }).filter(Boolean);
    }, [homeApps]);

    return (
        <div className="flex flex-col h-full">
            <div className="px-4 pt-3 pb-4">
                <SmartSearch theme={theme} onNavigate={onNavigate} onAskAI={onAskAI} onVoiceActivate={onVoiceActivate} />
            </div>
            <div className="flex-1 px-4 grid grid-cols-2 gap-3">
                {tiles.map(item => (
                    <GlassCard key={item.id} theme={theme} variant="elevated" interactive className="p-4 flex flex-col items-start justify-between" style={{ borderRadius: 26 }} onClick={() => onNavigate(item.id)}>
                        <item.icon className="w-[22px] h-[22px] mb-1" style={{ color: theme.colors.accent }} strokeWidth={1.6} />
                        <span className="text-[16px] font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>{item.label}</span>
                    </GlassCard>
                ))}
            </div>
            <div className="px-4 pt-3 pb-safe-bottom" style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}>
                <GlassCard theme={theme} variant="elevated" interactive className="w-full flex items-center justify-center space-x-3 px-5" style={{ borderRadius: 9999, height:56 }} onClick={() => onNavigate('feedback')}>
                    {FeedbackIcon && <FeedbackIcon className="w-[18px] h-[18px]" style={{ color: theme.colors.accent }} />}
                    <span className="text-[15px] font-semibold" style={{ color: theme.colors.textPrimary }}>Give Feedback</span>
                </GlassCard>
            </div>
        </div>
    );
};
