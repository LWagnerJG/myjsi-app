import React, { useState, useCallback, useRef, useEffect } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../../components/common/SearchInput.jsx';
import { QuickActionDropdown } from '../../../components/common/QuickActionDropdown.jsx';
import { getHomeChromePillStyles } from '../../../design-system/homeChrome.js';

/* ── Elliott avatar URL ────────────────────────────────────────────── */
const ELLIOTT_AVATAR_URL = '/elliott-avatar.png';
const DROPDOWN_ID = 'spotlight-listbox';

export const HomeHeader = ({
    colors,
    todayLabel,
    theme,
    searchQuery,
    setSearchQuery,
    handleSearchSubmit,
    onVoiceActivate,
    handleQuickAction,
    spotlightResults,
    onNavigate,
    openChatFromQuery,
    hoverBg,
    isDark,
    onRfpFileDrop,
}) => {
    const [fileDragOver, setFileDragOver] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const searchPillStyles = getHomeChromePillStyles(isDark);

    const totalItems = spotlightResults.length + 1; // +1 for Elliott row
    const isOpen = Boolean(searchQuery.trim());

    // Reset keyboard highlight whenever the result list changes
    useEffect(() => {
        setFocusedIndex(null);
    }, [spotlightResults]);

    // ── Keyboard handler for the search input ─────────────────────────
    const handleSearchKeyDown = useCallback((e) => {
        if (!isOpen) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setFocusedIndex(prev => prev === null ? 0 : Math.min(prev + 1, totalItems - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setFocusedIndex(prev => prev === null ? totalItems - 1 : Math.max(prev - 1, 0));
                break;
            case 'Enter':
                if (focusedIndex !== null) {
                    e.preventDefault();
                    if (focusedIndex < spotlightResults.length) {
                        onNavigate?.(spotlightResults[focusedIndex].route);
                    } else {
                        openChatFromQuery(searchQuery);
                    }
                    setSearchQuery('');
                    setFocusedIndex(null);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setSearchQuery('');
                setFocusedIndex(null);
                break;
            default:
                break;
        }
    }, [isOpen, focusedIndex, totalItems, spotlightResults, searchQuery, onNavigate, openChatFromQuery, setSearchQuery]);

    // ── Native file-drop (separate from @dnd-kit tile reorder) ────────
    const handleDragEnter = useCallback((e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
            e.preventDefault();
            setFileDragOver(true);
        }
    }, []);
    const handleDragOver = useCallback((e) => {
        if (e.dataTransfer?.types?.includes('Files')) {
            e.preventDefault();
        }
    }, []);
    const handleDragLeave = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setFileDragOver(false);
        }
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setFileDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
        if (isPdf && onRfpFileDrop) {
            onRfpFileDrop(file);
        }
    }, [onRfpFileDrop]);

    // ── Highlight style shared between app results and Elliott row ─────
    const focusedBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)';

    return (
        <div className="relative group">
            {/* Dashboard label + search bar on one row */}
            <div className="flex items-center gap-4">
                <div className="shrink-0 hidden sm:block min-w-[120px]">
                    <h2 className="text-[26px] font-bold tracking-tight leading-none" style={{ color: colors.textPrimary }}>Dashboard</h2>
                    <div className="text-[11px] font-medium whitespace-nowrap mt-1.5" style={{ color: colors.textSecondary, opacity: 0.45 }}>{todayLabel}</div>
                </div>

                <GlassCard
                    theme={theme}
                    className="relative z-10 px-5 flex items-center min-w-0 ml-auto w-full max-w-[760px]"
                    onDragEnter={handleDragEnter}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    style={{
                        ...searchPillStyles,
                        paddingTop: 0,
                        paddingBottom: 0,
                        border: fileDragOver ? `2px solid ${colors.accent}` : searchPillStyles.border,
                        boxShadow: fileDragOver
                            ? `0 0 0 4px ${colors.accent}22, ${searchPillStyles.boxShadow}`
                            : searchPillStyles.boxShadow,
                        transition: 'border 200ms ease, box-shadow 200ms ease',
                    }}
                >
                    <HomeSearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSubmit={handleSearchSubmit}
                        onVoiceClick={() => onVoiceActivate && onVoiceActivate('Voice search active')}
                        onKeyDown={handleSearchKeyDown}
                        ariaExpanded={isOpen}
                        ariaActiveDescendant={
                            focusedIndex !== null ? `spotlight-opt-${focusedIndex}` : undefined
                        }
                        ariaControls={isOpen ? DROPDOWN_ID : undefined}
                        theme={theme}
                        className="w-full"
                    />
                    {/* Quick Actions Dropdown (Plus button) */}
                    <QuickActionDropdown
                        theme={theme}
                        onActionSelect={handleQuickAction}
                        className="ml-2"
                    />
                </GlassCard>
            </div>

            {/* ── Spotlight dropdown ──────────────────────────────────────── */}
            {isOpen && (
                <div className="absolute left-0 right-0 top-full mt-2 z-20">
                    <GlassCard
                        theme={theme}
                        className="p-2"
                        style={{
                            borderRadius: 20,
                            backgroundColor: isDark ? 'rgba(42,42,42,0.85)' : 'rgba(255,255,255,0.55)',
                            backdropFilter: 'blur(24px) saturate(1.8)',
                            WebkitBackdropFilter: 'blur(24px) saturate(1.8)',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)',
                            boxShadow: isDark
                                ? '0 8px 32px rgba(0,0,0,0.3), 0 2px 8px rgba(0,0,0,0.2)'
                                : '0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.5)',
                        }}
                        role="listbox"
                        id={DROPDOWN_ID}
                        aria-label="Search results"
                    >
                        <div className="space-y-1">
                            {spotlightResults.map((app, index) => (
                                <button
                                    key={app.route}
                                    id={`spotlight-opt-${index}`}
                                    role="option"
                                    aria-selected={focusedIndex === index}
                                    aria-label={`Go to ${app.name}`}
                                    onMouseDown={(e) => {
                                        e.preventDefault();
                                        onNavigate?.(app.route);
                                        setSearchQuery('');
                                    }}
                                    onMouseEnter={() => setFocusedIndex(index)}
                                    onMouseLeave={() => setFocusedIndex(null)}
                                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors`}
                                    style={{
                                        backgroundColor: focusedIndex === index ? focusedBg : 'transparent',
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex items-center justify-center"
                                        style={{ backgroundColor: `${colors.accent}12` }}
                                    >
                                        <app.icon className="w-4 h-4" style={{ color: colors.accent }} />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                            {app.name}
                                        </div>
                                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                                            {app.route}
                                        </div>
                                    </div>
                                </button>
                            ))}

                            <div className="mt-1 pt-1" style={{ borderTop: `1px solid ${colors.border}` }}>
                                <button
                                    id={`spotlight-opt-${spotlightResults.length}`}
                                    role="option"
                                    aria-selected={focusedIndex === spotlightResults.length}
                                    aria-label={`Ask Elliott about "${searchQuery}"`}
                                    onMouseDown={(event) => {
                                        event.preventDefault();
                                        event.stopPropagation();
                                        openChatFromQuery(searchQuery);
                                    }}
                                    onMouseEnter={() => setFocusedIndex(spotlightResults.length)}
                                    onMouseLeave={() => setFocusedIndex(null)}
                                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors"
                                    style={{
                                        backgroundColor: focusedIndex === spotlightResults.length ? focusedBg : 'transparent',
                                    }}
                                >
                                    <div
                                        className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
                                        style={{ background: 'linear-gradient(135deg, #E8D1C2 0%, #D3A891 100%)' }}
                                    >
                                        <img
                                            src={ELLIOTT_AVATAR_URL}
                                            alt="Elliott"
                                            width={32}
                                            height={32}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    </div>
                                    <div className="text-left flex-1 min-w-0">
                                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                                            Ask Elliott
                                        </div>
                                        <div className="text-xs truncate" style={{ color: colors.textSecondary }}>
                                            Chat about &ldquo;{searchQuery}&rdquo;
                                        </div>
                                    </div>
                                    <div
                                        className="text-[10px] font-semibold tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                                        style={{
                                            backgroundColor: `${colors.accent}0F`,
                                            color: colors.textSecondary,
                                        }}
                                    >
                                        Elliott Bot
                                    </div>
                                </button>
                            </div>
                        </div>
                    </GlassCard>
                </div>
            )}
        </div>
    );
};
