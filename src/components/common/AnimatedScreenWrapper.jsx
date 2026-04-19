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

/* ═══════════════════════════════════════════════════════════════
   AnimatedScreenWrapper
   ─────────────────────────────────────────────────────────────
   Handles forward/back slide animations when screens change.
   Swipe-back is delegated entirely to the browser/OS native
   gesture (which triggers history.back → popstate → react-router).
   This avoids fighting the platform and is far more reliable.
   ═══════════════════════════════════════════════════════════════ */
export const AnimatedScreenWrapper = ({
    children,
    screenKey,
    direction = 'forward',
}) => {
    const containerRef = useRef(null);
    const [currentKey, setCurrentKey] = useState(screenKey);
    const [prevNode, setPrevNode] = useState(null);
    const [animating, setAnimating] = useState(false);
    const prevChildrenRef = useRef(children);

    const prefersReducedMotion = usePrefersReducedMotion();
    const screenAnimationMs = prefersReducedMotion ? 1 : MOTION_DURATIONS_MS.screen;

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

        // 'none' = external navigation (native swipe-back, browser buttons).
        // The browser already provided the visual transition, so swap instantly.
        if (direction === 'none') {
            done();
            return;
        }

        // Reset classes for fresh animation
        [cur, prev].forEach(el => {
            if (!el) return;
            el.className = 'panel';
        });

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
            }}
        >
            {prevNode && (
                <div data-role="previous" className="panel" aria-hidden="true">
                    <SilentErrorBoundary>{prevNode}</SilentErrorBoundary>
                </div>
            )}
            <div data-role="current" className="panel">
                <div className="panel-content">{children}</div>
            </div>
        </div>
    );
};
