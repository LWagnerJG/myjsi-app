import React, { useState, useMemo, useCallback, useRef } from 'react';
import { Trash2, ChevronUp, ChevronDown, Package, Send } from 'lucide-react';
import { FormInput } from '../../../../components/common/FormComponents.jsx';
import { LOAN_DURATIONS } from '../data.js';
import { hapticSuccess } from '../../../../utils/haptics.js';
import { createProjectDraft, getProjectDisplayName, projectNameMatches } from '../../../../utils/projectHelpers.js';

export const RequestItem = React.memo(({ item, onRemoveFromRequest, theme, isFirst = false }) => (
    <>
        {!isFirst && <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />}
        <div className="flex items-center space-x-3 py-2 px-1">
            <div
                className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center"
                style={{ backgroundColor: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}
            >
                <img src={item.img} alt={item.name} className="w-full h-full object-cover rounded-md" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                <p className="text-xs opacity-70" style={{ color: theme.colors.textSecondary }}>{item.model}</p>
            </div>
            <button
                onClick={() => onRemoveFromRequest(item.id)}
                className="w-6 h-6 flex items-center justify-center rounded-full transition-all duration-200 transform active:scale-90 hover:bg-black/5 dark:hover:bg-white/5 dark:hover:bg-white/5"
            >
                <Trash2 className="w-3 h-3" style={{ color: theme.colors.error }} />
            </button>
        </div>
    </>
));
RequestItem.displayName = 'RequestItem';

export const RequestDrawer = ({
    requestItems,
    onRemoveFromRequest,
    onSubmitRequest,
    theme,
    userSettings,
    myProjects = [],
    setMyProjects
}) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [requestForm, setRequestForm] = useState({
        contactName: '',
        email: '',
        phone: '',
        duration: '',
        purpose: '',
        projectName: '',
        address: userSettings?.homeAddress || '',
    });

    const totalRequestItems = requestItems.length;

    const inputRef = useRef(null);
    const filteredProjects = useMemo(() => {
        const q = requestForm.projectName.trim().toLowerCase();
        if (!q) return (myProjects || []).slice(0, 6);
        return (myProjects || []).filter(p => getProjectDisplayName(p).toLowerCase().includes(q)).slice(0, 6);
    }, [requestForm.projectName, myProjects]);

    const selectProject = useCallback((name) => {
        setRequestForm(prev => ({ ...prev, projectName: name }));
        inputRef.current?.blur();
    }, []);

    const ensureProjectExists = useCallback((nameRaw) => {
        const name = (nameRaw || '').trim();
        if (!name) return null;
        const exists = (myProjects || []).some(p => projectNameMatches(p, name));
        if (exists) return null;

        const newProject = createProjectDraft(name);

        if (typeof setMyProjects === 'function') {
            setMyProjects(prev => [newProject, ...(prev || [])]);
        }

        try {
            window.dispatchEvent(new CustomEvent('myjsi:create-project', { detail: newProject }));
            localStorage.setItem('myjsi:lastNewProject', JSON.stringify(newProject));
        } catch (_) { /* no-op */ }

        return newProject;
    }, [myProjects, setMyProjects]);

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (
            requestItems.length === 0 ||
            !requestForm.contactName.trim() ||
            !requestForm.email.trim() ||
            !requestForm.phone.trim() ||
            !requestForm.address.trim() ||
            !requestForm.duration.trim()
        ) return;

        hapticSuccess();
        ensureProjectExists(requestForm.projectName);
        onSubmitRequest(requestForm);

        setRequestForm({
            contactName: '',
            email: '',
            phone: '',
            duration: '',
            purpose: '',
            projectName: '',
            address: userSettings?.homeAddress || '',
        });
        setIsExpanded(false);
    }, [requestItems, requestForm, ensureProjectExists, onSubmitRequest, userSettings]);

    if (totalRequestItems === 0) return null;

    return (
        <div
            className="fixed bottom-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out shadow-2xl"
            style={{
                backgroundColor: theme.colors.surface,
                borderTop: `1px solid ${theme.colors.border}`,
                transform: `translateY(${isExpanded ? '0' : 'calc(100% - 64px)'})`,
                paddingBottom: 'env(safe-area-inset-bottom)'
            }}
        >
            {/* Header / Toggle */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full h-16 px-4 flex items-center justify-between transition-colors hover:bg-black/5 dark:hover:bg-white/5"
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Package className="w-6 h-6" style={{ color: theme.colors.accent }} />
                        <span
                            className="absolute -top-2 -right-2 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                            style={{ backgroundColor: theme.colors.accent }}
                        >
                            {totalRequestItems}
                        </span>
                    </div>
                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {totalRequestItems} Item{totalRequestItems !== 1 ? 's' : ''} Selected
                    </span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>
                        {isExpanded ? 'Close' : 'Review & Request'}
                    </span>
                    {isExpanded ? (
                        <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    ) : (
                        <ChevronUp className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                    )}
                </div>
            </button>

            {/* Expanded Content */}
            <div className="px-4 pb-6 max-h-[70vh] overflow-y-auto scrollbar-hide">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Selected Items List */}
                    <div className="space-y-2">
                        <h3 className="font-semibold text-sm mb-3" style={{ color: theme.colors.textPrimary }}>Selected Items</h3>
                        <div className="rounded-xl border overflow-hidden" style={{ borderColor: theme.colors.border }}>
                            {requestItems.map((item, index) => (
                                <RequestItem
                                    key={item.id}
                                    item={item}
                                    onRemoveFromRequest={onRemoveFromRequest}
                                    theme={theme}
                                    isFirst={index === 0}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Request Form */}
                    <div>
                        <h3 className="font-semibold text-sm mb-3" style={{ color: theme.colors.textPrimary }}>Request Details</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <FormInput
                                    label="Contact Name"
                                    value={requestForm.contactName}
                                    onChange={(e) => setRequestForm({ ...requestForm, contactName: e.target.value })}
                                    required
                                    theme={theme}
                                />
                                <FormInput
                                    label="Email"
                                    type="email"
                                    value={requestForm.email}
                                    onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                                    required
                                    theme={theme}
                                />
                                <FormInput
                                    label="Phone"
                                    type="tel"
                                    value={requestForm.phone}
                                    onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                                    required
                                    theme={theme}
                                />
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold ml-1" style={{ color: theme.colors.textSecondary }}>
                                        Duration <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={requestForm.duration}
                                        onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                                        required
                                        className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none appearance-none"
                                        style={{
                                            backgroundColor: theme.colors.subtle,
                                            color: theme.colors.textPrimary,
                                            border: `1px solid ${theme.colors.border}`,
                                        }}
                                    >
                                        <option value="">Select duration...</option>
                                        {LOAN_DURATIONS.map(d => (
                                            <option key={d.id} value={d.id}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="relative">
                                <FormInput
                                    label="Project Name (Optional)"
                                    value={requestForm.projectName}
                                    onChange={(e) => setRequestForm({ ...requestForm, projectName: e.target.value })}
                                    placeholder="Search or enter project name..."
                                    theme={theme}
                                    ref={inputRef}
                                />
                                {requestForm.projectName && document.activeElement === inputRef.current && filteredProjects.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 rounded-xl shadow-lg border overflow-hidden" style={{ backgroundColor: theme.colors.surface, borderColor: theme.colors.border }}>
                                        {filteredProjects.map((p, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                className="w-full text-left px-4 py-2 text-sm hover:bg-black/5 transition-colors"
                                                style={{ color: theme.colors.textPrimary }}
                                                onMouseDown={() => selectProject(p.name || p.projectName)}
                                            >
                                                {p.name || p.projectName}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold ml-1" style={{ color: theme.colors.textSecondary }}>
                                    Shipping Address <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={requestForm.address}
                                    onChange={(e) => setRequestForm({ ...requestForm, address: e.target.value })}
                                    required
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none resize-none"
                                    style={{
                                        backgroundColor: theme.colors.subtle,
                                        color: theme.colors.textPrimary,
                                        border: `1px solid ${theme.colors.border}`,
                                    }}
                                    placeholder="Enter full shipping address..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold ml-1" style={{ color: theme.colors.textSecondary }}>
                                    Purpose / Notes
                                </label>
                                <textarea
                                    value={requestForm.purpose}
                                    onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                                    rows={2}
                                    className="w-full px-4 py-2.5 rounded-xl text-sm transition-all outline-none resize-none"
                                    style={{
                                        backgroundColor: theme.colors.subtle,
                                        color: theme.colors.textPrimary,
                                        border: `1px solid ${theme.colors.border}`,
                                    }}
                                    placeholder="Any special instructions or context..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={
                                    requestItems.length === 0 ||
                                    !requestForm.contactName.trim() ||
                                    !requestForm.email.trim() ||
                                    !requestForm.phone.trim() ||
                                    !requestForm.address.trim() ||
                                    !requestForm.duration.trim()
                                }
                                className="w-full py-3 rounded-xl font-bold text-sm transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: theme.colors.accent, color: '#fff' }}
                            >
                                <Send className="w-4 h-4" />
                                Submit Request
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};
