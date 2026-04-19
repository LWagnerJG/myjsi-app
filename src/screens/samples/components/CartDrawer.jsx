import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FloatingCart } from '../../../components/common/FloatingCart.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { ShoppingCart, ChevronDown, ChevronUp, Building2, Home, Send, CheckCircle, Search, MapPin, Plus, User, Briefcase, PenTool } from 'lucide-react';
import { hapticSuccess } from '../../../utils/haptics.js';
import { SAMPLE_CATEGORIES, FINISH_CATEGORIES } from '../data.js';
import { getSampleProduct } from '../sampleIndex.js';
import { DrawerItem } from './DrawerItem.jsx';
import { PrimaryButton } from '../../../components/common/JSIButtons.jsx';
import { getUnifiedBackdropStyle, UNIFIED_BACKDROP_TRANSITION, UNIFIED_MODAL_Z } from '../../../components/common/modalUtils.js';
import { getBottomSheetMotion, getModalMotion, MOTION_DURATIONS_MS, MOTION_EASINGS, buildCssTransition } from '../../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';

const idOf = (x) => String(x);

const CONTACT_TYPES = [
    { id: 'dealer', label: 'Dealer', icon: Briefcase, color: '#4A7C59' },
    { id: 'design', label: 'Design Firm', icon: PenTool, color: '#5B7B8C' },
    { id: 'end-user', label: 'End User', icon: User, color: '#8B7355' },
];

export const CartDrawer = ({ cart, onUpdateCart, theme, userSettings, dealers, designFirms, initialOpen = false, onNavigate, onSubmitOrder }) => {
    const [isExpanded, setIsExpanded] = useState(initialOpen);
    const [dirOpen, setDirOpen] = useState(false);
    const [dirQuery, setDirQuery] = useState('');
    const [shipToName, setShipToName] = useState('');
    const [address1, setAddress1] = useState(userSettings?.homeAddress || '');
    const [address2, setAddress2] = useState('');
    const [shipToType, setShipToType] = useState('end-user');
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [overlayPhase, setOverlayPhase] = useState('idle');
    const [newContactType, setNewContactType] = useState(null);
    const [creatingNew, setCreatingNew] = useState(false);
    const isDark = isDarkTheme(theme);
    const prefersReduced = usePrefersReducedMotion();
    const sheetMotion = getBottomSheetMotion(prefersReduced);
    const modalMotion = getModalMotion(prefersReduced);
    const dirSearchRef = useRef(null);
    const addr1Ref = useRef(null);

    const safeSetShipTo = (v) => setShipToName(v ?? '');
    const safeSetAddress1 = (v) => setAddress1(v ?? '');
    const safeSetAddress2 = (v) => setAddress2(v ?? '');

    // Directory items (inline)
    const dirItems = useMemo(() => {
        const normalize = (x, idx, type) => ({
            key: `${x?.id ?? x?.name ?? 'item'}-${idx}`,
            name: x?.name ?? x?.company ?? x?.title ?? 'Unknown',
            address: x?.address ?? x?.Address ?? x?.location ?? x?.street ?? x?.office ?? '',
            type,
        });
        const list = [
            ...(dealers || []).map((d, i) => normalize(d, i, 'dealer')),
            ...(designFirms || []).map((d, i) => normalize(d, i + 1000, 'design')),
        ];
        const k = dirQuery.trim().toLowerCase();
        return k ? list.filter((i) => i.name.toLowerCase().includes(k) || i.address.toLowerCase().includes(k)) : list;
    }, [dirQuery, dealers, designFirms]);

    useEffect(() => {
        if (dirOpen && dirSearchRef.current) dirSearchRef.current.focus();
        if (!dirOpen) setDirQuery('');
    }, [dirOpen]);

    const cartItems = useMemo(() => Object.entries(cart).map(([rawId, quantity]) => {
        const id = idOf(rawId);
        if (id === 'full-jsi-set') return { id, name: 'Full JSI Sample Set', quantity, isSet: true };
        if (id.startsWith('set-')) { const categoryId = id.replace('set-', ''); const categoryName = FINISH_CATEGORIES.find((c) => c.id === categoryId)?.name || SAMPLE_CATEGORIES.find((c) => c.id === categoryId)?.name || categoryId; return { id, name: `All ${categoryName} Finishes`, quantity, isSet: true }; }
        const product = getSampleProduct(id); return product ? { ...product, id, quantity, isSet: false } : null;
    }).filter(Boolean), [cart]);

    const totalCartItems = useMemo(() => Object.values(cart).reduce((s, q) => s + q, 0), [cart]);

    const submit = useCallback(() => {
        if (!shipToName.trim() || !address1.trim() || cartItems.length === 0) return;
        hapticSuccess();
        onSubmitOrder?.({
            cartItems,
            shipToName,
            address1,
            address2,
            shipToType,
        });
        setIsExpanded(false);
        setJustSubmitted(true); setOverlayPhase('enter');
        Object.entries(cart).forEach(([id, qty]) => { if (qty > 0) onUpdateCart({ id }, -qty); });
        setTimeout(() => setOverlayPhase('hold'), prefersReduced ? 200 : 400);
        setTimeout(() => { setOverlayPhase('exit'); }, prefersReduced ? 1200 : 2000);
        setTimeout(() => { onNavigate && onNavigate('home'); }, prefersReduced ? 1600 : 2600);
    }, [shipToName, address1, cartItems, cart, onUpdateCart, onNavigate, onSubmitOrder, address2, shipToType, prefersReduced]);

    const handleCreateNew = useCallback((type) => {
        setNewContactType(type);
        setShipToType(type);
        safeSetShipTo(dirQuery.trim());
        setDirOpen(false);
        setCreatingNew(false);
        setTimeout(() => addr1Ref.current?.focus(), 120);
    }, [dirQuery]);

    const canSubmit = totalCartItems > 0 && shipToName.trim() && address1.trim();
    if (totalCartItems === 0 && !justSubmitted) return null;

    return (
        <>
            {/* Floating cart pill  shared component */}
            {!isExpanded && (
                <FloatingCart
                    itemCount={totalCartItems}
                    label={`View Cart (${totalCartItems})`}
                    onClick={() => setIsExpanded(true)}
                    theme={theme}
                />
            )}

            {/* Expanded drawer modal */}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                {isExpanded && (
                    <div className="fixed inset-0 flex items-start justify-center pt-[8vh] sm:pt-[10vh]" style={{ zIndex: UNIFIED_MODAL_Z }} onClick={() => setIsExpanded(false)}>
                        <motion.div
                            initial={modalMotion.backdrop.initial}
                            animate={modalMotion.backdrop.animate}
                            exit={modalMotion.backdrop.exit}
                            transition={modalMotion.backdrop.transition}
                            className="absolute inset-0"
                            style={getUnifiedBackdropStyle(true, prefersReduced)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.96, y: 24 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.96, y: 24 }}
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                            className="relative w-[calc(100%-2rem)] max-w-md rounded-3xl overflow-hidden"
                            style={{ backgroundColor: theme.colors.surface, boxShadow: '0 8px 32px -4px rgba(0,0,0,0.14)', maxHeight: '80vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setIsExpanded(false)}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)' }}>
                                    <ShoppingCart className="w-[18px] h-[18px]" style={{ color: theme.colors.textPrimary }} />
                                </div>
                                <div>
                                    <p className="font-bold text-[0.9375rem] leading-tight" style={{ color: theme.colors.textPrimary }}>
                                        Your Samples
                                    </p>
                                    <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
                                        {totalCartItems} item{totalCartItems !== 1 ? 's' : ''}
                                    </p>
                                </div>
                            </div>
                            <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary, opacity: 0.6 }} />
                        </div>

                        {/* Divider */}
                        <div className="mx-5" style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />

                        {/* Scrollable content */}
                        <div className="px-5 pb-5 pt-1 overflow-y-auto scrollbar-hide flex flex-col gap-5" style={{ maxHeight: 'calc(80vh - 72px)' }}>
                            {/* Items */}
                            <div>
                                {cartItems.map((item, idx) => (
                                    <React.Fragment key={item.id}>
                                        {idx > 0 && <div style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }} />}
                                        <DrawerItem item={item} onUpdateCart={onUpdateCart} theme={theme} />
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }} />

                            {/* Ship To */}
                            <div className="flex flex-col gap-2.5">
                                <p className="text-xs font-bold uppercase tracking-widest px-0.5" style={{ color: theme.colors.textSecondary }}>Ship To</p>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setDirOpen(v => !v)}
                                        className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all"
                                        style={{
                                            background: dirOpen
                                                ? (isDark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.08)')
                                                : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'),
                                            color: theme.colors.textPrimary,
                                        }}
                                    >
                                        <Building2 className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        Directory
                                        {dirOpen
                                            ? <ChevronUp className="w-3.5 h-3.5 ml-0.5" style={{ color: theme.colors.textSecondary }} />
                                            : <ChevronDown className="w-3.5 h-3.5 ml-0.5" style={{ color: theme.colors.textSecondary }} />
                                        }
                                    </button>
                                    <button
                                        onClick={() => { setDirOpen(false); safeSetShipTo('Home'); safeSetAddress1(userSettings?.homeAddress || ''); safeSetAddress2(''); setShipToType('personal'); setNewContactType(null); setCreatingNew(false); }}
                                        className="flex items-center gap-2 text-sm font-semibold px-5 py-2.5 rounded-full active:scale-95 transition-all"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}
                                    >
                                        <Home className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                                        Home
                                    </button>
                                </div>

                                {/* Inline directory dropdown */}
                                <AnimatePresence>
                                    {dirOpen && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 34 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'}`, backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.015)' }}>
                                                {/* Search */}
                                                <div className="relative px-3 pt-3 pb-2">
                                                    <input
                                                        ref={dirSearchRef}
                                                        value={dirQuery}
                                                        onChange={(e) => setDirQuery(e.target.value)}
                                                        placeholder="Search directory..."
                                                        className="w-full rounded-full pl-9 pr-4 py-2.5 text-sm outline-none transition"
                                                        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme.colors.textPrimary }}
                                                    />
                                                    <Search className="w-3.5 h-3.5 absolute left-6 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary, opacity: 0.6 }} />
                                                </div>
                                                {/* Results */}
                                                <div className="max-h-[28vh] overflow-y-auto scrollbar-hide px-1.5 pb-1.5">
                                                    {dirItems.map((it) => (
                                                        <button
                                                            key={it.key}
                                                            onClick={() => { safeSetShipTo(it.name); safeSetAddress1(it.address || ''); safeSetAddress2(''); setShipToType(it.type); setNewContactType(null); setDirOpen(false); setCreatingNew(false); }}
                                                            className="w-full text-left px-3 py-2.5 rounded-xl group transition-all active:scale-[0.99]"
                                                            style={{ backgroundColor: 'transparent' }}
                                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.03)'; }}
                                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                                                        >
                                                            <div className="flex items-center gap-2.5">
                                                                <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.05)' }}>
                                                                    <Building2 className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-1.5">
                                                                        <p className="font-semibold text-sm truncate" style={{ color: theme.colors.textPrimary }}>{it.name}</p>
                                                                        {it.type === 'dealer' && <span className="text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.08)', color: theme.colors.success }}>Dealer</span>}
                                                                        {it.type === 'design' && <span className="text-[0.6rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(91,123,140,0.15)' : 'rgba(91,123,140,0.08)', color: '#5B7B8C' }}>Design</span>}
                                                                    </div>
                                                                    {it.address && (
                                                                        <div className="flex items-center gap-1 mt-0.5">
                                                                            <MapPin className="w-2.5 h-2.5 flex-shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.5 }} />
                                                                            <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>{it.address}</p>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </button>
                                                    ))}
                                                    {dirItems.length === 0 && dirQuery.trim() && (
                                                        <div className="flex flex-col items-center py-4 px-3 gap-3">
                                                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>No matches for "{dirQuery.trim()}"</p>
                                                            {!creatingNew ? (
                                                                <button
                                                                    onClick={() => setCreatingNew(true)}
                                                                    className="flex items-center gap-2 text-sm font-semibold px-4 py-2.5 rounded-full active:scale-95 transition-all"
                                                                    style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}
                                                                >
                                                                    <Plus className="w-3.5 h-3.5" />
                                                                    Create "{dirQuery.trim()}"
                                                                </button>
                                                            ) : (
                                                                <motion.div
                                                                    initial={{ opacity: 0, y: 6 }}
                                                                    animate={{ opacity: 1, y: 0 }}
                                                                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                                                    className="w-full flex flex-col gap-2"
                                                                >
                                                                    <p className="text-xs font-bold uppercase tracking-widest text-center" style={{ color: theme.colors.textSecondary }}>Select type</p>
                                                                    <div className="flex gap-2 justify-center">
                                                                        {CONTACT_TYPES.map(ct => (
                                                                            <button
                                                                                key={ct.id}
                                                                                onClick={() => handleCreateNew(ct.id)}
                                                                                className="flex flex-col items-center gap-1.5 px-3 py-2.5 rounded-2xl active:scale-95 transition-all flex-1"
                                                                                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}
                                                                            >
                                                                                <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: `${ct.color}15` }}>
                                                                                    <ct.icon className="w-3.5 h-3.5" style={{ color: ct.color }} />
                                                                                </div>
                                                                                <span className="text-[0.6875rem] font-semibold" style={{ color: theme.colors.textPrimary }}>{ct.label}</span>
                                                                            </button>
                                                                        ))}
                                                                    </div>
                                                                </motion.div>
                                                            )}
                                                        </div>
                                                    )}
                                                    {dirItems.length === 0 && !dirQuery.trim() && (
                                                        <div className="flex flex-col items-center py-6">
                                                            <p className="text-sm" style={{ color: theme.colors.textSecondary }}>Type to search directory</p>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="relative">
                                    <input value={shipToName || ''} onChange={(e) => safeSetShipTo(e.target.value)} placeholder="Recipient / Company" className="w-full rounded-full px-4 py-3 text-sm outline-none transition placeholder:text-current placeholder:opacity-40" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}`, paddingRight: newContactType ? '5.5rem' : undefined }} />
                                    {newContactType && (() => { const ct = CONTACT_TYPES.find(c => c.id === newContactType); return ct ? (
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.6rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ backgroundColor: `${ct.color}15`, color: ct.color }}>{ct.label}</span>
                                    ) : null; })()}
                                </div>
                                <input ref={addr1Ref} value={address1 || ''} onChange={(e) => safeSetAddress1(e.target.value)} placeholder="Street address" className="w-full rounded-full px-4 py-3 text-sm outline-none transition placeholder:text-current placeholder:opacity-40" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }} />
                                <input value={address2 || ''} onChange={(e) => safeSetAddress2(e.target.value)} placeholder="Suite / Unit" className="w-full rounded-full px-4 py-3 text-sm outline-none transition placeholder:text-current placeholder:opacity-40" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary, border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }} />
                            </div>

                            {/* Submit */}
                            <PrimaryButton
                                type="button"
                                onClick={submit}
                                theme={theme}
                                disabled={!canSubmit}
                                fullWidth
                                className="py-3.5 text-sm rounded-full"
                                icon={<Send className="w-4 h-4" />}
                            >
                                Submit Request
                            </PrimaryButton>
                        </div>
                        </motion.div>
                    </div>
                )}
                </AnimatePresence>,
                document.body
            )}
            {typeof document !== 'undefined' && createPortal(
                <AnimatePresence>
                {justSubmitted && (
                    <motion.div
                        className="fixed inset-0 flex items-center justify-center"
                        style={{ zIndex: UNIFIED_MODAL_Z + 100 }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <motion.div
                            className="absolute inset-0"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.4 }}
                            style={{
                                background: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.85)',
                                backdropFilter: prefersReduced ? 'none' : 'blur(20px)',
                                WebkitBackdropFilter: prefersReduced ? 'none' : 'blur(20px)',
                            }}
                        />
                        <motion.div
                            className="relative flex flex-col items-center gap-5"
                            initial={{ opacity: 0, scale: 0.8, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -30 }}
                            transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
                        >
                            <motion.div
                                className="w-20 h-20 rounded-full flex items-center justify-center"
                                style={{ backgroundColor: `${theme.colors.success}18` }}
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                            >
                                <motion.div
                                    initial={{ pathLength: 0 }}
                                    animate={{ pathLength: 1 }}
                                    transition={{ delay: 0.4, duration: 0.4, ease: 'easeOut' }}
                                >
                                    <CheckCircle className="w-10 h-10" style={{ color: theme.colors.success }} />
                                </motion.div>
                            </motion.div>
                            <div className="text-center px-8">
                                <motion.p
                                    className="font-black text-xl tracking-tight"
                                    style={{ color: theme.colors.textPrimary }}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.35 }}
                                >
                                    Request Submitted
                                </motion.p>
                                <motion.p
                                    className="text-sm mt-2 leading-relaxed"
                                    style={{ color: theme.colors.textSecondary }}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    Your samples are on the way to{' '}
                                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>{shipToName || 'you'}</span>
                                </motion.p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
                </AnimatePresence>,
                document.body
            )}
        </>
    );
};
