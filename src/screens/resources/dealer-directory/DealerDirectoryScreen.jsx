import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { motion } from 'framer-motion';
import { ChevronRight, Building2, UserPlus } from 'lucide-react';
import { DEALER_DIRECTORY_DATA } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrency } from '../../../utils/format.js';

const stagger = (i) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, delay: i * 0.028, ease: [0.25, 0.1, 0.25, 1] } },
});

const goalTone = (pct) => pct >= 80 ? '#4A7C59' : pct >= 50 ? '#C4956A' : '#B85C5C';

export const DealerDirectoryScreen = ({ theme, dealerDirectory, onNavigate }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

    const sorted = useMemo(() => dealers
        .filter(d => {
            if (!searchTerm) return true;
            const q = searchTerm.toLowerCase();
            return d.name.toLowerCase().includes(q) ||
                (d.address && d.address.toLowerCase().includes(q)) ||
                (d.territory && d.territory.toLowerCase().includes(q));
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [dealers, searchTerm]);

    const totalSales = useMemo(() => dealers.reduce((s, d) => s + (d.sales || 0), 0), [dealers]);
    const subtleBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)';

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: colors.background }}>

            {/* ── Header ── */}
            <div className="flex-shrink-0 px-4 pt-3 pb-2">
                <PageTitle
                    title="Dealers"
                    subtitle={`${dealers.length} accounts - ${formatCurrency(totalSales)} portfolio`}
                    theme={theme}
                    className="px-0 pt-0 pb-0"
                    titleClassName="text-[1.375rem] font-black"
                    subtitleClassName="text-sm mt-0.5"
                />
            </div>

            {/* ── Search + Add ── */}
            <div className="flex-shrink-0 px-4 pb-3 flex items-center gap-2">
                <StandardSearchBar
                    value={searchTerm}
                    onChange={setSearchTerm}
                    placeholder="Search dealers..."
                    theme={theme}
                    className="flex-1"
                />
                <button
                    onClick={() => onNavigate?.('new-dealer-signup')}
                    className="flex items-center gap-1.5 px-4 rounded-full transition-all active:scale-[0.97] flex-shrink-0"
                    style={{ height: 44, backgroundColor: colors.accent, color: colors.accentText }}
                >
                    <UserPlus className="w-4 h-4" />
                    <span className="text-[0.8125rem] font-semibold">Add</span>
                </button>
            </div>

            {/* ── Dealer list ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-10">
                {sorted.length > 0 ? (
                    <GlassCard theme={theme} className="rounded-[22px] overflow-hidden p-0">
                        {sorted.map((d, i) => {
                            const pct = d.ytdGoal ? Math.round((d.sales / d.ytdGoal) * 100) : null;
                            const gColor = pct !== null ? goalTone(pct) : null;
                            const initials = d.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();

                            return (
                                <motion.button
                                    key={d.id}
                                    {...stagger(i)}
                                    onClick={() => onNavigate?.(`resources/dealer-directory/${d.id}`)}
                                    className="w-full text-left flex items-center gap-3 px-4 transition-colors active:bg-black/[0.02]"
                                    style={{
                                        paddingTop: 13,
                                        paddingBottom: 13,
                                        borderBottom: i < sorted.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                    }}
                                >
                                    {/* Avatar */}
                                    <div
                                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black"
                                        style={{ backgroundColor: `${colors.accent}18`, color: colors.accent }}
                                    >
                                        {initials}
                                    </div>

                                    {/* Name + territory */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[0.9375rem] font-bold tracking-tight truncate leading-snug" style={{ color: colors.textPrimary }}>
                                            {d.name}
                                        </p>
                                        <p className="text-xs truncate mt-[3px] leading-snug" style={{ color: colors.textSecondary, opacity: 0.7 }}>
                                            {d.territory || d.address?.split(',').slice(1).join(',').trim() || d.address}
                                        </p>
                                    </div>

                                    {/* Sales + goal mini-bar */}
                                    <div className="flex flex-col items-end flex-shrink-0 gap-[5px] mr-0.5">
                                        <span className="text-sm font-black tabular-nums leading-none" style={{ color: colors.textPrimary }}>
                                            {formatCurrency(d.sales)}
                                        </span>
                                        {pct !== null && (
                                            <div className="flex items-center gap-1.5">
                                                <div
                                                    className="w-16 rounded-full overflow-hidden"
                                                    style={{ height: 3, backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.08)' }}
                                                >
                                                    <div
                                                        className="h-full rounded-full"
                                                        style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: gColor }}
                                                    />
                                                </div>
                                                <span
                                                    className="text-[0.6875rem] font-bold tabular-nums"
                                                    style={{ color: gColor, minWidth: 30, textAlign: 'right' }}
                                                >
                                                    {pct}%
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.2 }} />
                                </motion.button>
                            );
                        })}
                    </GlassCard>
                ) : (
                    <div className="py-16 flex flex-col items-center justify-center text-center gap-3">
                        <div
                            className="w-14 h-14 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.04)' }}
                        >
                            <Building2 className="w-6 h-6" style={{ color: colors.textSecondary, opacity: 0.35 }} />
                        </div>
                        <p className="text-[0.9375rem] font-bold" style={{ color: colors.textPrimary }}>No dealers found</p>
                        <p className="text-[0.8125rem]" style={{ color: colors.textSecondary, opacity: 0.7 }}>Try a different search term.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
