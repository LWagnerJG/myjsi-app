import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { AVAILABILITY_STATUS, STATUS_LABELS, CURRENT_USER, SALES_REPS } from '../data.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ProductCard = React.memo(({ product, theme, isInRequest, onView, onTransfer, onAdd, onRemove }) => {
    const isAvailable = product.status === AVAILABILITY_STATUS.AVAILABLE;
    const isOnLoan = product.status === AVAILABILITY_STATUS.OUT_FOR_LOAN;
    const currentHolder = product.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;
    const canTransfer = isOnLoan && product.transferEligible && product.currentHolderRepId !== CURRENT_USER.id;

    return (
        <div
            onClick={() => onView(product)}
            className="text-left cursor-pointer"
            role="button"
            tabIndex={0}
            aria-label={`View ${product.name} details`}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onView(product); } }}
        >
            <div className="rounded-2xl shadow-md overflow-hidden h-full flex flex-col" style={{ backgroundColor: theme.colors.surface }}>
                <div className="w-full h-40 relative" style={{ backgroundColor: theme.colors.subtle || `${theme.colors.border}40` }}>
                    <img src={product.img} alt={product.name} className="w-full h-full object-cover" />
                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center p-2">
                            <span className="text-white font-bold text-sm text-center">{STATUS_LABELS[product.status]}</span>
                            {currentHolder && (
                                <span className="text-white/80 text-xs mt-1 text-center">
                                    with {currentHolder.name.split(' ')[0]}
                                </span>
                            )}
                        </div>
                    )}
                </div>
                <div className="p-3 flex flex-col flex-1">
                    <div className="flex-1 mb-3">
                        <h3 className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{product.name}</h3>
                        <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>Model: {product.model}</p>
                        {product.returnDate && !isAvailable && (
                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                Available: {formatDate(product.returnDate)}
                            </p>
                        )}
                    </div>
                    <div className="space-y-2">
                        {canTransfer && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onTransfer(product); }}
                                className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95"
                                style={{ backgroundColor: theme.colors.info, color: theme.colors.accentText }}
                            >
                                <ArrowRightLeft className="w-4 h-4" />
                                Request Transfer
                            </button>
                        )}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (isInRequest) onRemove(product.id);
                                else if (isAvailable) onAdd(e, product);
                            }}
                            disabled={!isAvailable && !isInRequest}
                            className="w-full flex items-center justify-center px-3 py-1.5 rounded-full font-semibold text-xs transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                                backgroundColor: isInRequest ? theme.colors.success : (isAvailable ? theme.colors.accent : theme.colors.subtle),
                                color: isInRequest || isAvailable ? theme.colors.accentText : theme.colors.textSecondary
                            }}
                        >
                            {isInRequest ? 'Added to Request' : (isAvailable ? 'Add to Request' : 'Unavailable')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});
ProductCard.displayName = 'ProductCard';
