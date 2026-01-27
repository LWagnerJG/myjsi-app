import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { SearchableSelect } from '../../../components/forms/SearchableSelect.jsx';
import { Modal } from '../../../components/common/Modal.jsx';
import { PrimaryButton } from '../../../components/common/JSIButtons.jsx';
import { Trash2 } from 'lucide-react';
import { FABRICS_DATA, JSI_MODELS } from '../../products/data.js';

export const RequestComYardageScreen = ({ theme, showAlert, onNavigate, userSettings }) => {
    const [selectedItems, setSelectedItems] = useState([]); // items: {key, modelId, modelName, fabric, quantity}
    const [showConfirm, setShowConfirm] = useState(false);
    const [summary, setSummary] = useState('');
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

    const handleSubmit = () => {
        if (selectedItems.length === 0) return;
        const invalid = selectedItems.some(i => !i.fabric || !i.modelId || !i.quantity || i.quantity < 1);
        if (invalid) return showAlert('Please complete fabric, model, and quantity for each line.');
        const list = selectedItems.map(i => `${i.modelName} (${i.quantity}x) - ${i.fabric}`).join('\n');
        setSummary(list);
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
            if ([200,201,202].includes(res.status)) {
                showAlert('Submitted successfully.');
                setSelectedItems([]);
                setShowConfirm(false);
                onNavigate('resources');
            } else showAlert('Server error submitting.');
        } catch { showAlert('Network error.'); } finally { setIsSubmitting(false); }
    };

    return (
        <div className="flex flex-col h-full" style={{ background: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pt-5 pb-6 space-y-6">
                {/* Fabric add pill */}
                <div>
                    <SearchableSelect
                        theme={theme}
                        placeholder="Add fabric pattern..."
                        options={fabricOptions}
                        value=""
                        onChange={addFabric}
                        size="md"
                        searchPlaceholder="Search fabric pattern..."
                        missingActionLabel="If your fabric isn't here, you can send it in for testing"
                        onMissingAction={() => onNavigate && onNavigate('resources/comcol-request')}
                    />
                </div>

                <div className="space-y-4">
                    {selectedItems.map(item => (
                        <GlassCard key={item.key} theme={theme} className="p-4 space-y-4" style={{ background: theme.colors.surface }}>
                            {/* Fabric header */}
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-sm truncate pr-4" style={{ color: theme.colors.textPrimary }}>{item.fabric}</p>
                                {/* Delete now inline with rest row via next section on small screens; keep hidden here for accessibility */}
                            </div>
                            {/* Model + Qty Row */}
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-4">
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
                                        searchPlaceholder="Search model number..."
                                    />
                                </div>
                                <div className="flex items-end gap-3">
                                    <button
                                        onClick={() => removeItem(item.key)}
                                        className="w-10 h-10 flex items-center justify-center rounded-full border flex-shrink-0 hover:bg-red-500/10 active:scale-95 transition"
                                        style={{ borderColor: theme.colors.border }}
                                        aria-label="Remove line"
                                    >
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </button>
                                    <div className="w-24">
                                        <label className="text-[11px] font-medium tracking-wide mb-1 block" style={{ color: theme.colors.textSecondary }}>Quantity</label>
                                        <input
                                            type="number"
                                            min={1}
                                            value={item.quantity}
                                            onChange={e => updateItem(item.key, { quantity: Math.max(1, parseInt(e.target.value,10) || 1) })}
                                            className="w-full px-3 py-2 rounded-full border text-sm text-center"
                                            style={{ background: theme.colors.subtle, borderColor: theme.colors.border, color: theme.colors.textPrimary }}
                                            aria-label="Quantity"
                                        />
                                    </div>
                                </div>
                            </div>
                        </GlassCard>
                    ))}
                </div>

                <PrimaryButton
                    onClick={handleSubmit}
                    disabled={selectedItems.length === 0 || selectedItems.some(i => !i.modelId || !i.fabric)}
                    theme={theme}
                    size="large"
                    fullWidth
                >
                    Submit Request
                </PrimaryButton>
            </div>

            <Modal show={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Submission" theme={theme}>
                <div>
                    <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>The following request will be sent:</p>
                    <pre className="text-sm whitespace-pre-wrap p-3 rounded-xl mb-4" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}>{summary}</pre>
                    <PrimaryButton onClick={handleFinalSubmit} disabled={isSubmitting} theme={theme} fullWidth>{isSubmitting ? 'Submitting...' : 'Confirm and Send'}</PrimaryButton>
                </div>
            </Modal>
        </div>
    );
};