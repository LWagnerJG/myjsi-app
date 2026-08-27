import React, { useMemo, useState } from 'react';
import { PackageSearch, ScanLine } from 'lucide-react';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { PageHeader } from '../../../components/common/PageHeader.jsx';
import { StatusChip } from '../../../components/common/StatusChip.jsx';
import { subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import { DEMO_SHIPMENTS } from '../data.js';
import { isScanDemoEnabled } from '../demoFlags.js';
import { RECEIPT_STATUS, formatDateTime } from '../receivingLogic.js';
import {
    BigButton,
    Caption,
    ConnectionChip,
    DemoBadge,
    InfoRow,
    ProgressBar,
    SectionCard,
    SectionHeading,
} from './ScanPrimitives.jsx';

const matches = (shipment, query) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return [
        shipment.projectName,
        shipment.customer,
        shipment.dealerPo,
        shipment.salesOrder,
        shipment.id,
        shipment.proNumber,
        shipment.warehouse,
    ].some((field) => String(field).toLowerCase().includes(q));
};

const ShipmentCard = ({ theme, shipment, receipt, counts, onOpen, primaryLabel }) => {
    const completed = receipt?.status === RECEIPT_STATUS.COMPLETED;
    const held = receipt?.status === RECEIPT_STATUS.HELD;

    return (
        <SectionCard theme={theme} className="space-y-3">
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <p className="text-[1rem] font-bold leading-tight truncate" style={{ color: theme.colors.textPrimary }}>
                        {shipment.projectName}
                    </p>
                    <Caption theme={theme} className="mt-0.5">
                        {shipment.customer} · {shipment.warehouse}
                    </Caption>
                </div>
                {completed ? (
                    <StatusChip theme={theme} label="Complete" tone="success" />
                ) : held ? (
                    <StatusChip theme={theme} label="On hold" tone="warning" />
                ) : receipt ? (
                    <StatusChip theme={theme} label="In progress" tone="active" />
                ) : (
                    <StatusChip theme={theme} label={`${shipment.cartonCount} cartons`} tone="neutral" showDot={false} />
                )}
            </div>

            <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}>
                <InfoRow theme={theme} label="Dealer PO" value={shipment.dealerPo} mono />
                <InfoRow theme={theme} label="JSI sales order" value={shipment.salesOrder} mono />
                <InfoRow theme={theme} label="PRO" value={shipment.proNumber} mono />
            </div>

            {receipt ? (
                <div className="space-y-1.5">
                    <ProgressBar theme={theme} value={counts.scanned} max={counts.expected} />
                    <div className="flex items-center justify-between">
                        <Caption theme={theme}>
                            {counts.scanned} of {counts.expected} scanned
                            {counts.openIssues ? ` · ${counts.openIssues} open issue${counts.openIssues === 1 ? '' : 's'}` : ''}
                        </Caption>
                        {completed ? <Caption theme={theme}>{formatDateTime(receipt.completedAt)}</Caption> : null}
                    </div>
                </div>
            ) : null}

            <BigButton theme={theme} onClick={() => onOpen(shipment)} icon={ScanLine}>
                {primaryLabel}
            </BigButton>
        </SectionCard>
    );
};

export const ScanHome = ({ theme, receiving, onOpenShipment, onOpenConnection }) => {
    const [query, setQuery] = useState('');

    const buckets = useMemo(() => {
        const expected = [];
        const inProgress = [];
        const completed = [];
        DEMO_SHIPMENTS.filter((shipment) => matches(shipment, query)).forEach((shipment) => {
            const receipt = receiving.receiptFor(shipment.id);
            if (receipt?.status === RECEIPT_STATUS.COMPLETED) completed.push(shipment);
            else if (receipt) inProgress.push(shipment);
            else expected.push(shipment);
        });
        return { expected, inProgress, completed };
    }, [query, receiving]);

    const renderGroup = (title, shipments, primaryLabel, emptyCopy) => (
        <section className="space-y-3">
            <SectionHeading theme={theme}>{title}</SectionHeading>
            {shipments.length ? (
                shipments.map((shipment) => (
                    <ShipmentCard
                        key={shipment.id}
                        theme={theme}
                        shipment={shipment}
                        receipt={receiving.receiptFor(shipment.id)}
                        counts={receiving.countsFor(shipment)}
                        onOpen={onOpenShipment}
                        primaryLabel={primaryLabel}
                    />
                ))
            ) : (
                <p className="text-[0.8125rem] px-1" style={{ color: theme.colors.textSecondary }}>{emptyCopy}</p>
            )}
        </section>
    );

    return (
        <div className="space-y-6">
            <div className="space-y-3">
                <PageHeader
                    theme={theme}
                    title="Scan"
                    subtitle="Receive a truck at the dock, online or off."
                    action={(
                        <ConnectionChip
                            theme={theme}
                            network={receiving.network}
                            queuedCount={receiving.queuedCount}
                            failedCount={receiving.failedCount}
                            syncing={receiving.syncing}
                            onClick={onOpenConnection}
                        />
                    )}
                />
                <StandardSearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="Project, PO, sales order, shipment or PRO"
                    theme={theme}
                    size="control"
                />
                <div className="flex items-center gap-2">
                    {isScanDemoEnabled() ? (
                        <>
                            <DemoBadge theme={theme} />
                            <Caption theme={theme}>Order and shipment numbers below are fabricated.</Caption>
                        </>
                    ) : null}
                </div>
            </div>

            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-6 lg:items-start">
                <div className="space-y-6 min-w-0">
                    {renderGroup('Expected today', buckets.expected, 'Start receiving', 'Nothing else expected today.')}
                </div>
                <div className="space-y-6 min-w-0">
                    {renderGroup('In progress', buckets.inProgress, 'Continue receiving', 'No receipts in progress.')}
                    {renderGroup('Completed', buckets.completed, 'View receipt', 'No completed receipts yet.')}
                </div>
            </div>

            {!buckets.expected.length && !buckets.inProgress.length && !buckets.completed.length ? (
                <div className="flex flex-col items-center gap-2 py-14 text-center">
                    <PackageSearch className="w-10 h-10 opacity-25" style={{ color: theme.colors.textSecondary }} aria-hidden="true" />
                    <p className="text-[0.9375rem] font-semibold" style={{ color: theme.colors.textPrimary }}>No shipments found</p>
                    <Caption theme={theme}>Try a different project, PO, or PRO number.</Caption>
                </div>
            ) : null}
        </div>
    );
};
