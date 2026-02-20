import React, { useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';

export const Modal = ({ show, onClose, title, children, theme, maxWidth = 'max-w-md' }) => {
    const isDark = isDarkTheme(theme);
    const modalRef = useRef(null);
    const previouslyFocusedRef = useRef(null);
    const titleId = React.useId();

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
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center pointer-events-auto p-4"
                    style={{ zIndex: DESIGN_TOKENS.zIndex.modal }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <motion.div
                        className="absolute inset-0"
                        style={{ backgroundColor: theme?.colors?.overlay || 'rgba(0,0,0,0.5)' }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    />

                    {/* Modal card */}
                    <motion.div
                        ref={modalRef}
                        onClick={e => e.stopPropagation()}
                        onKeyDown={handleKeyDown}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby={title ? titleId : undefined}
                        tabIndex={-1}
                        className={`w-full ${maxWidth} rounded-3xl flex flex-col relative outline-none`}
                        style={{
                            backgroundColor: isDark ? '#282828' : '#FFFFFF',
                            border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255,255,255,0.6)',
                            boxShadow: DESIGN_TOKENS.shadows.modal,
                            maxHeight: '85vh',
                        }}
                        initial={{ opacity: 0, scale: 0.95, y: 12 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.97, y: 8 }}
                        transition={{ type: 'spring', damping: 28, stiffness: 350 }}
                    >
                        {title && (
                            <div
                                className="flex justify-between items-center p-5 border-b flex-shrink-0"
                                style={{ borderColor: theme?.colors?.border || 'rgba(0,0,0,0.08)' }}
                            >
                                <h2 id={titleId} className="text-lg font-bold tracking-tight" style={{ color: theme?.colors?.textPrimary }}>
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    aria-label="Close"
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <X className="w-4 h-4" aria-hidden="true" style={{ color: theme?.colors?.textSecondary }} />
                                </button>
                            </div>
                        )}
                        <div
                            className={`${title ? "p-6" : "pt-8 px-6 pb-6"} overflow-y-auto space-y-4 scrollbar-hide`}
                        >
                            {children}
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};