import React from 'react';
import { Download, Share2, Trash2, LayoutGrid, Sparkles, Clock } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';

export const MyDeckCard = ({ deck, theme, onDownload, onShare, onDelete }) => {
    const isDark = isDarkTheme(theme);
    const isGenerated = deck.source === 'generated';
    return (
        <div className="rounded-3xl overflow-hidden transition-all duration-300"
            style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}>
            {/* Thumbnail */}
            <div className="aspect-video w-full overflow-hidden relative"
                style={{ background: isDark ? 'rgba(255,255,255,0.09)' : '#f0ede8' }}>
                {deck.thumbnailUrl
                    ? <img src={deck.thumbnailUrl} alt={deck.title} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center"><LayoutGrid className="w-8 h-8 opacity-20" style={{ color: theme.colors.textPrimary }} /></div>
                }
                {isGenerated && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{ background: `${theme.colors.accent}CC`, color: theme.colors.accentText || '#FFF' }}>
                        <Sparkles className="w-2.5 h-2.5" /> AI Generated
                    </span>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase"
                    style={{ background: 'rgba(0,0,0,0.45)', color: '#FFF' }}>
                    {deck.format}
                </span>
            </div>
            <div className="px-4 py-4 space-y-3">
                <div className="space-y-1">
                    <h3 className="font-semibold text-sm leading-snug" style={{ color: theme.colors.textPrimary }}>{deck.title}</h3>
                    {deck.prompt && (
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: theme.colors.textSecondary }}>{deck.prompt}</p>
                    )}
                    <div className="flex items-center gap-1 text-xs" style={{ color: theme.colors.textSecondary }}>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(deck.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {deck.slideCount && <span>· {deck.slideCount} slides</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF') }}>
                        <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button onClick={onShare}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
                        <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDelete}
                        className="flex items-center justify-center w-10 rounded-full transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};
