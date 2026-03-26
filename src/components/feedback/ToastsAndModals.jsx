import React from 'react';
import { CheckCircle, Mic } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { GlassCard } from '../common/GlassCard.jsx';
import { getModalMotion, getToastMotion } from '../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export const SuccessToast = ({ message, show, theme }) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const toastMotion = getToastMotion(prefersReducedMotion);
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 pointer-events-auto"
                    initial={toastMotion.initial}
                    animate={toastMotion.animate}
                    exit={toastMotion.exit}
                    transition={toastMotion.transition}
                >
                    <GlassCard theme={theme} className="px-4 py-2.5 flex items-center gap-2 relative overflow-visible">
                        <span className="absolute inset-0 rounded-[inherit] pointer-events-none toast-pulse" />
                        <CheckCircle className="w-4 h-4 flex-shrink-0" style={{ color: theme.colors.accent }} />
                        <span className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>
                            {message}
                        </span>
                    </GlassCard>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const VoiceModal = ({ message, show, theme }) => {
    const prefersReducedMotion = usePrefersReducedMotion();
    const modalMotion = getModalMotion(prefersReducedMotion);
    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                    initial={modalMotion.backdrop.initial}
                    animate={modalMotion.backdrop.animate}
                    exit={modalMotion.backdrop.exit}
                    transition={modalMotion.backdrop.transition}
                >
                    <motion.div
                        initial={modalMotion.card.initial}
                        animate={modalMotion.card.animate}
                        exit={modalMotion.card.exit}
                        transition={modalMotion.card.transition}
                    >
                        <GlassCard theme={theme} className="px-8 py-6 flex items-center space-x-4 shadow-2xl">
                            <Mic className="w-7 h-7" style={{ color: theme.colors.accent }} />
                            <span className="text-xl font-semibold" style={{ color: theme.colors.textPrimary }}>
                                {message}
                            </span>
                        </GlassCard>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
