const EASINGS = Object.freeze({
  standard: [0.4, 0, 0.2, 1],
  emphasized: [0.23, 1, 0.32, 1],
  springOut: [0.3, 1, 0.3, 1],
  // iOS-style screen push — fast start, silky settle (same curve used by Safari)
  screenPush: [0.22, 1, 0.36, 1],
});

const DURATIONS_MS = Object.freeze({
  instant: 0,
  micro: 120,
  fast: 160,
  standard: 220,
  medium: 260,
  slow: 320,
  screen: 320,        // slightly longer than before — the new curve feels faster anyway
  modalSpringFallback: 280,
});

export const MOTION_EASINGS = EASINGS;
export const MOTION_DURATIONS_MS = DURATIONS_MS;

export const toCssBezier = (curve = EASINGS.standard) =>
  `cubic-bezier(${curve.join(',')})`;

export const toFramerSeconds = (durationMs) =>
  Math.max(0, Number(durationMs || 0)) / 1000;

export const resolveDurationMs = (durationMs, prefersReducedMotion = false) =>
  prefersReducedMotion ? 0 : durationMs;

export const buildCssTransition = (
  property,
  durationMs = DURATIONS_MS.standard,
  easing = EASINGS.standard
) => `${property} ${resolveDurationMs(durationMs)}ms ${toCssBezier(easing)}`;

export const getModalMotion = (prefersReducedMotion = false) => ({
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: {
      duration: toFramerSeconds(resolveDurationMs(DURATIONS_MS.standard, prefersReducedMotion)),
      ease: EASINGS.standard,
    },
  },
  card: {
    initial: prefersReducedMotion
      ? { opacity: 1, scale: 1, y: 0 }
      : { opacity: 0, scale: 0.96, y: 14 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 8 },
    transition: prefersReducedMotion
      ? { duration: 0 }
      : { type: 'spring', stiffness: 380, damping: 32, mass: 0.82 },
  },
});

export const getBottomSheetMotion = (prefersReducedMotion = false) => ({
  initial: prefersReducedMotion ? { y: 0, opacity: 1 } : { y: '100%', opacity: 0.5 },
  animate: { y: 0, opacity: 1 },
  exit: prefersReducedMotion ? { y: 0, opacity: 0 } : { y: '100%', opacity: 0.5 },
  transition: prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 360, damping: 34, mass: 0.88 },
});

export const getFloatingPillMotion = (prefersReducedMotion = false) => ({
  initial: prefersReducedMotion ? { opacity: 1, x: '-50%', y: 0, scale: 1 } : { opacity: 0, x: '-50%', y: 24, scale: 0.92 },
  animate: { opacity: 1, x: '-50%', y: 0, scale: 1 },
  exit: prefersReducedMotion ? { opacity: 0, x: '-50%' } : { opacity: 0, x: '-50%', y: 24, scale: 0.92 },
  transition: prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 400, damping: 30, mass: 0.8 },
});

export const getToastMotion = (prefersReducedMotion = false) => ({
  initial: prefersReducedMotion ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 16, scale: 0.92 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: -8, scale: 0.92 },
  transition: prefersReducedMotion
    ? { duration: 0 }
    : { type: 'spring', stiffness: 480, damping: 32, mass: 0.75 },
});

// Crossfade with a small upward drift — used for tab panel swaps.
// Exit is instant so AnimatePresence mode="wait" never produces a visible gap.
export const getTabContentMotion = (prefersReducedMotion = false) => ({
  initial: prefersReducedMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, transition: { duration: 0 } },
  transition: prefersReducedMotion
    ? { duration: 0 }
    : {
        duration: toFramerSeconds(DURATIONS_MS.fast),
        ease: EASINGS.standard,
      },
});
