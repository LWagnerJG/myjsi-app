import React, { useState, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { isDarkTheme, fieldTileSurface } from '../../../design-system/tokens.js';
import { ExternalLink, Link2, Share2, FileText, ChevronDown, Check } from 'lucide-react';
import { CONTRACTS_DATA } from './data.js';
import { SegmentedToggle } from '../../../components/common/GroupedToggle.jsx';
import { TabContent } from '../../../components/common/TabContent.jsx';
import { UNIFIED_MODAL_Z } from '../../../components/common/modalUtils.js';

const TABS = [
    { label: 'Omnia',   value: 'omnia'   },
    { label: 'TIPS',    value: 'tips'    },
    { label: 'Premier', value: 'premier' },
    { label: 'GSA',     value: 'gsa'     },
    { label: 'State',   value: 'state', iconAfter: ChevronDown },
];

const DOC_VERSIONS = [
    { key: 'documentUrl',       label: 'Rep Version',    short: 'Rep'    },
    { key: 'dealerDocumentUrl', label: 'Dealer Version', short: 'Dealer' },
    { key: 'publicDocumentUrl', label: 'Public Version', short: 'Public' },
];

const stagger = (i, base = 0.04) => ({
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.2, delay: i * base, ease: [0.25, 0.1, 0.25, 1] } },
});

/* ── small icon action button ─────────────────────────── */
const IconBtn = ({ icon: Icon, title, onClick, theme, dark }) => (
    <button
        type="button"
        onClick={onClick}
        title={title}
        className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-90"
        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.05)' }}
    >
        <Icon className="w-[15px] h-[15px]" style={{ color: theme.colors.textSecondary }} />
    </button>
);

/* ── state picker attached to tab bubble ───────────────── */
const StateTabDropdown = ({ entries, selected, onSelect, onClose, theme, dark, isOpen, anchorRect }) => {
    if (!isOpen || !anchorRect) return null;

    const rowBorder = dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.06)';
    const surface = dark ? 'rgba(28,26,24,0.98)' : 'rgba(252,251,249,0.98)';
    const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 360;
    const menuWidth = Math.min(340, Math.max(248, viewportWidth - 24));
    const anchorCenter = anchorRect.left + (anchorRect.width / 2);
    const minLeft = 12;
    const maxLeft = Math.max(minLeft, viewportWidth - menuWidth - 12);
    const left = Math.min(maxLeft, Math.max(minLeft, anchorCenter - (menuWidth / 2)));
    const caretLeft = Math.min(menuWidth - 14, Math.max(10, anchorCenter - left - 6));

    return ReactDOM.createPortal(
        <AnimatePresence>
            <>
                <motion.button
                    key="state-drop-overlay"
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="fixed inset-0"
                    style={{ backgroundColor: 'transparent', zIndex: UNIFIED_MODAL_Z }}
                    onClick={onClose}
                    aria-label="Close state picker"
                />
                <motion.div
                    key="state-drop-menu"
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: [0.2, 0.8, 0.2, 1] }}
                    className="fixed rounded-[16px] overflow-hidden"
                    style={{
                        top: anchorRect.bottom + 8,
                        left,
                        width: menuWidth,
                        backgroundColor: surface,
                        border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
                        boxShadow: dark ? '0 14px 32px rgba(0,0,0,0.38)' : '0 14px 32px rgba(0,0,0,0.14)',
                        zIndex: UNIFIED_MODAL_Z + 1,
                    }}
                >
                    <div
                        className="absolute w-3 h-3 rotate-45"
                        style={{
                            top: -6,
                            left: caretLeft,
                            backgroundColor: surface,
                            borderTop: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
                            borderLeft: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)',
                        }}
                    />

                    <div className="max-h-[52vh] overflow-y-auto py-1.5 scrollbar-hide">
                        {entries.map((entry, idx) => {
                            const isSel = selected === entry.state;
                            return (
                                <button
                                    key={entry.state}
                                    type="button"
                                    onClick={() => { onSelect(entry.state); onClose(); }}
                                    className="w-full flex items-center px-4 text-left transition-colors"
                                    style={{
                                        paddingTop: 11,
                                        paddingBottom: 11,
                                        borderBottom: idx < entries.length - 1 ? `1px solid ${rowBorder}` : 'none',
                                        backgroundColor: isSel ? (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)') : 'transparent',
                                    }}
                                >
                                    <span className="flex-1 text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                                        {entry.state}
                                    </span>
                                    <span className="text-[0.6875rem] mr-2.5" style={{ color: theme.colors.textSecondary, opacity: 0.52 }}>
                                        {entry.contracts.length === 1 ? '1 contract' : `${entry.contracts.length} contracts`}
                                    </span>
                                    {isSel
                                        ? <Check className="w-4 h-4 shrink-0" style={{ color: theme.colors.accent }} />
                                        : <div className="w-4 h-4 shrink-0" />}
                                </button>
                            );
                        })}
                    </div>
                </motion.div>
            </>
        </AnimatePresence>,
        document.body
    );
};

/* ── card section header ──────────────────────────────── */
const CardHeader = ({ children, theme, dark, right }) => (
    <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}` }}
    >
        <span
            className="text-[0.8125rem] font-bold uppercase tracking-[0.07em]"
            style={{ color: theme.colors.textSecondary, opacity: 0.65 }}
        >
            {children}
        </span>
        {right}
    </div>
);

const MetricHeaderLabel = ({ shortLabel, longLabel, theme }) => {
    const [shortTop, shortBottom] = String(shortLabel).split('|');
    const [longTop, longBottom] = String(longLabel).split('|');

    return (
        <span
            className="text-[0.6875rem] text-center"
            style={{ color: theme.colors.textSecondary, opacity: 0.52 }}
        >
            <span className="font-bold uppercase tracking-[0.05em] leading-[1.06] md:hidden">
                <span className="block">{shortTop}</span>
                {shortBottom && <span className="block">{shortBottom}</span>}
            </span>
            <span className="hidden md:inline font-semibold tracking-[0.01em] leading-[1.08]">
                <span className="block">{longTop}</span>
                {longBottom && <span className="block">{longBottom}</span>}
            </span>
        </span>
    );
};

/* ── main screen ──────────────────────────────────────── */
export const ContractsScreen = ({ theme, setSuccessMessage }) => {
    const [active, setActive] = useState('omnia');
    const [selectedState, setSelectedState] = useState('');
    const [stateDropdownOpen, setStateDropdownOpen] = useState(false);
    const [stateTabAnchor, setStateTabAnchor] = useState(null);
    const tabBarRef = useRef(null);
    const dark = isDarkTheme(theme);
    const contract = CONTRACTS_DATA[active];
    const isState = active === 'state';
    const usesTierChartLayout = contract.discountLayout === 'tier-chart';
    const hasMargins = !isState && !usesTierChartLayout && contract.discounts?.some(r => r.margin);
    const tierChartRows = usesTierChartLayout ? (contract.tierRows || []) : [];
    const tierChartHasDealerDiscount = tierChartRows.some((row) => (row.rows || []).some((item) => item.dealerDiscount));
    const tierMetricGridClass = tierChartHasDealerDiscount
        ? 'grid grid-cols-[52px_52px_58px] md:grid-cols-[118px_118px_120px] items-center gap-2 shrink-0'
        : 'grid grid-cols-[52px_52px] md:grid-cols-[118px_118px] items-center gap-2 shrink-0';
    const standardMetricGridClass = hasMargins
        ? 'grid grid-cols-[52px_52px_56px] md:grid-cols-[118px_118px_108px] items-center gap-2 shrink-0'
        : 'grid grid-cols-[52px_52px] md:grid-cols-[118px_118px] items-center gap-2 shrink-0';

    const updateStateTabAnchor = useCallback(() => {
        const rootEl = tabBarRef.current;
        if (!rootEl) {
            setStateTabAnchor(null);
            return;
        }

        const stateButton = Array
            .from(rootEl.querySelectorAll('button[data-toggle-btn]'))
            .find((btn) => (btn.textContent || '').replace(/\s+/g, ' ').trim().startsWith('State'));

        if (!stateButton) {
            setStateTabAnchor(null);
            return;
        }

        const rect = stateButton.getBoundingClientRect();
        setStateTabAnchor({
            top: rect.top,
            right: rect.right,
            bottom: rect.bottom,
            left: rect.left,
            width: rect.width,
            height: rect.height,
        });
    }, []);

    const openStateDropdown = useCallback(() => {
        setStateDropdownOpen(true);
        requestAnimationFrame(() => {
            updateStateTabAnchor();
        });
    }, [updateStateTabAnchor]);

    useEffect(() => {
        if (!stateDropdownOpen || active !== 'state') return;

        const syncAnchor = () => updateStateTabAnchor();
        window.addEventListener('resize', syncAnchor);
        window.addEventListener('scroll', syncAnchor, true);

        return () => {
            window.removeEventListener('resize', syncAnchor);
            window.removeEventListener('scroll', syncAnchor, true);
        };
    }, [active, stateDropdownOpen, updateStateTabAnchor]);

    const handleTabChange = useCallback((val) => {
        if (val === 'state') {
            setActive('state');
            openStateDropdown();
            return;
        }

        setActive(val);
        setSelectedState('');
        setStateDropdownOpen(false);
    }, [openStateDropdown]);
    const documentEntries = Array.isArray(contract.documentEntries)
        ? contract.documentEntries
        : DOC_VERSIONS.map((ver) => ({
            ...ver,
            url: contract[ver.key],
        })).filter((entry) => entry.url);
    const showStandaloneContractTitle = isState;
    const pricingTableTitle = contract.pricingTableTitle || 'Pricing Tiers';
    const pricingNoteSurface = {
        ...fieldTileSurface(theme),
        backgroundColor: dark ? 'rgba(255,255,255,0.055)' : 'rgba(240,237,232,0.76)',
    };

    const feedback = useCallback((msg) => {
        setSuccessMessage?.(msg);
        if (msg) setTimeout(() => setSuccessMessage?.(''), 1400);
    }, [setSuccessMessage]);

    const copyUrl  = useCallback(async (url, label) => {
        try { await navigator.clipboard.writeText(url); feedback(`${label} link copied`); } catch { /* no-op */ }
    }, [feedback]);

    const shareUrl = useCallback(async (url, title) => {
        if (navigator.share) { try { await navigator.share({ title, url }); } catch { /* no-op */ } }
        else { await navigator.clipboard.writeText(url); feedback('Link copied'); }
    }, [feedback]);

    const shareContract = useCallback(async (number, label) => {
        const text = label ? `${label}: ${number}` : number;
        if (navigator.share) { try { await navigator.share({ title: 'JSI Contract Number', text }); } catch { /* no-op */ } }
        else { await navigator.clipboard.writeText(number); feedback('Contract number copied'); }
    }, [feedback]);

    const subtleBorder = dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)';

    return (
        <div className="flex h-full flex-col app-header-offset" style={{ backgroundColor: theme.colors.background }}>

            {/* ── Tab bar ── */}
            <div ref={tabBarRef} className="px-4 pt-3 pb-3 overflow-x-auto scrollbar-hide">
                <SegmentedToggle
                    value={active}
                    onChange={handleTabChange}
                    options={TABS}
                    size="sm"
                    theme={theme}
                />
            </div>

            {/* ── Scrollable content ── */}
            <div className="flex-1 overflow-y-auto px-4 pb-8 scrollbar-hide">
                <TabContent activeKey={active} tabIndex={TABS.findIndex(t => t.value === active)}>
                    <div className="space-y-4">

                        {/* Contract title */}
                        {showStandaloneContractTitle && (
                            <div className="pt-1 px-1">
                                <h2 className="text-[1.3125rem] font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>
                                    {contract.name}
                                </h2>
                                {contract.subtitle && (
                                    <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>
                                        {contract.subtitle}
                                    </p>
                                )}
                            </div>
                        )}

                        {isState ? (
                            /* ── State contracts: custom picker sheet + detail ── */
                            <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                                <CardHeader theme={theme} dark={dark} right={
                                    <span className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]"
                                        style={{ color: theme.colors.textSecondary, opacity: 0.45 }}>
                                        {contract.entries.length} States
                                    </span>
                                }>
                                    Active Contracts
                                </CardHeader>

                                {/* Selected state contracts */}
                                {selectedState ? (() => {
                                    const entry = contract.entries.find((e) => e.state === selectedState);
                                    if (!entry) return null;

                                    return entry.contracts.map((c, ci) => (
                                        <motion.div
                                            key={ci}
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0, transition: { duration: 0.18, delay: ci * 0.04 } }}
                                            className="flex items-center px-5 gap-3"
                                            style={{
                                                paddingTop: 13,
                                                paddingBottom: 13,
                                                borderBottom: ci < entry.contracts.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                            }}
                                        >
                                            <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                                <span
                                                    className="text-[0.9375rem] font-mono font-semibold tracking-wide"
                                                    style={{ color: theme.colors.accent }}
                                                >
                                                    {c.number}
                                                </span>
                                                {c.label && (
                                                    <span
                                                        className="text-[0.6875rem]"
                                                        style={{ color: theme.colors.textSecondary, opacity: 0.55 }}
                                                    >
                                                        {c.label}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                <IconBtn icon={Link2} title="Copy number" onClick={() => { navigator.clipboard.writeText(c.number); feedback('Contract number copied'); }} theme={theme} dark={dark} />
                                                <IconBtn icon={Share2} title="Share" onClick={() => shareContract(c.number, c.label || selectedState)} theme={theme} dark={dark} />
                                            </div>
                                        </motion.div>
                                    ));
                                })() : (
                                    <div className="px-5 py-4">
                                        <p className="text-sm" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                                            Choose a state from the State tab above.
                                        </p>
                                    </div>
                                )}
                            </GlassCard>
                        ) : (
                            <>
                                {/* ── Pricing tiers ── */}
                                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                                    <CardHeader theme={theme} dark={dark} right={
                                        usesTierChartLayout ? (
                                            <div className={tierMetricGridClass}>
                                                <MetricHeaderLabel
                                                    shortLabel={tierChartHasDealerDiscount ? 'Dealer|Mgn' : 'Dealer|Comm'}
                                                    longLabel={tierChartHasDealerDiscount ? 'Dealer|Margin' : 'Dealer|Commission'}
                                                    theme={theme}
                                                />
                                                <MetricHeaderLabel shortLabel="Rep|Comm" longLabel="Rep|Commission" theme={theme} />
                                                {tierChartHasDealerDiscount && (
                                                    <MetricHeaderLabel shortLabel="Dealer|Disc" longLabel="Dealer|Discount" theme={theme} />
                                                )}
                                            </div>
                                        ) : (
                                            <div className={standardMetricGridClass}>
                                                <MetricHeaderLabel shortLabel="Dealer|Comm" longLabel="Dealer|Commission" theme={theme} />
                                                <MetricHeaderLabel shortLabel="Rep|Comm" longLabel="Rep|Commission" theme={theme} />
                                                {hasMargins && (
                                                    <MetricHeaderLabel shortLabel="Gross|Mgn" longLabel="Gross|Margin" theme={theme} />
                                                )}
                                            </div>
                                        )
                                    }>
                                        {pricingTableTitle}
                                    </CardHeader>

                                    {usesTierChartLayout ? (
                                        tierChartRows.map((row, idx) => (
                                            <motion.div
                                                key={row.tier}
                                                {...stagger(idx)}
                                                className="px-5"
                                                style={{
                                                    paddingTop: 13,
                                                    paddingBottom: 13,
                                                    borderBottom: idx < tierChartRows.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                                }}
                                            >
                                                <div className="text-[0.6875rem] font-bold uppercase tracking-[0.06em]" style={{ color: theme.colors.textSecondary, opacity: 0.58 }}>
                                                    {row.shortTier || row.tier}
                                                </div>
                                                <div className="mt-2 space-y-2 min-w-0">
                                                    {(row.rows || []).map((item) => (
                                                        <div key={`${row.tier}-${item.label}`} className="flex items-start gap-5 min-w-0">
                                                            <div className="flex-1 min-w-0 flex items-baseline gap-2.5">
                                                                <span className="text-[1.0625rem] font-extrabold tabular-nums shrink-0" style={{ color: theme.colors.accent }}>
                                                                    {item.discount}
                                                                </span>
                                                                <div className="text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                                                                    <span className="md:hidden">{item.shortLabel || item.label}</span>
                                                                    <span className="hidden md:inline">{item.label}</span>
                                                                </div>
                                                            </div>
                                                            <div className={tierMetricGridClass}>
                                                                <span className="text-sm font-semibold tabular-nums text-center" style={{ color: theme.colors.textPrimary }}>
                                                                    {item.dealerCommission}
                                                                </span>
                                                                <span className="text-sm tabular-nums text-center" style={{ color: theme.colors.textSecondary }}>
                                                                    {item.repCommission}
                                                                </span>
                                                                {tierChartHasDealerDiscount && (
                                                                    <span className="text-sm tabular-nums text-center" style={{ color: theme.colors.textSecondary }}>
                                                                        {item.dealerDiscount || '—'}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        ))
                                    ) : (
                                        contract.discounts?.map((row, idx) => (
                                            <motion.div
                                                key={idx}
                                                {...stagger(idx)}
                                                className="flex items-start px-5"
                                                style={{
                                                    paddingTop: 13,
                                                    paddingBottom: 13,
                                                    borderBottom: idx < contract.discounts.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                                }}
                                            >
                                                <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                                                    <div className="flex items-baseline gap-2.5">
                                                        <span className="text-[1.0625rem] font-extrabold tabular-nums shrink-0" style={{ color: theme.colors.accent }}>
                                                            {row.discount}
                                                        </span>
                                                        <span className="text-sm font-medium truncate" style={{ color: theme.colors.textPrimary }}>
                                                            {row.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={standardMetricGridClass}>
                                                    <span className="text-sm font-semibold tabular-nums text-center" style={{ color: theme.colors.textPrimary }}>
                                                        {row.dealerCommission}
                                                    </span>
                                                    <span className="text-sm tabular-nums text-center" style={{ color: theme.colors.textSecondary }}>
                                                        {row.repCommission}
                                                    </span>
                                                    {hasMargins && (
                                                        <span className="text-[0.8125rem] tabular-nums text-center font-medium"
                                                            style={{ color: theme.colors.textSecondary, opacity: row.margin ? 0.65 : 0.3 }}>
                                                            {row.margin || '—'}
                                                        </span>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </GlassCard>

                                {contract.disclaimer && (
                                    <p className="text-[0.8125rem] italic px-1 leading-relaxed" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                                        {contract.disclaimer}
                                    </p>
                                )}

                                {/* ── Documents ── */}
                                <GlassCard theme={theme} className="rounded-[22px] overflow-hidden">
                                    <CardHeader theme={theme} dark={dark}>Documents</CardHeader>
                                    {documentEntries.map((ver, idx) => {
                                        const url = ver.url || contract[ver.key];
                                        const isPlaceholder = !!ver.placeholder;
                                        return (
                                            <motion.div
                                                key={ver.key}
                                                {...stagger(idx, 0.06)}
                                                className="px-5 flex items-center justify-between"
                                                style={{
                                                    paddingTop: 13,
                                                    paddingBottom: 13,
                                                    borderBottom: idx < documentEntries.length - 1 ? `1px solid ${subtleBorder}` : 'none',
                                                }}
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div
                                                        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                                                        style={pricingNoteSurface}
                                                    >
                                                        <FileText className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.6 }} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                                                            {ver.label}
                                                        </div>
                                                        {ver.description ? (
                                                            <div className="text-[0.6875rem] mt-0.5 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                                                                {ver.description}
                                                            </div>
                                                        ) : null}
                                                    </div>
                                                </div>
                                                {isPlaceholder ? (
                                                    <span
                                                        className="px-3 py-1 rounded-full text-[0.6875rem] font-semibold whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(240,237,232,0.9)',
                                                            color: theme.colors.textSecondary,
                                                        }}
                                                    >
                                                        Coming soon
                                                    </span>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                        <IconBtn icon={ExternalLink} title="Open"       onClick={() => window.open(url, '_blank')}                             theme={theme} dark={dark} />
                                                        <IconBtn icon={Link2}        title="Copy link"  onClick={() => copyUrl(url, ver.short)}                               theme={theme} dark={dark} />
                                                        <IconBtn icon={Share2}       title="Share"      onClick={() => shareUrl(url, `${contract.name} — ${ver.label}`)}      theme={theme} dark={dark} />
                                                    </div>
                                                )}
                                            </motion.div>
                                        );
                                    })}
                                </GlassCard>
                            </>
                        )}

                    </div>
                </TabContent>
            </div>

            {/* ── State picker attached to tab bubble ── */}
            <StateTabDropdown
                entries={CONTRACTS_DATA.state.entries}
                selected={selectedState}
                onSelect={setSelectedState}
                onClose={() => setStateDropdownOpen(false)}
                theme={theme}
                dark={dark}
                isOpen={stateDropdownOpen && isState}
                anchorRect={stateTabAnchor}
            />
        </div>
    );
};
