import React from 'react';
import { User, Calendar, ArrowRightLeft } from 'lucide-react';
import { Modal } from '../../../../components/common/Modal.jsx';
import { AVAILABILITY_STATUS, STATUS_LABELS, STATUS_COLORS, CURRENT_USER, SALES_REPS } from './data.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const ProductDetailModal = React.memo(({ product, theme, onClose, onTransfer }) => {
    const currentHolder = product?.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;
    const canTransfer = product?.status === AVAILABILITY_STATUS.OUT_FOR_LOAN &&
                      product?.transferEligible &&
                      product?.currentHolderRepId !== CURRENT_USER.id;

    return (
        <Modal show={!!product} onClose={onClose} title="" theme={theme}>
            {product && (
                <div>
                    <div className="mb-4">
                        <h3 className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{product.name}</h3>
                        <p className="text-sm font-mono" style={{ color: theme.colors.textSecondary }}>Model: {product.model}</p>
                        <div className="mt-2">
                            <span
                                className="inline-block px-2 py-1 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: STATUS_COLORS[product.status] + '20', color: STATUS_COLORS[product.status] }}
                            >
                                {STATUS_LABELS[product.status]}
                            </span>
                        </div>
                    </div>
                    <img src={product.img} alt={product.name} className="w-full h-48 object-cover rounded-lg mb-4" />
                    {currentHolder && (
                        <div className="mb-4 p-3 rounded-xl" style={{ backgroundColor: theme.colors.subtle || `${theme.colors.border}20` }}>
                            <div className="flex items-center gap-2 mb-2">
                                <User className="w-4 h-4" style={{ color: theme.colors.accent }} />
                                <span className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                    Currently with {currentHolder.name}
                                </span>
                            </div>
                            <p className="text-xs" style={{ color: theme.colors.textSecondary }}>
                                {currentHolder.region} Region &bull; {currentHolder.email}
                            </p>
                            {product.projectName && (
                                <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                    Project: {product.projectName}
                                </p>
                            )}
                            {product.returnDate && (
                                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: theme.colors.accent }}>
                                    <Calendar className="w-3 h-3" />
                                    <span>Expected available: {formatDate(product.returnDate)}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <h4 className="font-bold mb-2" style={{ color: theme.colors.textPrimary }}>Specifications</h4>
                    <div className="space-y-1 text-sm">
                        {Object.entries(product.specs).map(([key, value]) => (
                            <div key={key} className="flex">
                                <span className="font-medium w-24 flex-shrink-0 capitalize" style={{ color: theme.colors.textSecondary }}>{key}:</span>
                                <span style={{ color: theme.colors.textPrimary }}>{value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-4 space-y-1 text-sm">
                        <div className="flex">
                            <span className="font-medium w-24 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>Location:</span>
                            <span style={{ color: theme.colors.textPrimary }}>{product.location}</span>
                        </div>
                        {product.estimatedReturn && (
                            <div className="flex">
                                <span className="font-medium w-24 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>Est. Return:</span>
                                <span style={{ color: theme.colors.textPrimary }}>{product.estimatedReturn}</span>
                            </div>
                        )}
                    </div>
                    {canTransfer && (
                        <button
                            onClick={() => { onClose(); onTransfer(product); }}
                            className="w-full mt-4 flex items-center justify-center gap-2 py-3 px-4 rounded-full font-bold transition-all active:scale-95"
                            style={{ backgroundColor: theme.colors.info, color: theme.colors.accentText }}
                        >
                            <ArrowRightLeft className="w-5 h-5" />
                            Request Transfer from {currentHolder?.name?.split(' ')[0]}
                        </button>
                    )}
                </div>
            )}
        </Modal>
    );
});
ProductDetailModal.displayName = 'ProductDetailModal';
