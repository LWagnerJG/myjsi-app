// RequestQuoteModal - Condensed single-screen quote request form
import React, { useState, useCallback, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { X, FileText, Calendar, CheckCircle2, Upload, AlertCircle, ChevronDown, ChevronUp, Users, Search, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { INITIAL_MEMBERS } from '../../screens/members/data.js';

// Document format options
const FORMAT_OPTIONS = [
    { id: 'pdf', label: 'PDF', default: true },
    { id: 'dwg', label: 'DWG' },
    { id: 'sif', label: 'SIF' },
    { id: 'sp4', label: 'SP4' },
    { id: 'cdb', label: 'CDB' },
    { id: 'dxf', label: 'DXF' },
];

// Items needed options
const QUOTE_ITEMS = [
    { id: 'specCheck', label: 'Spec Check' },
    { id: 'quoteWorksheet', label: 'Quote Worksheet' },
    { id: 'drawing2d3d', label: '2D/3D Drawing' },
    { id: 'colorRendering', label: 'Color Rendering' },
];

// Mock dealer/A&D data - in real app would come from API
const DEALERS_LIST = [
    'ABC Office Solutions',
    'Modern Workspace Co',
    'Premier Office Interiors',
    'Workplace Design Group',
    'Contract Furniture Inc',
    'Office Innovations',
    'Collaborative Spaces',
    'Executive Environments',
];

const AD_FIRMS_LIST = [
    'Smith & Associates Architects',
    'Design Collective Studio',
    'Urban Planning Partners',
    'Interior Design Group',
    'Architectural Solutions',
    'Creative Spaces Design',
    'Commercial Design Firm',
];

// Compact search input with dropdown
const SearchSelect = ({ value, onChange, options, placeholder, theme, onAddNew }) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const colors = theme?.colors || {};
    
    const filtered = useMemo(() => {
        if (!query) return options.slice(0, 8);
        return options.filter(o => o.toLowerCase().includes(query.toLowerCase())).slice(0, 8);
    }, [options, query]);

    const canCreate = query && !options.some(o => o.toLowerCase() === query.toLowerCase());

    return (
        <div className="relative">
            <div 
                className="flex items-center gap-2 px-3 cursor-text"
                style={{ 
                    height: 44, 
                    borderRadius: 12, 
                    backgroundColor: colors.surface,
                    border: `1px solid ${colors.border}`,
                }}
                onClick={() => setOpen(true)}
            >
                <Search className="w-4 h-4" style={{ color: colors.textSecondary }} />
                {value ? (
                    <div className="flex-1 flex items-center justify-between">
                        <span className="text-sm" style={{ color: colors.textPrimary }}>{value}</span>
                        <button 
                            onClick={(e) => { e.stopPropagation(); onChange(''); }}
                            className="p-1 rounded-full hover:bg-black/5"
                        >
                            <X className="w-3 h-3" style={{ color: colors.textSecondary }} />
                        </button>
                    </div>
                ) : (
                    <input
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                        placeholder={placeholder}
                        className="flex-1 bg-transparent outline-none text-sm"
                        style={{ color: colors.textPrimary }}
                        onFocus={() => setOpen(true)}
                    />
                )}
            </div>
            
            {open && !value && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
                    <div 
                        className="absolute top-full left-0 right-0 mt-1 rounded-xl overflow-hidden shadow-lg z-50"
                        style={{ backgroundColor: colors.surface, border: `1px solid ${colors.border}` }}
                    >
                        {filtered.map((opt) => (
                            <button
                                key={opt}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-black/5"
                                style={{ color: colors.textPrimary }}
                                onClick={() => { onChange(opt); setQuery(''); setOpen(false); }}
                            >
                                {opt}
                            </button>
                        ))}
                        {canCreate && onAddNew && (
                            <>
                                <div className="h-px" style={{ backgroundColor: colors.border }} />
                                <button
                                    className="w-full text-left px-3 py-2 text-sm font-medium flex items-center gap-2 hover:bg-black/5"
                                    style={{ color: colors.accent }}
                                    onClick={() => { onAddNew(query); onChange(query); setQuery(''); setOpen(false); }}
                                >
                                    <Plus className="w-3.5 h-3.5" /> Add "{query}"
                                </button>
                            </>
                        )}
                        {!filtered.length && !canCreate && (
                            <div className="px-3 py-2 text-sm" style={{ color: colors.textSecondary }}>
                                No results
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

// Compact toggle pill
const FormatToggle = ({ id, label, checked, onChange, colors }) => (
    <button
        type="button"
        onClick={() => onChange(id, !checked)}
        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
        style={{
            backgroundColor: checked ? colors.accent : colors.subtle,
            color: checked ? '#FFFFFF' : colors.textSecondary,
            border: `1px solid ${checked ? colors.accent : colors.border}`,
        }}
    >
        {label}
    </button>
);

// Team member mini avatar
const MiniAvatar = ({ member, selected, onToggle, colors }) => {
    const initials = `${member.firstName?.[0] || ''}${member.lastName?.[0] || ''}`.toUpperCase();
    return (
        <button
            type="button"
            onClick={() => onToggle(member.id)}
            className="relative group"
            title={`${member.firstName} ${member.lastName}`}
        >
            <div 
                className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                style={{ 
                    backgroundColor: selected ? colors.accent : colors.subtle,
                    color: selected ? '#FFFFFF' : colors.textPrimary,
                    border: `2px solid ${selected ? colors.accent : 'transparent'}`,
                }}
            >
                {initials}
            </div>
            {selected && (
                <div 
                    className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: '#4A7C59' }}
                >
                    <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                </div>
            )}
        </button>
    );
};

export const RequestQuoteModal = ({ show, onClose, theme, onSubmit, members = INITIAL_MEMBERS, initialData }) => {
    const [formData, setFormData] = useState({
        projectName: '',
        quoteType: 'new',
        neededByDate: '',
        neededByTime: '',
        projectType: 'commercial',
        dealerName: '',
        adName: '',
        itemsNeeded: [],
        formats: ['pdf'],
        projectInfo: '',
        files: [],
        selectedTeamMembers: [],
    });

    // Pre-fill from initialData when modal opens
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

    const colors = useMemo(() => ({
        background: theme?.colors?.background || '#F0EDE8',
        surface: theme?.colors?.surface || '#FFFFFF',
        textPrimary: theme?.colors?.textPrimary || '#353535',
        textSecondary: theme?.colors?.textSecondary || '#666666',
        border: theme?.colors?.border || '#E3E0D8',
        accent: theme?.colors?.accent || '#353535',
        subtle: theme?.colors?.subtle || '#F5F3EF',
        success: '#4A7C59',
        error: '#B85C5C',
    }), [theme]);

    const activeMembers = useMemo(() => members.filter(m => m.status === 'active'), [members]);

    const updateField = useCallback((field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
    }, [errors]);

    const toggleTeamMember = useCallback((memberId) => {
        setFormData(prev => ({
            ...prev,
            selectedTeamMembers: prev.selectedTeamMembers.includes(memberId)
                ? prev.selectedTeamMembers.filter(id => id !== memberId)
                : [...prev.selectedTeamMembers, memberId]
        }));
    }, []);

    const toggleItem = useCallback((itemId) => {
        setFormData(prev => ({
            ...prev,
            itemsNeeded: prev.itemsNeeded.includes(itemId)
                ? prev.itemsNeeded.filter(id => id !== itemId)
                : [...prev.itemsNeeded, itemId]
        }));
    }, []);

    const toggleFormat = useCallback((formatId, checked) => {
        setFormData(prev => ({
            ...prev,
            formats: checked 
                ? [...prev.formats, formatId]
                : prev.formats.filter(id => id !== formatId)
        }));
    }, []);

    const handleFileChange = useCallback((e) => {
        const newFiles = Array.from(e.target.files || []);
        setFormData(prev => ({ ...prev, files: [...prev.files, ...newFiles] }));
    }, []);

    const removeFile = useCallback((index) => {
        setFormData(prev => ({ ...prev, files: prev.files.filter((_, i) => i !== index) }));
    }, []);

    const validateForm = useCallback(() => {
        const newErrors = {};
        if (!formData.projectName.trim()) newErrors.projectName = 'Required';
        if (!formData.dealerName.trim()) newErrors.dealerName = 'Required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1200));
        setIsSubmitting(false);
        setSubmitSuccess(true);
        
        setTimeout(() => {
            onSubmit?.(formData);
            setSubmitSuccess(false);
            setFormData({
                projectName: '', quoteType: 'new', neededByDate: '', neededByTime: '',
                projectType: 'commercial', dealerName: '', adName: '', itemsNeeded: [],
                formats: ['pdf'], projectInfo: '', files: [], selectedTeamMembers: [],
            });
            onClose();
        }, 1200);
    }, [formData, validateForm, onSubmit, onClose]);

    React.useEffect(() => {
        if (show) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => { document.body.style.overflow = prev; };
        }
    }, [show]);

    if (!show) return null;

    const inputStyle = {
        height: 44,
        borderRadius: 12,
        backgroundColor: colors.surface,
        border: `1px solid ${colors.border}`,
        color: colors.textPrimary,
        padding: '0 14px',
        fontSize: 14,
        outline: 'none',
        width: '100%',
    };

    const labelStyle = {
        color: colors.textSecondary,
        fontSize: 12,
        fontWeight: 600,
        marginBottom: 4,
        display: 'block',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
    };

    return ReactDOM.createPortal(
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 flex items-start justify-center z-[999] p-4 overflow-y-auto"
                onClick={onClose}
            >
                <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 20, scale: 0.98 }}
                    transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-lg my-6 rounded-3xl overflow-hidden relative"
                    style={{ backgroundColor: colors.surface, boxShadow: '0 25px 60px -12px rgba(0,0,0,0.25)' }}
                >
                    {/* Success Overlay */}
                    <AnimatePresence>
                        {submitSuccess && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 z-20 flex flex-col items-center justify-center"
                                style={{ backgroundColor: colors.surface }}
                            >
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                                >
                                    <CheckCircle2 className="w-14 h-14" style={{ color: colors.success }} />
                                </motion.div>
                                <p className="mt-3 text-base font-semibold" style={{ color: colors.textPrimary }}>
                                    Quote Request Sent!
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Header */}
                    <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: colors.border }}>
                        <div className="flex items-center gap-3">
                            <div 
                                className="w-10 h-10 rounded-2xl flex items-center justify-center"
                                style={{ backgroundColor: `${colors.accent}10` }}
                            >
                                <FileText className="w-5 h-5" style={{ color: colors.accent }} />
                            </div>
                            <h2 className="text-lg font-bold tracking-tight" style={{ color: colors.textPrimary }}>
                                Request a Quote
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="w-9 h-9 rounded-full flex items-center justify-center transition-colors hover:bg-black/5"
                        >
                            <X className="w-5 h-5" style={{ color: colors.textSecondary }} />
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto scrollbar-hide">
                        
                        {/* Project Name */}
                        <div>
                            <label style={labelStyle}>Project Name *</label>
                            <input
                                type="text"
                                value={formData.projectName}
                                onChange={(e) => updateField('projectName', e.target.value)}
                                placeholder="Enter project name"
                                style={{ ...inputStyle, borderColor: errors.projectName ? colors.error : colors.border }}
                            />
                        </div>

                        {/* Row: Type + Needed By */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label style={labelStyle}>Type</label>
                                <div className="flex p-0.5 rounded-lg" style={{ backgroundColor: colors.subtle }}>
                                    {['new', 'revision'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => updateField('quoteType', type)}
                                            className="flex-1 py-2 rounded-md text-xs font-semibold transition-all"
                                            style={{
                                                backgroundColor: formData.quoteType === type ? colors.surface : 'transparent',
                                                color: formData.quoteType === type ? colors.textPrimary : colors.textSecondary,
                                                boxShadow: formData.quoteType === type ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                                            }}
                                        >
                                            {type === 'new' ? 'New' : 'Revision'}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label style={labelStyle}>
                                    <Calendar className="w-3 h-3 inline mr-1" style={{ marginBottom: 1 }} />
                                    Needed By
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="date"
                                        value={formData.neededByDate}
                                        onChange={(e) => updateField('neededByDate', e.target.value)}
                                        style={{ ...inputStyle, flex: 1 }}
                                    />
                                    <input
                                        type="time"
                                        value={formData.neededByTime}
                                        onChange={(e) => updateField('neededByTime', e.target.value)}
                                        style={{ ...inputStyle, width: 90 }}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Project Type */}
                        <div>
                            <label style={labelStyle}>Project Type *</label>
                            <div className="grid grid-cols-2 gap-2">
                                {['commercial', 'contract'].map((type) => (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => updateField('projectType', type)}
                                        className="py-3 rounded-xl text-sm font-semibold transition-all"
                                        style={{
                                            backgroundColor: formData.projectType === type ? colors.accent : colors.subtle,
                                            color: formData.projectType === type ? '#FFFFFF' : colors.textPrimary,
                                            border: `1px solid ${formData.projectType === type ? colors.accent : colors.border}`,
                                        }}
                                    >
                                        {type.charAt(0).toUpperCase() + type.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Dealer & A&D */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label style={labelStyle}>Dealer *</label>
                                <SearchSelect
                                    value={formData.dealerName}
                                    onChange={(v) => updateField('dealerName', v)}
                                    options={DEALERS_LIST}
                                    placeholder="Search dealer..."
                                    theme={theme}
                                    onAddNew={() => {}}
                                />
                                {errors.dealerName && (
                                    <p className="mt-1 text-xs" style={{ color: colors.error }}>{errors.dealerName}</p>
                                )}
                            </div>
                            <div>
                                <label style={labelStyle}>A&D Firm</label>
                                <SearchSelect
                                    value={formData.adName}
                                    onChange={(v) => updateField('adName', v)}
                                    options={AD_FIRMS_LIST}
                                    placeholder="Search A&D..."
                                    theme={theme}
                                    onAddNew={() => {}}
                                />
                            </div>
                        </div>

                        {/* Items Needed - Clean pills */}
                        <div>
                            <label style={labelStyle}>Items Needed</label>
                            <div className="flex flex-wrap gap-2">
                                {QUOTE_ITEMS.map((item) => {
                                    const isSelected = formData.itemsNeeded.includes(item.id);
                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => toggleItem(item.id)}
                                            className="px-4 py-2 rounded-full text-xs font-semibold transition-all"
                                            style={{
                                                backgroundColor: isSelected ? `${colors.accent}15` : colors.subtle,
                                                color: isSelected ? colors.textPrimary : colors.textSecondary,
                                                border: `1px solid ${isSelected ? colors.accent : colors.border}`,
                                            }}
                                        >
                                            {item.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Document Formats */}
                        <div>
                            <label style={labelStyle}>Document Formats</label>
                            <div className="flex flex-wrap gap-2">
                                {FORMAT_OPTIONS.map((format) => (
                                    <FormatToggle
                                        key={format.id}
                                        id={format.id}
                                        label={format.label}
                                        checked={formData.formats.includes(format.id)}
                                        onChange={toggleFormat}
                                        colors={colors}
                                    />
                                ))}
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label style={labelStyle}>Notes</label>
                            <textarea
                                value={formData.projectInfo}
                                onChange={(e) => updateField('projectInfo', e.target.value)}
                                placeholder="Additional details or requirements..."
                                rows={2}
                                style={{ ...inputStyle, height: 'auto', minHeight: 60, padding: 12, resize: 'none' }}
                            />
                        </div>

                        {/* File Upload - Compact */}
                        <div>
                            <label style={labelStyle}>
                                <Upload className="w-3 h-3 inline mr-1" style={{ marginBottom: 1 }} />
                                Attachments
                            </label>
                            <div 
                                className="border border-dashed rounded-xl p-3 text-center cursor-pointer hover:bg-black/[0.02] transition-colors"
                                style={{ borderColor: colors.border }}
                                onClick={() => document.getElementById('quote-file-upload')?.click()}
                            >
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="quote-file-upload"
                                />
                                <p className="text-xs" style={{ color: colors.textSecondary }}>
                                    Click to upload files
                                </p>
                            </div>
                            {formData.files.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {formData.files.map((file, index) => (
                                        <div 
                                            key={index}
                                            className="flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs"
                                            style={{ backgroundColor: colors.subtle }}
                                        >
                                            <FileText className="w-3 h-3" style={{ color: colors.accent }} />
                                            <span className="max-w-[100px] truncate" style={{ color: colors.textPrimary }}>{file.name}</span>
                                            <button type="button" onClick={() => removeFile(index)} className="hover:bg-black/5 rounded p-0.5">
                                                <X className="w-3 h-3" style={{ color: colors.textSecondary }} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Team Section - Collapsible */}
                        <div className="border rounded-xl overflow-hidden" style={{ borderColor: colors.border }}>
                            <button
                                type="button"
                                onClick={() => setShowTeamSection(!showTeamSection)}
                                className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-black/[0.02] transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" style={{ color: colors.textSecondary }} />
                                    <span className="text-xs font-semibold" style={{ color: colors.textSecondary }}>
                                        Include Team Members
                                    </span>
                                    {formData.selectedTeamMembers.length > 0 && (
                                        <span 
                                            className="px-1.5 py-0.5 rounded-full text-[10px] font-bold"
                                            style={{ backgroundColor: colors.success, color: '#FFFFFF' }}
                                        >
                                            {formData.selectedTeamMembers.length}
                                        </span>
                                    )}
                                </div>
                                {showTeamSection ? (
                                    <ChevronUp className="w-4 h-4" style={{ color: colors.textSecondary }} />
                                ) : (
                                    <ChevronDown className="w-4 h-4" style={{ color: colors.textSecondary }} />
                                )}
                            </button>
                            
                            <AnimatePresence>
                                {showTeamSection && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                        className="border-t px-3 py-3"
                                        style={{ borderColor: colors.border }}
                                    >
                                        <div className="flex flex-wrap gap-2">
                                            {activeMembers.map((member) => (
                                                <MiniAvatar
                                                    key={member.id}
                                                    member={member}
                                                    selected={formData.selectedTeamMembers.includes(member.id)}
                                                    onToggle={toggleTeamMember}
                                                    colors={colors}
                                                />
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </form>

                    {/* Footer */}
                    <div 
                        className="flex items-center justify-end gap-3 px-6 py-4 border-t"
                        style={{ borderColor: colors.border, backgroundColor: colors.subtle }}
                    >
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-black/5 transition-colors"
                            style={{ color: colors.textPrimary }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-60"
                            style={{ backgroundColor: colors.accent, color: '#FFFFFF' }}
                        >
                            {isSubmitting ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Sending...
                                </span>
                            ) : (
                                'Submit Request'
                            )}
                        </button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>,
        document.body
    );
};

export default RequestQuoteModal;
