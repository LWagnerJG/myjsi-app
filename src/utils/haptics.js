/**
 * Lightweight haptic feedback via the Web Vibration API.
 * Works on Android Chrome / Edge / Samsung Internet.
 * Fails silently on iOS Safari (API unsupported) — safe to call everywhere.
 */

const canVibrate = typeof navigator !== 'undefined' && 'vibrate' in navigator;

/**
 * Predefined haptic patterns (milliseconds).
 * Single number = vibrate that long. Array = vibrate/pause/vibrate alternating.
 */
const PATTERNS = {
  /** Light tap — button presses, tab switches, toggles */
  light: 8,
  /** Medium tap — add-to-cart, upvote, like */
  medium: 15,
  /** Firm tap — form submit, important confirmations */
  success: [12, 40, 18],
  /** Double tap — errors, warnings */
  warning: [20, 50, 20],
};

/**
 * Trigger haptic feedback.
 * @param {'light'|'medium'|'success'|'warning'} intensity - Haptic pattern name
 */
export function haptic(intensity = 'light') {
  if (!canVibrate) return;
  try {
    navigator.vibrate(PATTERNS[intensity] || PATTERNS.light);
  } catch {
    // Swallow — some browsers throw in restrictive contexts
  }
}

/** Convenience shortcuts */
export const hapticLight   = () => haptic('light');
export const hapticMedium  = () => haptic('medium');
export const hapticSuccess = () => haptic('success');
export const hapticWarning = () => haptic('warning');
