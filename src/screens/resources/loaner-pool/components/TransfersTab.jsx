import React, { useState, useMemo } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { CURRENT_USER, TRANSFER_STATUS } from '../data.js';
import { IncomingTransferCard } from './IncomingTransferCard.jsx';

export const TransfersTab = ({ transferRequests, products, theme, onApprove, onDecline }) => {
    const [filter, setFilter] = useState('all');
    const isDark = isDarkTheme(theme);
    const c = theme.colors;

    const filteredRequests = useMemo(() => {
        let filtered = transferRequests;
        if (filter === 'incoming') {
            filtered = transferRequests.filter(r => r.fromRepId === CURRENT_USER.id);
        } else if (filter === 'outgoing') {
            filtered = transferRequests.filter(r => r.toRepId === CURRENT_USER.id);
        }
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [transferRequests, filter]);

    const pendingCount = transferRequests.filter(
        r => r.status === TRANSFER_STATUS.PENDING && r.fromRepId === CURRENT_USER.id
    ).length;

    const filters = [
        { key: 'all', label: 'All' },
        { key: 'incoming', label: pendingCount > 0 ? `Requests for Me (${pendingCount})` : 'Requests for Me' },
        { key: 'outgoing', label: 'My Requests' },
    ];

    return (
        <div className="pt-1 space-y-4">
            <div className="flex flex-wrap gap-2">
                {filters.map((f) => {
                    const active = filter === f.key;
                    return (
                        <button
                            key={f.key}
                            type="button"
                            onClick={() => setFilter(f.key)}
                            className="px-3.5 py-2 rounded-full text-[0.75rem] font-semibold whitespace-nowrap transition-all active:scale-[0.98] focus-ring"
                            style={{
                                backgroundColor: active ? c.accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)'),
                                color: active ? (c.accentText || '#FFFFFF') : c.textSecondary,
                            }}
                        >
                            {f.label}
                        </button>
                    );
                })}
            </div>

            {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                    <ArrowRightLeft className="w-10 h-10 mx-auto mb-3" style={{ color: c.textSecondary, opacity: 0.35 }} aria-hidden="true" />
                    <p className="text-sm font-medium" style={{ color: c.textSecondary }}>No transfer requests</p>
                    <p className="text-[0.75rem] mt-1 max-w-xs mx-auto" style={{ color: c.textSecondary, opacity: 0.72 }}>
                        Request a transfer when you find an unavailable item you need.
                    </p>
                </div>
            ) : (
                <div className="grid gap-3 lg:grid-cols-2 lg:items-start">
                    {filteredRequests.map(request => (
                        <IncomingTransferCard
                            key={request.id}
                            request={request}
                            products={products}
                            theme={theme}
                            onApprove={onApprove}
                            onDecline={onDecline}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
