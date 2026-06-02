import React from 'react';
import { ArrowRight, Share2, Check, Sparkles } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { GBB_TIERS } from '../goodBetterBestData.js';

const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';

// Featured, deep-linked deck card. Opens a full standalone screen (its own
// shareable URL). Kept light and on-brand to match the rest of the app.
export const GoodBetterBestCard = ({ card, theme, onOpen, onShare, shared }) => {
    const isDark = isDarkTheme(theme);
    const surface = isDark ? theme.colors.surface : '#FFFFFF';
    return (
        <div
            className="rounded-3xl overflow-hidden transition-all duration-300"
            style={{ background: surface, border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}
        >
            <button onClick={onOpen} className="block w-full text-left p-5 transition-colors active:opacity-90">
                <div className="flex items-center gap-1.5 mb-3">
                    <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider"
                        style={{ background: `${theme.colors.accent}14`, color: theme.colors.accent }}
                    >
                        <Sparkles className="w-3 h-3" /> Featured
                    </span>
                    <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                        Sales Deck
                    </span>
                </div>

                <h3 className="text-2xl font-black tracking-tight leading-none" style={{ color: theme.colors.textPrimary }}>
                    Good · Better · Best
                </h3>

                <div className="flex items-center gap-4 mt-3">
                    {GBB_TIERS.map((t) => (
                        <div key={t.id} className="flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full" style={{ background: t.dot }} />
                            <span className="text-[0.625rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                                {t.label}
                            </span>
                        </div>
                    ))}
                </div>

                <p className="text-[0.8125rem] leading-relaxed mt-3" style={{ color: theme.colors.textSecondary }}>
                    {card.description}
                </p>
            </button>

            <div className="px-5 pb-5 flex items-center gap-2">
                <button
                    onClick={onOpen}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-full text-[0.8125rem] font-semibold transition-all active:opacity-80"
                    style={{ background: theme.colors.accent, color: theme.colors.accentText }}
                >
                    Open deck <ArrowRight className="w-4 h-4" />
                </button>
                <button
                    onClick={onShare}
                    aria-label="Share deck link"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-full text-[0.8125rem] font-semibold transition-all active:opacity-80"
                    style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)', color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}` }}
                >
                    {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                    {shared ? 'Copied' : 'Share'}
                </button>
            </div>
        </div>
    );
};
