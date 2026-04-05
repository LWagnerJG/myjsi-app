import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, Component } from 'react';

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
    onSwipeBack = null
}) => {
    const containerRef = useRef(null);
    const [currentKey, setCurrentKey] = useState(screenKey);
    const [prevNode, setPrevNode] = useState(null);
    const [animating, setAnimating] = useState(false);
    const prevChildrenRef = useRef(children);
    // Tracks whether the last back-nav was committed via swipe gesture so we
    // can skip the duplicate exit animation (the gesture already did it).
    const gestureCommitRef = useRef(false);
    const prefersReducedMotion = usePrefersReducedMotion();
    const screenAnimationMs = prefersReducedMotion ? 1 : MOTION_DURATIONS_MS.screen;
    const settleAnimationMs = prefersReducedMotion ? 0 : MOTION_DURATIONS_MS.standard;

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
        const cur = root.querySelector('[data-role="current"]');
        const prev = root.querySelector('[data-role="previous"]');

        const done = () => { setPrevNode(null); setAnimating(false); };

        // If this navigation was triggered by a committed swipe gesture, the
        // gesture already played the exit animation. Skipping it here prevents
        // the old panel from flashing back to position 0 when we clear the
        // inline transform before the CSS exit-right animation can take over.
        if (gestureCommitRef.current && direction === 'back') {
            gestureCommitRef.current = false;
            // Show new screen immediately, prev is already off-screen.
            if (cur) { cur.className = 'panel'; cur.style.transform = ''; cur.style.transition = ''; cur.style.opacity = ''; }
            const shadow = cur?.querySelector('.swipe-shadow');
            if (shadow) { shadow.style.opacity = '0'; shadow.style.transition = ''; }
            done();
            return;
        }
        gestureCommitRef.current = false;

        // Clear ALL gesture-set inline styles before CSS animations run.
        // The current panel's DOM node is reused across navigations, so any
        // transform/transition/opacity left by the swipe gesture must be wiped
        // or they will override the CSS animation keyframes.
        [cur, prev].forEach(el => {
            if (!el) return;
            el.className = 'panel';
            el.style.transform = '';
            el.style.transition = '';
            el.style.opacity = '';
        });
        // Also reset the shadow on the incoming panel
        const shadow = cur?.querySelector('.swipe-shadow');
        if (shadow) { shadow.style.opacity = '0'; shadow.style.transition = ''; }

        if (direction === 'forward') {
            prev && prev.classList.add('panel', 'exit-left');
            cur && cur.classList.add('panel', 'enter-right');
        } else {
            prev && prev.classList.add('panel', 'exit-right');
            cur && cur.classList.add('panel', 'enter-left');
        }

        const t = setTimeout(done, screenAnimationMs + 24);
        return () => clearTimeout(t);
    }, [animating, direction, screenAnimationMs]);

    const gesture = useRef({
        active: false, locked: false,
        startX: 0, startY: 0, dx: 0,
        vx: 0, lastX: 0, lastTs: 0,
        rafId: null,
    });

    const onTouchStart = useCallback((e) => {
        if (!onSwipeBack) return;
        const t = e.touches?.[0]; if (!t) return;

        // Wider edge zone (44px) for easier swipe initiation; skip on desktop
        if (t.clientX > 44 || window.innerWidth > 768) {
            gesture.current = { active: false, locked: false, startX: 0, startY: 0, dx: 0, vx: 0, lastX: 0, lastTs: 0, rafId: null };
            return;
        }
        gesture.current = {
            active: true, locked: false,
            startX: t.clientX, startY: t.clientY, dx: 0,
            vx: 0, lastX: t.clientX, lastTs: performance.now(),
            rafId: null,
        };
    }, [onSwipeBack]);

    const onTouchMove = useCallback((e) => {
        const g = gesture.current;
        if (!g.active || !onSwipeBack) return;
        const t = e.touches?.[0]; if (!t) return;

        const dx = Math.max(0, t.clientX - g.startX);
        const dy = Math.abs(t.clientY - g.startY);
        const now = performance.now();

        // Velocity tracking (pixels/ms, exponential smoothing)
        const dt = now - g.lastTs;
        if (dt > 0) {
            const rawVx = (t.clientX - g.lastX) / dt;
            g.vx = g.vx === 0 ? rawVx : g.vx * 0.6 + rawVx * 0.4;
        }
        g.lastX = t.clientX;
        g.lastTs = now;

        // Cancel only if the gesture is clearly vertical (scrolling, not swiping).
        // Use a generous threshold so a slight diagonal doesn't kill a real swipe.
        if (dy > Math.max(dx, 4) * 2.5 && dy > 10) {
            g.active = false;
            // If the panel already moved a bit, spring it back
            if (g.dx > 0) {
                if (g.rafId) { cancelAnimationFrame(g.rafId); g.rafId = null; }
                const cur = containerRef.current?.querySelector('[data-role="current"]');
                if (cur) {
                    cur.style.transition = 'transform 120ms ease';
                    cur.style.transform = 'translateX(0)';
                    setTimeout(() => { if (cur) { cur.style.transform = ''; cur.style.transition = ''; } }, 140);
                }
            }
            document.body.style.overflow = '';
            containerRef.current?.classList.remove('gesture-lock');
            return;
        }

        // CRITICAL: prevent browser scroll/pull-to-refresh BEFORE direction is
        // confirmed. If we wait until g.locked is true, iOS has already committed
        // to a native scroll gesture and ignores subsequent preventDefault calls.
        e.preventDefault();

        if (!g.locked && dx > 2) {
            g.locked = true;
            document.body.style.overflow = 'hidden';
            containerRef.current?.classList.add('gesture-lock');
        }

        g.dx = dx;

        // RAF-throttled style update — always uses latest g.dx value
        if (g.rafId) return;
        g.rafId = requestAnimationFrame(() => {
            g.rafId = null;
            if (!g.active) return;
            const root = containerRef.current;
            if (!root) return;
            const cur = root.querySelector('[data-role="current"]');
            const shadow = root.querySelector('.swipe-shadow');

            if (cur) {
                cur.style.transition = 'none';
                cur.style.transform = `translateX(${g.dx}px)`;
            }
            if (shadow) {
                const w = root.clientWidth || window.innerWidth;
                const p = Math.min(1, g.dx / w);
                shadow.style.transition = 'none';
                shadow.style.opacity = String(0.25 * (1 - p));
            }
        });
    }, [onSwipeBack]);

    const onTouchEnd = useCallback(() => {
        const g = gesture.current;

        // Cancel any pending RAF so it doesn't fire after end
        if (g.rafId) { cancelAnimationFrame(g.rafId); g.rafId = null; }

        if (!g.locked || !onSwipeBack) {
            gesture.current = { active: false, locked: false, startX: 0, startY: 0, dx: 0, vx: 0, lastX: 0, lastTs: 0, rafId: null };
            return;
        }

        const root = containerRef.current;
        const cur = root?.querySelector('[data-role="current"]');
        const shadow = root?.querySelector('.swipe-shadow');
        const w = root?.clientWidth || window.innerWidth;

        // Commit on distance OR velocity flick (fast rightward swipe)
        const commit = g.dx > w * 0.28 || (g.vx > 0.45 && g.dx > 32);

        if (cur) {
            cur.style.transition = prefersReducedMotion
                ? 'none'
                : `transform ${settleAnimationMs}ms ${toCssBezier(MOTION_EASINGS.springOut)}`;
            cur.style.transform = commit ? `translateX(${w}px)` : 'translateX(0px)';
        }
        if (shadow) {
            shadow.style.transition = prefersReducedMotion
                ? 'none'
                : `opacity ${settleAnimationMs}ms ${toCssBezier(MOTION_EASINGS.standard)}`;
            // Always animate shadow back to 0 — commit slides away, snap-back restores
            shadow.style.opacity = '0';
        }

        setTimeout(() => {
            document.body.style.overflow = '';
            root?.classList.remove('gesture-lock');
            gesture.current = { active: false, locked: false, startX: 0, startY: 0, dx: 0, vx: 0, lastX: 0, lastTs: 0, rafId: null };
            if (commit) {
                // Signal the animation effect to skip the redundant exit animation
                gestureCommitRef.current = true;
                onSwipeBack();
            } else {
                // Snap-back: no navigation, clear gesture styles manually
                if (cur) { cur.style.transform = ''; cur.style.transition = ''; }
                if (shadow) { shadow.style.opacity = ''; shadow.style.transition = ''; }
            }
        }, settleAnimationMs + 20);
    }, [onSwipeBack, prefersReducedMotion, settleAnimationMs]);

    useEffect(() => {
        const root = containerRef.current;
        if (!root || !onSwipeBack) return;
        root.addEventListener('touchstart', onTouchStart, { passive: true });
        root.addEventListener('touchmove', onTouchMove, { passive: false });
        root.addEventListener('touchend', onTouchEnd, { passive: true });
        root.addEventListener('touchcancel', onTouchEnd, { passive: true });
        return () => {
            root.removeEventListener('touchstart', onTouchStart);
            root.removeEventListener('touchmove', onTouchMove);
            root.removeEventListener('touchend', onTouchEnd);
            root.removeEventListener('touchcancel', onTouchEnd);
        };
    }, [onTouchStart, onTouchMove, onTouchEnd, onSwipeBack]);

    // Focus management for screen reader accessibility
    useEffect(() => {
        if (animating) return;
        // After transition completes, move focus to the new screen content
        const root = containerRef.current;
        const content = root?.querySelector('[data-role="current"] .panel-content');
        if (content) {
            // Find the first heading or focusable element within the new screen
            const focusTarget = content.querySelector('h1, h2, h3, h4, [data-autofocus], [tabindex="-1"]');
            if (focusTarget) {
                focusTarget.setAttribute('tabindex', '-1');
                focusTarget.focus({ preventScroll: true });
            }
        }
    }, [animating, currentKey]);

    return (
        <div
            ref={containerRef}
            className="animated-screen-container"
            aria-live="polite"
            style={{
                '--screen-motion-duration': `${screenAnimationMs}ms`,
                '--screen-motion-ease': toCssBezier(MOTION_EASINGS.screenPush),
                '--screen-shadow-duration': `${prefersReducedMotion ? 1 : MOTION_DURATIONS_MS.medium}ms`,
                '--screen-shadow-ease': toCssBezier(MOTION_EASINGS.standard),
            }}
        >
            {prevNode && (
                <div data-role="previous" className="panel" aria-hidden="true">
                    <SilentErrorBoundary>{prevNode}</SilentErrorBoundary>
                </div>
            )}
            <div data-role="current" className="panel">
                <div className="swipe-shadow" />
                {/* Transparent overlay: touch-action:none forces iOS to hand
                    left-edge touches to JS instead of UIScrollView */}
                {onSwipeBack && <div className="swipe-edge-zone" aria-hidden="true" />}
                <div className="panel-content">{children}</div>
            </div>
        </div>
    );
};
