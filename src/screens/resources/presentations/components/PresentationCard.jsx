import React from 'react';
import { Download, Share2, Check, Plus, MonitorPlay, GraduationCap, Package, Building2, TrendingUp } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';

const CATEGORY_ICON = {
    'Product Training': GraduationCap,
    'Product Specific': Package,
    'Sales Training': TrendingUp,
    'Company': Building2,
};

const IconBtn = ({ icon: Icon, title, onClick, theme, dark, accent }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        aria-label={title}
        className="w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90 flex-shrink-0"
        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }}
    >
        <Icon className="w-[16px] h-[16px]" style={{ color: accent ? theme.colors.accent : theme.colors.textSecondary }} />
    </button>
);

export const PresentationCard = ({ p, theme, onAddToMyDecks, myDeckIds, onDownload, onShare, onViewFull }) => {
    const dark = isDarkTheme(theme);
    const inMyDecks = myDeckIds.has(String(p.id));
    const Icon = CATEGORY_ICON[p.category] || MonitorPlay;
    const surface = dark ? theme.colors.surface : '#FFFFFF';

    return (
        <div
            className="rounded-3xl overflow-hidden h-full flex flex-col transition-all duration-300"
            style={{ background: surface, border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}
        >
            <button
                onClick={() => onViewFull(p)}
                className="flex items-center gap-3 w-full text-left p-4 transition-colors active:opacity-90"
                aria-label={`Preview ${p.title}`}
            >
                <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)' }}
                >
                    <Icon className="w-5 h-5" style={{ color: theme.colors.accent, opacity: 0.85 }} />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[0.9375rem] leading-snug line-clamp-1" style={{ color: theme.colors.textPrimary }}>{p.title}</h3>
                    <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{p.type} · {p.size}</p>
                </div>
            </button>

            <div className="px-4 pb-4 flex-1 flex flex-col">
                <p className="text-[0.8125rem] leading-relaxed line-clamp-2 flex-1" style={{ color: theme.colors.textSecondary }}>{p.description}</p>
                <div className="flex items-center justify-end gap-1.5 mt-3">
                    <IconBtn icon={Download} title="Download" onClick={onDownload} theme={theme} dark={dark} />
                    <IconBtn icon={Share2} title="Share" onClick={onShare} theme={theme} dark={dark} />
                    <IconBtn
                        icon={inMyDecks ? Check : Plus}
                        title={inMyDecks ? 'Saved to My Decks' : 'Save to My Decks'}
                        onClick={() => onAddToMyDecks(p)}
                        theme={theme}
                        dark={dark}
                        accent={inMyDecks}
                    />
                </div>
            </div>
        </div>
    );
};
