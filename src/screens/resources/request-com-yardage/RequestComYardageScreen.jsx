import React, { useState, useMemo, useRef } from 'react';
import { SearchableSelect } from '../../../components/forms/SearchableSelect.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { PrimaryButton } from '../../../components/common/JSIButtons.jsx';
import { AppScreenLayout } from '../../../components/common/AppScreenLayout.jsx';
import { FloatingSubmitCTA } from '../../../components/common/FloatingSubmitCTA.jsx';
import { X, Plus, Minus, Trash2, Scissors } from 'lucide-react';
import { FABRICS_DATA, JSI_MODELS } from '../../products/data.js';
import { hapticSuccess } from '../../../utils/haptics.js';
import { validateWebhookUrl } from '../../../utils/secureWebhook.js';
import { cardSurface, subtleBorder, isDarkTheme } from '../../../design-system/tokens.js';

/* Inline editable qty — tap the number to type directly (opens numpad on mobile) */
const QtyValue = ({ value, onChange, theme }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef(null);

    const commit = () => {
        setEditing(false);
        const n = parseInt(inputRef.current?.value, 10);
        if (n && n >= 1) onChange(n);
    };

    if (editing) {
        return (
            <input
                ref={el => { inputRef.current = el; el?.focus(); el?.select(); }}
                type="number"
                inputMode="numeric"
                pattern="[0-9]*"
                min={1}
                defaultValue={value}
                onBlur={commit}
                onKeyDown={e => e.key === 'Enter' && commit()}
                className="w-10 text-center text-sm font-semibold tabular-nums bg-transparent outline-none rounded"
                style={{ color: theme.colors.textPrimary, WebkitAppearance: 'none', MozAppearance: 'textfield' }}
            />
        );
    }
    return (
        <button
            onClick={() => setEditing(true)}
            className="w-10 text-center text-sm font-semibold tabular-nums cursor-text select-none"
            style={{ color: theme.colors.textPrimary }}
            aria-label="Edit quantity"
        >
            {value}
        </button>
    );
};

export const RequestComYardageScreen = ({ theme, showAlert, onNavigate, userSettings }) => {
    const [selectedItems, setSelectedItems] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const dark = isDarkTheme(theme);

    const modelOptions = useMemo(() => JSI_MODELS.filter(m => m.isUpholstered).map(m => ({ value: m.id, label: `${m.name} (${m.id})` })), []);
    const fabricOptions = useMemo(() => FABRICS_DATA.map(f => ({ value: `${f.supplier}, ${f.pattern}`, label: `${f.supplier}, ${f.pattern}` })), []);

    const addFabric = (fabricValue) => {
        if (!fabricValue) return;
        const key = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
        setSelectedItems(prev => [...prev, { key, fabric: fabricValue, modelId: '', modelName: '', quantity: 1 }]);
    };

    const updateItem = (key, patch) => setSelectedItems(prev => prev.map(it => it.key === key ? { ...it, ...patch } : it));
    const removeItem = (key) => setSelectedItems(prev => prev.filter(it => it.key !== key));

    const canSubmit = selectedItems.length > 0 && selectedItems.every(i => i.modelId && i.fabric);

    const handleSubmit = () => {
        if (!canSubmit) return;
        const invalid = selectedItems.some(i => !i.quantity || i.quantity < 1);
        if (invalid) return showAlert('Please complete all fields for each line.');
        setShowConfirm(true);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        const url = validateWebhookUrl(import.meta.env.VITE_POWER_AUTOMATE_URL, 'VITE_POWER_AUTOMATE_URL');
        if (!url) { showAlert('Not configured.'); setIsSubmitting(false); return; }
        const payload = {
            requester: userSettings?.email || 'unknown@example.com',
            models: selectedItems.map(i => ({ name: i.modelName, modelId: i.modelId, quantity: i.quantity, fabric: i.fabric }))
        };
        try {
            const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            if ([200, 201, 202].includes(res.status)) {
                hapticSuccess();
                showAlert('Submitted successfully.');
                setSelectedItems([]);
                setShowConfirm(false);
                onNavigate('resources');
            } else showAlert('Server error submitting.');
        } catch { showAlert('Network error.'); } finally { setIsSubmitting(false); }
    };

    const itemCount = selectedItems.length;
    const card = cardSurface(theme);
    const bdr = subtleBorder(theme);

    // Frosted glass style for the search pill — matches StandardSearchBar / SearchInput
    const frostedPill = {
        backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)',
        border: dark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(255,255,255,0.80)',
        boxShadow: dark ? '0 2px 10px rgba(0,0,0,0.25)' : '0 2px 10px rgba(53,53,53,0.08)',
        backdropFilter: 'blur(12px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(12px) saturate(1.4)',
    };

    return (
        <>
            <AppScreenLayout
                theme={theme}
                title="COM Yardage"
                subtitle="Add fabric patterns, assign models, and submit one combined yardage request."
                maxWidthClass="max-w-2xl"
                horizontalPaddingClass="px-4 sm:px-6"
                contentPaddingBottomClass="pb-6"
                contentClassName="pt-1"
                footer={(
                    <FloatingSubmitCTA
                        theme={theme}
                        onClick={handleSubmit}
                        visible={canSubmit}
                        label={`Submit Request${itemCount > 1 ? ` (${itemCount})` : ''}`}
                    />
                )}
            >

                    {/* Fabric search — frosted glass pill matching app search bars */}
                    <div className="pb-5">
                        <SearchableSelect
                            theme={theme}
                            placeholder="Search fabric pattern…"
                            options={fabricOptions}
                            value=""
                            onChange={addFabric}
                            size="md"
                            inlineSearch
                            leadingIndicator
                            buttonStyle={frostedPill}
                            inputStyle={frostedPill}
                            buttonClassName="h-[52px]"
                            inputClassName="h-[52px]"
                            missingActionLabel="Fabric not listed? Send for testing"
                            onMissingAction={() => onNavigate && onNavigate('resources/comcol-request')}
                        />
                    </div>

                    {/* Empty state */}
                    {itemCount === 0 && (
                        <div className="flex flex-col items-center justify-center pt-8 pb-16 px-6">
                            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                                style={{ backgroundColor: `${theme.colors.accent}15` }}>
                                <Scissors className="w-10 h-10" style={{ color: theme.colors.accent }} />
                            </div>
                            <h3 className="font-bold text-[1.375rem] mb-2" style={{ color: theme.colors.textPrimary }}>
                                Request COM Yardage
                            </h3>
                            <p className="text-[0.8125rem] text-center max-w-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                                Search for a fabric pattern above to get started. You'll assign models and quantities to each line before submitting.
                            </p>
                        </div>
                    )}

                    {/* Line items */}
                    {itemCount > 0 && (
                        <div className="space-y-2.5 pb-28">
                            {selectedItems.map((item) => (
                                <div key={item.key} className="rounded-[24px] p-4" style={card}>
                                    {/* Fabric name + remove */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <p className="flex-1 text-[0.9375rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                            {item.fabric}
                                        </p>
                                        <button
                                            onClick={() => removeItem(item.key)}
                                            className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 active:scale-90 transition-transform"
                                            style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}
                                            aria-label="Remove line"
                                        >
                                            <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                        </button>
                                    </div>

                                    {/* Model select + quantity stepper */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 min-w-0 relative" style={{ zIndex: 1 }}>
                                            <SearchableSelect
                                                theme={theme}
                                                placeholder="Select model…"
                                                options={modelOptions}
                                                value={item.modelId}
                                                onChange={(v) => {
                                                    const model = JSI_MODELS.find(m => m.id === v);
                                                    updateItem(item.key, { modelId: v, modelName: model?.name || '' });
                                                }}
                                                size="sm"
                                                allowClear
                                                searchPlaceholder="Search model…"
                                            />
                                        </div>
                                        {/* Quantity stepper */}
                                        <div className="flex items-center rounded-full flex-shrink-0" style={{ border: bdr }}>
                                            <button
                                                onClick={() => {
                                                    if (item.quantity <= 1) removeItem(item.key);
                                                    else updateItem(item.key, { quantity: item.quantity - 1 });
                                                }}
                                                className="w-9 h-9 flex items-center justify-center rounded-l-full active:scale-90 transition-transform"
                                                aria-label={item.quantity <= 1 ? 'Remove item' : 'Decrease quantity'}
                                            >
                                                {item.quantity <= 1
                                                    ? <Trash2 className="w-3.5 h-3.5" style={{ color: theme.colors.error }} />
                                                    : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                }
                                            </button>
                                            <QtyValue value={item.quantity} onChange={(n) => updateItem(item.key, { quantity: n })} theme={theme} />
                                            <button
                                                onClick={() => updateItem(item.key, { quantity: item.quantity + 1 })}
                                                className="w-9 h-9 flex items-center justify-center rounded-r-full active:scale-90 transition-transform"
                                                aria-label="Increase quantity"
                                            >
                                                <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
            </AppScreenLayout>

            {/* Confirmation modal */}
            <Modal show={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Request" theme={theme}>
                <div>
                    <div className="space-y-0 mb-5">
                        {selectedItems.map((item, idx) => (
                            <div key={item.key}
                                className="flex items-center gap-3 py-3"
                                style={{ borderBottom: idx < selectedItems.length - 1 ? bdr : 'none' }}>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[0.9375rem] truncate" style={{ color: theme.colors.textPrimary }}>
                                        {item.modelName || 'No model'}
                                    </p>
                                    <p className="text-xs truncate mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                        {item.fabric}
                                    </p>
                                </div>
                                <span className="text-xs font-bold px-2 py-0.5 rounded-full tabular-nums"
                                    style={{ backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent }}>
                                    ×{item.quantity}
                                </span>
                            </div>
                        ))}
                    </div>
                    <PrimaryButton onClick={handleFinalSubmit} disabled={isSubmitting} theme={theme} fullWidth>
                        {isSubmitting ? 'Submitting…' : 'Confirm & Send'}
                    </PrimaryButton>
                </div>
            </Modal>
        </>
    );
};