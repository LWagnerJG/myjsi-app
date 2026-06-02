import React from 'react';
import { Download, Share2, Check, Plus, MonitorPlay, GraduationCap, Package, Building2, TrendingUp } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { formatLongDate } from '../../../../utils/format.js';
import { JSIActionButton, JSIActionButtonGroup } from '../../../../components/common/JSIButtons.jsx';

const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';

const CATEGORY_ICON = {
    'Product Training': GraduationCap,
    'Product Specific': Package,
    'Sales Training': TrendingUp,
    'Company': Building2,
};

export const PresentationCard = ({ p, theme, onAddToMyDecks, myDeckIds, onDownload, onShare, onViewFull }) => {
    const isDark = isDarkTheme(theme);
    const inMyDecks = myDeckIds.has(String(p.id));
    const Icon = CATEGORY_ICON[p.category] || MonitorPlay;
    const surface = isDark ? theme.colors.surface : '#FFFFFF';

    return (
        <div
            className="rounded-3xl overflow-hidden transition-all duration-300"
            style={{ background: surface, border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}
        >
            <button
                onClick={() => onViewFull(p)}
                className="flex items-start gap-4 w-full text-left p-4 transition-colors active:opacity-90"
                aria-label={`Preview ${p.title}`}
            >
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)' }}
                >
                    <Icon className="w-6 h-6" style={{ color: theme.colors.accent, opacity: 0.85 }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[0.9375rem] leading-snug" style={{ color: theme.colors.textPrimary }}>{p.title}</h3>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs font-medium mt-1">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: `${theme.colors.accent}14`, color: theme.colors.accent }}>{p.category}</span>
                        <span style={{ color: theme.colors.textSecondary }}>{p.type} · {p.size}</span>
                    </div>
                </div>
            </button>

            <div className="px-4 pb-4 space-y-3">
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: theme.colors.textSecondary }}>{p.description}</p>
                <div className="flex items-center justify-between gap-2">
                    <span className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Updated {formatLongDate(p.lastUpdated)}</span>
                </div>
                <JSIActionButtonGroup>
                    <JSIActionButton
                        onClick={onDownload}
                        theme={theme}
                        icon={<Download className="w-4 h-4" />}
                    >
                        Download
                    </JSIActionButton>
                    <JSIActionButton
                        onClick={onShare}
                        theme={theme}
                        icon={<Share2 className="w-4 h-4" />}
                    >
                        Share
                    </JSIActionButton>
                    <JSIActionButton
                        onClick={() => onAddToMyDecks(p)}
                        title={inMyDecks ? 'In My Decks' : 'Save to My Decks'}
                        theme={theme}
                        icon={inMyDecks ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    >
                        {inMyDecks ? 'Saved' : 'Save'}
                    </JSIActionButton>
                </JSIActionButtonGroup>
            </div>
        </div>
    );
};
