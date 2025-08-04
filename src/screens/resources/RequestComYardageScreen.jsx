import React, { useState, useMemo } from 'react';
import { PageTitle } from '../../components/common/PageTitle.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { Modal } from '../../components/common/Modal.jsx';
import { Trash2 } from 'lucide-react';
import * as Data from '../../data';

export const RequestComYardageScreen = ({ theme, showAlert, onNavigate, userSettings }) => {
    const [selectedModels, setSelectedModels] = useState([]);
    const [showConfirm, setShowConfirm] = useState(false);
    const [summary, setSummary] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fabricStrings = useMemo(() =>
        Data.FABRICS_DATA.map(f => `${f.supplier}, ${f.pattern}`), []);

    const modelOptions = useMemo(() =>
        Data.JSI_MODELS.filter(m => m.isUpholstered)
            .map(m => `${m.name} (${m.id})`), []);

    const addModel = rawVal => {
        if (!rawVal) return;
        const match = rawVal.match(/\(([^)]+)\)/);
        const modelId = match ? match[1] : rawVal.trim();
        const model = Data.JSI_MODELS.find(m => m.id === modelId);
        if (!model) return;
        const key = `${modelId}_${Date.now()}`;
        setSelectedModels(prev => [...prev, { ...model, quantity: 1, fabric: '', fabricSearch: '', showFabricSearch: false, key }]);
    };

    const updateModel = (key, updates) =>
        setSelectedModels(prev =>
            prev.map(m => (m.key === key ? { ...m, ...updates } : m)));

    const removeModel = key =>
        setSelectedModels(prev => prev.filter(m => m.key !== key));

    const handleSubmit = () => {
        const incomplete = selectedModels.some(m => !m.fabric.trim() || m.quantity < 1);
        if (incomplete) return showAlert('Please ensure all models have a fabric and a quantity greater than 0.');
        const list = selectedModels
            .map(m => `${m.name} (${m.quantity}x) – ${m.fabric}`)
            .join('\n');
        setSummary(list);
        setShowConfirm(true);
    };

    const handleFinalSubmit = async () => {
        setIsSubmitting(true);
        const powerAutomateURL = import.meta.env.VITE_POWER_AUTOMATE_URL;

        if (!powerAutomateURL) {
            console.error("VITE_POWER_AUTOMATE_URL is not defined. Please check your environment variables.");
            showAlert("Application is not configured correctly. Please contact support.");
            setIsSubmitting(false);
            return;
        }

        const payload = {
            requester: userSettings?.email || 'unknown@example.com',
            models: selectedModels.map(m => ({
                name: m.name,
                quantity: m.quantity,
                fabric: m.fabric,
            }))
        };

        try {
            console.log('Submitting COM Yardage Request:', payload);
            console.log('Using Power Automate URL:', powerAutomateURL);
            
            const response = await fetch(powerAutomateURL, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(payload),
            });

            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);

            // Handle authentication errors specifically
            if (response.status === 401) {
                const errorText = await response.text();
                console.error('Authentication error:', errorText);
                throw new Error('Authentication failed. Please check that you are using the correct Power Automate URL with anonymous access enabled.');
            }

            // Many Power Automate flows return 202 (Accepted) instead of 200
            if (response.status === 200 || response.status === 201 || response.status === 202) {
                showAlert('COM Yardage Request Submitted Successfully!');
                setShowConfirm(false);
                setSelectedModels([]); // Clear the form
                onNavigate('resources');
            } else {
                const errorText = await response.text();
                console.error('Server error response:', errorText);
                throw new Error(`Server responded with status ${response.status}: ${response.statusText}`);
            }

        } catch (error) {
            console.error('Submission failed:', error);
            
            // Check if it's a network error vs server error
            if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
                showAlert('Network error. Please check your connection and try again.');
            } else if (error.message.includes('Authentication failed')) {
                showAlert('Authentication error. Please verify the Power Automate URL is configured for anonymous access. Contact support if this issue persists.');
            } else if (error.message.includes('Server responded with status')) {
                showAlert('Request was received but there was a server error. Your submission may have been processed. Please check with support if needed.');
            } else {
                showAlert('Submission failed. Please try again later.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="flex flex-col h-full">
            <PageTitle title="COM Yardage Request" theme={theme} />
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4">
                <GlassCard theme={theme} className="p-4">
                    <h3 className="font-bold mb-3 text-xl" style={{ color: theme.colors.textPrimary }}>
                        Select Model(s)
                    </h3>
                    {selectedModels.map(m => (
                        <GlassCard key={m.key} theme={theme} className="p-4 mb-3 space-y-3">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="font-semibold">{m.name}</p>
                                    <p className="text-sm font-mono">{m.id}</p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => removeModel(m.key)}
                                        className="p-1.5 rounded-full hover:bg-red-500/10 transition">
                                        <Trash2 className="w-5 h-5 text-red-500" />
                                    </button>
                                    <input
                                        type="number"
                                        min="1"
                                        value={m.quantity}
                                        onChange={e => {
                                            const newQuantity = parseInt(e.target.value, 10);
                                            updateModel(m.key, { quantity: isNaN(newQuantity) ? '' : newQuantity });
                                        }}
                                        required
                                        className="w-16 text-center py-1.5 px-2 border rounded-md"
                                        style={{
                                            backgroundColor: theme.colors.subtle,
                                            borderColor: theme.colors.border,
                                            color: theme.colors.textPrimary
                                        }}
                                    />
                                </div>
                            </div>
                            <AutoCompleteCombobox
                                value={m.fabric}
                                onChange={v => updateModel(m.key, { fabric: v })}
                                onSelect={v => updateModel(m.key, { fabric: v })}
                                placeholder="Fabric pattern…"
                                options={fabricStrings}
                                theme={theme}
                            />
                        </GlassCard>
                    ))}
                    <AutoCompleteCombobox
                        value="" onChange={() => { }} onSelect={addModel}
                        placeholder="+ Add model" options={modelOptions}
                        theme={theme} resetOnSelect={true} />
                </GlassCard>
                <button
                    onClick={handleSubmit}
                    disabled={selectedModels.length === 0 || selectedModels.some(m => m.quantity < 1)}
                    className="w-full font-bold py-3 rounded-full text-white disabled:opacity-50"
                    style={{ backgroundColor: theme.colors.accent }}>
                    Submit Request
                </button>
            </div>

            <Modal show={showConfirm} onClose={() => setShowConfirm(false)} title="Confirm Submission" theme={theme}>
                <div>
                    <p className="text-sm mb-2" style={{ color: theme.colors.textSecondary }}>The following request will be sent:</p>
                    <pre className="text-sm whitespace-pre-wrap p-3 rounded-md mb-4" style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary }}>
                        {summary}
                    </pre>
                    <button onClick={handleFinalSubmit} disabled={isSubmitting}
                        className="w-full py-2 rounded-full text-white disabled:opacity-70"
                        style={{ backgroundColor: theme.colors.accent }}>
                        {isSubmitting ? 'Submitting...' : 'Confirm and Send'}
                    </button>
                </div>
            </Modal>
        </div>
    );
};