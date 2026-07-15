import React, { useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme, DESIGN_TOKENS, modalCardSurface } from '../../design-system/tokens.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z, ModalSafeAreaCover } from './modalUtils.js';
import { getModalMotion } from '../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export const Modal = ({ show, onClose, title, children, theme, maxWidth = 'max-w-md' }) => {
    const isDark = isDarkTheme(theme);
    const modalRef = useRef(null);
    const previouslyFocusedRef = useRef(null);
    const titleId = React.useId();
    const prefersReducedMotion = usePrefersReducedMotion();
    const modalMotion = getModalMotion(prefersReducedMotion);

    // Lock body scroll and handle focus management
    useEffect(() => {
        if (show) {
            previouslyFocusedRef.current = document.activeElement;
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';

            // Move focus into the modal after a brief delay for animation
            const timer = setTimeout(() => {
                modalRef.current?.focus();
            }, 80);

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = prev;
                // Restore focus to the element that opened the modal
                previouslyFocusedRef.current?.focus?.();
            };
        }
    }, [show]);

    // Escape key handler
    useEffect(() => {
        if (!show) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                e.stopPropagation();
                onClose();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [show, onClose]);

    // Focus trapping
    const handleKeyDown = useCallback((e) => {
        if (e.key !== 'Tab' || !modalRef.current) return;
        const focusable = modalRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
            if (document.activeElement === first) {
                e.preventDefault();
                last.focus();
            }
        } else {
            if (document.activeElement === last) {
                e.preventDefault();
                first.focus();
            }
        }
    }, []);

    return ReactDOM.createPortal(
        <>
        <ModalSafeAreaCover visible={show} />
        <AnimatePresence>
            {show && (
                <motion.div
                    key="modal-root"
                    className="fixed inset-0 flex items-center justify-center pointer-events-auto p-4"
                    style={{
                        zIndex: Math.max(DESIGN_TOKENS.zIndex.modal || 0, UNIFIED_MODAL_Z),
                        ...getUnifiedBackdropStyle(true, prefersReducedMotion),
                        touchAction: 'none',
                    }}
                    initial={modalMotion.backdrop.initial}
                    animate={modalMotion.backdrop.animate}
                    exit={modalMotion.backdrop.exit}
                    transition={modalMotion.backdrop.transition}
                >
                    <div data-modal-backdrop="app-modal" className="absolute inset-0" onClick={onClose} aria-hidden="true" />

                    {/* Modal card */}
                    <motion.div
                        ref={modalRef}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={handleKeyDown}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? titleId : undefined}
                        tabIndex={-1}
                        className={`w-full ${maxWidth} flex flex-col relative z-10 outline-none`}
                        style={{
                            ...modalCardSurface(theme),
                            maxHeight: '85vh',
                        }}
                        initial={modalMotion.card.initial}
                        animate={modalMotion.card.animate}
                        exit={modalMotion.card.exit}
                        transition={modalMotion.card.transition}
                    >
                        {title && (
                            <div
                                className="flex justify-between items-center px-5 py-4 flex-shrink-0"
                                style={{
                                    // Selective airy hierarchy: chrome header over canvas-25 body
                                    backgroundColor: isDark
                                        ? 'rgba(255,255,255,0.04)'
                                        : (theme?.colors?.chrome || '#F0EDE8'),
                                    borderBottom: isDark
                                        ? `1px solid ${theme?.colors?.border || 'rgba(255,255,255,0.08)'}`
                                        : 'none',
                                    borderRadius: `${DESIGN_TOKENS.borderRadius.xl} ${DESIGN_TOKENS.borderRadius.xl} 0 0`,
                                }}
                            >
                                <h2 id={titleId} className="text-[0.9375rem] font-bold tracking-tight" style={{ color: theme?.colors?.textPrimary }}>
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)',
                                        border: isDark ? 'none' : '1px solid rgba(0,0,0,0.06)',
                                    }}
                                >
                                    <X className="w-4 h-4" aria-hidden="true" style={{ color: theme?.colors?.textSecondary }} />
                                </button>
                            </div>
                        )}
                        <div
                            className={`${title ? "p-6" : "pt-8 px-6 pb-6"} overflow-y-auto space-y-4 scrollbar-hide`}
                            style={{
                                // Nested white fields pop against the airy modal body without extra card borders
                                backgroundColor: isDark
                                    ? 'transparent'
                                    : (theme?.colors?.canvas25 || '#FCFAF7'),
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
        </>,
        document.body
    );
};
