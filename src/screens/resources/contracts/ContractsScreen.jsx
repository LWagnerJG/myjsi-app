import React, { useMemo, useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Share2, ExternalLink, Percent } from 'lucide-react';
import { CONTRACTS_DATA } from './data.js';

/**
 * ContractsScreen
 * - No "Contracts" page header
 * - Underline tab selector (scrollable on mobile)
 * - High-level rows with discount badge + clean stat chips
 * - Accurate commissions pulled from CONTRACTS_DATA
 */
export const ContractsScreen = ({ theme, setSuccessMessage }) => {
    const [active, setActive] = useState('omnia');
    const contracts = useMemo(() => CONTRACTS_DATA, []);

    const TABS = useMemo(
        () => [
            { label: 'Omnia', value: 'omnia' },
            { label: 'TIPS', value: 'tips' },
            { label: 'Premier', value: 'premier' },
            // add { label: 'BuyBoard', value: 'buyboard' } when you’re ready to show it
        ],
        []
    );

    return (
        <div className="flex h-full flex-col">
            {/* Tabs */}
            <div className="px-4 pt-4">
                <TabBar tabs={TABS} value={active} onChange={setActive} theme={theme} />
            </div>

            {/* Body */}
            <div className="px-4 py-4">
                <ContractCard contract={contracts[active]} theme={theme} setSuccessMessage={setSuccessMessage} />
            </div>
        </div>
    );
};

/* ----------------------------- UI Subcomponents ---------------------------- */

const TabBar = ({ tabs, value, onChange, theme }) => (
    <div className="relative">
        <div className="flex gap-6 overflow-x-auto no-scrollbar border-b"
            style={{ borderColor: theme.colors.border }}>
            {tabs.map(t => {
                const active = value === t.value;
                return (
                    <button
                        key={t.value}
                        onClick={() => onChange(t.value)}
                        className="relative py-3 text-sm font-medium whitespace-nowrap transition-colors"
                        style={{ color: active ? theme.colors.accent : theme.colors.textSecondary }}
                    >
                        {t.label}
                        <span
                            className="absolute left-0 right-0 -bottom-px h-[2px] rounded-full"
                            style={{ backgroundColor: active ? theme.colors.accent : 'transparent' }}
                        />
                    </button>
                );
            })}
        </div>
    </div>
);

const ContractCard = ({ contract, theme, setSuccessMessage }) => {
    const share = async () => {
        const text = `JSI ${contract.name} – contract overview`;
        if (navigator.share) {
            try { await navigator.share({ title: `JSI ${contract.name}`, text, url: window.location.href }); }
            catch { /* no-op */ }
        } else {
            navigator.clipboard.writeText(`${text}\n${contract.documentUrl || ''}`);
            setSuccessMessage?.('Link copied');
            setTimeout(() => setSuccessMessage?.(''), 1400);
        }
    };

    return (
        <GlassCard theme={theme} className="p-4 space-y-5">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold tracking-tight" style={{ color: theme.colors.textPrimary }}>
                        {contract.name}
                    </h2>
                    {contract.subtitle && (
                        <p className="text-sm" style={{ color: theme.colors.textSecondary }}>{contract.subtitle}</p>
                    )}
                </div>
                <button
                    onClick={share}
                    className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                    aria-label="Share"
                    title="Share"
                >
                    <Share2 className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                </button>
            </div>

            {/* Discount rows */}
            <div className="space-y-3">
                {contract.discounts?.map((row, idx) => (
                    <RowCard key={idx} row={row} theme={theme} />
                ))}
            </div>

            {/* Optional margin calcs / disclaimers */}
            {(contract.marginCalcs?.length || contract.disclaimer) && (
                <div className="pt-1 space-y-2">
                    {contract.marginCalcs?.length > 0 && (
                        <InfoBlock title="Dealer margins" theme={theme}>
                            <ul className="list-disc ml-5 space-y-0.5" style={{ color: theme.colors.textSecondary }}>
                                {contract.marginCalcs.map((m, i) => <li key={i}>{m}</li>)}
                            </ul>
                        </InfoBlock>
                    )}
                    {contract.disclaimer && (
                        <p className="italic text-sm" style={{ color: theme.colors.textSecondary }}>
                            {contract.disclaimer}
                        </p>
                    )}
                </div>
            )}

            {/* PDF */}
            {contract.documentUrl && (
                <div className="pt-1">
                    <a
                        href={contract.documentUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full inline-flex items-center justify-center gap-2 font-semibold py-3 px-5 rounded-full
                       transition-transform hover:scale-[1.02] active:scale-[0.98]"
                        style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                    >
                        View Contract PDF
                        <ExternalLink className="w-4 h-4" />
                    </a>
                </div>
            )}
        </GlassCard>
    );
};

const RowCard = ({ row, theme }) => {
    return (
        <div
            className="rounded-2xl border p-4 md:p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-sm"
            style={{ backgroundColor: theme.colors.subtle, borderColor: theme.colors.border }}
        >
            {/* Left: badge + label */}
            <div className="flex items-center gap-3 md:gap-4">
                <DiscountBadge value={row.discount} theme={theme} />
                <div>
                    <p className="font-semibold leading-snug" style={{ color: theme.colors.textPrimary }}>
                        {row.label}
                    </p>
                    {row.note && (
                        <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{row.note}</p>
                    )}
                </div>
            </div>

            {/* Right: stat chips */}
            <div className="flex flex-wrap gap-2">
                {row.dealerCommission && (
                    <StatChip label="Dealer" value={row.dealerCommission} tone="dealer" theme={theme} />
                )}
                {row.repCommission && (
                    <StatChip label="Rep" value={row.repCommission} tone="rep" theme={theme} />
                )}
            </div>
        </div>
    );
};

const DiscountBadge = ({ value, theme }) => (
    <div
        className="w-16 h-16 md:w-18 md:h-18 rounded-full grid place-items-center text-center"
        style={{
            border: `3px solid ${theme.colors.accent}`,
            color: theme.colors.accent
        }}
    >
        <div className="leading-tight">
            <div className="text-xl font-bold tracking-tight">{value}</div>
            <div className="text-[10px] font-semibold tracking-wider opacity-80">OFF</div>
        </div>
    </div>
);

const StatChip = ({ label, value, tone, theme }) => {
    const tones = {
        dealer: { bg: 'rgba(199,161,122,0.16)', bd: 'rgba(199,161,122,0.45)' },
        rep: { bg: 'rgba(61,132,184,0.15)', bd: 'rgba(61,132,184,0.45)' },
    }[tone] || { bg: theme.colors.subtle, bd: theme.colors.border };

    return (
        <div
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium"
            style={{ backgroundColor: tones.bg, borderColor: tones.bd, color: theme.colors.textPrimary }}
            title={`${label} commission`}
        >
            <Percent className="w-3.5 h-3.5 opacity-70" />
            <span className="opacity-70">{label}</span>
            <span className="font-semibold">{value}</span>
        </div>
    );
};

const InfoBlock = ({ title, children, theme }) => (
    <div
        className="rounded-xl border p-3 md:p-4"
        style={{ backgroundColor: 'rgba(0,0,0,0.02)', borderColor: theme.colors.border }}
    >
        <p className="text-sm font-semibold mb-1.5" style={{ color: theme.colors.textPrimary }}>{title}</p>
        {children}
    </div>
);
