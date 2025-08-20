import React, { useState, useMemo, useRef, useLayoutEffect, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { FormInput } from '../../components/forms/FormInput.jsx';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { ToggleSwitch } from '../../components/forms/ToggleSwitch.jsx';
import { ProbabilitySlider } from '../../components/forms/ProbabilitySlider.jsx';
import { ToggleButtonGroup } from '../../components/common/ToggleButtonGroup.jsx';
import { FormSection, SettingsRow } from '../../components/forms/FormSections.jsx';
import { SpotlightMultiSelect } from '../../components/common/SpotlightMultiSelect.jsx';

// Import data from proper feature-based sources
import { 
    STAGES, 
    VERTICALS, 
    COMPETITORS, 
    DISCOUNT_OPTIONS, 
    PO_TIMEFRAMES 
} from './data.js';
import { LEAD_TIMES_DATA } from '../resources/lead-times/data.js';
import { JSI_LAMINATES, JSI_VENEERS } from '../products/data.js';
// Removed imports from ../../data/projects.js and ../../data/products.js now that data migrated
import { FINISH_SAMPLES } from '../samples'; // re-exported by screens/samples/index.js
import { CONTRACTS_DATA } from '../resources/contracts/data.js';
import { VisionOptions, KnoxOptions, WinkHoopzOptions } from './product-options.jsx';


const AutoCompleteCombobox = ({
    label,
    value,
    onChange,
    onSelect,
    onAddNew,
    placeholder,
    options = [],
    theme,
    resetOnSelect = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const inputRef = useRef(null);
    const dropdownRef = useRef(null);

    const filteredOptions = useMemo(() => {
        if (!value) return options;
        return options.filter(option =>
            option.toLowerCase().includes(value.toLowerCase())
        );
    }, [value, options]);

    const canAddNew = onAddNew && value && !options.some(opt => opt.toLowerCase() === value.toLowerCase());

    // Calculate dynamic height based on number of options
    const calculateDropdownHeight = useMemo(() => {
        const optionHeight = 40; // Height per option (py-2 + text height)
        const padding = 16; // p-2 = 8px top + 8px bottom
        const maxVisibleOptions = 8; // Max options before scrolling
        const minHeight = 60; // Minimum dropdown height
        
        const totalOptions = filteredOptions.length + (canAddNew ? 1 : 0);
        const visibleOptions = Math.min(totalOptions, maxVisibleOptions);
        const calculatedHeight = Math.max(minHeight, visibleOptions * optionHeight + padding);
        
        return {
            height: calculatedHeight,
            needsScroll: totalOptions > maxVisibleOptions
        };
    }, [filteredOptions.length, canAddNew]);

    useLayoutEffect(() => {
        if (isOpen && inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, [isOpen, value]); // Recalculate on open and when value changes (for filtering)

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                inputRef.current && 
                !inputRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen]);

    const handleSelect = useCallback((option) => {
        onSelect(option);
        if (resetOnSelect) {
            onChange('');
        } else {
            onChange(option);
        }
        setIsOpen(false);
    }, [onSelect, onChange, resetOnSelect]);

    const handleAddNewClick = useCallback(() => {
        if (onAddNew && value) {
            onAddNew(value);
        }
        onChange('');
        setIsOpen(false);
    }, [onAddNew, value, onChange]);

    const { height: dropdownHeight, needsScroll } = calculateDropdownHeight;

    const DropdownPortal = () => createPortal(
        <div
            ref={dropdownRef}
            className={`fixed shadow-2xl rounded-2xl border ${needsScroll ? 'overflow-y-scroll scrollbar-hide' : ''}`}
            style={{
                top: `${position.top + 8}px`, // Add small gap
                left: `${position.left}px`,
                width: `${position.width}px`,
                height: `${dropdownHeight}px`,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                zIndex: 99999, // Ensure it's on top
                pointerEvents: 'auto',
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <ul className="p-2">
                {filteredOptions.length > 0 ? (
                    filteredOptions.map((option, index) => (
                        <li
                            key={index}
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelect(option);
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelect(option);
                            }}
                            className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer hover:bg-neutral-500/10 transition-colors"
                            style={{ 
                                color: theme.colors.textPrimary,
                                pointerEvents: 'auto'
                            }}
                        >
                            {option}
                        </li>
                    ))
                ) : !canAddNew && (
                    <li className="px-3 py-2 text-sm text-center" style={{ color: theme.colors.textSecondary }}>
                        No results found
                    </li>
                )}
                {canAddNew && (
                    <li
                        onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddNewClick();
                        }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddNewClick();
                        }}
                        className="px-3 py-2 text-sm font-medium rounded-lg cursor-pointer hover:bg-neutral-500/10 transition-colors border-t"
                        style={{ 
                            color: theme.colors.accent,
                            borderColor: theme.colors.border,
                            pointerEvents: 'auto'
                        }}
                    >
                        Add new: "{value}"
                    </li>
                )}
            </ul>
        </div>,
        document.body
    );

    return (
        <div className="relative w-full">
            <div ref={inputRef}>
                <FormInput
                    label={label}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    placeholder={placeholder}
                    theme={theme}
                    autoComplete="off"
                />
            </div>
            {isOpen && <DropdownPortal />}
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
    newLeadData = {},
    onNewLeadChange,
}) => {
    const [productSearch, setProductSearch] = useState('');
    
    const updateField = (field, value) => {
        // Clear otherVertical when vertical changes away from "Other"
        if (field === 'vertical' && value !== 'Other (Please specify)') {
            onNewLeadChange({ [field]: value, otherVertical: '' });
        } else {
            onNewLeadChange({ [field]: value });
        }
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
    
    // Stakeholder management functions
    const addDesignFirm = (firm) => {
        const currentFirms = newLeadData.designFirms || [];
        if (!currentFirms.includes(firm)) {
            updateField('designFirms', [...currentFirms, firm]);
        }
    };
    
    const removeDesignFirm = (firm) => {
        const currentFirms = newLeadData.designFirms || [];
        updateField('designFirms', currentFirms.filter(f => f !== firm));
    };
    
    const addDealer = (dealer) => {
        const currentDealers = newLeadData.dealers || [];
        if (!currentDealers.includes(dealer)) {
            updateField('dealers', [...currentDealers, dealer]);
        }
    };
    
    const removeDealer = (dealer) => {
        const currentDealers = newLeadData.dealers || [];
        updateField('dealers', currentDealers.filter(d => d !== dealer));
    };
    
    const availableSeries = useMemo(() => {
        const allSeries = LEAD_TIMES_DATA.map(item => item.series);
        const uniqueSeries = Array.from(new Set(allSeries));
        return uniqueSeries.filter(s => !(newLeadData.products || []).some(p => p.series === s));
    }, [newLeadData.products]);
    
    return (
        <form onSubmit={handleSubmit} className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-6 scrollbar-hide">
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
                                    options={STAGES.map(s => ({ label: s, value: s }))}
                                    placeholder="Select..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Vertical" theme={theme}>
                            <div className="w-7/12 relative">
                                {newLeadData.vertical === 'Other (Please specify)' ? (
                                    <div className="flex items-center space-x-3 transition-all duration-300 ease-in-out">
                                        <div className="flex items-center space-x-2 animate-slide-in-left">
                                            <span
                                                className="text-sm font-medium px-3 py-2 rounded-lg border transition-all duration-300"
                                                style={{
                                                    backgroundColor: theme.colors.subtle,
                                                    borderColor: theme.colors.border,
                                                    color: theme.colors.textPrimary
                                                }}
                                            >
                                                Other
                                            </span>
                                        </div>
                                        <div className="flex-1 animate-fade-in">
                                            <FormInput
                                                label=""
                                                required
                                                value={newLeadData.otherVertical || ''}
                                                onChange={e => updateField('otherVertical', e.target.value)}
                                                placeholder="Specify other vertical..."
                                                theme={theme}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="transition-all duration-300 ease-in-out">
                                        <PortalNativeSelect
                                            label=""
                                            required
                                            value={newLeadData.vertical || ''}
                                            onChange={e => updateField('vertical', e.target.value)}
                                            options={VERTICALS.map(v => ({ label: v, value: v }))}
                                            placeholder="Select..."
                                            theme={theme}
                                        />
                                    </div>
                                )}
                            </div>
                        </SettingsRow>
                    </div>
                </FormSection>
                
                <FormSection title="Stakeholders" theme={theme}>
                    <div>
                        <SettingsRow label="A&D Firm" isFirst={true} theme={theme}>
                            <div className="w-7/12">
                                <SpotlightMultiSelect
                                    selectedItems={newLeadData.designFirms || []}
                                    onAddItem={addDesignFirm}
                                    onRemoveItem={removeDesignFirm}
                                    options={designFirms || []}
                                    onAddNew={(f) => setDesignFirms((p) => [...new Set([f, ...p])])}
                                    placeholder="Search..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Dealer" theme={theme}>
                            <div className="w-7/12">
                                <SpotlightMultiSelect
                                    selectedItems={newLeadData.dealers || []}
                                    onAddItem={addDealer}
                                    onRemoveItem={removeDealer}
                                    options={dealers || []}
                                    onAddNew={(d) => setDealers((p) => [...new Set([d, ...p])])}
                                    placeholder="Search..."
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
                        {/* Row 1: label (left) + toggle (right) */}
                        <SettingsRow label="Competition?" theme={theme}>
                            <div className="w-full flex justify-end">
                                <div className="w-7/12 h-10 flex items-center justify-end">
                                    <ToggleSwitch
                                        checked={!!newLeadData.competitionPresent}
                                        onChange={(e) => updateField('competitionPresent', e.target.checked)}
                                        theme={theme}
                                    />
                                </div>
                            </div>
                        </SettingsRow>

                        {/* Row 2: full-width chip grid (left edge of tile → right edge of tile) */}
                        {newLeadData.competitionPresent && (
                            <div className="-mx-4 mt-3">
                                <div className="px-4">
                                    <div
                                        className="rounded-2xl p-3"
                                        style={{ backgroundColor: theme.colors.subtle }}
                                    >
                                        <div
                                            className="grid gap-2"
                                            style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(132px, 1fr))' }}
                                        >
                                            {COMPETITORS.filter(c => c !== 'None').map((c) => {
                                                const on = (newLeadData.competitors || []).includes(c);
                                                return (
                                                    <button
                                                        key={c}
                                                        type="button"
                                                        onClick={() => toggleCompetitor(c)}
                                                        className="px-3 py-1.5 text-[13px] rounded-full font-medium transition-colors border text-center whitespace-nowrap"
                                                        style={{
                                                            backgroundColor: on ? theme.colors.accent : theme.colors.surface,
                                                            color: on ? theme.colors.surface : theme.colors.textPrimary,
                                                            borderColor: on ? theme.colors.accent : theme.colors.border
                                                        }}
                                                    >
                                                        {c}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}


                    </div>
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
                        <SettingsRow label="Estimated List" isFirst={true} theme={theme}>
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
                                    options={DISCOUNT_OPTIONS.map(d => ({ label: d, value: d }))}
                                    placeholder="Select..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="PO Timeframe" theme={theme}>
                            <div className="w-7/12 relative">
                                <PortalNativeSelect
                                    label=""
                                    required
                                    value={newLeadData.poTimeframe || ''}
                                    onChange={e => updateField('poTimeframe', e.target.value)}
                                    options={PO_TIMEFRAMES.map(t => ({ label: t, value: t }))}
                                    placeholder="Select..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                        <SettingsRow label="Contract?" theme={theme}>
                            <div className="w-7/12 relative">
                                <PortalNativeSelect
                                    label=""
                                    required
                                    value={newLeadData.contractType || 'None'}
                                    onChange={e => updateField('contractType', e.target.value)}
                                    options={[
                                        { label: 'None', value: '' },
                                        ...Object.keys(CONTRACTS_DATA).map(key => ({
                                            label: CONTRACTS_DATA[key].name,
                                            value: key,
                                        }))
                                    ]}
                                    placeholder="Select..."
                                    theme={theme}
                                />
                            </div>
                        </SettingsRow>
                    </div>
                </FormSection>
                
                <FormSection title="Notes" theme={theme}>
                    <SettingsRow label="Other Notes" isFirst={true} theme={theme}>
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