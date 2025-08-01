import React, { useState, useMemo } from 'react';
import { X } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput.jsx';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { AutoCompleteCombobox } from '../../components/forms/AutoCompleteCombobox.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup.jsx';
import { FormSection, SettingsRow } from '../../components/forms/FormSections.jsx';
import * as Data from '../../data.jsx';

// Product option components
const KnoxOptions = ({ theme, product, productIndex, onUpdate }) => {
    return (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                    Wood back?
                </label>
                <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-2"
                    style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }}
                    checked={!!product.hasWoodBack}
                    onChange={(e) => onUpdate(productIndex, 'hasWoodBack', e.target.checked)}
                />
            </div>
        </div>
    );
};

const VisionOptions = ({ theme, product, productIndex, onUpdate }) => {
    const handleMaterialToggle = (material) => {
        const currentMaterials = product.materials || [];
        const nextMaterials = currentMaterials.includes(material)
            ? currentMaterials.filter(m => m !== material)
            : [...currentMaterials, material];
        onUpdate(productIndex, 'materials', nextMaterials);
    };

    const MaterialButtonGroup = ({ label, options }) => (
        <div>
            <p className="text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>
                {label}
            </p>
            <div className="flex flex-wrap gap-2">
                {options.map(opt => {
                    const isSelected = product.materials?.includes(opt);
                    return (
                        <button
                            key={opt}
                            type="button"
                            onClick={() => handleMaterialToggle(opt)}
                            className="px-3 py-1.5 text-sm rounded-full font-medium transition-colors border"
                            style={{
                                backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
                                color: isSelected ? theme.colors.surface : theme.colors.textPrimary,
                                borderColor: isSelected ? theme.colors.accent : theme.colors.border,
                            }}
                        >
                            {opt}
                        </button>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-4 mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: theme.colors.background }}>
                <label className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                    Glass Doors?
                </label>
                <input
                    type="checkbox"
                    className="h-5 w-5 rounded-md border-2"
                    style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }}
                    checked={!!product.hasGlassDoors}
                    onChange={(e) => onUpdate(productIndex, 'hasGlassDoors', e.target.checked)}
                />
            </div>

            <div className="space-y-4">
                <MaterialButtonGroup label="Laminate" options={Data.JSI_LAMINATES || []} />
                <MaterialButtonGroup label="Veneer" options={Data.JSI_VENEERS || []} />
            </div>
        </div>
    );
};

const WinkHoopzOptions = ({ theme, product, productIndex, onUpdate }) => {
    return (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
            <PortalNativeSelect
                label="Select poly"
                value={product.polyColor}
                onChange={(e) => onUpdate(productIndex, 'polyColor', e.target.value)}
                placeholder="Select a poly color"
                theme={theme}
                options={(Data.JSI_POLY_COLORS || []).map(c => ({ value: c, label: c }))}
            />
        </div>
    );
};

export const NewLeadScreen = ({
    theme,
    onSuccess,
    designFirms,
    setDesignFirms,
    dealers,
    setDealers,
    newLeadData,
    onNewLeadChange,
}) => {
    const [productSearch, setProductSearch] = useState('');

    const updateField = (field, value) => {
        onNewLeadChange({ [field]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newLeadData.projectStatus) {
            alert('Please select a Project Stage before submitting.');
            return;
        }
        onSuccess(newLeadData);
    };

    const toggleCompetitor = (c) => {
        const list = newLeadData.competitors || [];
        const next = list.includes(c) ? list.filter(x => x !== c) : [...list, c];
        updateField('competitors', next);
    };

    const addProduct = (series) => {
        if (!series) return;
        const newProducts = [...(newLeadData.products || []), { 
            series, 
            hasGlassDoors: false, 
            materials: [], 
            hasWoodBack: false, 
            polyColor: '' 
        }];
        updateField('products', newProducts);
    };

    const removeProduct = (idx) => {
        const newProducts = (newLeadData.products || []).filter((_, i) => i !== idx);
        updateField('products', newProducts);
    };

    const updateProductOption = (pi, key, value) => {
        const newProducts = (newLeadData.products || []).map((p, i) => i === pi ? { ...p, [key]: value } : p);
        updateField('products', newProducts);
    };

    const availableSeries = useMemo(() => 
        (Data.JSI_PRODUCT_SERIES || []).filter(s => 
            !(newLeadData.products || []).some(p => p.series === s)
        ), 
        [newLeadData.products]
    );

    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pt-6 pb-4 space-y-4 scrollbar-hide">
                <FormSection title="Project Details" theme={theme}>
                    <div>
                        <SettingsRow label="Project Name" isFirst={true} theme={theme}>
                            <div className="w-7/12">
                                <FormInput 
                                    label="" 
                                    required 
                                    value={newLeadData.project || ''} 
                                    onChange={e => updateField('project', e.target.value)} 
                                    placeholder="Required" 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Project Stage" theme={theme}>
                            <div className="w-7/12">
                                <PortalNativeSelect 
                                    label="" 
                                    required 
                                    value={newLeadData.projectStatus || ''} 
                                    onChange={e => updateField('projectStatus', e.target.value)} 
                                    options={(Data.STAGES || []).map(s => ({ label: s, value: s }))} 
                                    placeholder="Select..." 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Vertical" theme={theme}>
                            <div className="w-7/12">
                                <PortalNativeSelect 
                                    label="" 
                                    required 
                                    value={newLeadData.vertical || ''} 
                                    onChange={e => updateField('vertical', e.target.value)} 
                                    options={(Data.VERTICALS || []).map(v => ({ label: v, value: v }))} 
                                    placeholder="Select..." 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                    </div>
                    {newLeadData.vertical === 'Other (Please specify)' && (
                        <div className="animate-fade-in pt-2 pl-4">
                            <FormInput 
                                required 
                                value={newLeadData.otherVertical || ''} 
                                onChange={e => updateField('otherVertical', e.target.value)} 
                                placeholder="Specify other vertical..." 
                                theme={theme} 
                            />
                        </div>
                    )}
                </FormSection>

                <FormSection title="Stakeholders" theme={theme}>
                    <div>
                        <SettingsRow label="A&D Firm" isFirst={true} theme={theme}>
                            <div className="w-7/12">
                                <AutoCompleteCombobox 
                                    label="" 
                                    required 
                                    value={newLeadData.designFirm || ''} 
                                    onChange={val => updateField('designFirm', val)} 
                                    onSelect={val => updateField('designFirm', val)} 
                                    placeholder="Search..." 
                                    options={designFirms || []} 
                                    onAddNew={(f) => setDesignFirms(p => [...new Set([f, ...p])])} 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Dealer" theme={theme}>
                            <div className="w-7/12">
                                <AutoCompleteCombobox 
                                    label="" 
                                    required 
                                    value={newLeadData.dealer || ''} 
                                    onChange={val => updateField('dealer', val)} 
                                    onSelect={val => updateField('dealer', val)} 
                                    placeholder="Search..." 
                                    options={dealers || []} 
                                    onAddNew={(d) => setDealers(p => [...new Set([d, ...p])])} 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                    </div>
                </FormSection>

                <FormSection title="Competition & Products" theme={theme}>
                    <div>
                        <SettingsRow label="Bid?" isFirst={true} theme={theme}>
                            <ToggleSwitch 
                                checked={!!newLeadData.isBid} 
                                onChange={e => updateField('isBid', e.target.checked)} 
                                theme={theme} 
                            />
                        </SettingsRow>
                        <SettingsRow label="Competition?" theme={theme}>
                            <ToggleSwitch 
                                checked={!!newLeadData.competitionPresent} 
                                onChange={e => updateField('competitionPresent', e.target.checked)} 
                                theme={theme} 
                            />
                        </SettingsRow>
                    </div>
                    {newLeadData.competitionPresent && (
                        <div className="pt-4">
                            <div className="p-2 flex flex-wrap gap-2 rounded-2xl" style={{ backgroundColor: theme.colors.subtle }}>
                                {(Data.COMPETITORS || []).filter(c => c !== 'None').map(c => (
                                    <button 
                                        key={c} 
                                        type="button" 
                                        onClick={() => toggleCompetitor(c)} 
                                        className="px-3 py-1.5 text-sm rounded-full font-medium transition-colors border" 
                                        style={{ 
                                            backgroundColor: (newLeadData.competitors || []).includes(c) ? theme.colors.accent : theme.colors.surface, 
                                            color: (newLeadData.competitors || []).includes(c) ? theme.colors.surface : theme.colors.textPrimary, 
                                            borderColor: (newLeadData.competitors || []).includes(c) ? theme.colors.accent : theme.colors.border 
                                        }}
                                    >
                                        {c}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    <SettingsRow label="Products" theme={theme}>
                        <div className="w-7/12">
                            <AutoCompleteCombobox 
                                label="" 
                                value={productSearch} 
                                onChange={setProductSearch} 
                                onSelect={addProduct} 
                                placeholder="Search..." 
                                options={availableSeries} 
                                theme={theme} 
                                resetOnSelect={true} 
                            />
                        </div>
                    </SettingsRow>
                    {(newLeadData.products || []).length > 0 && (
                        <div className="space-y-3 pt-2">
                            {(newLeadData.products || []).map((p, idx) => {
                                const hasOptions = ['Vision', 'Knox', 'Wink', 'Hoopz'].includes(p.series);
                                const itemStyle = hasOptions ? "p-3 border rounded-2xl" : "p-2 pl-4 border rounded-full";
                                return (
                                    <div 
                                        key={idx} 
                                        className={`${itemStyle} space-y-2`} 
                                        style={{ 
                                            borderColor: theme.colors.border, 
                                            backgroundColor: theme.colors.surface 
                                        }}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                                                {p.series}
                                            </span>
                                            <button 
                                                type="button" 
                                                onClick={() => removeProduct(idx)} 
                                                className="w-7 h-7 flex items-center justify-center rounded-full transition-colors hover:bg-red-500/10"
                                            >
                                                <X className="w-5 h-5 text-red-500" />
                                            </button>
                                        </div>
                                        {hasOptions && (
                                            <div className="animate-fade-in pr-2">
                                                {p.series === 'Vision' && (
                                                    <VisionOptions 
                                                        theme={theme} 
                                                        product={p} 
                                                        productIndex={idx} 
                                                        onUpdate={updateProductOption} 
                                                    />
                                                )}
                                                {p.series === 'Knox' && (
                                                    <KnoxOptions 
                                                        theme={theme} 
                                                        product={p} 
                                                        productIndex={idx} 
                                                        onUpdate={updateProductOption} 
                                                    />
                                                )}
                                                {(p.series === 'Wink' || p.series === 'Hoopz') && (
                                                    <WinkHoopzOptions 
                                                        theme={theme} 
                                                        product={p} 
                                                        productIndex={idx} 
                                                        onUpdate={updateProductOption} 
                                                    />
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </FormSection>

                <FormSection title="Financials & Timeline" theme={theme}>
                    <div>
                        <SettingsRow label="Estimated List Price" isFirst={true} theme={theme}>
                            <div className="w-7/12">
                                <FormInput 
                                    label="" 
                                    required 
                                    type="currency" 
                                    value={newLeadData.estimatedList || ''} 
                                    onChange={e => updateField('estimatedList', e.target.value)} 
                                    placeholder="$0" 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Win Probability" theme={theme}>
                            <div className="w-7/12">
                                <ProbabilitySlider 
                                    showLabel={false} 
                                    value={newLeadData.winProbability || 50} 
                                    onChange={v => updateField('winProbability', v)} 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Discount" theme={theme}>
                            <div className="w-7/12">
                                <PortalNativeSelect 
                                    label="" 
                                    value={newLeadData.discount || ''} 
                                    onChange={e => updateField('discount', e.target.value)} 
                                    options={(Data.DISCOUNT_OPTIONS || []).map(d => ({ label: d, value: d }))} 
                                    placeholder="Select..." 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="PO Timeframe" theme={theme}>
                            <div className="w-7/12">
                                <PortalNativeSelect 
                                    label="" 
                                    required 
                                    value={newLeadData.poTimeframe || ''} 
                                    onChange={e => updateField('poTimeframe', e.target.value)} 
                                    options={(Data.PO_TIMEFRAMES || []).map(t => ({ label: t, value: t }))} 
                                    placeholder="Select..." 
                                    theme={theme} 
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Contract?" theme={theme}>
                            {newLeadData.isContract ? (
                                <div className="w-7/12 flex items-center space-x-2">
                                    <div className="flex-1">
                                        <PortalNativeSelect 
                                            label="" 
                                            required 
                                            value={newLeadData.contractType || ''} 
                                            onChange={e => updateField('contractType', e.target.value)} 
                                            options={(Data.CONTRACT_OPTIONS || []).map(c => ({ label: c, value: c }))} 
                                            placeholder="Select..." 
                                            theme={theme} 
                                        />
                                    </div>
                                    <ToggleSwitch 
                                        checked={true} 
                                        onChange={e => updateField('isContract', e.target.checked)} 
                                        theme={theme} 
                                    />
                                </div>
                            ) : (
                                <ToggleSwitch 
                                    checked={false} 
                                    onChange={e => updateField('isContract', e.target.checked)} 
                                    theme={theme} 
                                />
                            )}
                        </SettingsRow>
                    </div>
                </FormSection>

                <FormSection title="Services & Notes" theme={theme}>
                    <div>
                        <SettingsRow label="JSI Spec Services Required?" isFirst={true} theme={theme}>
                            <ToggleSwitch 
                                checked={!!newLeadData.jsiSpecServices} 
                                onChange={e => updateField('jsiSpecServices', e.target.checked)} 
                                theme={theme} 
                            />
                        </SettingsRow>
                    </div>
                    {newLeadData.jsiSpecServices && (
                        <div className="animate-fade-in pt-2">
                            <ToggleButtonGroup 
                                value={newLeadData.jsiSpecServicesType || ''} 
                                onChange={(val) => updateField('jsiSpecServicesType', val)} 
                                options={[
                                    { label: 'New Quote', value: 'New Quote' }, 
                                    { label: 'Revision', value: 'Revision' }, 
                                    { label: 'Past Project', value: 'Past Project' }
                                ]} 
                                theme={theme} 
                            />
                            <div className="mt-4">
                                {newLeadData.jsiSpecServicesType === 'Revision' && (
                                    <FormInput 
                                        label="Revision Quote #" 
                                        value={newLeadData.jsiRevisionQuoteNumber || ''} 
                                        onChange={(e) => updateField('jsiRevisionQuoteNumber', e.target.value)} 
                                        placeholder="Enter original quote #" 
                                        theme={theme} 
                                        required 
                                    />
                                )}
                                {newLeadData.jsiSpecServicesType === 'Past Project' && (
                                    <FormInput 
                                        label="Past Project Info" 
                                        value={newLeadData.jsiPastProjectInfo || ''} 
                                        onChange={(e) => updateField('jsiPastProjectInfo', e.target.value)} 
                                        placeholder="Enter past project name or #" 
                                        theme={theme} 
                                        required 
                                    />
                                )}
                            </div>
                        </div>
                    )}
                    <SettingsRow label="Other Notes" theme={theme}>
                        <div className="w-7/12">
                            <FormInput 
                                label="" 
                                type="textarea" 
                                value={newLeadData.notes || ''} 
                                onChange={e => updateField('notes', e.target.value)} 
                                placeholder="Enter details..." 
                                theme={theme} 
                            />
                        </div>
                    </SettingsRow>
                </FormSection>

                <div className="pt-2 pb-4">
                    <button 
                        type="submit" 
                        className="w-full text-white font-bold py-3.5 rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95" 
                        style={{ backgroundColor: theme.colors.accent }}
                    >
                        Submit Lead
                    </button>
                </div>
            </div>
        </form>
    );
};