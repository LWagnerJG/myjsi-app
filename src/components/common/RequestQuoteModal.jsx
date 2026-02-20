// RequestQuoteModal — Clean, dark-mode-ready quote request form
import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, FileText, Calendar, CheckCircle2, Upload, ChevronDown, ChevronUp, Users, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { hapticMedium, hapticSuccess } from '../../utils/haptics.js';
import { INITIAL_MEMBERS } from '../../screens/members/data.js';
import { CONTRACTS_DATA } from '../../screens/resources/contracts/data.js';

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

/* ── Theme-aware SearchSelect ── */
const SearchSelect = ({ value, onChange, options, placeholder, theme, onAddNew }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const isDark = theme?.name === 'dark';
    const c = theme?.colors || {};

    const filtered = useMemo(() => {
        if (!query) return options.slice(0, 8);
        return options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
    }, [options, query]);
    const canCreate = query && !options.some(o => o.toLowerCase() === query.toLowerCase());

    const fieldBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.025)';
    const fieldBrd = isDark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.08)';
    const hoverBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)';
    const dropBg  = isDark ? '#2a2a2a' : '#fff';

    return (
        <div className="relative">
            <div
                className="flex items-center gap-2 px-3 cursor-text"
                style={{ height: 44, borderRadius: 14, background: fieldBg, border: fieldBrd }}
                onClick={() => setOpen(true)}
            >
                <Search className="w-4 h-4 flex-shrink-0" style={{ color: c.textSecondary, opacity: 0.4 }} />
                {value ? (
                    <div className="flex-1 flex items-center justify-between min-w-0">
                        <span className="text-[13px] font-medium truncate" style={{ color: c.textPrimary }}>{value}</span>
                        <button onClick={e => { e.stopPropagation(); onChange(''); }} className="p-1 rounded-full flex-shrink-0 transition-colors" style={{ color: c.textSecondary }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ) : (
                    <input
                        value={query}
                        onChange={e => { setQuery(e.target.value); setOpen(true); }}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none text-[13px] font-medium"
                        style={{ color: c.textPrimary }}
                        onFocus={() => setOpen(true)}
                    />
                )}
            </div>
            {open && !value && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-lg z-50"
                        style={{ backgroundColor: dropBg, border: fieldBrd }}>
                        <div className="max-h-[200px] overflow-y-auto scrollbar-hide py-1">
                            {filtered.map(opt => (
                                <button key={opt} className="w-full text-left px-3 py-2.5 text-[13px] font-medium transition-colors"
                                    style={{ color: c.textPrimary }}
                                    onClick={() => { onChange(opt); setQuery(''); setOpen(false); }}
                                    onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
                                    onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                    {opt}
                                </button>
                            ))}
                            {canCreate && onAddNew && (
                                <>
                                    <div className="h-px mx-2"
                                        style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)' }} />
                                    <button className="w-full text-left px-3 py-2.5 text-[13px] font-semibold flex items-center gap-2 transition-colors"
                                        style={{ color: c.accent }}
                                        onClick={() => { onAddNew(query); onChange(query); setQuery(''); setOpen(false); }}
                                        onMouseEnter={e => e.currentTarget.style.backgroundColor = hoverBg}
                                        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                        <Plus className="w-3.5 h-3.5" /> Add "{query}"
                                    </button>
                                </>
                            )}
                            {!filtered.length && !canCreate && (
                                <div className="px-3 py-3 text-[12px] text-center" style={{ color: c.textSecondary }}>No results</div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* ── Team member avatar ── */
const MiniAvatar = ({ member, selected, onToggle, isDark, colors }) => {
    const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
    return (
        <button type="button" onClick={() => onToggle(member.id)} className="relative group"
            title={`${member.firstName} ${member.lastName}`}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-[10px] font-bold transition-all"
                style={{
                    backgroundColor: selected ? colors.accent : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                    color: selected ? '#FFFFFF' : colors.textPrimary,
                    border: `2px solid ${selected ? colors.accent : 'transparent'}`,
                }}>
                {initials}
            </div>
            {selected && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#4A7C59' }}>
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
            )}
        </button>
    );
};

/* ══════════════════════════════════════════════════════════════════════════ */
export const RequestQuoteModal = ({ show, onClose, theme, onSubmit, members = INITIAL_MEMBERS, initialData }) => {
    const [formData, setFormData] = useState({
        projectName: '', quoteType: 'new', neededByDate: '',
        projectType: 'commercial', contractName: '', dealerName: '', adName: '', itemsNeeded: [],
        formats: ['pdf'], projectInfo: '', files: [], selectedTeamMembers: [],
    });

    // Pre-fill from opportunity data
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

    const [showTeamSection, setShowTeamSection] = useState(false);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const isDark = theme?.name === 'dark';
    const colors = useMemo(() => ({
        background:      theme?.colors?.background   || '#F0EDE8',
        surface:         isDark ? '#1e1e1e' : (theme?.colors?.surface || '#FFFFFF'),
        surfaceElevated: isDark ? '#282828' : (theme?.colors?.surface || '#FFFFFF'),
        textPrimary:     theme?.colors?.textPrimary   || '#353535',
        textSecondary:   theme?.colors?.textSecondary || '#666666',
        border:          isDark ? 'rgba(255,255,255,0.10)' : (theme?.colors?.border || 'rgba(0,0,0,0.08)'),
        accent:          theme?.colors?.accent        || '#353535',
        subtle:          isDark ? 'rgba(255,255,255,0.06)' : (theme?.colors?.subtle || '#F5F3EF'),
        fieldBg:         isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.025)',
        fieldBorder:     isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.08)',
        hoverBg:         isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
        success: '#4A7C59',
        error:   '#B85C5C',
    }), [theme, isDark]);

    const activeMembers = useMemo(() => members.filter(m => m.status === 'active'), [members]);

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

    const toggleFormat = useCallback((id, checked) => {
        setFormData(prev => ({ ...prev, formats: checked ? [...prev.formats, id] : prev.formats.filter(i => i !== id) }));
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
            setFormData({ projectName: '', quoteType: 'new', neededByDate: '', projectType: 'commercial', contractName: '', dealerName: '', adName: '', itemsNeeded: [], formats: ['pdf'], projectInfo: '', files: [], selectedTeamMembers: [] });
            onClose();
        }, 1200);
    }, [formData, validateForm, onSubmit, onClose]);

    React.useEffect(() => {
        if (show) { const prev = document.body.style.overflow; document.body.style.overflow = 'hidden'; return () => { document.body.style.overflow = prev; }; }
    }, [show]);

    if (!show) return null;

    const inputBase = {
        height: 44, borderRadius: 14,
        background: colors.fieldBg, border: `1px solid ${colors.fieldBorder}`,
        color: colors.textPrimary, padding: '0 14px', fontSize: 13, fontWeight: 500,
        outline: 'none', width: '100%',
    };

    const labelCls = { color: colors.textSecondary, fontSize: 10, fontWeight: 700, marginBottom: 6, display: 'block', textTransform: 'uppercase', letterSpacing: '0.8px' };

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 flex items-center justify-center z-[999] p-4 overflow-y-auto"
                style={{ backgroundColor: isDark ? 'rgba(0,0,0,0.70)' : 'rgba(0,0,0,0.45)' }}
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: 24, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 24, scale: 0.97 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    onClick={e => e.stopPropagation()}
                    className="w-full max-w-[480px] rounded-3xl overflow-hidden relative my-auto"
                    style={{
                        backgroundColor: colors.surfaceElevated,
                        boxShadow: isDark ? '0 25px 60px -12px rgba(0,0,0,0.6)' : '0 25px 60px -12px rgba(0,0,0,0.20)',
                        border: isDark ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    }}
                >
                    {/* ── Success overlay ── */}
                    <AnimatePresence>
                        {submitSuccess && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                                style={{ backgroundColor: colors.surfaceElevated }}>
                                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}>
                                    <CheckCircle2 className="w-14 h-14" style={{ color: colors.success }} />
                                </motion.div>
                                <p className="mt-3 text-base font-bold" style={{ color: colors.textPrimary }}>Quote Request Sent!</p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* ── Header ── */}
                    <div className="flex items-center justify-between px-6 py-4" style={{ borderBottom: `1px solid ${colors.border}` }}>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                                <FileText className="w-5 h-5" style={{ color: colors.textPrimary }} />
                            </div>
                            <h2 className="text-[18px] font-bold tracking-tight" style={{ color: colors.textPrimary }}>Request a Quote</h2>
                        </div>
                        <button onClick={onClose} className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hoverBg}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                        </button>
                    </div>

                    {/* ── Form ── */}
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[65vh] overflow-y-auto scrollbar-hide">

                        {/* Project Name */}
                        <div>
                            <label style={labelCls}>Project Name *</label>
                            <input type="text" value={formData.projectName}
                                onChange={e => updateField('projectName', e.target.value)}
                                placeholder="Enter project name"
                                style={{ ...inputBase, borderColor: errors.projectName ? colors.error : colors.fieldBorder }} />
                            {errors.projectName && <p className="mt-1 text-[11px] font-medium" style={{ color: colors.error }}>{errors.projectName}</p>}
                        </div>

                        {/* Type + Needed By */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label style={labelCls}>Type</label>
                                <div className="flex p-0.5 rounded-xl" style={{ backgroundColor: colors.subtle }}>
                                    {['new', 'revision'].map(type => (
                                        <button key={type} type="button"
                                            onClick={() => updateField('quoteType', type)}
                                            className="flex-1 py-2.5 rounded-[10px] text-[12px] font-bold transition-all"
                                            style={{
                                                backgroundColor: formData.quoteType === type ? colors.surfaceElevated : 'transparent',
                                                color: formData.quoteType === type ? colors.textPrimary : colors.textSecondary,
                                                boxShadow: formData.quoteType === type ? (isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.08)') : 'none',
                                            }}>
                                            {type === 'new' ? 'New' : 'Revision'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelCls}>
                                    <Calendar className="w-3 h-3 inline mr-1 opacity-60" style={{ marginBottom: 1 }} />
                                    Needed By
                                </label>
                                <input type="date" value={formData.neededByDate}
                                    onChange={e => updateField('neededByDate', e.target.value)}
                                    style={inputBase} />
                            </div>
                        </div>

                        {/* Project Type */}
                        <div>
                            <label style={labelCls}>Project Type</label>
                            <div className="flex p-0.5 rounded-xl" style={{ backgroundColor: colors.subtle }}>
                                {['commercial', 'contract'].map(type => (
                                    <button key={type} type="button"
                                        onClick={() => { updateField('projectType', type); if (type === 'commercial') updateField('contractName', ''); }}
                                        className="flex-1 py-2.5 rounded-[10px] text-[12px] font-bold transition-all"
                                        style={{
                                            backgroundColor: formData.projectType === type ? colors.surfaceElevated : 'transparent',
                                            color: formData.projectType === type ? colors.textPrimary : colors.textSecondary,
                                            boxShadow: formData.projectType === type ? (isDark ? '0 1px 4px rgba(0,0,0,0.3)' : '0 1px 4px rgba(0,0,0,0.08)') : 'none',
                                        }}>
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                            <AnimatePresence>
                                {formData.projectType === 'contract' && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="overflow-hidden">
                                        <div className="pt-3">
                                            <label style={{ ...labelCls, marginBottom: 4 }}>Contract</label>
                                            <div className="relative">
                                                <select
                                                    value={formData.contractName || ''}
                                                    onChange={e => updateField('contractName', e.target.value)}
                                                    style={{
                                                        ...inputBase,
                                                        appearance: 'none',
                                                        WebkitAppearance: 'none',
                                                        paddingRight: 36,
                                                        cursor: 'pointer',
                                                    }}>
                                                    <option value="">Select Contract</option>
                                                    {Object.keys(CONTRACTS_DATA).map(k => (
                                                        <option key={k} value={k}>{CONTRACTS_DATA[k].name}</option>
                                                    ))}
                                                </select>
                                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: colors.textSecondary }} />
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Dealer & A&D */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <label style={labelCls}>Dealer *</label>
                                <SearchSelect value={formData.dealerName} onChange={v => updateField('dealerName', v)}
                                    options={DEALERS_LIST} placeholder="Search dealer..." theme={theme} onAddNew={() => {}} />
                                {errors.dealerName && <p className="mt-1 text-[11px] font-medium" style={{ color: colors.error }}>{errors.dealerName}</p>}
                            </div>
                            <div>
                                <label style={labelCls}>A&D Firm</label>
                                <SearchSelect value={formData.adName} onChange={v => updateField('adName', v)}
                                    options={AD_FIRMS_LIST} placeholder="Search A&D..." theme={theme} onAddNew={() => {}} />
                            </div>
                        </div>

                        {/* Items Needed */}
                        <div>
                            <label style={labelCls}>Items Needed</label>
                            <div className="flex flex-wrap gap-2">
                                {QUOTE_ITEMS.map(item => {
                                    const on = formData.itemsNeeded.includes(item.id);
                                    return (
                                        <button key={item.id} type="button" onClick={() => toggleItem(item.id)}
                                            className="px-4 py-2 rounded-full text-[11px] font-bold transition-all"
                                            style={{
                                                backgroundColor: on ? (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)') : 'transparent',
                                                color: on ? colors.textPrimary : colors.textSecondary,
                                                border: `1px solid ${on ? (isDark ? 'rgba(255,255,255,0.20)' : 'rgba(0,0,0,0.15)') : colors.border}`,
                                            }}>
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Document Formats */}
                        <div>
                            <label style={labelCls}>Document Formats</label>
                            <div className="flex flex-wrap gap-2">
                                {FORMAT_OPTIONS.map(fmt => {
                                    const on = formData.formats.includes(fmt.id);
                                    return (
                                        <button key={fmt.id} type="button" onClick={() => toggleFormat(fmt.id, !on)}
                                            className="px-3.5 py-1.5 rounded-full text-[11px] font-bold transition-all"
                                            style={{
                                                backgroundColor: on ? colors.accent : 'transparent',
                                                color: on ? (isDark ? '#1a1a1a' : '#FFFFFF') : colors.textSecondary,
                                                border: `1px solid ${on ? colors.accent : colors.border}`,
                                            }}>
                                            {fmt.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label style={labelCls}>Notes</label>
                            <textarea value={formData.projectInfo}
                                onChange={e => updateField('projectInfo', e.target.value)}
                                placeholder="Additional details or requirements..."
                                rows={2}
                                style={{ ...inputBase, height: 'auto', minHeight: 70, padding: 14, resize: 'none', lineHeight: '1.5' }} />
                        </div>

                        {/* Attachments */}
                        <div>
                            <label style={labelCls}>
                                <Upload className="w-3 h-3 inline mr-1 opacity-60" style={{ marginBottom: 1 }} />
                                Attachments
                            </label>
                            <button type="button"
                                onClick={() => document.getElementById('rfq-file-upload')?.click()}
                                className="w-full rounded-xl p-4 text-center transition-colors"
                                style={{ border: `2px dashed ${colors.border}`, color: colors.textSecondary }}
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hoverBg}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <input type="file" multiple onChange={handleFileChange} className="hidden" id="rfq-file-upload" />
                                <p className="text-[12px] font-medium">Click to upload files</p>
                            </button>
                            {formData.files.length > 0 && (
                                <div className="mt-2.5 flex flex-wrap gap-2">
                                    {formData.files.map((file, idx) => (
                                        <div key={idx} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium"
                                            style={{ backgroundColor: colors.subtle, color: colors.textPrimary }}>
                                            <FileText className="w-3 h-3 flex-shrink-0" style={{ color: colors.accent }} />
                                            <span className="max-w-[100px] truncate">{file.name}</span>
                                            <button type="button" onClick={() => removeFile(idx)}
                                                className="p-0.5 rounded-full transition-colors"
                                                onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hoverBg}
                                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                                <X className="w-3 h-3" style={{ color: colors.textSecondary }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Team Members */}
                        <div className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}` }}>
                            <button type="button" onClick={() => setShowTeamSection(!showTeamSection)}
                                className="w-full flex items-center justify-between px-4 py-3 transition-colors"
                                onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hoverBg}
                                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                                <div className="flex items-center gap-2.5">
                                    <Users className="w-4 h-4" style={{ color: colors.textSecondary, opacity: 0.6 }} />
                                    <span className="text-[12px] font-semibold" style={{ color: colors.textSecondary }}>Include Team Members</span>
                                    {formData.selectedTeamMembers.length > 0 && (
                                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ backgroundColor: colors.success, color: '#fff' }}>
                                            {formData.selectedTeamMembers.length}
                                        </span>
                                    )}
                                </div>
                                {showTeamSection
                                    ? <ChevronUp className="w-4 h-4" style={{ color: colors.textSecondary }} />
                                    : <ChevronDown className="w-4 h-4" style={{ color: colors.textSecondary }} />}
                            </button>
                            <AnimatePresence>
                                {showTeamSection && (
                                    <motion.div initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="px-4 py-3"
                                        style={{ borderTop: `1px solid ${colors.border}` }}>
                                        <div className="flex flex-wrap gap-2">
                                            {activeMembers.map(m =>
                                                <MiniAvatar key={m.id} member={m}
                                                    selected={formData.selectedTeamMembers.includes(m.id)}
                                                    onToggle={toggleTeamMember} isDark={isDark} colors={colors} />
                                            )}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </form>

                    {/* ── Footer ── */}
                    <div className="flex items-center justify-end gap-3 px-6 py-4"
                        style={{ borderTop: `1px solid ${colors.border}`, backgroundColor: colors.subtle }}>
                        <button type="button" onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-colors"
                            style={{ color: colors.textPrimary }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = colors.hoverBg}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}>
                            Cancel
                        </button>
                        <button type="submit" onClick={handleSubmit} disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-[0.98] disabled:opacity-60"
                            style={{ backgroundColor: colors.accent, color: isDark ? '#1a1a1a' : '#FFFFFF' }}>
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending...
                                </span>
                            ) : 'Submit Request'}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default RequestQuoteModal;
