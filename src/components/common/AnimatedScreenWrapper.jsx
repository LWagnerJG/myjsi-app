import React, { useEffect, useLayoutEffect, useRef, useState, Component } from 'react';

// Silently swallows errors in the exit panel — a crash in the outgoing screen
// must never propagate to the incoming screen's ErrorBoundary.
class SilentErrorBoundary extends Component {
    constructor(props) { super(props); this.state = { dead: false }; }
    static getDerivedStateFromError() { return { dead: true }; }
    render() { return this.state.dead ? null : this.props.children; }
}

import './AnimatedScreenWrapper.css';
import { MOTION_DURATIONS_MS, MOTION_EASINGS, toCssBezier } from '../../design-system/motion.js';
import { usePrefersReducedMotion } from '../../hooks/usePrefersReducedMotion.js';

export const AnimatedScreenWrapper = ({
    children,
    screenKey,
    direction = 'forward',
    onSwipeBack = null,
}) => {
    const containerRef = useRef(null);
    const [currentKey, setCurrentKey] = useState(screenKey);
    const [prevNode, setPrevNode] = useState(null);
    const [animating, setAnimating] = useState(false);
    const prevChildrenRef = useRef(children);

    // ─── Mutable refs so gesture handlers always see the latest values ────────
    // We never want to re-register event listeners just because a prop changed.
    const onSwipeBackRef = useRef(onSwipeBack);
    const gestureCommitRef = useRef(false);          // skip animation after swipe commit

    const prefersReducedMotion = usePrefersReducedMotion();
    const screenAnimationMs = prefersReducedMotion ? 1 : MOTION_DURATIONS_MS.screen;
    const settleAnimationMs = prefersReducedMotion ? 0 : MOTION_DURATIONS_MS.standard;

    // Keep refs in sync with props/state on every render
    useEffect(() => { onSwipeBackRef.current = onSwipeBack; }, [onSwipeBack]);

    const settleRef = useRef(settleAnimationMs);
    const reduceRef = useRef(prefersReducedMotion);
    useEffect(() => { settleRef.current = settleAnimationMs; }, [settleAnimationMs]);
    useEffect(() => { reduceRef.current = prefersReducedMotion; }, [prefersReducedMotion]);

    // ─── Screen transition effect ─────────────────────────────────────────────
    useLayoutEffect(() => {
        if (screenKey !== currentKey) {
            setPrevNode(prevChildrenRef.current);
            setCurrentKey(screenKey);
            setAnimating(true);
        }
        prevChildrenRef.current = children;
    }, [screenKey, currentKey, children]);

    useEffect(() => {
        if (!animating || !containerRef.current) return;

        const root = containerRef.current;
        const cur  = root.querySelector('[data-role="current"]');
        const prev = root.querySelector('[data-role="previous"]');
        const done = () => { setPrevNode(null); setAnimating(false); };

        // Gesture already animated the departure — skip the duplicate exit animation
        // that would flash the old panel back to position 0 while clearing the transform.
        if (gestureCommitRef.current && direction === 'back') {
            gestureCommitRef.current = false;
            if (cur) {
                cur.className = 'panel';
                cur.style.transform = '';
                cur.style.transition = '';
                cur.style.opacity = '';
            }
            const sh = cur?.querySelector('.swipe-shadow');
            if (sh) { sh.style.opacity = '0'; sh.style.transition = ''; }
            done();
            return;
        }
        gestureCommitRef.current = false;

        // Clear any inline styles left by the gesture system so they don't
        // override the CSS keyframe animations about to play.
        [cur, prev].forEach(el => {
            if (!el) return;
            el.className = 'panel';
            el.style.transform = '';
            el.style.transition = '';
            el.style.opacity = '';
        });
        const shadow = cur?.querySelector('.swipe-shadow');
        if (shadow) { shadow.style.opacity = '0'; shadow.style.transition = ''; }

        if (direction === 'forward') {
            prev?.classList.add('panel', 'exit-left');
            cur?.classList.add('panel', 'enter-right');
        } else {
            prev?.classList.add('panel', 'exit-right');
            cur?.classList.add('panel', 'enter-left');
        }

        const t = setTimeout(done, screenAnimationMs + 24);
        return () => clearTimeout(t);
    }, [animating, direction, screenAnimationMs]);

    // ─── Gesture system — registered ONCE on mount ───────────────────────────
    // All changing values (onSwipeBack, settleMs, prefersReducedMotion) are
    // read through refs. This means listeners are never removed/re-added mid-
    // swipe due to prop changes, eliminating the main source of dropped gestures.
    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        const g = {
            active: false, locked: false,
            startX: 0, startY: 0,
            dx: 0, vx: 0, lastX: 0, lastTs: 0,
            rafId: null,
        };

        // Cleanup helpers
        function resetGesture() {
            if (g.rafId) { cancelAnimationFrame(g.rafId); g.rafId = null; }
            g.active = false; g.locked = false;
            g.startX = 0; g.startY = 0;
            g.dx = 0; g.vx = 0; g.lastX = 0; g.lastTs = 0;
        }

        function removeLockListeners() {
            window.removeEventListener('touchend',   onTouchEnd);
            window.removeEventListener('touchcancel', onTouchEnd);
        }

        // ── touchstart ──────────────────────────────────────────────────────
        function onTouchStart(e) {
            if (!onSwipeBackRef.current) return;
            const t = e.touches[0];
            if (!t) return;

            // Only activate for left-edge touches; skip on large screens (desktop)
            if (t.clientX > 44 || window.innerWidth > 768) {
                resetGesture();
                return;
            }

            resetGesture();
            g.active  = true;
            g.startX  = t.clientX;
            g.startY  = t.clientY;
            g.lastX   = t.clientX;
            g.lastTs  = performance.now();
        }

        // ── touchmove ──────────────────────────────────────────────────────
        function onTouchMove(e) {
            if (!g.active) return;
            const t = e.touches[0];
            if (!t) return;

            const dx  = Math.max(0, t.clientX - g.startX);
            const dy  = Math.abs(t.clientY - g.startY);
            const now = performance.now();

            // Velocity tracking (exponential smoothing)
            const dt = now - g.lastTs;
            if (dt > 0) {
                const rawVx = (t.clientX - g.lastX) / dt;
                g.vx = g.vx === 0 ? rawVx : g.vx * 0.6 + rawVx * 0.4;
            }
            g.lastX  = t.clientX;
            g.lastTs = now;

            // Cancel only for clearly vertical scrolling
            if (!g.locked && dy > 10 && dy > dx * 2.5) {
                // Spring back if panel had already moved
                if (g.dx > 0) {
                    const cur = root.querySelector('[data-role="current"]');
                    if (cur) {
                        cur.style.transition = 'transform 120ms ease';
                        cur.style.transform  = 'translateX(0)';
                        setTimeout(() => { cur.style.transform = ''; cur.style.transition = ''; }, 140);
                    }
                }
                document.body.style.overflow = '';
                root.classList.remove('gesture-lock');
                removeLockListeners();
                resetGesture();
                return;
            }

            // Claim the touch — prevent browser scroll from competing
            e.preventDefault();

            // Lock on first real horizontal movement
            if (!g.locked && dx > 2) {
                g.locked = true;
                document.body.style.overflow = 'hidden';
                root.classList.add('gesture-lock');
                // Listen for touchend on window so a lifted finger is never missed
                window.addEventListener('touchend',    onTouchEnd, { passive: true });
                window.addEventListener('touchcancel', onTouchEnd, { passive: true });
            }

            g.dx = dx;

            // RAF-throttled DOM updates — g.dx always has the latest value
            if (g.rafId) return;
            g.rafId = requestAnimationFrame(() => {
                g.rafId = null;
                if (!g.active) return;
                const cur    = root.querySelector('[data-role="current"]');
                const shadow = root.querySelector('.swipe-shadow');
                const w      = root.clientWidth || window.innerWidth;

                if (cur)    { cur.style.transition = 'none'; cur.style.transform = `translateX(${g.dx}px)`; }
                if (shadow) { shadow.style.transition = 'none'; shadow.style.opacity = String(0.25 * (1 - Math.min(1, g.dx / w))); }
            });
        }

        // ── touchend / touchcancel ──────────────────────────────────────────
        function onTouchEnd() {
            removeLockListeners();

            if (g.rafId) { cancelAnimationFrame(g.rafId); g.rafId = null; }

            if (!g.locked) {
                resetGesture();
                return;
            }

            document.body.style.overflow = '';
            root.classList.remove('gesture-lock');

            const cur    = root.querySelector('[data-role="current"]');
            const shadow = root.querySelector('.swipe-shadow');
            const w      = root.clientWidth || window.innerWidth;
            const ms     = settleRef.current;
            const ease   = toCssBezier(MOTION_EASINGS.springOut);

            // Commit: dragged far enough OR fast flick
            const commit = g.dx > w * 0.28 || (g.vx > 0.4 && g.dx > 30);

            if (cur) {
                cur.style.transition = reduceRef.current ? 'none' : `transform ${ms}ms ${ease}`;
                cur.style.transform  = commit ? `translateX(${w}px)` : 'translateX(0px)';
            }
            if (shadow) {
                shadow.style.transition = reduceRef.current ? 'none' : `opacity ${ms}ms ease`;
                shadow.style.opacity    = '0';
            }

            const snapDx = g.dx;
            resetGesture();

            if (commit) {
                setTimeout(() => {
                    gestureCommitRef.current = true;
                    onSwipeBackRef.current?.();
                }, ms + 20);
            } else {
                // Snap-back: clear inline styles after animation finishes
                setTimeout(() => {
                    if (cur)    { cur.style.transform = '';    cur.style.transition = ''; }
                    if (shadow) { shadow.style.opacity = ''; shadow.style.transition = ''; }
                }, ms + 20);
            }
        }

        root.addEventListener('touchstart',  onTouchStart, { passive: true });
        root.addEventListener('touchmove',   onTouchMove,  { passive: false });
        root.addEventListener('touchend',    onTouchEnd,   { passive: true });
        root.addEventListener('touchcancel', onTouchEnd,   { passive: true });

        return () => {
            root.removeEventListener('touchstart',  onTouchStart);
            root.removeEventListener('touchmove',   onTouchMove);
            root.removeEventListener('touchend',    onTouchEnd);
            root.removeEventListener('touchcancel', onTouchEnd);
            removeLockListeners();
            if (g.rafId) cancelAnimationFrame(g.rafId);
        };
    }, []); // ← mount/unmount ONLY — never re-registers

    // ─── Focus management ─────────────────────────────────────────────────────
    useEffect(() => {
        if (animating) return;
        const root    = containerRef.current;
        const content = root?.querySelector('[data-role="current"] .panel-content');
        if (!content) return;
        const focus = content.querySelector('h1, h2, h3, h4, [data-autofocus], [tabindex="-1"]');
        if (focus) { focus.setAttribute('tabindex', '-1'); focus.focus({ preventScroll: true }); }
    }, [animating, currentKey]);

    return (
        <div
            ref={containerRef}
            className="animated-screen-container"
            aria-live="polite"
            style={{
                '--screen-motion-duration': `${screenAnimationMs}ms`,
                '--screen-motion-ease':     toCssBezier(MOTION_EASINGS.screenPush),
                '--screen-shadow-duration': `${prefersReducedMotion ? 1 : MOTION_DURATIONS_MS.medium}ms`,
                '--screen-shadow-ease':     toCssBezier(MOTION_EASINGS.standard),
            }}
        >
            {prevNode && (
                <div data-role="previous" className="panel" aria-hidden="true">
                    <SilentErrorBoundary>{prevNode}</SilentErrorBoundary>
                </div>
            )}
            <div data-role="current" className="panel">
                <div className="swipe-shadow" />
                {/* Transparent overlay: touch-action:none tells iOS not to start
                    any native gesture (scroll, zoom) for left-edge touches, so
                    JS handlers get the full touch sequence without UIScrollView
                    competition. Only rendered when back-nav is possible. */}
                {onSwipeBack && <div className="swipe-edge-zone" aria-hidden="true" />}
                <div className="panel-content">{children}</div>
            </div>
        </div>
    );
};
