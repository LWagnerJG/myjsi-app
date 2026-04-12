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
import { PrimaryButton } from '../../../components/common/JSIButtons.jsx';
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
                <>
                    {/* Blur scrim behind the cart pill */}
                    {totalCartItems > 0 && (
                        <div
                            aria-hidden="true"
                            className="fixed left-0 right-0 pointer-events-none"
                            style={{
                                bottom: 0,
                                height: 'max(100px, calc(env(safe-area-inset-bottom, 0px) + 80px))',
                                background: `linear-gradient(to top, ${isDark ? 'rgba(26,26,26,0.85)' : 'rgba(240,237,232,0.85)'} 0%, ${isDark ? 'rgba(26,26,26,0.5)' : 'rgba(240,237,232,0.5)'} 50%, transparent 100%)`,
                                backdropFilter: 'blur(12px)',
                                WebkitBackdropFilter: 'blur(12px)',
                                zIndex: 19,
                            }}
                        />
                    )}
                    <FloatingCart
                        itemCount={totalCartItems}
                        label={`View Cart (${totalCartItems})`}
                        onClick={() => setIsExpanded(true)}
                        theme={theme}
                    />
                </>
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
                            className="absolute bottom-4 left-4 right-4 max-w-md mx-auto rounded-2xl overflow-hidden"
                            style={{ backgroundColor: theme.colors.surface, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxHeight: '75vh' }}
                            onClick={(e) => e.stopPropagation()}
                        >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3.5 cursor-pointer" onClick={() => setIsExpanded(false)}>
                            <div className="flex items-center gap-2.5">
                                <ShoppingCart className="w-[18px] h-[18px]" style={{ color: theme.colors.textSecondary }} />
                                <p className="font-semibold text-sm" style={{ color: theme.colors.textPrimary }}>
                                    {totalCartItems} sample{totalCartItems !== 1 ? 's' : ''}
                                </p>
                            </div>
                            <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary, opacity: 0.6 }} />
                        </div>

                        {/* Divider */}
                        <div className="mx-5" style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }} />

                        {/* Scrollable content */}
                        <div className="px-5 pb-5 pt-2 max-h-[60vh] overflow-y-auto scrollbar-hide flex flex-col gap-4">
                            {/* Items */}
                            <div className="pt-1">
                                {cartItems.map((item, idx) => (<DrawerItem key={item.id} item={item} onUpdateCart={onUpdateCart} theme={theme} isLast={idx === 0} />))}
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }} />

                            {/* Ship To */}
                            <div className="flex flex-col gap-2">
                                <div className="flex items-center gap-1.5">
                                    <button
                                        onClick={() => setShowDir(true)}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-colors"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme.colors.textPrimary }}
                                    >
                                        <Building2 className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                                        Directory
                                    </button>
                                    <button
                                        onClick={() => { safeSetShipTo('Home'); safeSetAddress1(userSettings?.homeAddress || ''); safeSetAddress2(''); }}
                                        className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full active:scale-95 transition-colors"
                                        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)', color: theme.colors.textPrimary }}
                                    >
                                        <Home className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                                        Home
                                    </button>
                                </div>
                                <input value={shipToName || ''} onChange={(e) => safeSetShipTo(e.target.value)} placeholder="Recipient / Company" className="w-full rounded-xl px-3.5 py-2.5 text-[0.8125rem] outline-none transition placeholder:text-current placeholder:opacity-40" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary }} />
                                <input value={address1 || ''} onChange={(e) => safeSetAddress1(e.target.value)} placeholder="Street address" className="w-full rounded-xl px-3.5 py-2.5 text-[0.8125rem] outline-none transition placeholder:text-current placeholder:opacity-40" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary }} />
                                <input value={address2 || ''} onChange={(e) => safeSetAddress2(e.target.value)} placeholder="Suite / Unit" className="w-full rounded-xl px-3.5 py-2.5 text-[0.8125rem] outline-none transition placeholder:text-current placeholder:opacity-40" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: theme.colors.textPrimary }} />
                            </div>

                            {/* Submit */}
                            <PrimaryButton
                                type="button"
                                onClick={submit}
                                theme={theme}
                                disabled={!canSubmit}
                                fullWidth
                                className="py-3 text-[0.8125rem]"
                                icon={<Send className="w-3.5 h-3.5" />}
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
                        <div className="relative px-10 py-8 rounded-2xl text-center" style={{ background: theme.colors.surface, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}`, transform: overlayPhase==='enter' ? 'scale(1)' : 'scale(.9)', opacity: overlayPhase==='enter' ? 1 : 0.9, transition: prefersReduced ? 'none' : [buildCssTransition('transform', MOTION_DURATIONS_MS.slow, MOTION_EASINGS.springOut), buildCssTransition('opacity', MOTION_DURATIONS_MS.medium, MOTION_EASINGS.standard)].join(', '), boxShadow:'0 6px 24px -4px rgba(0,0,0,0.12)' }}>
                            <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: theme.colors.success }} />
                            <p className="font-bold text-[0.9375rem]">Sample Request Submitted</p>
                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>You'll receive a confirmation email shortly.</p>
                        </div>
                    </div>
                ),
                document.body
            )}
        </>
    );
};
