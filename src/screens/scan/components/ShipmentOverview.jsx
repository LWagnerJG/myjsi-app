import React from 'react';
import { CheckCircle2, Download, Grid3x3, ScanLine } from 'lucide-react';
import { subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import { RECEIPT_STATUS, formatDateTime } from '../receivingLogic.js';
import { formatShortDate } from '../../../utils/format.js';
import {
    BigButton,
    Caption,
    CountTile,
    DemoBadge,
    InfoRow,
    QuietButton,
    SectionCard,
    SectionHeading,
    StatusPill,
} from './ScanPrimitives.jsx';

export const ShipmentOverview = ({
    theme,
    shipment,
    receiving,
    onStartScanning,
    onViewBingo,
    onViewReview,
    onViewSummary,
}) => {
    const receipt = receiving.receiptFor(shipment.id);
    const counts = receiving.countsFor(shipment);
    const cached = receiving.isCached(shipment.id);
    const completed = receipt?.status === RECEIPT_STATUS.COMPLETED;

    return (
        <div className="space-y-4">
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <DemoBadge theme={theme} />
                    {cached ? <StatusPill theme={theme} label="Saved for offline" tone="success" icon={CheckCircle2} /> : null}
                </div>
                <h1 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-tight" style={{ color: theme.colors.textPrimary }}>
                    {shipment.projectName}
                </h1>
                <Caption theme={theme}>
                    {shipment.customer} · {shipment.manufacturer} shipment {shipment.id}
                </Caption>
            </div>

            <SectionCard theme={theme}>
                <SectionHeading theme={theme}>Shipment</SectionHeading>
                <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}>
                    <InfoRow theme={theme} label="Dealer PO" value={shipment.dealerPo} mono />
                    <InfoRow theme={theme} label="JSI sales order" value={shipment.salesOrder} mono />
                    <InfoRow theme={theme} label="Warehouse" value={shipment.warehouse} />
                    <InfoRow theme={theme} label="Carrier" value={shipment.carrier} />
                    <InfoRow theme={theme} label="PRO number" value={shipment.proNumber} mono />
                    <InfoRow theme={theme} label="Shipped" value={formatShortDate(shipment.shipDate)} />
                    <InfoRow theme={theme} label="Expected arrival" value={formatShortDate(shipment.expectedArrival)} />
                    <InfoRow theme={theme} label="Pallets / cartons" value={`${shipment.pallets} / ${shipment.cartonCount}`} mono />
                    <InfoRow theme={theme} label="Release" value={shipment.phase} />
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {shipment.productLines.map((line) => (
                        <span
                            key={line}
                            className="text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full"
                            style={{ backgroundColor: subtleBg(theme, 1.4), color: theme.colors.textSecondary }}
                        >
                            {line}
                        </span>
                    ))}
                </div>
            </SectionCard>

            <SectionCard theme={theme}>
                <SectionHeading theme={theme}>Counts</SectionHeading>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    <CountTile theme={theme} label="Expected" value={counts.expected} />
                    <CountTile theme={theme} label="Scanned" value={counts.scanned} tone={theme.colors.info} />
                    <CountTile theme={theme} label="Accepted" value={counts.accepted} tone={theme.colors.success} />
                    <CountTile theme={theme} label="Issues" value={counts.openIssues} tone={counts.openIssues ? theme.colors.warning : undefined} />
                    {/* Nothing is short until the receipt is posted — before that it is simply unscanned. */}
                    <CountTile
                        theme={theme}
                        label={completed ? 'Missing' : 'Not scanned'}
                        value={counts.missing}
                        tone={completed && counts.missing ? theme.colors.error : undefined}
                    />
                </div>
                {completed ? (
                    <Caption theme={theme} className="mt-3">
                        Receipt {receipt.id} completed {formatDateTime(receipt.completedAt)} by {receipt.user}.
                    </Caption>
                ) : null}
            </SectionCard>

            <div className="space-y-2.5">
                {!cached ? (
                    <BigButton theme={theme} tone="neutral" icon={Download} onClick={() => receiving.cacheShipment(shipment)}>
                        Save shipment for offline
                    </BigButton>
                ) : null}
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <QuietButton theme={theme} icon={Grid3x3} onClick={onViewBingo} className="w-full">
                        View bingo sheet
                    </QuietButton>
                    {completed ? (
                        <QuietButton theme={theme} icon={CheckCircle2} onClick={onViewSummary} className="w-full">
                            View receipt
                        </QuietButton>
                    ) : (
                        <QuietButton theme={theme} onClick={onViewReview} className="w-full">
                            Review receipt
                        </QuietButton>
                    )}
                </div>
                {!completed ? (
                    <BigButton theme={theme} icon={ScanLine} onClick={onStartScanning}>
                        {receipt ? 'Continue scanning' : 'Start scanning'}
                    </BigButton>
                ) : null}
            </div>
        </div>
    );
};
