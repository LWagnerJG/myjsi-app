import React, { useState } from 'react';
import { AlertTriangle, CloudOff, PauseCircle, ScanLine } from 'lucide-react';
import { subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import { ISSUE_TYPES, buildCompletionPrompt, formatDateTime } from '../receivingLogic.js';
import {
    BigButton,
    BottomSheet,
    Caption,
    CountTile,
    InfoRow,
    QuietButton,
    SectionCard,
    SectionHeading,
    StatusPill,
} from './ScanPrimitives.jsx';

const typeLabel = (value) => ISSUE_TYPES.find((t) => t.value === value)?.label || value;

export const ReceiptReview = ({ theme, shipment, receiving, onBackToScanning, onCompleted, onOpenIssue }) => {
    const receipt = receiving.receiptFor(shipment.id);
    const counts = receiving.countsFor(shipment);
    const issues = receiving.issuesFor(shipment.id);
    const [confirming, setConfirming] = useState(false);

    const partial = counts.missing > 0 || counts.held > 0;

    return (
        <div className="space-y-4 pb-4">
            <div>
                <h1 className="text-[1.5rem] font-bold tracking-[-0.02em]" style={{ color: theme.colors.textPrimary }}>
                    Review receipt
                </h1>
                <Caption theme={theme}>
                    {receipt ? `${receipt.id} · started ${formatDateTime(receipt.startedAt)}` : shipment.id}
                </Caption>
            </div>

            <SectionCard theme={theme}>
                <SectionHeading theme={theme}>What arrived</SectionHeading>
                <div className="grid grid-cols-3 gap-2">
                    <CountTile theme={theme} label="Expected" value={counts.expected} />
                    <CountTile theme={theme} label="Scanned" value={counts.scanned} tone={theme.colors.info} />
                    <CountTile theme={theme} label="Accepted" value={counts.accepted} tone={theme.colors.success} />
                    <CountTile theme={theme} label="Missing" value={counts.missing} tone={counts.missing ? theme.colors.error : undefined} />
                    <CountTile theme={theme} label="On hold" value={counts.held} tone={counts.held ? theme.colors.warning : undefined} />
                    <CountTile theme={theme} label="Open issues" value={counts.openIssues} tone={counts.openIssues ? theme.colors.warning : undefined} />
                </div>
                <div className="mt-3 rounded-2xl px-3 py-2" style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}>
                    <InfoRow theme={theme} label="Duplicate scan attempts" value={counts.duplicateAttempts} mono />
                    <InfoRow theme={theme} label="Wrong-shipment attempts" value={counts.wrongShipmentAttempts} mono />
                    <InfoRow theme={theme} label="Extra cartons recorded" value={counts.extras} mono />
                    <InfoRow theme={theme} label="Waiting to sync" value={receiving.queuedCount} mono />
                </div>
                <Caption theme={theme} className="mt-2.5">
                    Scanning records arrival only. Cartons become available inventory when this receipt is posted.
                </Caption>
            </SectionCard>

            <SectionCard theme={theme}>
                <SectionHeading theme={theme}>Issues</SectionHeading>
                {issues.length ? (
                    <ul className="space-y-2">
                        {issues.map((issue) => (
                            <li key={issue.id}>
                                <button
                                    type="button"
                                    onClick={() => onOpenIssue(issue)}
                                    className="w-full text-left rounded-2xl px-3 py-2.5 min-h-[56px] flex items-center justify-between gap-3 focus-ring"
                                    style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}
                                >
                                    <div className="min-w-0">
                                        <p className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                            {typeLabel(issue.type)}
                                            {issue.cartonNumber ? ` · carton ${issue.cartonNumber}` : ''}
                                        </p>
                                        <Caption theme={theme}>
                                            {issue.owner} · {issue.disposition === 'hold' ? 'held' : 'accepted'} · opened {formatDateTime(issue.openedAt)}
                                        </Caption>
                                    </div>
                                    <StatusPill
                                        theme={theme}
                                        tone={issue.status === 'open' ? 'warning' : 'success'}
                                        label={issue.status === 'open' ? 'Open' : 'Closed'}
                                    />
                                </button>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <Caption theme={theme}>No issues on this receipt.</Caption>
                )}
                {counts.missing > 0 ? (
                    <div className="mt-3">
                        <QuietButton
                            theme={theme}
                            icon={AlertTriangle}
                            onClick={() => onOpenIssue(null, { carton: null, type: 'missing' })}
                            className="w-full"
                        >
                            Open a shortage issue
                        </QuietButton>
                    </div>
                ) : null}
            </SectionCard>

            {receiving.isOffline ? (
                <div className="flex items-center gap-2 rounded-3xl px-4 py-3" style={{ backgroundColor: theme.colors.warningLight }}>
                    <CloudOff className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.warning }} aria-hidden="true" />
                    <p className="text-[0.75rem]" style={{ color: theme.colors.textPrimary }}>
                        Offline. You can still complete the receipt — {receiving.queuedCount} event{receiving.queuedCount === 1 ? '' : 's'} will send when service returns.
                    </p>
                </div>
            ) : null}

            <div className="space-y-2.5">
                <BigButton theme={theme} onClick={() => setConfirming(true)} disabled={!receipt || !counts.scanned}>
                    {partial ? 'Complete partial receipt' : 'Post receipt'}
                </BigButton>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                    <QuietButton theme={theme} icon={PauseCircle} onClick={() => receiving.holdReceipt(shipment)} className="w-full">
                        Hold receipt
                    </QuietButton>
                    <QuietButton theme={theme} icon={ScanLine} onClick={onBackToScanning} className="w-full">
                        Back to scanning
                    </QuietButton>
                </div>
            </div>

            <BottomSheet
                theme={theme}
                open={confirming}
                onClose={() => setConfirming(false)}
                title={partial ? 'Complete partial receipt' : 'Post this receipt'}
                subtitle={buildCompletionPrompt(counts)}
                footer={(
                    <div className="flex flex-col gap-2 sm:flex-row">
                        <BigButton theme={theme} tone="neutral" onClick={() => setConfirming(false)} className="sm:flex-1">
                            Not yet
                        </BigButton>
                        <BigButton
                            theme={theme}
                            tone="success"
                            onClick={() => {
                                const completed = receiving.finishReceipt(shipment);
                                setConfirming(false);
                                if (completed) onCompleted();
                            }}
                            className="sm:flex-1"
                        >
                            Confirm
                        </BigButton>
                    </div>
                )}
            >
                <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}>
                    <InfoRow theme={theme} label="Post to inventory" value={`${counts.accepted} cartons`} mono />
                    <InfoRow theme={theme} label="Stay on hold" value={`${counts.held} cartons`} mono />
                    <InfoRow theme={theme} label="Recorded short" value={`${counts.missing} cartons`} mono />
                    <InfoRow theme={theme} label="Issues left open" value={counts.openIssues} mono />
                </div>
                <Caption theme={theme} className="mt-3">
                    Open issues stay open after the receipt posts, so a shortage can be worked after the truck leaves.
                </Caption>
            </BottomSheet>
        </div>
    );
};
