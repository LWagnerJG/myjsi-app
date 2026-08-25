import React from 'react';
import { CheckCircle2, ClipboardList, Plug, ScanLine } from 'lucide-react';
import { subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import { NETWORK_MODES, formatDateTime } from '../receivingLogic.js';
import {
    BigButton,
    Caption,
    CountTile,
    InfoRow,
    QuietButton,
    SectionCard,
    SectionHeading,
    StatusPill,
} from './ScanPrimitives.jsx';

export const CompletionSummary = ({ theme, shipment, receiving, onViewReceipt, onViewIssues, onReceiveAnother, onOpenConnection }) => {
    const receipt = receiving.receiptFor(shipment.id);
    const counts = receiving.countsFor(shipment);
    const issues = receiving.issuesFor(shipment.id);
    const openIssues = issues.filter((issue) => issue.status === 'open');
    const damaged = issues.filter((issue) => issue.type === 'damaged').length;

    return (
        <div className="space-y-4">
            <div className="flex items-start gap-3">
                <span
                    className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: theme.colors.successLight }}
                >
                    <CheckCircle2 className="w-6 h-6" style={{ color: theme.colors.success }} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                    <h1 className="text-[1.5rem] font-bold tracking-[-0.02em] leading-tight" style={{ color: theme.colors.textPrimary }}>
                        Receipt complete
                    </h1>
                    <Caption theme={theme}>
                        {receipt?.id} · {shipment.projectName}
                    </Caption>
                </div>
            </div>

            <SectionCard theme={theme}>
                <SectionHeading theme={theme}>Result</SectionHeading>
                <div className="grid grid-cols-3 gap-2">
                    <CountTile theme={theme} label="Accepted" value={receipt?.accepted?.length ?? counts.accepted} tone={theme.colors.success} />
                    <CountTile theme={theme} label="Missing" value={receipt?.missing?.length ?? counts.missing} tone={counts.missing ? theme.colors.error : undefined} />
                    <CountTile theme={theme} label="Damaged" value={damaged} tone={damaged ? theme.colors.warning : undefined} />
                </div>
                <div className="mt-3 rounded-2xl px-3 py-2" style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}>
                    <InfoRow theme={theme} label="Receipt number" value={receipt?.id || '—'} mono />
                    <InfoRow theme={theme} label="Started" value={formatDateTime(receipt?.startedAt)} />
                    <InfoRow theme={theme} label="Completed" value={formatDateTime(receipt?.completedAt)} />
                    <InfoRow theme={theme} label="Received by" value={receipt?.user || '—'} />
                    <InfoRow theme={theme} label="Open issues" value={openIssues.length} mono />
                </div>
            </SectionCard>

            <SectionCard theme={theme}>
                <SectionHeading
                    theme={theme}
                    action={(
                        <StatusPill
                            theme={theme}
                            tone={receiving.network === NETWORK_MODES.OFFLINE ? 'warning' : receiving.queuedCount ? 'info' : 'success'}
                            label={receiving.network === NETWORK_MODES.OFFLINE
                                ? 'Offline'
                                : receiving.queuedCount ? `${receiving.queuedCount} waiting` : 'All sent'}
                        />
                    )}
                >
                    Connection
                </SectionHeading>
                <Caption theme={theme}>
                    {receiving.lastSyncAt ? `Last sync ${formatDateTime(receiving.lastSyncAt)}.` : 'Nothing has synced yet.'}
                </Caption>
                <div className="mt-3">
                    <QuietButton theme={theme} icon={Plug} onClick={onOpenConnection} className="w-full">
                        View connection detail
                    </QuietButton>
                </div>
            </SectionCard>

            <div className="space-y-2.5">
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <QuietButton theme={theme} icon={ClipboardList} onClick={onViewReceipt} className="w-full">
                        View receipt
                    </QuietButton>
                    <QuietButton theme={theme} onClick={onViewIssues} className="w-full">
                        View open issues
                    </QuietButton>
                </div>
                <BigButton theme={theme} icon={ScanLine} onClick={onReceiveAnother}>
                    Receive another shipment
                </BigButton>
            </div>
        </div>
    );
};
