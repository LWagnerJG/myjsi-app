import React, { useMemo, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { ExternalLink, Copy, Share2, ChevronDown, ChevronUp, FileText } from 'lucide-react';
import { CONTRACTS_DATA } from './data.js';

const TABS = [
    { label: 'Omnia', value: 'omnia' },
    { label: 'TIPS', value: 'tips' },
    { label: 'Premier', value: 'premier' },
    { label: 'GSA', value: 'gsa' },
];

export const ContractsScreen = ({ theme, setSuccessMessage }) => {
    const [active, setActive] = useState('omnia');
    const dark = isDarkTheme(theme);
    const contract = CONTRACTS_DATA[active];

    const feedback = (msg) => { setSuccessMessage?.(msg); if (msg) setTimeout(() => setSuccessMessage?.(''), 1400); };

    const copyPdf = async () => { try { await navigator.clipboard.writeText(contract.documentUrl || ''); feedback('PDF link copied'); } catch { /* no-op */ } };
    const shareDealer = async () => {
        const url = contract.dealerDocumentUrl || contract.documentUrl;
        if (navigator.share) { try { await navigator.share({ title: `${contract.name} Dealer Version`, url }); } catch { /* no-op */ } } else { await navigator.clipboard.writeText(url || ''); feedback('Dealer link copied'); }
    };
    const sharePublic = async () => {
        const url = contract.publicDocumentUrl || contract.documentUrl;
        if (navigator.share) { try { await navigator.share({ title: `${contract.name} Public Version`, url }); } catch { /* no-op */ } } else { await navigator.clipboard.writeText(url || ''); feedback('Public link copied'); }
    };

    return (
        <div className="flex h-full flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            {/* ── Tab pills ── */}
            <div className="px-4 pt-1 pb-2">
                <div className="flex gap-1.5">
                    {TABS.map(t => {
                        const on = active === t.value;
                        return (
                            <button
                                key={t.value}
                                onClick={() => setActive(t.value)}
                                className="px-3.5 py-[7px] rounded-full text-[13px] font-semibold transition-all"
                                style={{
                                    backgroundColor: on ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'),
                                    color: on ? (theme.colors.accentText || '#fff') : theme.colors.textSecondary,
                                }}
                            >
                                {t.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 scrollbar-hide space-y-3.5">

                {/* Contract name */}
                <div className="pt-1">
                    <h2 className="text-[17px] font-bold" style={{ color: theme.colors.textPrimary }}>
                        {contract.name}
                    </h2>
                    {contract.subtitle && (
                        <p className="text-[12px] mt-0.5" style={{ color: theme.colors.textSecondary }}>{contract.subtitle}</p>
                    )}
                </div>

                {/* ── Delivery tiers ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                        <span className="text-[11px] font-bold uppercase tracking-[0.08em]" style={{ color: theme.colors.textSecondary, opacity: 0.55 }}>
                            Delivery Tiers
                        </span>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-bold uppercase tracking-[0.06em] min-w-[44px] text-right" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Dealer</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.06em] min-w-[44px] text-right" style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>Rep</span>
                        </div>
                    </div>
                    {contract.discounts?.map((row, idx) => (
                        <TierRow key={idx} row={row} theme={theme} dark={dark} isLast={idx === contract.discounts.length - 1} />
                    ))}
                </GlassCard>

                {/* ── Margin calcs (collapsible) ── */}
                {contract.marginCalcs?.length > 0 && (
                    <MarginBlock margins={contract.marginCalcs} theme={theme} dark={dark} />
                )}

                {/* ── Disclaimer ── */}
                {contract.disclaimer && (
                    <p className="text-[12px] italic px-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                        {contract.disclaimer}
                    </p>
                )}

                {/* ── Actions ── */}
                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                    <ActionRow icon={FileText} label="View Contract PDF" onClick={() => window.open(contract.documentUrl, '_blank')} theme={theme} dark={dark} accent />
                    <ActionRow icon={Copy} label="Copy PDF Link" onClick={copyPdf} theme={theme} dark={dark} />
                    <ActionRow icon={Share2} label="Share Dealer Version" onClick={shareDealer} theme={theme} dark={dark} />
                    <ActionRow icon={Share2} label="Share Public Version" onClick={sharePublic} theme={theme} dark={dark} isLast />
                </GlassCard>

            </div>
        </div>
    );
};

/* ── tier row ─────────────────────────────────────────── */
const TierRow = ({ row, theme, dark, isLast }) => (
    <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: isLast ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}
    >
        <div className="flex items-center gap-3 min-w-0">
            <span
                className="text-[15px] font-extrabold tabular-nums flex-shrink-0"
                style={{ color: theme.colors.accent }}
            >
                {row.discount}
            </span>
            <span className="text-[13px] font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                {row.label}
            </span>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
            <span className="text-[13px] font-semibold tabular-nums min-w-[44px] text-right" style={{ color: theme.colors.textPrimary }}>
                {row.dealerCommission}
            </span>
            <span className="text-[13px] tabular-nums min-w-[44px] text-right" style={{ color: theme.colors.textSecondary }}>
                {row.repCommission}
            </span>
        </div>
    </div>
);

/* ── collapsible margin block ─────────────────────────── */
const MarginBlock = ({ margins, theme, dark }) => {
    const [open, setOpen] = useState(false);
    return (
        <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
            <button
                type="button"
                onClick={() => setOpen(!open)}
                className="w-full flex items-center justify-between px-4 py-3 transition-colors"
            >
                <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Dealer Margins
                </span>
                {open
                    ? <ChevronUp className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                    : <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                }
            </button>
            {open && (
                <div className="px-4 pb-3 space-y-1">
                    {margins.map((m, i) => (
                        <div key={i} className="flex items-center gap-2">
                            <div className="w-1 h-1 rounded-full" style={{ backgroundColor: theme.colors.textSecondary, opacity: 0.4 }} />
                            <span className="text-[12px] tabular-nums" style={{ color: theme.colors.textSecondary }}>
                                {m}
                            </span>
                        </div>
                    ))}
                </div>
            )}
        </GlassCard>
    );
};

/* ── action row ───────────────────────────────────────── */
const ActionRow = ({ icon: Icon, label, onClick, theme, dark, isLast, accent }) => (
    <button
        type="button"
        onClick={onClick}
        className="w-full flex items-center gap-3 px-4 py-3 transition-colors active:opacity-70"
        style={{ borderBottom: isLast ? 'none' : `1px solid ${dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)'}` }}
    >
        <Icon className="w-[18px] h-[18px] flex-shrink-0" style={{ color: accent ? theme.colors.accent : theme.colors.textSecondary }} />
        <span className="text-[13px] font-medium" style={{ color: accent ? theme.colors.accent : theme.colors.textPrimary }}>
            {label}
        </span>
    </button>
);
