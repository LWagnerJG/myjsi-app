/**
 * iOS Dynamic Type — live scale tracking for myJSI web app.
 *
 * How it works:
 *   1. Creates a persistent off-screen probe element styled with
 *      `font: -apple-system-body` — the only CSS API that reflects
 *      the user's Dynamic Type preference in real time.
 *   2. Attaches a ResizeObserver to the probe. When the user moves the
 *      iOS text-size slider (even while the app is open and in the
 *      foreground), the probe's layout size changes immediately, firing
 *      the observer — no polling, no page reload required.
 *   3. On each observation, recomputes the scale vs iOS's default body
 *      size (17 px at "Large"), then updates:
 *        - `--font-scale`     CSS custom property on <html>
 *        - `--font-scale-pct` percentage form for convenience
 *        - `html.style.fontSize` so rem units throughout the app scale
 *
 * Requirements:
 *   - Viewport must NOT have `maximum-scale=1` (index.html)
 *   - `html { -webkit-text-size-adjust: auto }` must be set (index.css)
 *
 * iOS Dynamic Type body font-size reference:
 *   xSmall 14 | Small 15 | Medium 16 | Large 17 (default)
 *   xLarge 19 | xxLarge 21 | xxxLarge 23
 *   Accessibility sizes extend to ~53 px
 */

const IOS_DEFAULT_BODY_PX = 17; // "Large" — iOS factory default
const BASE_BROWSER_PX     = 16; // Browser rem base

/** Read the probe element's current computed font-size in px. */
function readProbeSize(el) {
  const size = parseFloat(getComputedStyle(el).fontSize);
  return Number.isFinite(size) && size > 0 ? size : IOS_DEFAULT_BODY_PX;
}

function applyScale(probeEl) {
  const size  = readProbeSize(probeEl);
  // Clamp: floor at 0.94 so the smallest iOS Dynamic Type setting ("xSmall")
  // still produces comfortably readable text. Cap at ~AX2 (23px body = 1.35x)
  // so extreme accessibility sizes don't break px-locked chrome elements.
  // Nav/tile chrome uses explicit px so it never scales regardless of this.
  const scale = Math.min(Math.max(size / IOS_DEFAULT_BODY_PX, 0.94), 1.35);

  const root = document.documentElement;
  root.style.setProperty('--font-scale',     scale.toFixed(4));
  root.style.setProperty('--font-scale-pct', `${(scale * 100).toFixed(1)}%`);
  root.style.fontSize = `${(scale * BASE_BROWSER_PX).toFixed(3)}px`;
}

/** Call once at app startup. No-op on non-Apple platforms. */
export function initDynamicType() {
  const isApple =
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (!isApple) return;

  // Create a persistent probe element that lives for the app's lifetime.
  // Its size is driven entirely by -apple-system-body, so it changes the
  // instant iOS applies a new Dynamic Type category.
  const probe = document.createElement('span');
  probe.setAttribute('aria-hidden', 'true');
  probe.textContent = 'X'; // needs text so line-height gives it a real height
  probe.style.cssText =
    'position:fixed;top:-9999px;left:-9999px;' +
    'visibility:hidden;pointer-events:none;user-select:none;' +
    'font:-apple-system-body;white-space:nowrap;line-height:1';
  document.documentElement.appendChild(probe);

  // Apply immediately (synchronous, before first paint)
  applyScale(probe);

  // ResizeObserver fires the moment the probe's size changes —
  // i.e., the moment iOS finishes applying a new text-size category.
  // This works live while the slider is being dragged in Control Center.
  if (typeof ResizeObserver !== 'undefined') {
    let raf = 0;
    const ro = new ResizeObserver(() => {
      // Debounce to one frame — the slider can fire many events per second
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => applyScale(probe));
    });
    ro.observe(probe);
  } else {
    // Fallback for older browsers: catch orientation / keyboard resize events
    let raf = 0;
    window.addEventListener('resize', () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => applyScale(probe));
    }, { passive: true });
  }
}
