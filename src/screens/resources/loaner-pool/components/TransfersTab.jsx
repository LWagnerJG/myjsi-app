import React, { useState, useMemo } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { CURRENT_USER, TRANSFER_STATUS } from './data.js';
import { IncomingTransferCard } from './IncomingTransferCard.jsx';

export const TransfersTab = ({ transferRequests, products, theme, onApprove, onDecline }) => {
    const [filter, setFilter] = useState('all'); // all, incoming, outgoing

    const filteredRequests = useMemo(() => {
        let filtered = transferRequests;
        if (filter === 'incoming') {
            // Requests where someone wants item from me
            filtered = transferRequests.filter(r => r.fromRepId === CURRENT_USER.id);
        } else if (filter === 'outgoing') {
            // Requests where I want item from someone
            filtered = transferRequests.filter(r => r.toRepId === CURRENT_USER.id);
        }
        return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [transferRequests, filter]);

    const pendingCount = transferRequests.filter(
        r => r.status === TRANSFER_STATUS.PENDING && r.fromRepId === CURRENT_USER.id
    ).length;

    return (
        <div className="p-4 space-y-4">
            {/* Filter pills */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
                {[
                    { key: 'all', label: 'All' },
                    { key: 'incoming', label: `Requests for Me ${pendingCount > 0 ? `(${pendingCount})` : ''}` },
                    { key: 'outgoing', label: 'My Requests' }
                ].map(f => (
                    <button
                        key={f.key}
                        onClick={() => setFilter(f.key)}
                        className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all"
                        style={{
                            backgroundColor: filter === f.key ? theme.colors.accent : theme.colors.subtle,
                            color: filter === f.key ? 'white' : theme.colors.textPrimary
                        }}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Transfer cards */}
            {filteredRequests.length === 0 ? (
                <div className="text-center py-12">
                    <ArrowRightLeft className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                    <p className="font-medium" style={{ color: theme.colors.textSecondary }}>No transfer requests</p>
                    <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                        Request a transfer when you find an unavailable item you need
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
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
