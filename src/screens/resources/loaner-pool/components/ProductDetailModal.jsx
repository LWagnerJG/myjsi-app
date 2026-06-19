import React from 'react';
import { User, Calendar, ArrowRightLeft, Plus, Check } from 'lucide-react';
import { Modal } from '../../../../components/common/Modal.jsx';
import { PrimaryButton } from '../../../../components/common/JSIButtons.jsx';
import { isDarkTheme, fieldTileSurface } from '../../../../design-system/tokens.js';
import { AVAILABILITY_STATUS, STATUS_LABELS, STATUS_COLORS, CURRENT_USER, SALES_REPS } from '../data.js';
import { formatLongDate } from '../../../../utils/format.js';

const getRepById = (repId) => SALES_REPS.find(r => r.id === repId);
const formatDate = (dateStr) => dateStr ? formatLongDate(dateStr) : '';

export const ProductDetailModal = React.memo(({
    product,
    theme,
    onClose,
    onTransfer,
    isInRequest = false,
    onAdd,
    onRemove,
}) => {
    const isDark = isDarkTheme(theme);
    const c = theme.colors;
    const imageBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(240,237,232,0.65)';

    if (!product) return null;

    const currentHolder = product.currentHolderRepId ? getRepById(product.currentHolderRepId) : null;
    const isAvailable = product.status === AVAILABILITY_STATUS.AVAILABLE;
    const canTransfer = product.status === AVAILABILITY_STATUS.OUT_FOR_LOAN
        && product.transferEligible
        && product.currentHolderRepId !== CURRENT_USER.id;
    const statusColor = STATUS_COLORS[product.status] || c.textSecondary;

    const handlePrimaryAction = (e) => {
        e.preventDefault();
        if (isInRequest) {
            onRemove?.(product.id);
        } else if (isAvailable) {
            onAdd?.(e, product);
        }
    };

    return (
        <Modal
            show={!!product}
            onClose={onClose}
            title={product.name}
            theme={theme}
            maxWidth="max-w-lg"
        >
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.75rem] font-mono" style={{ color: c.textSecondary }}>{product.model}</p>
                    <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold"
                        style={{ backgroundColor: `${statusColor}18`, color: statusColor }}
                    >
                        {STATUS_LABELS[product.status]}
                    </span>
                </div>

                <div className="rounded-2xl overflow-hidden aspect-[16/10]" style={{ backgroundColor: imageBg }}>
                    <img
                        src={product.img}
                        alt={product.name}
                        className="w-full h-full object-contain p-4"
                    />
                </div>

                {currentHolder ? (
                    <div className="rounded-2xl px-3.5 py-3" style={fieldTileSurface(theme)}>
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4 flex-shrink-0" style={{ color: c.accent }} aria-hidden="true" />
                            <span className="text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>
                                With {currentHolder.name}
                            </span>
                        </div>
                        <p className="text-[0.6875rem] mt-1 ml-6" style={{ color: c.textSecondary }}>
                            {currentHolder.region} · {currentHolder.email}
                        </p>
                        {product.projectName ? (
                            <p className="text-[0.6875rem] mt-1 ml-6" style={{ color: c.textSecondary }}>
                                Project: {product.projectName}
                            </p>
                        ) : null}
                        {product.returnDate ? (
                            <div className="flex items-center gap-1.5 mt-2 ml-6 text-[0.6875rem] font-medium" style={{ color: c.accent }}>
                                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                                Available {formatDate(product.returnDate)}
                            </div>
                        ) : null}
                    </div>
                ) : null}

                <div>
                    <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: c.textSecondary, opacity: 0.7 }}>
                        Specifications
                    </p>
                    <div className="space-y-1.5">
                        {Object.entries(product.specs).map(([key, value]) => (
                            <div key={key} className="flex gap-3 text-[0.8125rem]">
                                <span className="w-20 flex-shrink-0 capitalize" style={{ color: c.textSecondary, opacity: 0.8 }}>{key}</span>
                                <span className="flex-1" style={{ color: c.textPrimary }}>{value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="text-[0.8125rem] flex gap-3">
                    <span className="w-20 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.8 }}>Location</span>
                    <span style={{ color: c.textPrimary }}>{product.location}</span>
                </div>

                <div className="pt-1 space-y-2">
                    {(isAvailable || isInRequest) ? (
                        isInRequest ? (
                            <button
                                type="button"
                                onClick={handlePrimaryAction}
                                className="w-full flex items-center justify-center gap-2 min-h-[44px] rounded-full font-semibold text-[0.8125rem] transition-all active:scale-[0.98] focus-ring"
                                style={{
                                    backgroundColor: `${c.success}18`,
                                    color: c.success,
                                    border: `1px solid ${c.success}40`,
                                }}
                            >
                                <Check className="w-4 h-4" aria-hidden="true" />
                                Added · tap to remove
                            </button>
                        ) : (
                            <PrimaryButton
                                type="button"
                                onClick={handlePrimaryAction}
                                theme={theme}
                                fullWidth
                                icon={<Plus className="w-4 h-4" />}
                                className="h-11 !py-0"
                            >
                                Add to Request
                            </PrimaryButton>
                        )
                    ) : null}

                    {canTransfer ? (
                        <button
                            type="button"
                            onClick={() => { onClose(); onTransfer(product); }}
                            className="w-full flex items-center justify-center gap-2 min-h-[44px] px-4 rounded-full font-semibold text-[0.8125rem] transition-all active:scale-[0.98] focus-ring"
                            style={{
                                backgroundColor: isDark ? 'rgba(91,123,140,0.18)' : `${c.info}14`,
                                color: c.info,
                                border: `1px solid ${isDark ? 'rgba(91,123,140,0.28)' : `${c.info}30`}`,
                            }}
                        >
                            <ArrowRightLeft className="w-4 h-4" aria-hidden="true" />
                            Request transfer from {currentHolder?.name?.split(' ')[0]}
                        </button>
                    ) : null}
                </div>
            </div>
        </Modal>
    );
});
ProductDetailModal.displayName = 'ProductDetailModal';
