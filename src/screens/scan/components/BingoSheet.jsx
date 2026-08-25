import React, { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import {
    CARTON_STATUS,
    CARTON_STATUS_LABELS,
    CARTON_STATUS_TONE,
    buildCartonStatusMap,
    filterCartons,
} from '../receivingLogic.js';
import {
    Caption,
    FilterChip,
    SectionCard,
    SectionHeading,
    StatusPill,
    QuietButton,
} from './ScanPrimitives.jsx';

const STATUS_FILTERS = [
    { value: 'all', label: 'All' },
    { value: CARTON_STATUS.EXPECTED, label: 'Not scanned' },
    { value: CARTON_STATUS.SCANNED, label: 'Scanned' },
    { value: CARTON_STATUS.AVAILABLE, label: 'Accepted' },
    { value: CARTON_STATUS.ISSUE, label: 'Issue' },
    { value: CARTON_STATUS.MISSING, label: 'Missing' },
];

const PAGE_SIZE = 60;

export const BingoSheet = ({ theme, shipment, receiving, onReportIssue }) => {
    const receipt = receiving.receiptFor(shipment.id);
    const issues = receiving.issuesFor(shipment.id);
    const [query, setQuery] = useState('');
    const [status, setStatus] = useState('all');
    const [productLine, setProductLine] = useState('all');
    const [pallet, setPallet] = useState('all');
    const [phase, setPhase] = useState('all');
    const [visible, setVisible] = useState(PAGE_SIZE);

    const statusMap = useMemo(
        () => buildCartonStatusMap({ shipment, receipt, issues }),
        [issues, receipt, shipment]
    );

    const statusCounts = useMemo(() => {
        const counts = {};
        statusMap.forEach((value) => { counts[value] = (counts[value] || 0) + 1; });
        return counts;
    }, [statusMap]);

    const pallets = useMemo(
        () => ['all', ...Array.from(new Set(shipment.cartons.map((c) => c.pallet)))],
        [shipment.cartons]
    );

    const filtered = useMemo(
        () => filterCartons(shipment.cartons, { query, status, productLine, pallet, phase }, statusMap),
        [pallet, phase, productLine, query, shipment.cartons, status, statusMap]
    );

    const shown = filtered.slice(0, visible);

    const resetPaging = (fn) => (value) => { fn(value); setVisible(PAGE_SIZE); };

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-[1.5rem] font-bold tracking-[-0.02em]" style={{ color: theme.colors.textPrimary }}>
                    Bingo sheet
                </h1>
                <Caption theme={theme}>
                    {shipment.cartonCount} cartons on {shipment.id} · {shipment.projectName}
                </Caption>
            </div>

            <SectionCard theme={theme} className="space-y-3">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} aria-hidden="true" />
                    <label htmlFor="bingo-search" className="sr-only">Search cartons</label>
                    <input
                        id="bingo-search"
                        value={query}
                        onChange={(e) => resetPaging(setQuery)(e.target.value)}
                        placeholder="Carton number, barcode, model or PO line"
                        className="w-full min-h-[48px] pl-11 pr-4 rounded-full text-[0.875rem] focus-ring"
                        style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                    />
                </div>

                <div className="flex gap-2 overflow-x-auto scrollbar-hide -mx-1 px-1 py-0.5">
                    {STATUS_FILTERS.map((option) => (
                        <FilterChip
                            key={option.value}
                            theme={theme}
                            active={status === option.value}
                            onClick={() => resetPaging(setStatus)(option.value)}
                            count={option.value === 'all' ? shipment.cartonCount : statusCounts[option.value] || 0}
                        >
                            {option.label}
                        </FilterChip>
                    ))}
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <div>
                        <label htmlFor="bingo-line" className="sr-only">Product line</label>
                        <select
                            id="bingo-line"
                            value={productLine}
                            onChange={(e) => resetPaging(setProductLine)(e.target.value)}
                            className="w-full min-h-[44px] px-3 rounded-full text-[0.8125rem] font-semibold focus-ring"
                            style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                        >
                            <option value="all">All product lines</option>
                            {shipment.productLines.map((line) => <option key={line} value={line}>{line}</option>)}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bingo-pallet" className="sr-only">Pallet</label>
                        <select
                            id="bingo-pallet"
                            value={pallet}
                            onChange={(e) => resetPaging(setPallet)(e.target.value)}
                            className="w-full min-h-[44px] px-3 rounded-full text-[0.8125rem] font-semibold focus-ring"
                            style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                        >
                            {pallets.map((value) => (
                                <option key={value} value={value}>{value === 'all' ? 'All pallets' : value}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="bingo-phase" className="sr-only">Installation phase</label>
                        <select
                            id="bingo-phase"
                            value={phase}
                            onChange={(e) => resetPaging(setPhase)(e.target.value)}
                            className="w-full min-h-[44px] px-3 rounded-full text-[0.8125rem] font-semibold focus-ring"
                            style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme), color: theme.colors.textPrimary }}
                        >
                            <option value="all">All phases</option>
                            {(shipment.phases || []).map((value) => <option key={value} value={value}>{value}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                    <Caption theme={theme}>
                        {filtered.length} carton{filtered.length === 1 ? '' : 's'} shown
                    </Caption>
                    {shipment.missingCartonNumber ? (
                        <QuietButton theme={theme} onClick={() => { resetPaging(setStatus)('all'); setQuery(String(shipment.missingCartonNumber)); }}>
                            Jump to carton {shipment.missingCartonNumber}
                        </QuietButton>
                    ) : null}
                </div>
            </SectionCard>

            <SectionCard theme={theme}>
                <SectionHeading theme={theme}>Cartons</SectionHeading>
                {shown.length ? (
                    <ul>
                        {shown.map((carton, index) => {
                            const cartonStatus = statusMap.get(carton.id);
                            const tone = CARTON_STATUS_TONE[cartonStatus] || 'info';
                            return (
                                <li
                                    key={carton.id}
                                    style={{ borderTop: index === 0 ? 'none' : subtleBorder(theme) }}
                                >
                                    <button
                                        type="button"
                                        onClick={() => onReportIssue({ carton })}
                                        className="w-full text-left py-3 flex items-start justify-between gap-3 min-h-[56px] focus-ring rounded-2xl px-1"
                                    >
                                        <div className="min-w-0">
                                            <p className="text-[0.875rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                Carton {carton.cartonNumber} of {carton.cartonCount}
                                                <span className="font-normal" style={{ color: theme.colors.textSecondary }}>
                                                    {' '}· {carton.model}
                                                </span>
                                            </p>
                                            <p className="text-[0.75rem] mt-0.5 truncate" style={{ color: theme.colors.textSecondary }}>
                                                {carton.description} · qty {carton.qty}
                                            </p>
                                            <p className="text-[0.6875rem] mt-0.5 tabular-nums" style={{ color: theme.colors.textSecondary, opacity: 0.8 }}>
                                                {carton.id} · {carton.barcode} · line {carton.poLine} · {carton.pallet} · {carton.phase}
                                            </p>
                                        </div>
                                        <StatusPill theme={theme} tone={tone} label={CARTON_STATUS_LABELS[cartonStatus]} />
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                ) : (
                    <Caption theme={theme}>No cartons match these filters.</Caption>
                )}

                {filtered.length > shown.length ? (
                    <div className="pt-3">
                        <QuietButton theme={theme} onClick={() => setVisible((v) => v + PAGE_SIZE)} className="w-full">
                            Show {Math.min(PAGE_SIZE, filtered.length - shown.length)} more
                        </QuietButton>
                    </div>
                ) : null}
            </SectionCard>
        </div>
    );
};
