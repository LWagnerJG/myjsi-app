import React, { useState, useCallback, useEffect } from 'react';
import { Package, Briefcase, LayoutGrid } from 'lucide-react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { HomeSearchInput } from '../../../components/common/SearchInput.jsx';
import { QuickActionDropdown } from '../../../components/common/QuickActionDropdown.jsx';
import { getHomeChromePillStyles } from '../../../design-system/homeChrome.js';
import { formatCurrencyCompact } from '../../../utils/format.js';

const ELLIOTT_AVATAR_URL = '/elliott-avatar.png';
const DROPDOWN_ID = 'spotlight-listbox';

const STATUS_DOT_COLOR = {
    'Order Entry': '#C4956A',
    'Acknowledged': '#8B8685',
    'In Production': '#5B7B8C',
    'Shipping': '#5B7B8C',
    'Delivered': '#4A7C59',
};

const TYPE_LABEL = { order: 'Order', project: 'Project', product: 'Product' };

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
    isDark,
    onRfpFileDrop,
    homeStats,
}) => {
    const [fileDragOver, setFileDragOver] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(null);
    const searchPillStyles = getHomeChromePillStyles(isDark);

    const totalItems = spotlightResults.length + 1;
    const isOpen = Boolean(searchQuery.trim());

    useEffect(() => { setFocusedIndex(null); }, [spotlightResults]);

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

    const handleDragEnter = useCallback((e) => {
        if (e.dataTransfer?.types?.includes('Files')) { e.preventDefault(); setFileDragOver(true); }
    }, []);
    const handleDragOver = useCallback((e) => {
        if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
    }, []);
    const handleDragLeave = useCallback((e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setFileDragOver(false);
    }, []);
    const handleDrop = useCallback((e) => {
        e.preventDefault();
        setFileDragOver(false);
        const file = e.dataTransfer?.files?.[0];
        if (!file) return;
        const isPdf = file.type === 'application/pdf' || file.name?.toLowerCase().endsWith('.pdf');
        if (isPdf && onRfpFileDrop) onRfpFileDrop(file);
    }, [onRfpFileDrop]);

    const focusedBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.03)';

    const renderResultIcon = (item) => {
        if (item.type === 'app' && item.icon) {
            return <item.icon className="w-4 h-4" style={{ color: colors.accent }} />;
        }
        const Icon = item.type === 'order' ? Package : item.type === 'project' ? Briefcase : LayoutGrid;
        return <Icon className="w-4 h-4" style={{ color: colors.accent }} />;
    };

    const renderResultMeta = (item) => {
        if (item.type === 'app') {
            return <div className="text-xs" style={{ color: colors.textSecondary }}>{item.route}</div>;
        }
        if (item.type === 'order') {
            return (
                <div className="text-xs flex items-center gap-2" style={{ color: colors.textSecondary }}>
                    <span className="truncate">{item.subtitle}</span>
                    <span className="font-semibold tabular-nums flex-shrink-0"
                        style={{ color: colors.textPrimary, opacity: 0.7 }}>
                        {formatCurrencyCompact(item.net)}
                    </span>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: STATUS_DOT_COLOR[item.status] || colors.textSecondary }} />
                </div>
            );
        }
        return <div className="text-xs truncate" style={{ color: colors.textSecondary }}>{item.subtitle}</div>;
    };

    return (
        <div className="flex flex-col gap-2.5">
            {/* Search row */}
            <div className="relative group">
                <div className="flex items-center gap-4">
                    <div className="shrink-0 hidden sm:block min-w-[120px]">
                        <h2 className="text-[1.625rem] font-bold tracking-tight leading-none" style={{ color: colors.textPrimary }}>Dashboard</h2>
                        <div className="text-xs font-medium whitespace-nowrap mt-1.5" style={{ color: colors.textSecondary, opacity: 0.45 }}>{todayLabel}</div>
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
                            ariaActiveDescendant={focusedIndex !== null ? `spotlight-opt-${focusedIndex}` : undefined}
                            ariaControls={isOpen ? DROPDOWN_ID : undefined}
                            theme={theme}
                            className="w-full"
                        />
                        <QuickActionDropdown theme={theme} onActionSelect={handleQuickAction} className="ml-2" />
                    </GlassCard>
                </div>

                {/* Spotlight dropdown */}
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
                            <div className="space-y-0.5">
                                {spotlightResults.map((item, index) => (
                                    <button
                                        key={`${item.type}-${item.route}-${index}`}
                                        id={`spotlight-opt-${index}`}
                                        role="option"
                                        aria-selected={focusedIndex === index}
                                        aria-label={`Go to ${item.name}`}
                                        onMouseDown={(e) => {
                                            e.preventDefault();
                                            onNavigate?.(item.route);
                                            setSearchQuery('');
                                        }}
                                        onMouseEnter={() => setFocusedIndex(index)}
                                        onMouseLeave={() => setFocusedIndex(null)}
                                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-colors"
                                        style={{ backgroundColor: focusedIndex === index ? focusedBg : 'transparent' }}
                                    >
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                                            style={{ backgroundColor: `${colors.accent}12` }}>
                                            {renderResultIcon(item)}
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="text-sm font-semibold truncate" style={{ color: colors.textPrimary }}>
                                                {item.name}
                                            </div>
                                            {renderResultMeta(item)}
                                        </div>
                                        {item.type !== 'app' && (
                                            <span className="text-[0.5625rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full flex-shrink-0"
                                                style={{ backgroundColor: `${colors.accent}10`, color: colors.textSecondary }}>
                                                {TYPE_LABEL[item.type]}
                                            </span>
                                        )}
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
                                        style={{ backgroundColor: focusedIndex === spotlightResults.length ? focusedBg : 'transparent' }}
                                    >
                                        <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden"
                                            style={{ background: 'linear-gradient(135deg, #E8D1C2 0%, #D3A891 100%)' }}>
                                            <img src={ELLIOTT_AVATAR_URL} alt="Elliott" width={32} height={32}
                                                className="w-full h-full object-cover" loading="lazy" />
                                        </div>
                                        <div className="text-left flex-1 min-w-0">
                                            <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>Ask Elliott</div>
                                            <div className="text-xs truncate" style={{ color: colors.textSecondary }}>
                                                Chat about &ldquo;{searchQuery}&rdquo;
                                            </div>
                                        </div>
                                        <div className="text-xs font-semibold tracking-wide px-2 py-0.5 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: `${colors.accent}0F`, color: colors.textSecondary }}>
                                            Elliott Bot
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </GlassCard>
                    </div>
                )}
            </div>

            {/* Live stats strip */}
            {homeStats && (
                <div className="flex items-center gap-1.5 flex-wrap px-0.5">
                    {homeStats.unacked > 0 && (
                        <button
                            onClick={() => onNavigate?.('orders')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 hover:opacity-80"
                            style={{ backgroundColor: isDark ? 'rgba(196,149,106,0.12)' : 'rgba(196,149,106,0.12)', color: '#C4956A' }}
                        >
                            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: '#C4956A' }} />
                            {homeStats.unacked} need ACK
                        </button>
                    )}
                    <button
                        onClick={() => onNavigate?.('sales')}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 hover:opacity-80"
                        style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.14)' : 'rgba(74,124,89,0.10)', color: '#4A7C59' }}
                    >
                        {formatCurrencyCompact(homeStats.ytd)} YTD
                    </button>
                    {homeStats.active > 0 && (
                        <button
                            onClick={() => onNavigate?.('projects')}
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all active:scale-95 hover:opacity-80"
                            style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.14)' : 'rgba(91,123,140,0.10)', color: '#5B7B8C' }}
                        >
                            {homeStats.active} active projects
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};
