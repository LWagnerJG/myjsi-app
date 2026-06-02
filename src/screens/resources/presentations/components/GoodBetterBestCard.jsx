import React from 'react';
import { ArrowRight, Share2, Check, Layers } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { GBB_TIERS } from '../goodBetterBestData.js';

const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';

// Featured, deep-linked deck card. Unlike a standard PresentationCard this opens
// a full standalone screen (its own shareable URL) rather than a slide modal.
export const GoodBetterBestCard = ({ card, theme, onOpen, onShare, shared }) => {
    const isDark = isDarkTheme(theme);
    return (
        <div
            className="rounded-2xl overflow-hidden transition-all duration-300"
            style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}
        >
            <button onClick={onOpen} className="block w-full text-left">
                <div
                    className="relative px-5 pt-5 pb-6"
                    style={{
                        background: isDark
                            ? 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))'
                            : 'linear-gradient(135deg, #353535, #4a4a4a)',
                    }}
                >
                    <div className="flex items-center gap-1.5 mb-3">
                        <span
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[0.625rem] font-bold uppercase tracking-wider"
                            style={{ background: 'rgba(255,255,255,0.16)', color: '#FFFFFF' }}
                        >
                            <Layers className="w-3 h-3" /> Featured
                        </span>
                    </div>
                    <h3 className="text-2xl font-black tracking-tight leading-none" style={{ color: '#FFFFFF' }}>
                        Good · Better · Best
                    </h3>
                    <div className="flex items-center gap-4 mt-4">
                        {GBB_TIERS.map((t) => (
                            <div key={t.id} className="flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full" style={{ background: t.dot }} />
                                <span className="text-[0.6875rem] font-bold uppercase tracking-[0.16em]" style={{ color: 'rgba(255,255,255,0.85)' }}>
                                    {t.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </button>

            <div className="px-5 pb-5 pt-4 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-medium">
                    <span className="px-2 py-0.5 rounded-full" style={{ background: `${theme.colors.accent}18`, color: theme.colors.accent }}>{card.category}</span>
                    <span style={{ color: theme.colors.textSecondary }}>{card.type} · {card.size}</span>
                </div>
                <p className="text-[0.8125rem] leading-relaxed" style={{ color: theme.colors.textSecondary }}>{card.description}</p>
                <div className="flex items-center gap-2 pt-1">
                    <button
                        onClick={onOpen}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[0.8125rem] font-semibold transition-all active:opacity-80"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText }}
                    >
                        Open deck <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                        onClick={onShare}
                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-2xl text-[0.8125rem] font-semibold transition-all active:opacity-80"
                        style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)', color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}` }}
                    >
                        {shared ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                        {shared ? 'Copied' : 'Share'}
                    </button>
                </div>
            </div>
        </div>
    );
};
