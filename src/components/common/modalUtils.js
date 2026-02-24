import { buildCssTransition, MOTION_DURATIONS_MS, MOTION_EASINGS } from '../../design-system/motion.js';

export const UNIFIED_MODAL_Z = 1100;
export const UNIFIED_BACKDROP_BLUR_PX = 14;
export const UNIFIED_BACKDROP_DIM = 0.42;

export const getUnifiedBackdropStyle = (visible = true, prefersReducedMotion = false) => {
    const blurPx = visible && !prefersReducedMotion ? UNIFIED_BACKDROP_BLUR_PX : 0;
    return {
        backgroundColor: visible ? `rgba(18, 18, 18, ${UNIFIED_BACKDROP_DIM})` : 'rgba(18, 18, 18, 0)',
        backdropFilter: `blur(${blurPx}px)`,
        WebkitBackdropFilter: `blur(${blurPx}px)`,
    };
};

export const UNIFIED_BACKDROP_TRANSITION = [
    buildCssTransition('background-color', MOTION_DURATIONS_MS.standard, MOTION_EASINGS.standard),
    buildCssTransition('backdrop-filter', MOTION_DURATIONS_MS.standard, MOTION_EASINGS.standard),
    buildCssTransition('-webkit-backdrop-filter', MOTION_DURATIONS_MS.standard, MOTION_EASINGS.standard),
].join(', ');
