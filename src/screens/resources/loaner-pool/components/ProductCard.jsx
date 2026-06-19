import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { AVAILABILITY_STATUS, STATUS_LABELS, CURRENT_USER, SALES_REPS } from '../data.js';
import { formatLongDate } from '../../../../utils/format.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const formatDate = (dateStr) => dateStr ? formatLongDate(dateStr) : '';

export const ProductCard = React.memo(({ product, theme, isInRequest, onView, onTransfer, onAdd, onRemove }) => {
    const isDark = isDarkTheme(theme);
    const c = theme.colors;
    const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)';
    const imageBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(240,237,232,0.65)';

    const isAvailable = product.status === AVAILABILITY_STATUS.AVAILABLE;
    const isOnLoan = product.status === AVAILABILITY_STATUS.OUT_FOR_LOAN;
    const currentHolder = product.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;
    const canTransfer = isOnLoan && product.transferEligible && product.currentHolderRepId !== CURRENT_USER.id;

    return (
        <div
            onClick={() => onView(product)}
            className="text-left cursor-pointer h-full"
            role="button"
            tabIndex={0}
            aria-label={`View ${product.name} details`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(product); } }}
        >
            <div
                className="rounded-2xl overflow-hidden h-full flex flex-col transition-shadow duration-200"
                style={{
                    backgroundColor: c.surface,
                    border: isInRequest ? `1.5px solid ${c.accent}` : `1px solid ${border}`,
                    boxShadow: isDark ? 'none' : '0 1px 4px rgba(53,53,53,0.05)',
                }}
            >
                <div className="relative aspect-[4/3] overflow-hidden" style={{ backgroundColor: imageBg }}>
                    <img
                        src={product.img}
                        alt={product.name}
                        loading="lazy"
                        className="w-full h-full object-contain p-3"
                    />
                    {!isAvailable ? (
                        <div className="absolute inset-x-0 bottom-0 px-2.5 py-2 bg-gradient-to-t from-black/70 via-black/45 to-transparent">
                            <span className="block text-white text-[0.6875rem] font-semibold leading-tight">
                                {STATUS_LABELS[product.status]}
                            </span>
                            {currentHolder ? (
                                <span className="block text-white/75 text-[0.625rem] mt-0.5">
                                    with {currentHolder.name.split(' ')[0]}
                                </span>
                            ) : null}
                        </div>
                    ) : null}
                </div>

                <div className="p-3 flex flex-col flex-1 gap-2.5">
                    <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-[0.875rem] leading-tight truncate" style={{ color: c.textPrimary }}>
                            {product.name}
                        </h3>
                        <p className="text-[0.6875rem] font-mono mt-0.5 truncate" style={{ color: c.textSecondary, opacity: 0.8 }}>
                            {product.model}
                        </p>
                        {product.returnDate && !isAvailable ? (
                            <p className="text-[0.625rem] mt-1" style={{ color: c.textSecondary, opacity: 0.72 }}>
                                Available {formatDate(product.returnDate)}
                            </p>
                        ) : null}
                    </div>

                    <div className="space-y-1.5">
                        {canTransfer ? (
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onTransfer(product); }}
                                className="w-full flex items-center justify-center gap-1.5 min-h-[36px] px-3 rounded-full font-semibold text-[0.6875rem] transition-all active:scale-[0.98] focus-ring"
                                style={{
                                    backgroundColor: isDark ? 'rgba(91,123,140,0.18)' : `${c.info}14`,
                                    color: c.info,
                                    border: `1px solid ${isDark ? 'rgba(91,123,140,0.28)' : `${c.info}30`}`,
                                }}
                            >
                                <ArrowRightLeft className="w-3.5 h-3.5" aria-hidden="true" />
                                Request Transfer
                            </button>
                        ) : null}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isInRequest) onRemove(product.id);
                                else if (isAvailable) onAdd(e, product);
                            }}
                            disabled={!isAvailable && !isInRequest}
                            className="w-full flex items-center justify-center min-h-[36px] px-3 rounded-full font-semibold text-[0.6875rem] transition-all active:scale-[0.98] focus-ring disabled:opacity-45 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: isInRequest
                                    ? `${c.success}18`
                                    : (isAvailable ? c.accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)')),
                                color: isInRequest ? c.success : (isAvailable ? (c.accentText || '#FFFFFF') : c.textSecondary),
                                border: isInRequest ? `1px solid ${c.success}40` : 'none',
                            }}
                        >
                            {isInRequest ? 'Added · tap to remove' : (isAvailable ? 'Add to Request' : 'Unavailable')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
ProductCard.displayName = 'ProductCard';
