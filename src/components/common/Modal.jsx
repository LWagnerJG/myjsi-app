import React from 'react';
import ReactDOM from 'react-dom';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';

export const Modal = ({ show, onClose, title, children, theme, maxWidth = 'max-w-md' }) => {
    const isDark = isDarkTheme(theme);

    React.useEffect(() => {
        if (show) {
            const prev = document.body.style.overflow;
            document.body.style.overflow = 'hidden';
            return () => {
                document.body.style.overflow = prev;
            };
        }
    }, [show]);

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
                        onClick={e => e.stopPropagation()}
                        className={`w-full ${maxWidth} rounded-3xl flex flex-col relative`}
                        style={{
                            backgroundColor: isDark ? 'rgba(40, 40, 40, 0.85)' : 'rgba(255, 255, 255, 0.85)',
                            backdropFilter: 'blur(24px) saturate(160%)',
                            WebkitBackdropFilter: 'blur(24px) saturate(160%)',
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
                                <h2 className="text-lg font-bold tracking-tight" style={{ color: theme?.colors?.textPrimary }}>
                                    {title}
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                                    style={{
                                        backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                                    }}
                                >
                                    <X className="w-4 h-4" style={{ color: theme?.colors?.textSecondary }} />
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