import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';
import { FloatingCart } from '../../../components/common/FloatingCart.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { ShoppingCart, ChevronDown, Building2, Home, Send, CheckCircle } from 'lucide-react';
import { hapticSuccess } from '../../../utils/haptics.js';
import { SAMPLE_CATEGORIES, FINISH_CATEGORIES } from '../data.js';
import { getSampleProduct } from '../sampleIndex.js';
import { DirectoryModal } from './DirectoryModal.jsx';
import { DrawerItem } from './DrawerItem.jsx';
import { getUnifiedBackdropStyle, UNIFIED_BACKDROP_TRANSITION, UNIFIED_MODAL_Z } from '../../../components/common/modalUtils.js';
import { getBottomSheetMotion, getModalMotion, MOTION_DURATIONS_MS, MOTION_EASINGS, buildCssTransition } from '../../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../../hooks/usePrefersReducedMotion.js';

const idOf = (x) => String(x);

export const CartDrawer = ({ cart, onUpdateCart, theme, userSettings, dealers, designFirms, initialOpen = false, onNavigate }) => {
    const [isExpanded, setIsExpanded] = useState(initialOpen);
    const [showDir, setShowDir] = useState(false);
    const [shipToName, setShipToName] = useState('');
    const [address1, setAddress1] = useState(userSettings?.homeAddress || '');
    const [address2, setAddress2] = useState('');
    const [justSubmitted, setJustSubmitted] = useState(false);
    const [overlayPhase, setOverlayPhase] = useState('idle');
    const isDark = isDarkTheme(theme);
    const prefersReduced = usePrefersReducedMotion();
    const sheetMotion = getBottomSheetMotion(prefersReduced);
    const modalMotion = getModalMotion(prefersReduced);

    const safeSetShipTo = (v) => setShipToName(v ?? '');
    const safeSetAddress1 = (v) => setAddress1(v ?? '');
    const safeSetAddress2 = (v) => setAddress2(v ?? '');

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
        setJustSubmitted(true); setOverlayPhase('enter');
        Object.entries(cart).forEach(([id, qty]) => { if (qty > 0) onUpdateCart({ id }, -qty); });
        setTimeout(() => { onNavigate && onNavigate('home'); setOverlayPhase('exit'); }, prefersReduced ? 600 : 900);
    }, [shipToName, address1, cartItems.length, cart, onUpdateCart, onNavigate, prefersReduced]);

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
                    <div className="fixed inset-0" style={{ zIndex: UNIFIED_MODAL_Z }} onClick={() => setIsExpanded(false)}>
                        <motion.div
                            initial={modalMotion.backdrop.initial}
                            animate={modalMotion.backdrop.animate}
                            exit={modalMotion.backdrop.exit}
                            transition={modalMotion.backdrop.transition}
                            className="absolute inset-0"
                            style={getUnifiedBackdropStyle(true, prefersReduced)}
                        />
                        <motion.div
                            initial={sheetMotion.initial}
                            animate={sheetMotion.animate}
                            exit={sheetMotion.exit}
                            transition={sheetMotion.transition}
                            className="absolute bottom-4 left-4 right-4 max-w-md mx-auto rounded-3xl overflow-hidden"
                            style={{ backgroundColor: theme.colors.surface, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxHeight: '75vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 cursor-pointer" onClick={() => setIsExpanded(false)} style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                                    <ShoppingCart className="w-5 h-5" style={{ color: theme.colors.accentText || '#fff' }} />
                                </div>
                                <div>
                                    <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Sample Cart</p>
                                    <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{totalCartItems} sample{totalCartItems !== 1 ? 's' : ''} selected</p>
                                </div>
                            </div>
                            <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                        </div>

                        {/* Scrollable content */}
                        <div className="px-5 pb-5 pt-3 max-h-[60vh] overflow-y-auto scrollbar-hide flex flex-col gap-5">
                            {/* Items section */}
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: theme.colors.textSecondary, letterSpacing: '0.06em' }}>Items</p>
                                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.015)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.04)'}` }}>
                                    <div className="px-2 py-1">
                                        {cartItems.map((item, idx) => (<DrawerItem key={item.id} item={item} onUpdateCart={onUpdateCart} theme={theme} isLast={idx === 0} />))}
                                    </div>
                                </div>
                            </div>

                            {/* Ship To section */}
                            <div>
                                <div className="flex items-center justify-between mb-2.5">
                                    <p className="text-xs font-bold uppercase tracking-widest px-1" style={{ color: theme.colors.textSecondary, letterSpacing: '0.06em' }}>Ship To</p>
                                    <div className="flex items-center gap-1.5">
                                        <button
                                            onClick={() => setShowDir(true)}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
                                            style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)', color: theme.colors.textPrimary }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)'; }}
                                        >
                                            <Building2 className="w-3 h-3" style={{ color: theme.colors.accent }} />
                                            Directory
                                        </button>
                                        <button
                                            onClick={() => { safeSetShipTo('Home'); safeSetAddress1(userSettings?.homeAddress || ''); safeSetAddress2(''); }}
                                            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-all"
                                            style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)', color: theme.colors.textPrimary }}
                                            onMouseEnter={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.06)'; }}
                                            onMouseLeave={e => { e.currentTarget.style.backgroundColor = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)'; }}
                                        >
                                            <Home className="w-3 h-3" style={{ color: theme.colors.accent }} />
                                            Home
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <div className="relative">
                                        <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Recipient / Company</label>
                                        <input value={shipToName || ''} onChange={(e) => safeSetShipTo(e.target.value)} className="w-full rounded-2xl px-4 pt-5 pb-2.5 text-[13px] outline-none border transition focus:ring-2" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.inputBackground, borderColor: theme.colors.border, color: theme.colors.textPrimary }} />
                                    </div>
                                    <div className="relative">
                                        <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Street Address</label>
                                        <input value={address1 || ''} onChange={(e) => safeSetAddress1(e.target.value)} className="w-full rounded-2xl px-4 pt-5 pb-2.5 text-[13px] outline-none border transition focus:ring-2" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.inputBackground, borderColor: theme.colors.border, color: theme.colors.textPrimary }} />
                                    </div>
                                    <div className="relative">
                                        <label className="absolute left-4 top-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary }}>Suite / Unit (optional)</label>
                                        <input value={address2 || ''} onChange={(e) => safeSetAddress2(e.target.value)} className="w-full rounded-2xl px-4 pt-5 pb-2.5 text-[13px] outline-none border transition focus:ring-2" style={{ background: isDark ? 'rgba(255,255,255,0.08)' : theme.colors.inputBackground, borderColor: theme.colors.border, color: theme.colors.textPrimary }} />
                                    </div>
                                </div>
                            </div>

                            {/* Submit button */}
                            <button
                                disabled={!canSubmit}
                                onClick={submit}
                                className="w-full px-5 py-3.5 rounded-full text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{
                                    backgroundColor: canSubmit ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.10)' : theme.colors.border),
                                    color: canSubmit ? theme.colors.accentText : theme.colors.textSecondary,
                                    boxShadow: 'none',
                                }}
                            >
                                <Send className="w-4 h-4" />
                                Submit Sample Request
                            </button>
                        </div>
                        </motion.div>
                    </div>
                )}
                </AnimatePresence>,
                document.body
            )}
            <DirectoryModal show={showDir} onClose={() => setShowDir(false)} onSelect={({ name, address1: addr1, address2: addr2 }) => { safeSetShipTo(name); safeSetAddress1(addr1); safeSetAddress2(addr2); }} theme={theme} dealers={dealers} designFirms={designFirms} />
            {typeof document !== 'undefined' && createPortal(
                justSubmitted && (
                    <div className="fixed inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: UNIFIED_MODAL_Z + 100 }}>
                        <div
                            className="absolute inset-0"
                            style={{
                                background: overlayPhase==='enter' ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)',
                                backdropFilter: overlayPhase==='enter' && !prefersReduced ? 'blur(10px)' : 'blur(0px)',
                                WebkitBackdropFilter: overlayPhase==='enter' && !prefersReduced ? 'blur(10px)' : 'blur(0px)',
                                transition: prefersReduced ? 'none' : UNIFIED_BACKDROP_TRANSITION
                            }}
                        />
                        <div className="relative px-10 py-8 rounded-3xl text-center" style={{ background: theme.colors.surface, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}`, transform: overlayPhase==='enter' ? 'scale(1)' : 'scale(.9)', opacity: overlayPhase==='enter' ? 1 : 0.9, transition: prefersReduced ? 'none' : [buildCssTransition('transform', MOTION_DURATIONS_MS.slow, MOTION_EASINGS.springOut), buildCssTransition('opacity', MOTION_DURATIONS_MS.medium, MOTION_EASINGS.standard)].join(', '), boxShadow:'0 6px 24px -4px rgba(0,0,0,0.12)' }}>
                            <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: theme.colors.success }} />
                            <p className="font-bold text-[15px]">Sample Request Submitted</p>
                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>You'll receive a confirmation email shortly.</p>
                        </div>
                    </div>
                ),
                document.body
            )}
        </>
    );
};
