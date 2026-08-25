import React from 'react';
import { FastForward, RefreshCw, RotateCcw } from 'lucide-react';
import { subtleBg, subtleBorder } from '../../../design-system/tokens.js';
import { NETWORK_MODES, formatDateTime } from '../receivingLogic.js';
import {
    BigButton,
    BottomSheet,
    Caption,
    ChoiceRow,
    FieldLabel,
    InfoRow,
    QuietButton,
    StatusPill,
} from './ScanPrimitives.jsx';

const NETWORK_OPTIONS = [
    { value: NETWORK_MODES.ONLINE, label: 'Online' },
    { value: NETWORK_MODES.OFFLINE, label: 'Offline' },
    { value: NETWORK_MODES.SLOW, label: 'Slow sync' },
    { value: NETWORK_MODES.FAILING, label: 'Failed sync' },
];

export const ConnectionPanel = ({ theme, open, onClose, receiving, shipment }) => {
    const queued = receiving.queue.filter((event) => event.status === 'queued');
    const failed = receiving.queue.filter((event) => event.status === 'failed');

    return (
        <BottomSheet
            theme={theme}
            open={open}
            onClose={onClose}
            title="Demo connection"
            subtitle="Mock endpoints and demo controls. Not part of the warehouse flow."
            footer={(
                <div className="flex flex-col gap-2 sm:flex-row">
                    <BigButton theme={theme} tone="neutral" icon={RotateCcw} onClick={() => { receiving.resetDemo(); onClose(); }} className="sm:flex-1">
                        Reset demo
                    </BigButton>
                    <BigButton theme={theme} icon={RefreshCw} onClick={() => receiving.syncNow()} className="sm:flex-1" disabled={receiving.isOffline}>
                        Sync now
                    </BigButton>
                </div>
            )}
        >
            <div className="space-y-4">
                <div>
                    <FieldLabel theme={theme}>Connection state</FieldLabel>
                    <ChoiceRow
                        theme={theme}
                        ariaLabel="Connection state"
                        options={NETWORK_OPTIONS}
                        value={receiving.network}
                        onChange={receiving.setNetwork}
                    />
                </div>

                <div className="space-y-2">
                    {receiving.adapters.map((adapter) => {
                        const deliveredCount = (receiving.delivered[adapter.id] || []).length;
                        return (
                            <div
                                key={adapter.id}
                                className="rounded-2xl px-3 py-2.5 flex items-center justify-between gap-3"
                                style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}
                            >
                                <div className="min-w-0">
                                    <p className="text-[0.875rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{adapter.name}</p>
                                    <Caption theme={theme}>{adapter.note} · {deliveredCount} event{deliveredCount === 1 ? '' : 's'} received</Caption>
                                </div>
                                <StatusPill
                                    theme={theme}
                                    tone={receiving.isOffline ? 'warning' : failed.length ? 'error' : 'success'}
                                    label={receiving.isOffline ? 'Waiting' : failed.length ? 'Erroring' : 'Reachable'}
                                />
                            </div>
                        );
                    })}
                </div>

                <div className="rounded-2xl px-3 py-2" style={{ backgroundColor: subtleBg(theme), border: subtleBorder(theme) }}>
                    <InfoRow theme={theme} label="Last sync" value={formatDateTime(receiving.lastSyncAt)} />
                    <InfoRow theme={theme} label="Queued events" value={queued.length} mono />
                    <InfoRow theme={theme} label="Failed events" value={failed.length} mono />
                </div>

                {failed.length ? (
                    <QuietButton theme={theme} icon={RefreshCw} onClick={receiving.retryFailed} className="w-full">
                        Retry {failed.length} failed event{failed.length === 1 ? '' : 's'}
                    </QuietButton>
                ) : null}

                {shipment ? (
                    <div>
                        <FieldLabel theme={theme}>Demo shortcut</FieldLabel>
                        <QuietButton
                            theme={theme}
                            icon={FastForward}
                            onClick={() => receiving.fastForwardScanning(shipment)}
                            className="w-full"
                        >
                            Fast-forward remaining cartons
                        </QuietButton>
                        <Caption theme={theme} className="mt-1.5">
                            Scans every remaining carton except the one staged as missing.
                        </Caption>
                    </div>
                ) : null}

                {queued.length ? (
                    <div>
                        <FieldLabel theme={theme}>Waiting to send</FieldLabel>
                        <ul className="space-y-1">
                            {queued.slice(0, 6).map((event) => (
                                <li key={event.id} className="flex items-center justify-between gap-3">
                                    <span className="text-[0.75rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{event.type}</span>
                                    <span className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary }}>{formatDateTime(event.createdAt)}</span>
                                </li>
                            ))}
                        </ul>
                        {queued.length > 6 ? <Caption theme={theme} className="mt-1">+{queued.length - 6} more</Caption> : null}
                    </div>
                ) : null}

                <div>
                    <FieldLabel theme={theme}>Integration log</FieldLabel>
                    {receiving.log.length ? (
                        <ul className="space-y-1.5">
                            {receiving.log.slice(0, 14).map((entry) => (
                                <li key={entry.id} className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-[0.75rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                                            {entry.adapterName}: {entry.message}
                                        </p>
                                        <Caption theme={theme}>{entry.eventType} · {formatDateTime(entry.at)}</Caption>
                                    </div>
                                    <StatusPill
                                        theme={theme}
                                        tone={entry.status === 'delivered' ? 'success' : entry.status === 'skipped' ? 'info' : 'error'}
                                        label={entry.status}
                                    />
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <Caption theme={theme}>Nothing sent yet.</Caption>
                    )}
                </div>
            </div>
        </BottomSheet>
    );
};
