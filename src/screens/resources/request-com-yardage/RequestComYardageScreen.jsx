import React, { useState, useMemo, useRef } from 'react';
import { SearchableSelect } from '../../../components/forms/SearchableSelect.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { FrostButton, PrimaryButton } from '../../../components/common/JSIButtons.jsx';
import { X, Plus, Minus, Trash2 } from 'lucide-react';
import { FABRICS_DATA, JSI_MODELS } from '../../products/data.js';
import { hapticSuccess } from '../../../utils/haptics.js';

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
        const url = import.meta.env.VITE_POWER_AUTOMATE_URL;
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

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ background: theme.colors.background }}>
            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="max-w-2xl mx-auto w-full px-4 sm:px-6 pb-32">

                    {/* Search bar to add fabrics */}
                    <div className="pt-2 pb-5 sticky top-0 z-10" style={{ background: theme.colors.background }}>
                        <SearchableSelect
                            theme={theme}
                            placeholder="Add a fabric pattern..."
                            options={fabricOptions}
                            value=""
                            onChange={addFabric}
                            size="md"
                            searchPlaceholder="Search supplier or pattern..."
                            missingActionLabel="Fabric not listed? Send it for testing"
                            onMissingAction={() => onNavigate && onNavigate('resources/comcol-request')}
                        />
                    </div>

                    {/* Empty state */}
                    {itemCount === 0 && (
                        <div className="text-center py-16 px-4">
                            <p className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                                Search above to add a fabric, then assign models and quantities.
                            </p>
                        </div>
                    )}

                    {/* Line items */}
                    {itemCount > 0 && (
                        <div className="space-y-3">
                            {selectedItems.map((item) => (
                                <div
                                    key={item.key}
                                    className="rounded-card p-4"
                                    style={{
                                        background: theme.colors.surface,
                                        border: `1px solid ${theme.colors.border}`,
                                    }}
                                >
                                    {/* Row 1: Fabric name + X remove */}
                                    <div className="flex items-center gap-2 mb-3">
                                        <p className="flex-1 text-sm font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                            {item.fabric}
                                        </p>
                                        <button
                                            onClick={() => removeItem(item.key)}
                                            className="w-7 h-7 flex items-center justify-center rounded-full flex-shrink-0 active:scale-90 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                                            aria-label="Remove line"
                                        >
                                            <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                        </button>
                                    </div>

                                    {/* Row 2: Model select + quantity stepper */}
                                    <div className="flex items-end gap-3">
                                        <div className="flex-1 min-w-0 relative" style={{ zIndex: 1 }}>
                                            <SearchableSelect
                                                theme={theme}
                                                placeholder="Select model..."
                                                options={modelOptions}
                                                value={item.modelId}
                                                onChange={(v) => {
                                                    const model = JSI_MODELS.find(m => m.id === v);
                                                    updateItem(item.key, { modelId: v, modelName: model?.name || '' });
                                                }}
                                                size="sm"
                                                allowClear
                                                searchPlaceholder="Search model..."
                                            />
                                        </div>
                                        {/* Quantity stepper — trash icon replaces minus at qty 1 */}
                                        <div className="flex items-center gap-0 rounded-full flex-shrink-0" style={{ border: `1px solid ${theme.colors.border}` }}>
                                            <button
                                                onClick={() => {
                                                    if (item.quantity <= 1) removeItem(item.key);
                                                    else updateItem(item.key, { quantity: item.quantity - 1 });
                                                }}
                                                className="w-9 h-9 flex items-center justify-center rounded-l-full active:scale-90 transition-all hover:bg-black/5 dark:hover:bg-white/5"
                                                aria-label={item.quantity <= 1 ? 'Remove item' : 'Decrease quantity'}
                                            >
                                                {item.quantity <= 1
                                                    ? <Trash2 className="w-3.5 h-3.5" style={{ color: '#B85C5C' }} />
                                                    : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                                }
                                            </button>
                                            <QtyValue
                                                value={item.quantity}
                                                onChange={(n) => updateItem(item.key, { quantity: n })}
                                                theme={theme}
                                            />
                                            <button
                                                onClick={() => updateItem(item.key, { quantity: item.quantity + 1 })}
                                                className="w-9 h-9 flex items-center justify-center rounded-r-full active:scale-90 transition-all hover:bg-black/5 dark:hover:bg-white/5"
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
                </div>
            </div>

            {/* Sticky frost-glass submit bar at bottom */}
            <div
                className="flex-shrink-0 px-4 sm:px-6 pb-5 pt-3"
                style={{
                    background: 'linear-gradient(to top, rgba(240,237,232,1) 60%, rgba(240,237,232,0))',
                }}
            >
                <div className="max-w-2xl mx-auto">
                    <FrostButton
                        onClick={handleSubmit}
                        disabled={!canSubmit}
                        variant="dark"
                        size="large"
                        className="w-full"
                    >
                        {itemCount === 0 ? 'Submit Request' : `Submit Request${itemCount > 1 ? ` (${itemCount})` : ''}`}
                    </FrostButton>
                </div>
            </div>

            {/* Confirmation modal */}
            <Modal show={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Request" theme={theme}>
                <div>
                    <p className="text-[11px] font-semibold tracking-widest uppercase mb-3" style={{ color: theme.colors.textSecondary }}>
                        ITEMS TO SUBMIT
                    </p>
                    <div className="space-y-2 mb-5">
                        {selectedItems.map((item, idx) => (
                            <div
                                key={item.key}
                                className="flex items-baseline gap-3 text-sm py-2"
                                style={{ borderBottom: idx < selectedItems.length - 1 ? `1px solid ${theme.colors.border}` : 'none' }}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{item.modelName}</p>
                                    <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>{item.fabric}</p>
                                </div>
                                <span className="text-xs font-medium flex-shrink-0 tabular-nums" style={{ color: theme.colors.textSecondary }}>
                                    {item.quantity}x
                                </span>
                            </div>
                        ))}
                    </div>
                    <PrimaryButton onClick={handleFinalSubmit} disabled={isSubmitting} theme={theme} fullWidth>
                        {isSubmitting ? 'Submitting...' : 'Confirm and Send'}
                    </PrimaryButton>
                </div>
            </Modal>
        </div>
    );
};