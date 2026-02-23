import React, { useState } from 'react';
import { ArrowRightLeft, Calendar, MessageSquare, Check, X } from 'lucide-react';
import { CURRENT_USER, SALES_REPS, TRANSFER_STATUS, TRANSFER_STATUS_LABELS, TRANSFER_STATUS_COLORS } from './data.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const IncomingTransferCard = ({ request, products, theme, onApprove, onDecline }) => {
    const [declineReason, setDeclineReason] = useState('');
    const [showDeclineInput, setShowDeclineInput] = useState(false);
    
    const product = products.find(p => p.id === request.itemId);
    const fromRep = getRepById(request.fromRepId);
    const toRep = getRepById(request.toRepId);

    const isOutgoing = request.fromRepId === CURRENT_USER.id; // I'm requesting from someone

    if (!product) return null;

    return (
        <div 
            className="p-4 rounded-xl border-2"
            style={{ 
                borderColor: request.status === TRANSFER_STATUS.PENDING ? theme.colors.accent : theme.colors.border,
                backgroundColor: theme.colors.surface 
            }}
        >
            {/* Header */}
            <div className="flex items-start gap-3 mb-3">
                <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="font-bold" style={{ color: theme.colors.textPrimary }}>{product.name}</h4>
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{product.model}</p>
                </div>
                <span 
                    className="px-2 py-1 rounded-full text-xs font-semibold"
                    style={{ 
                        backgroundColor: TRANSFER_STATUS_COLORS[request.status] + '20',
                        color: TRANSFER_STATUS_COLORS[request.status]
                    }}
                >
                    {TRANSFER_STATUS_LABELS[request.status]}
                </span>
            </div>

            {/* Transfer direction */}
            <div className="flex items-center gap-2 mb-3 p-2 rounded-lg" style={{ backgroundColor: theme.colors.subtle }}>
                <div className="flex-1">
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>From</p>
                    <p className="font-medium text-sm" style={{ color: theme.colors.textPrimary }}>
                        {fromRep?.id === CURRENT_USER.id ? 'You' : fromRep?.name}
                    </p>
                </div>
                <ArrowRightLeft className="w-4 h-4" style={{ color: theme.colors.accent }} />
                <div className="flex-1 text-right">
                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>To</p>
                    <p className="font-medium text-sm" style={{ color: theme.colors.textPrimary }}>
                        {toRep?.id === CURRENT_USER.id ? 'You' : toRep?.name}
                    </p>
                </div>
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                    <Calendar className="w-4 h-4" />
                    <span>
                        {formatDate(request.desiredStartDate)} 
                        {request.desiredEndDate ? ` - ${formatDate(request.desiredEndDate)}` : ''}
                    </span>
                </div>
                {request.projectName && (
                    <div className="text-sm" style={{ color: theme.colors.textSecondary }}>
                        <span className="font-medium">Project:</span> {request.projectName}
                    </div>
                )}
                {request.message && (
                    <div className="flex items-start gap-2 text-sm p-2 rounded-lg" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                        <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                        <p className="italic">"{request.message}"</p>
                    </div>
                )}
            </div>

            {/* Actions (only if pending and I am the current holder) */}
            {request.status === TRANSFER_STATUS.PENDING && !isOutgoing && (
                <div className="flex gap-2 mt-4">
                    {showDeclineInput ? (
                        <div className="flex-1 flex gap-2">
                            <input
                                type="text"
                                value={declineReason}
                                onChange={(e) => setDeclineReason(e.target.value)}
                                placeholder="Reason for declining..."
                                className="flex-1 px-3 py-2 rounded-lg border text-sm"
                                style={{
                                    backgroundColor: theme.colors.surface,
                                    borderColor: theme.colors.border,
                                    color: theme.colors.textPrimary
                                }}
                                autoFocus
                            />
                            <button
                                onClick={() => {
                                    if (declineReason.trim()) {
                                        onDecline(request.id, declineReason);
                                        setShowDeclineInput(false);
                                    }
                                }}
                                disabled={!declineReason.trim()}
                                className="px-4 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95 disabled:opacity-50"
                                style={{ backgroundColor: theme.colors.error, color: '#fff' }}
                            >
                                Confirm
                            </button>
                            <button
                                onClick={() => setShowDeclineInput(false)}
                                className="px-3 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}
                            >
                                Cancel
                            </button>
                        </div>
                    ) : (
                        <>
                            <button
                                onClick={() => setShowDeclineInput(true)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.error }}
                            >
                                <X className="w-4 h-4" />
                                Decline
                            </button>
                            <button
                                onClick={() => onApprove(request.id)}
                                className="flex-1 flex items-center justify-center gap-2 py-2 rounded-lg font-semibold text-sm transition-all active:scale-95"
                                style={{ backgroundColor: theme.colors.success, color: '#fff' }}
                            >
                                <Check className="w-4 h-4" />
                                Approve
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};
