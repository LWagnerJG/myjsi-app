// RequestQuoteModal — On-brand quote request using shared design system
import React, { useState, useCallback, useMemo, useId } from 'react';
import ReactDOM from 'react-dom';
import { X, Send, CheckCircle2, Upload, FileText, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticMedium, hapticSuccess } from '../../utils/haptics.js';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import { getModalMotion } from '../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';
import { PrimaryButton, SecondaryButton } from './JSIButtons.jsx';
import { INITIAL_MEMBERS } from '../../screens/members/data.js';
import { CONTRACTS_DATA } from '../../screens/resources/contracts/data.js';
import { SearchSelect } from './RequestQuoteModalComponents.jsx';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from './modalUtils.js';

const FORMAT_OPTIONS = [
    { id: 'pdf', label: 'PDF' },
    { id: 'dwg', label: 'DWG' },
    { id: 'sif', label: 'SIF' },
    { id: 'sp4', label: 'SP4' },
    { id: 'cdb', label: 'CDB' },
    { id: 'dxf', label: 'DXF' },
];

const QUOTE_ITEMS = [
    { id: 'specCheck', label: 'Spec Check' },
    { id: 'quoteWorksheet', label: 'Quote Worksheet' },
    { id: 'drawing2d3d', label: '2D/3D Drawing' },
    { id: 'colorRendering', label: 'Color Rendering' },
];

const DEALERS_LIST = [
    'ABC Office Solutions', 'Modern Workspace Co', 'Premier Office Interiors',
    'Workplace Design Group', 'Contract Furniture Inc', 'Office Innovations',
    'Collaborative Spaces', 'Executive Environments',
    'Business Furniture', 'COE', 'OfficeWorks', 'RJE',
];

const AD_FIRMS_LIST = [
    'Smith & Associates Architects', 'Design Collective Studio', 'Urban Planning Partners',
    'Interior Design Group', 'Architectural Solutions', 'Creative Spaces Design',
    'McGee Designhouse', 'Ratio', 'CSO', 'IDO', 'Studio M',
];

/* ─── inline primitives ─── */

const SectionLabel = ({ children, accent }) => (
    <span className="text-[0.625rem] font-bold uppercase tracking-[0.08em] block mb-1.5"
        style={{ color: accent, opacity: 0.7 }}>{children}</span>
);

const SelectPill = ({ on, onClick, children, accent, accentText, textSecondary, isDark }) => (
    <button type="button" onClick={onClick}
        className="px-3.5 py-[7px] rounded-full text-[0.6875rem] font-semibold transition-all active:scale-[0.97]"
        style={{
            backgroundColor: on ? accent : 'transparent',
            color: on ? (accentText || '#fff') : textSecondary,
            border: `1.5px solid ${on ? accent : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)')}`,
        }}>
        {children}
    </button>
);

const SegToggle = ({ value, options, onChange, subtle, textPrimary, isDark, layoutId }) => (
    <div className="inline-flex rounded-full p-[3px] w-full"
        style={{ backgroundColor: subtle || (isDark ? 'rgba(255,255,255,0.10)' : '#E3E0D8') }}>
        {options.map(opt => {
            const sel = opt.value === value;
            return (
                <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
                    className="relative flex-1 rounded-full py-[7px] text-[0.6875rem] font-semibold transition-colors whitespace-nowrap"
                    style={{ color: sel ? textPrimary : (isDark ? 'rgba(240,240,240,0.5)' : '#6A6762') }}>
                    {sel && (
                        <motion.span layoutId={layoutId} className="absolute inset-0 rounded-full"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.14)' : '#fff' }}
                            transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
                    )}
                    <span className="relative z-10">{opt.label}</span>
                </button>
            );
        })}
    </div>
);

/* ─── main component ─── */

export const RequestQuoteModal = ({ show, onClose, theme, onSubmit, members = INITIAL_MEMBERS, initialData, currentUserId = 1 }) => {
    const [formData, setFormData] = useState({
        projectName: '', quoteType: 'new', neededByDate: '',
        projectType: 'commercial', contractName: '', dealerName: '', adName: '', itemsNeeded: [],
        formats: ['pdf'], projectInfo: '', files: [], selectedTeamMembers: [], previousQuoteRef: '',
    });

    React.useEffect(() => {
        if (show && initialData) {
            setFormData(prev => ({
                ...prev,
                projectName: initialData.projectName || prev.projectName,
                dealerName: initialData.dealerName || prev.dealerName,
                adName: initialData.adFirm || prev.adName,
            }));
        }
    }, [show, initialData]);

    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const isDark = isDarkTheme(theme);
    const c = theme?.colors || {};
    const prefersReducedMotion = usePrefersReducedMotion();
    const modalMotion = getModalMotion(prefersReducedMotion);
    const toggleId = useId();

    const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.025)';
    const fieldBorder = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)';
    const divider = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';

    const teamMembers = useMemo(() => {
        const source = Array.isArray(members) && members.length > 0 ? members : INITIAL_MEMBERS;
        const active = source.filter(m => m?.status !== 'inactive' && m?.status !== 'disabled');
        const repOnly = active.filter(m => String(m?.role || '').startsWith('rep-'));
        const pool = repOnly.length > 0 ? repOnly : active;
        return pool.filter(m => m?.id !== currentUserId);
    }, [members, currentUserId]);

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    }, [errors]);

    const toggleTeamMember = useCallback(id => {
        setFormData(prev => ({ ...prev, selectedTeamMembers: prev.selectedTeamMembers.includes(id) ? prev.selectedTeamMembers.filter(i => i !== id) : [...prev.selectedTeamMembers, id] }));
    }, []);
    const toggleItem = useCallback(id => {
        setFormData(prev => ({ ...prev, itemsNeeded: prev.itemsNeeded.includes(id) ? prev.itemsNeeded.filter(i => i !== id) : [...prev.itemsNeeded, id] }));
    }, []);
    const toggleFormat = useCallback((id, on) => {
        setFormData(prev => ({ ...prev, formats: on ? [...prev.formats, id] : prev.formats.filter(i => i !== id) }));
    }, []);
    const handleFileChange = useCallback(e => {
        const f = Array.from(e.target.files || []);
        setFormData(prev => ({ ...prev, files: [...prev.files, ...f] }));
    }, []);
    const removeFile = useCallback(idx => {
        setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== idx) }));
    }, []);

    const validateForm = useCallback(() => {
        const errs = {};
        if (!formData.projectName.trim()) errs.projectName = 'Required';
        if (!formData.dealerName.trim()) errs.dealerName = 'Required';
        if (formData.quoteType === 'revision') {
            if (!formData.previousQuoteRef.trim() && !formData.files.length) errs.previousQuoteRef = 'Enter previous quote # or attach file';
        }
        setErrors(errs);
        return !Object.keys(errs).length;
    }, [formData]);

    const handleSubmit = useCallback(async e => {
        e.preventDefault();
        if (!validateForm()) return;
        hapticMedium();
        setIsSubmitting(true);
        await new Promise(r => setTimeout(r, 1200));
        hapticSuccess();
        setIsSubmitting(false);
        setSubmitSuccess(true);
        setTimeout(() => {
            onSubmit?.(formData);
            setSubmitSuccess(false);
            setFormData({ projectName: '', quoteType: 'new', neededByDate: '', projectType: 'commercial', contractName: '', dealerName: '', adName: '', itemsNeeded: [], formats: ['pdf'], projectInfo: '', files: [], selectedTeamMembers: [], previousQuoteRef: '' });
            onClose();
        }, 1200);
    }, [formData, validateForm, onSubmit, onClose]);

    React.useEffect(() => {
        if (show) { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; }
    }, [show]);

    if (!show) return null;

    const inputStyle = {
        height: 40, borderRadius: DESIGN_TOKENS.borderRadius.md,
        background: fieldBg, border: `1px solid ${fieldBorder}`,
        color: c.textPrimary, padding: '0 12px', fontSize: "0.75rem", fontWeight: 500,
        outline: 'none', width: '100%',
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                initial={modalMotion.backdrop.initial} animate={modalMotion.backdrop.animate} exit={modalMotion.backdrop.exit}
                transition={modalMotion.backdrop.transition}
                className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto"
                style={{ ...getUnifiedBackdropStyle(true, prefersReducedMotion), zIndex: UNIFIED_MODAL_Z }}
                onClick={onClose}
            >
                <motion.div
                    initial={modalMotion.card.initial} animate={modalMotion.card.animate} exit={modalMotion.card.exit}
                    transition={modalMotion.card.transition}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-[520px] flex flex-col relative my-auto outline-none"
                    style={{
                        backgroundColor: c.surface || (isDark ? '#282828' : '#FFFFFF'),
                        border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}`,
                        borderRadius: DESIGN_TOKENS.borderRadius.xl,
                        boxShadow: isDark ? DESIGN_TOKENS.shadowsDark.modal : DESIGN_TOKENS.shadows.modal,
                        maxHeight: '85vh',
                    }}
                >
                    <AnimatePresence>
                        {submitSuccess && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                                style={{ backgroundColor: c.surface, borderRadius: DESIGN_TOKENS.borderRadius.xl }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                    <CheckCircle2 className="w-12 h-12" style={{ color: '#4A7C59' }} />
                                </motion.div>
                                <p className="mt-2.5 text-sm font-bold" style={{ color: c.textPrimary }}>Quote Request Sent</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center justify-between px-5 py-4 flex-shrink-0"
                        style={{ borderBottom: `1px solid ${divider}` }}>
                        <h2 className="text-[0.9375rem] font-bold tracking-tight" style={{ color: c.textPrimary }}>
                            Request Quote
                        </h2>
                        <button onClick={onClose} aria-label="Close"
                            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
                            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }}>
                            <X className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto scrollbar-hide">
                        <div className="px-5 py-4 space-y-4">

                            {/* Project Name */}
                            <div>
                                <SectionLabel accent={c.accent}>Project Name *</SectionLabel>
                                <input type="text" value={formData.projectName}
                                    onChange={e => updateField('projectName', e.target.value)}
                                    placeholder="Enter project name"
                                    style={{ ...inputStyle, borderColor: errors.projectName ? (c.error || '#B85C5C') : fieldBorder }} />
                                {errors.projectName && <p className="mt-1 text-[0.625rem] font-semibold" style={{ color: c.error || '#B85C5C' }}>{errors.projectName}</p>}
                            </div>

                            {/* Type + Needed By */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <SectionLabel accent={c.accent}>Type</SectionLabel>
                                    <SegToggle value={formData.quoteType} layoutId={`qt-type-${toggleId}`}
                                        options={[{ value: 'new', label: 'New' }, { value: 'revision', label: 'Revision' }]}
                                        onChange={v => updateField('quoteType', v)}
                                        subtle={c.subtle} textPrimary={c.textPrimary} isDark={isDark} />
                                </div>
                                <div>
                                    <SectionLabel accent={c.accent}>Needed By</SectionLabel>
                                    <input type="date" value={formData.neededByDate}
                                        onChange={e => updateField('neededByDate', e.target.value)}
                                        style={inputStyle} />
                                </div>
                            </div>

                            {/* Revision ref (conditional) */}
                            <AnimatePresence>
                                {formData.quoteType === 'revision' && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                        transition={{ duration: 0.15 }} className="overflow-hidden">
                                        <div>
                                            <SectionLabel accent={c.accent}>Previous Quote #</SectionLabel>
                                            <input type="text" value={formData.previousQuoteRef}
                                                onChange={e => updateField('previousQuoteRef', e.target.value)}
                                                placeholder="Enter quote number or attach below"
                                                style={{ ...inputStyle, borderColor: errors.previousQuoteRef ? (c.error || '#B85C5C') : fieldBorder }} />
                                            {errors.previousQuoteRef && <p className="mt-1 text-[0.625rem] font-semibold" style={{ color: c.error || '#B85C5C' }}>{errors.previousQuoteRef}</p>}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Team Members */}
                            {teamMembers.length > 0 && (
                                <div>
                                    <SectionLabel accent={c.accent}>Team Members</SectionLabel>
                                    <div className="flex flex-wrap gap-1.5">
                                        {teamMembers.map(m => {
                                            const sel = formData.selectedTeamMembers.includes(m.id);
                                            const name = `${m?.firstName || ''} ${m?.lastName || ''}`.trim() || m?.email;
                                            return (
                                                <SelectPill key={m.id} on={sel} onClick={() => toggleTeamMember(m.id)}
                                                    accent={c.accent} accentText={c.accentText} textSecondary={c.textSecondary} isDark={isDark}>
                                                    {name}
                                                </SelectPill>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Project Type */}
                            <div>
                                <SectionLabel accent={c.accent}>Project Type</SectionLabel>
                                <SegToggle value={formData.projectType} layoutId={`qt-ptype-${toggleId}`}
                                    options={[{ value: 'commercial', label: 'Commercial' }, { value: 'contract', label: 'Contract' }]}
                                    onChange={v => { updateField('projectType', v); if (v === 'commercial') updateField('contractName', ''); }}
                                    subtle={c.subtle} textPrimary={c.textPrimary} isDark={isDark} />
                                <AnimatePresence>
                                    {formData.projectType === 'contract' && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                                            transition={{ duration: 0.15 }} className="overflow-hidden">
                                            <div className="relative mt-2">
                                                <select value={formData.contractName} onChange={e => updateField('contractName', e.target.value)}
                                                    style={{ ...inputStyle, appearance: 'none', WebkitAppearance: 'none', paddingRight: 32, cursor: 'pointer' }}>
                                                    <option value="">Select contract</option>
                                                    {Object.keys(CONTRACTS_DATA).map(k => <option key={k} value={k}>{CONTRACTS_DATA[k].name}</option>)}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color: c.textSecondary }} />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Dealer & A&D */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <SectionLabel accent={c.accent}>Dealer *</SectionLabel>
                                    <SearchSelect value={formData.dealerName} onChange={v => updateField('dealerName', v)}
                                        options={DEALERS_LIST} placeholder="Search..." theme={theme} onAddNew={() => {}} />
                                    {errors.dealerName && <p className="mt-1 text-[0.625rem] font-semibold" style={{ color: c.error || '#B85C5C' }}>{errors.dealerName}</p>}
                                </div>
                                <div>
                                    <SectionLabel accent={c.accent}>A&D Firm</SectionLabel>
                                    <SearchSelect value={formData.adName} onChange={v => updateField('adName', v)}
                                        options={AD_FIRMS_LIST} placeholder="Search..." theme={theme} onAddNew={() => {}} />
                                </div>
                            </div>

                            {/* Items Needed + Formats */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <SectionLabel accent={c.accent}>Items Needed</SectionLabel>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUOTE_ITEMS.map(item => (
                                            <SelectPill key={item.id} on={formData.itemsNeeded.includes(item.id)} onClick={() => toggleItem(item.id)}
                                                accent={c.accent} accentText={c.accentText} textSecondary={c.textSecondary} isDark={isDark}>
                                                {item.label}
                                            </SelectPill>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <SectionLabel accent={c.accent}>Formats</SectionLabel>
                                    <div className="flex flex-wrap gap-1.5">
                                        {FORMAT_OPTIONS.map(fmt => (
                                            <SelectPill key={fmt.id} on={formData.formats.includes(fmt.id)} onClick={() => toggleFormat(fmt.id, !formData.formats.includes(fmt.id))}
                                                accent={c.accent} accentText={c.accentText} textSecondary={c.textSecondary} isDark={isDark}>
                                                {fmt.label}
                                            </SelectPill>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div>
                                <SectionLabel accent={c.accent}>Notes</SectionLabel>
                                <textarea value={formData.projectInfo}
                                    onChange={e => updateField('projectInfo', e.target.value)}
                                    placeholder="Additional details..."
                                    rows={2}
                                    className="w-full resize-none outline-none text-xs leading-relaxed"
                                    style={{ background: fieldBg, border: `1px solid ${fieldBorder}`, color: c.textPrimary,
                                        borderRadius: DESIGN_TOKENS.borderRadius.lg, padding: '10px 12px' }} />
                            </div>

                            {/* Attachments */}
                            <div>
                                <SectionLabel accent={c.accent}>Attachments</SectionLabel>
                                <button type="button"
                                    onClick={() => document.getElementById('rfq-file-upload')?.click()}
                                    className="w-full flex items-center gap-3 py-3 px-3 rounded-xl transition-colors hover:opacity-80"
                                    style={{ border: `1.5px dashed ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)'}`, color: c.textSecondary }}>
                                    <Upload className="w-3.5 h-3.5 flex-shrink-0" style={{ opacity: 0.4 }} />
                                    <span className="text-[0.6875rem] font-semibold">Click to upload files</span>
                                    <input type="file" multiple onChange={handleFileChange} className="hidden" id="rfq-file-upload" />
                                </button>
                                {formData.files.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                        {formData.files.map((file, idx) => (
                                            <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[0.6875rem] font-medium"
                                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: c.textPrimary }}>
                                                <FileText className="w-3 h-3 flex-shrink-0" style={{ color: c.accent }} />
                                                <span className="max-w-[90px] truncate">{file.name}</span>
                                                <button type="button" onClick={() => removeFile(idx)} className="ml-0.5 opacity-40 hover:opacity-80 transition-opacity">
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </form>

                    <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 flex-shrink-0"
                        style={{ borderTop: `1px solid ${divider}` }}>
                        <SecondaryButton
                            type="button"
                            onClick={onClose}
                            theme={theme}
                            className="h-10 !py-0 px-5 text-[0.75rem]"
                        >
                            Cancel
                        </SecondaryButton>
                        <PrimaryButton
                            type="submit"
                            disabled={isSubmitting}
                            theme={theme}
                            icon={isSubmitting ? (
                                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                            ) : <Send className="w-3.5 h-3.5" />}
                            className="h-10 !py-0 px-5 text-[0.75rem] disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'Sending…' : 'Submit Request'}
                        </PrimaryButton>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default RequestQuoteModal;

