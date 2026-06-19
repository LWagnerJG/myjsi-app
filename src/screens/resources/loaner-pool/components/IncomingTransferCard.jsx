import React, { useState } from 'react';
import { ArrowRightLeft, Calendar, MessageSquare, Check, X } from 'lucide-react';
import { isDarkTheme, fieldTileSurface } from '../../../../design-system/tokens.js';
import { CURRENT_USER, SALES_REPS, TRANSFER_STATUS, TRANSFER_STATUS_LABELS, TRANSFER_STATUS_COLORS } from '../data.js';
import { formatLongDate } from '../../../../utils/format.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const formatDate = (dateStr) => dateStr ? formatLongDate(dateStr) : '';

export const IncomingTransferCard = ({ request, products, theme, onApprove, onDecline }) => {
    const [declineReason, setDeclineReason] = useState('');
    const [showDeclineInput, setShowDeclineInput] = useState(false);

    const isDark = isDarkTheme(theme);
    const c = theme.colors;
    const tile = fieldTileSurface(theme);
    const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)';

    const product = products.find(p => p.id === request.itemId);
    const fromRep = getRepById(request.fromRepId);
    const toRep = getRepById(request.toRepId);
    const isOutgoing = request.fromRepId === CURRENT_USER.id;
    const statusColor = TRANSFER_STATUS_COLORS[request.status] || c.textSecondary;
    const isPending = request.status === TRANSFER_STATUS.PENDING;

    if (!product) return null;

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                backgroundColor: c.surface,
                border: `1px solid ${isPending && !isOutgoing ? `${c.accent}40` : border}`,
            }}
        >
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(240,237,232,0.8)' }}>
                        <img src={product.img} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h4 className="text-[0.875rem] font-semibold truncate" style={{ color: c.textPrimary }}>{product.name}</h4>
                                <p className="text-[0.6875rem] font-mono mt-0.5" style={{ color: c.textSecondary }}>{product.model}</p>
                            </div>
                            <span
                                className="flex-shrink-0 px-2 py-0.5 rounded-full text-[0.625rem] font-semibold"
                                style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
                            >
                                {TRANSFER_STATUS_LABELS[request.status]}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mt-3 flex items-center gap-2 rounded-xl px-3 py-2.5" style={tile}>
                    <div className="flex-1 min-w-0">
                        <p className="text-[0.625rem] uppercase tracking-wide font-semibold" style={{ color: c.textSecondary, opacity: 0.65 }}>From</p>
                        <p className="text-[0.8125rem] font-medium truncate" style={{ color: c.textPrimary }}>
                            {fromRep?.id === CURRENT_USER.id ? 'You' : fromRep?.name}
                        </p>
                    </div>
                    <ArrowRightLeft className="w-3.5 h-3.5 flex-shrink-0" style={{ color: c.accent, opacity: 0.7 }} aria-hidden="true" />
                    <div className="flex-1 min-w-0 text-right">
                        <p className="text-[0.625rem] uppercase tracking-wide font-semibold" style={{ color: c.textSecondary, opacity: 0.65 }}>To</p>
                        <p className="text-[0.8125rem] font-medium truncate" style={{ color: c.textPrimary }}>
                            {toRep?.id === CURRENT_USER.id ? 'You' : toRep?.name}
                        </p>
                    </div>
                </div>

                <div className="mt-3 space-y-1.5">
                    <div className="flex items-center gap-2 text-[0.75rem]" style={{ color: c.textSecondary }}>
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" aria-hidden="true" />
                        <span>
                            {formatDate(request.desiredStartDate)}
                            {request.desiredEndDate ? ` – ${formatDate(request.desiredEndDate)}` : ''}
                        </span>
                    </div>
                    {request.projectName ? (
                        <p className="text-[0.75rem]" style={{ color: c.textSecondary }}>
                            <span className="font-medium">Project:</span> {request.projectName}
                        </p>
                    ) : null}
                    {request.message ? (
                        <div className="flex items-start gap-2 rounded-xl px-3 py-2.5 mt-1" style={tile}>
                            <MessageSquare className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.6 }} aria-hidden="true" />
                            <p className="text-[0.75rem] leading-relaxed italic" style={{ color: c.textPrimary }}>&ldquo;{request.message}&rdquo;</p>
                        </div>
                    ) : null}
                </div>

                {isPending && !isOutgoing ? (
                    <div className="mt-4">
                        {showDeclineInput ? (
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={declineReason}
                                    onChange={(e) => setDeclineReason(e.target.value)}
                                    placeholder="Reason for declining"
                                    className="flex-1 min-h-[40px] px-3 rounded-xl text-[0.8125rem] outline-none focus-ring"
                                    style={{ ...tile, color: c.textPrimary }}
                                    autoFocus
                                />
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (declineReason.trim()) {
                                            onDecline(request.id, declineReason);
                                            setShowDeclineInput(false);
                                        }
                                    }}
                                    disabled={!declineReason.trim()}
                                    className="px-3.5 rounded-full font-semibold text-[0.75rem] transition-all active:scale-[0.98] disabled:opacity-45 focus-ring"
                                    style={{ backgroundColor: c.error, color: '#fff' }}
                                >
                                    Confirm
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowDeclineInput(false)}
                                    className="px-3 rounded-full font-semibold text-[0.75rem] focus-ring"
                                    style={{ ...tile, color: c.textSecondary }}
                                >
                                    Cancel
                                </button>
                            </div>
                        ) : (
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowDeclineInput(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-full font-semibold text-[0.75rem] transition-all active:scale-[0.98] focus-ring"
                                    style={{ ...tile, color: c.error }}
                                >
                                    <X className="w-3.5 h-3.5" aria-hidden="true" />
                                    Decline
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onApprove(request.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 min-h-[40px] rounded-full font-semibold text-[0.75rem] transition-all active:scale-[0.98] focus-ring"
                                    style={{ backgroundColor: c.success, color: '#fff' }}
                                >
                                    <Check className="w-3.5 h-3.5" aria-hidden="true" />
                                    Approve
                                </button>
                            </div>
                        )}
                    </div>
                ) : null}
            </div>
        </div>
    );
};
