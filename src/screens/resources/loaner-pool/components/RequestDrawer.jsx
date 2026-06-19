import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Package } from 'lucide-react';
import { isDarkTheme, fieldTileSurface, modalCardSurface } from '../../../../design-system/tokens.js';
import { PrimaryButton } from '../../../../components/common/JSIButtons.jsx';
import { LOAN_DURATIONS } from '../data.js';
import { hapticSuccess } from '../../../../utils/haptics.js';
import { createProjectDraft, getProjectDisplayName, projectNameMatches } from '../../../../utils/projectHelpers.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z, ModalSafeAreaCover } from '../../../../components/common/modalUtils.js';
import { getModalMotion } from '../../../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../../../hooks/usePrefersReducedMotion.js';

const FIELD_CLASS = 'w-full min-h-[44px] px-3.5 rounded-2xl text-[0.8125rem] outline-none focus-ring transition-colors';

const RequestLineItem = React.memo(({ item, onRemove, theme, isDark }) => {
    const c = theme.colors;
    const tile = fieldTileSurface(theme);
    return (
        <div className="flex items-center gap-2.5 py-2">
            <div
                className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden flex items-center justify-center"
                style={{ ...tile, padding: 4 }}
            >
                <img src={item.img} alt="" className="w-full h-full object-contain" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[0.8125rem] font-semibold truncate" style={{ color: c.textPrimary }}>{item.name}</p>
                <p className="text-[0.6875rem] font-mono truncate" style={{ color: c.textSecondary, opacity: 0.75 }}>{item.model}</p>
            </div>
            <button
                type="button"
                onClick={() => onRemove(item.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95 focus-ring"
                style={{ color: c.textSecondary, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)' }}
                aria-label={`Remove ${item.name}`}
            >
                <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
        </div>
    );
});
RequestLineItem.displayName = 'RequestLineItem';

export const RequestDrawer = ({
    open,
    onOpenChange,
    requestItems,
    onRemoveFromRequest,
    onSubmitRequest,
    theme,
    userSettings,
    myProjects = [],
    setMyProjects,
}) => {
    const isDark = isDarkTheme(theme);
    const c = theme.colors;
    const tile = fieldTileSurface(theme);
    const prefersReduced = usePrefersReducedMotion();
    const modalMotion = getModalMotion(prefersReduced);

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
    const projectInputRef = useRef(null);
    const [projectFocused, setProjectFocused] = useState(false);

    const filteredProjects = useMemo(() => {
        const q = requestForm.projectName.trim().toLowerCase();
        if (!q) return (myProjects || []).slice(0, 5);
        return (myProjects || []).filter(p => getProjectDisplayName(p).toLowerCase().includes(q)).slice(0, 5);
    }, [requestForm.projectName, myProjects]);

    useEffect(() => {
        if (!open) return undefined;
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = prev; };
    }, [open]);

    const selectProject = useCallback((name) => {
        setRequestForm(prev => ({ ...prev, projectName: name }));
        setProjectFocused(false);
        projectInputRef.current?.blur();
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

    const canSubmit = totalRequestItems > 0
        && requestForm.contactName.trim()
        && requestForm.email.trim()
        && requestForm.phone.trim()
        && requestForm.address.trim()
        && requestForm.duration.trim();

    const handleSubmit = useCallback((e) => {
        e.preventDefault();
        if (!canSubmit) return;

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
        onOpenChange?.(false);
    }, [canSubmit, ensureProjectExists, onSubmitRequest, onOpenChange, requestForm, userSettings]);

    const fieldStyle = {
        ...tile,
        color: c.textPrimary,
    };

    if (totalRequestItems === 0) return null;

    const modal = typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
            {open ? (
                <motion.div
                    key="loaner-request-modal"
                    className="fixed inset-0 flex items-start justify-center pt-[6vh] sm:pt-[10vh] px-4"
                    style={{ zIndex: UNIFIED_MODAL_Z, ...getUnifiedBackdropStyle(true, prefersReduced), touchAction: 'none' }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={modalMotion.backdrop.transition}
                >
                    <div className="absolute inset-0" onClick={() => onOpenChange?.(false)} aria-hidden="true" />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 16 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.96, y: 16 }}
                        transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                        className="relative z-10 w-full max-w-lg rounded-[24px] overflow-hidden flex flex-col"
                        style={{ ...modalCardSurface(theme), maxHeight: 'min(85vh, 720px)' }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="loaner-request-title"
                    >
                        <div className="flex items-center justify-between gap-3 px-5 py-4 border-b flex-shrink-0" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)' }}>
                            <div className="min-w-0">
                                <h2 id="loaner-request-title" className="text-[0.9375rem] font-bold tracking-tight" style={{ color: c.textPrimary }}>
                                    Loaner Request
                                </h2>
                                <p className="text-[0.6875rem] mt-0.5" style={{ color: c.textSecondary }}>
                                    {totalRequestItems} item{totalRequestItems !== 1 ? 's' : ''} selected
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => onOpenChange?.(false)}
                                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 focus-ring"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.06)', color: c.textSecondary }}
                                aria-label="Close request"
                            >
                                <X className="w-4 h-4" aria-hidden="true" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-hide px-5 py-4 space-y-5">
                            <div>
                                <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: c.textSecondary, opacity: 0.7 }}>
                                    Selected items
                                </p>
                                <div className="divide-y" style={{ borderColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)' }}>
                                    {requestItems.map((item) => (
                                        <RequestLineItem
                                            key={item.id}
                                            item={item}
                                            onRemove={onRemoveFromRequest}
                                            theme={theme}
                                            isDark={isDark}
                                        />
                                    ))}
                                </div>
                            </div>

                            <form id="loaner-request-form" onSubmit={handleSubmit} className="space-y-3">
                                <p className="text-[0.625rem] font-bold uppercase tracking-[0.14em]" style={{ color: c.textSecondary, opacity: 0.7 }}>
                                    Contact &amp; shipping
                                </p>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    <input
                                        required
                                        value={requestForm.contactName}
                                        onChange={(e) => setRequestForm({ ...requestForm, contactName: e.target.value })}
                                        placeholder="Contact name"
                                        className={FIELD_CLASS}
                                        style={fieldStyle}
                                    />
                                    <input
                                        required
                                        type="email"
                                        value={requestForm.email}
                                        onChange={(e) => setRequestForm({ ...requestForm, email: e.target.value })}
                                        placeholder="Email"
                                        className={FIELD_CLASS}
                                        style={fieldStyle}
                                    />
                                    <input
                                        required
                                        type="tel"
                                        value={requestForm.phone}
                                        onChange={(e) => setRequestForm({ ...requestForm, phone: e.target.value })}
                                        placeholder="Phone"
                                        className={FIELD_CLASS}
                                        style={fieldStyle}
                                    />
                                    <select
                                        required
                                        value={requestForm.duration}
                                        onChange={(e) => setRequestForm({ ...requestForm, duration: e.target.value })}
                                        className={`${FIELD_CLASS} appearance-none`}
                                        style={{ ...fieldStyle, color: requestForm.duration ? c.textPrimary : c.textSecondary }}
                                    >
                                        <option value="">Loan duration</option>
                                        {LOAN_DURATIONS.map(d => (
                                            <option key={d.id} value={d.id}>{d.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <textarea
                                    required
                                    value={requestForm.address}
                                    onChange={(e) => setRequestForm({ ...requestForm, address: e.target.value })}
                                    rows={2}
                                    placeholder="Shipping address"
                                    className={`${FIELD_CLASS} resize-none py-2.5`}
                                    style={fieldStyle}
                                />

                                <div className="relative">
                                    <input
                                        ref={projectInputRef}
                                        value={requestForm.projectName}
                                        onChange={(e) => setRequestForm({ ...requestForm, projectName: e.target.value })}
                                        onFocus={() => setProjectFocused(true)}
                                        onBlur={() => setTimeout(() => setProjectFocused(false), 150)}
                                        placeholder="Project name (optional)"
                                        className={FIELD_CLASS}
                                        style={fieldStyle}
                                    />
                                    {projectFocused && filteredProjects.length > 0 ? (
                                        <div
                                            className="absolute z-20 w-full mt-1 rounded-2xl overflow-hidden shadow-lg"
                                            style={{ ...modalCardSurface(theme) }}
                                        >
                                            {filteredProjects.map((p, i) => (
                                                <button
                                                    key={i}
                                                    type="button"
                                                    className="w-full text-left px-3.5 py-2.5 text-[0.8125rem] transition-colors"
                                                    style={{ color: c.textPrimary }}
                                                    onMouseDown={() => selectProject(getProjectDisplayName(p))}
                                                >
                                                    {getProjectDisplayName(p)}
                                                </button>
                                            ))}
                                        </div>
                                    ) : null}
                                </div>

                                <textarea
                                    value={requestForm.purpose}
                                    onChange={(e) => setRequestForm({ ...requestForm, purpose: e.target.value })}
                                    rows={2}
                                    placeholder="Purpose or notes (optional)"
                                    className={`${FIELD_CLASS} resize-none py-2.5`}
                                    style={fieldStyle}
                                />
                            </form>
                        </div>

                        <div className="flex-shrink-0 px-5 py-4 border-t" style={{ borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.08)' }}>
                            <PrimaryButton
                                type="submit"
                                form="loaner-request-form"
                                theme={theme}
                                fullWidth
                                icon={<Send className="w-4 h-4" />}
                                disabled={!canSubmit}
                                className="h-11 !py-0 px-5 text-[0.8125rem] disabled:cursor-not-allowed"
                            >
                                Submit Request
                            </PrimaryButton>
                        </div>
                    </motion.div>
                </motion.div>
            ) : null}
        </AnimatePresence>,
        document.body,
    );

    return (
        <>
            <ModalSafeAreaCover visible={open} />
            {modal}
            {!open ? (
                <div
                    className="fixed bottom-0 left-0 right-0 z-40 px-4 pointer-events-none"
                    style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                >
                    <div className="max-w-content mx-auto flex justify-center">
                        <button
                            type="button"
                            onClick={() => onOpenChange?.(true)}
                            className="pointer-events-auto inline-flex items-center gap-2.5 rounded-full pl-4 pr-5 min-h-[48px] font-semibold text-[0.8125rem] shadow-lg transition-all active:scale-[0.98] focus-ring"
                            style={{ backgroundColor: c.accent, color: c.accentText || '#FFFFFF' }}
                        >
                            <span className="relative flex items-center justify-center w-8 h-8 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.18)' }}>
                                <Package className="w-4 h-4" aria-hidden="true" />
                                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full text-[0.625rem] font-bold flex items-center justify-center" style={{ backgroundColor: c.surface, color: c.accent }}>
                                    {totalRequestItems}
                                </span>
                            </span>
                            Review request
                        </button>
                    </div>
                </div>
            ) : null}
        </>
    );
};
