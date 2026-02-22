import React, { useState, useMemo, useRef, useEffect } from 'react';
import { PageTitle } from '../../../components/common/PageTitle.jsx';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { Search, Plus, ChevronRight, MapPin, Building2 } from 'lucide-react';
import { DEALER_DIRECTORY_DATA } from './data.js';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { formatCurrency } from '../../../utils/format.js';

/* ────────────────────────────────────────────────
 *  Alphabet index strip (rolodex tab)
 * ──────────────────────────────────────────────── */
const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

const AlphaStrip = ({ activeLetter, availableLetters, onSelect, colors, isDark }) => (
    <div className="flex flex-wrap justify-center gap-[3px] px-3">
        {ALPHA.map(l => {
            const available = availableLetters.has(l);
            const active = activeLetter === l;
            return (
                <button
                    key={l}
                    onClick={() => available && onSelect(active ? null : l)}
                    disabled={!available}
                    className="w-[26px] h-[26px] rounded-md text-[11px] font-bold transition-all duration-150"
                    style={{
                        backgroundColor: active ? colors.accent : 'transparent',
                        color: active ? colors.accentText : available ? colors.textPrimary : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)'),
                        cursor: available ? 'pointer' : 'default',
                    }}
                >
                    {l}
                </button>
            );
        })}
    </div>
);

export const DealerDirectoryScreen = ({ theme, setSuccessMessage, dealerDirectory, onNavigate }) => {
    const dealers = useMemo(() => dealerDirectory || DEALER_DIRECTORY_DATA || [], [dealerDirectory]);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLetter, setActiveLetter] = useState(null);
    const isDark = isDarkTheme(theme);
    const colors = theme.colors;

    const availableLetters = useMemo(() => {
        const set = new Set();
        dealers.forEach(d => { if (d.name) set.add(d.name[0].toUpperCase()); });
        return set;
    }, [dealers]);

    const sorted = useMemo(() => dealers
        .filter(d => {
            const q = searchTerm.toLowerCase();
            const matchesSearch = !q || d.name.toLowerCase().includes(q) ||
                (d.address && d.address.toLowerCase().includes(q)) ||
                (d.territory && d.territory.toLowerCase().includes(q));
            const matchesLetter = !activeLetter || d.name[0].toUpperCase() === activeLetter;
            return matchesSearch && matchesLetter;
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [dealers, searchTerm, activeLetter]);

    /* thin divider color */
    const divider = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';

    return (
        <div className="flex flex-col h-full app-header-offset">
            {/* Header */}
            <div className="flex-shrink-0 px-4 pt-1 pb-2 space-y-3" style={{ backgroundColor: colors.background }}>
                <div className="flex items-center justify-between">
                    <PageTitle title="Dealers" theme={theme} />
                    <PillButton onClick={() => onNavigate?.('new-dealer-signup')} theme={theme} size="compact">
                        <Plus className="w-4 h-4 mr-1" /> Add
                    </PillButton>
                </div>

                {/* Search — minimal inline input */}
                <div
                    className="flex items-center gap-2.5 px-3.5 rounded-xl"
                    style={{
                        height: 42,
                        backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
                        border: `1px solid ${divider}`,
                    }}
                >
                    <Search className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.5 }} />
                    <input
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setActiveLetter(null); }}
                        placeholder="Search dealers..."
                        className="flex-1 bg-transparent text-sm outline-none"
                        style={{ color: colors.textPrimary }}
                    />
                    {searchTerm && (
                        <button onClick={() => setSearchTerm('')} className="text-xs font-medium" style={{ color: colors.textSecondary }}>Clear</button>
                    )}
                </div>

                {/* Alphabet strip */}
                <AlphaStrip
                    activeLetter={activeLetter}
                    availableLetters={availableLetters}
                    onSelect={l => { setActiveLetter(l); setSearchTerm(''); }}
                    colors={colors}
                    isDark={isDark}
                />

                {/* Count */}
                <p className="text-xs font-medium px-0.5" style={{ color: colors.textSecondary }}>
                    {sorted.length} dealer{sorted.length !== 1 ? 's' : ''}
                    {activeLetter ? ` under "${activeLetter}"` : ''}
                </p>
            </div>

            {/* Dealer list — clean rolodex cards */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-28">
                <GlassCard theme={theme} className="p-0 overflow-hidden" style={{ borderRadius: 16 }}>
                    {sorted.map((dealer, i) => {
                        const goalPct = dealer.ytdGoal ? Math.round((dealer.sales / dealer.ytdGoal) * 100) : null;
                        const goalColor = goalPct >= 80 ? '#4A7C59' : goalPct >= 50 ? '#C4956A' : colors.accent;
                        return (
                            <button
                                key={dealer.id}
                                onClick={() => onNavigate?.(`resources/dealer-directory/${dealer.id}`)}
                                className="w-full text-left flex items-center gap-3 px-4 py-3.5 transition-colors active:opacity-80"
                                style={{ borderBottom: i < sorted.length - 1 ? `1px solid ${divider}` : 'none' }}
                            >
                                {/* Monogram */}
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
                                    style={{
                                        backgroundColor: `${colors.accent}14`,
                                        color: colors.accent,
                                    }}
                                >
                                    {dealer.name.charAt(0)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-baseline gap-2">
                                        <h3 className="text-[15px] font-semibold tracking-tight truncate" style={{ color: colors.textPrimary }}>
                                            {dealer.name}
                                        </h3>
                                    </div>
                                    <div className="flex items-center gap-1 mt-0.5">
                                        <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.45 }} />
                                        <span className="text-[12px] truncate" style={{ color: colors.textSecondary }}>
                                            {dealer.address?.replace(/,\s*\w{2}\s+\d{5}$/, '') || 'No address'}
                                        </span>
                                    </div>
                                    {/* Compact stats line */}
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[12px] font-semibold" style={{ color: colors.textPrimary }}>
                                            {formatCurrency(dealer.sales)}
                                        </span>
                                        {goalPct !== null && (
                                            <span className="text-[11px] font-semibold" style={{ color: goalColor }}>
                                                {goalPct}% to goal
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <ChevronRight className="w-4 h-4 flex-shrink-0" style={{ color: colors.textSecondary, opacity: 0.3 }} />
                            </button>
                        );
                    })}

                    {sorted.length === 0 && (
                        <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
                            <Building2 className="w-7 h-7" style={{ color: colors.textSecondary, opacity: 0.3 }} />
                            <p className="text-sm font-medium" style={{ color: colors.textPrimary }}>No dealers found</p>
                            <p className="text-xs" style={{ color: colors.textSecondary }}>Try a different search or letter.</p>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
};