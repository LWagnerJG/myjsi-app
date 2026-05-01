import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UNIFIED_MODAL_Z, UNIFIED_BACKDROP_BLUR_PX, UNIFIED_BACKDROP_DIM } from './modalUtils.js';

/**
 * Covers the iOS status-bar safe area with the same dim+blur as the modal
 * backdrop. Renders via its own portal so it works inside any modal structure.
 */
export const ModalSafeAreaCover = React.memo(({ visible }) => {
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
                        backgroundColor: `rgba(18, 18, 18, ${UNIFIED_BACKDROP_DIM + 0.1})`,
                        backdropFilter: `blur(${UNIFIED_BACKDROP_BLUR_PX}px)`,
                        WebkitBackdropFilter: `blur(${UNIFIED_BACKDROP_BLUR_PX}px)`,
                        pointerEvents: 'none',
                    }}
                />
            )}
        </AnimatePresence>,
        document.body
    );
});
