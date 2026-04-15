import React from 'react';
import { Download, Share2, Check, Plus } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { formatLongDate } from '../../../../utils/format.js';
import { SlideCarousel } from './SlideCarousel.jsx';

const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';

export const PresentationCard = ({ p, theme, onAddToMyDecks, myDeckIds, onDownload, onShare, onViewFull }) => {
    const isDark = isDarkTheme(theme);
    const inMyDecks = myDeckIds.has(String(p.id));
    return (
        <div className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}>
            <div className="p-4">
                <SlideCarousel pres={p} theme={theme} onViewFull={() => onViewFull(p)} />
            </div>
            <div className="px-5 pb-5 space-y-3">
                <div className="space-y-1.5">
                    <h3 className="font-semibold text-[0.9375rem] leading-snug" style={{ color: theme.colors.textPrimary }}>{p.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: `${theme.colors.accent}18`, color: theme.colors.accent }}>{p.category}</span>
                        <span style={{ color: theme.colors.textSecondary }}>{p.type} · {p.size}</span>
                        <span style={{ color: theme.colors.textSecondary }}>Updated {formatLongDate(p.lastUpdated)}</span>
                    </div>
                    <p className="text-[0.8125rem] leading-relaxed" style={{ color: theme.colors.textSecondary }}>{p.description}</p>
                </div>
                <div className="flex gap-2 pt-1">
                    <button onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF') }}>
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={onShare}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button onClick={() => onAddToMyDecks(p)}
                        title={inMyDecks ? 'In My Decks' : 'Save to My Decks'}
                        className="flex items-center justify-center w-10 rounded-full transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${inMyDecks ? theme.colors.accent : theme.colors.border}`, color: inMyDecks ? theme.colors.accent : theme.colors.textSecondary, background: inMyDecks ? `${theme.colors.accent}12` : 'transparent' }}>
                        {inMyDecks ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};
