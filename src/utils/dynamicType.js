/**
 * iOS Dynamic Type support for myJSI web app.
 *
 * How it works:
 *   1. Probes the iOS system preferred body font size by creating an
 *      off-screen element with `font: -apple-system-body` — this is the
 *      only CSS API that reflects the user's Dynamic Type preference.
 *   2. Computes a scale factor relative to iOS's default body size (17px).
 *   3. Sets `--font-scale` on <html> and updates `html.style.fontSize`
 *      so that `rem` units in the app automatically track the user's
 *      preferred text size.
 *   4. Re-probes on `resize` (fired by iOS when the user changes the
 *      text size with the Control Center slider while the app is open).
 *
 * Requirements on the HTML side:
 *   - Viewport must NOT have `maximum-scale=1` (blocks iOS from scaling)
 *   - `-webkit-text-size-adjust: auto` must be set on `html` (index.css)
 *
 * Font size reference (iOS Dynamic Type body text):
 *   xSmall: 14px  |  Small: 15px  |  Medium: 16px  |  Large (default): 17px
 *   xLarge: 19px  |  xxLarge: 21px  |  xxxLarge: 23px
 *   Accessibility sizes go up to ~53px
 */

const IOS_DEFAULT_BODY_PX = 17;  // iOS "Large" (default) body size
const BASE_BROWSER_PX     = 16;  // Standard browser root font-size

/** Returns the current iOS preferred body font size in px, or the default. */
function probeSystemFontSize() {
  try {
    const el = document.createElement('span');
    el.style.cssText =
      'position:fixed;top:-9999px;left:-9999px;' +
      'visibility:hidden;pointer-events:none;' +
      'font:-apple-system-body;white-space:nowrap';
    document.documentElement.appendChild(el);
    const size = parseFloat(getComputedStyle(el).fontSize);
    el.remove();
    return Number.isFinite(size) && size > 0 ? size : IOS_DEFAULT_BODY_PX;
  } catch {
    return IOS_DEFAULT_BODY_PX;
  }
}

function applyDynamicTypeScale() {
  const size  = probeSystemFontSize();
  // Clamp to a reasonable range (xSmall → xxxLarge accessibility)
  const scale = Math.min(Math.max(size / IOS_DEFAULT_BODY_PX, 0.82), 2.0);
  const rootPx = (scale * BASE_BROWSER_PX).toFixed(3);

  const root = document.documentElement;
  root.style.setProperty('--font-scale',     scale.toFixed(4));
  root.style.setProperty('--font-scale-pct', `${(scale * 100).toFixed(1)}%`);
  root.style.fontSize = `${rootPx}px`;
}

/** Call once at app startup. Safe to call on non-iOS — exits immediately. */
export function initDynamicType() {
  // Only meaningful on Apple platforms
  const isApple =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isApple) return;

  // Initial probe (runs synchronously before first paint)
  applyDynamicTypeScale();

  // iOS fires `resize` when the user changes the text size slider in
  // Control Center while the app is running. Re-probe on each resize.
  let raf = 0;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(applyDynamicTypeScale);
  }, { passive: true });
}
