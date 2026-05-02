import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UNIFIED_MODAL_Z, UNIFIED_BACKDROP_BLUR_PX } from './modalUtils.js';

/**
 * Covers the iOS status-bar safe area with the same dim+blur as the modal
 * backdrop. Renders via its own portal so it works inside any modal structure.
 */
export const ModalSafeAreaCover = React.memo(({ visible }) => {
    useEffect(() => {
        if (!visible || typeof document === 'undefined') return undefined;
        const { body } = document;
        const key = 'jsiModalBackdropCount';
        const count = Number(body.dataset[key] || '0') + 1;
        body.dataset[key] = String(count);
        body.classList.add('jsi-modal-backdrop-active');

        return () => {
            const current = Number(body.dataset[key] || '0');
            const next = Math.max(0, current - 1);
            if (next === 0) {
                delete body.dataset[key];
                body.classList.remove('jsi-modal-backdrop-active');
            } else {
                body.dataset[key] = String(next);
            }
        };
    }, [visible]);

    if (typeof document === 'undefined') return null;
    return createPortal(
        <AnimatePresence>
            {visible && (
                <motion.div
                    key="modal-safe-area-cover"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    style={{
                        position: 'fixed',
                        top: 0, left: 0, right: 0,
                        height: 'env(safe-area-inset-top, 0px)',
                        zIndex: UNIFIED_MODAL_Z + 50,
                        background: 'linear-gradient(to bottom, rgba(18,18,18,0.16) 0%, rgba(18,18,18,0.08) 62%, rgba(18,18,18,0) 100%)',
                        backdropFilter: `blur(${UNIFIED_BACKDROP_BLUR_PX}px) saturate(1.35)`,
                        WebkitBackdropFilter: `blur(${UNIFIED_BACKDROP_BLUR_PX}px) saturate(1.35)`,
                        pointerEvents: 'none',
                    }}
                />
            )}
        </AnimatePresence>,
        document.body
    );
});
