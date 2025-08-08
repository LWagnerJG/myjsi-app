// AnimatedScreenWrapper.jsx
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

export const AnimatedScreenWrapper = ({
    children,
    screenKey,
    direction = 'forward',
    onSwipeBack = null,
}) => {
    const containerRef = useRef(null);
    const currentRef = useRef(null);

    const [currentKey, setCurrentKey] = useState(screenKey);
    const [prevNode, setPrevNode] = useState(null);
    const [animating, setAnimating] = useState(false);

    const [gesture, setGesture] = useState({
        active: false,
        startX: 0,
        startY: 0,
        dx: 0,
        locked: false,
    });

    useLayoutEffect(() => {
        if (screenKey === currentKey) return;
        setPrevNode(currentRef.current ? currentRef.current.cloneNode(true) : null);
        setCurrentKey(screenKey);
        setAnimating(true);
    }, [screenKey]);

    useEffect(() => {
        const root = containerRef.current;
        if (!root) return;

        if (animating) {
            const incoming = root.querySelector('[data-screen="current"]');
            const outgoing = root.querySelector('[data-screen="previous"]');

            if (incoming) {
                incoming.style.transform = direction === 'forward' ? 'translateX(100%)' : 'translateX(-30%)';
                incoming.style.opacity = '0.98';
                incoming.style.transition = 'none';
                requestAnimationFrame(() => {
                    incoming.style.transition = 'transform 280ms ease, opacity 280ms ease';
                    incoming.style.transform = 'translateX(0%)';
                    incoming.style.opacity = '1';
                });
            }
            if (outgoing) {
                outgoing.style.transform = 'translateX(0%)';
                outgoing.style.opacity = '1';
                outgoing.style.transition = 'transform 280ms ease, opacity 280ms ease';
                requestAnimationFrame(() => {
                    outgoing.style.transform = direction === 'forward' ? 'translateX(-10%)' : 'translateX(100%)';
                    outgoing.style.opacity = '0.0';
                });
            }

            const t = setTimeout(() => {
                setPrevNode(null);
                setAnimating(false);
            }, 320);
            return () => clearTimeout(t);
        }
    }, [animating, direction]);

    useEffect(() => {
        const root = containerRef.current;
        if (!root || !onSwipeBack) return;

        const EDGE = 28;

        const start = (e) => {
            const t = e.touches?.[0];
            if (!t) return;
            const x = t.clientX;
            const y = t.clientY;
            if (x > EDGE) {
                setGesture({ active: false, startX: x, startY: y, dx: 0, locked: false });
                return;
            }
            setGesture({ active: true, startX: x, startY: y, dx: 0, locked: false });
        };

        const move = (e) => {
            if (!gesture.active) return;
            const t = e.touches?.[0];
            if (!t) return;

            const dx = Math.max(0, t.clientX - gesture.startX);
            const dy = Math.abs(t.clientY - gesture.startY);

            if (!gesture.locked) {
                if (dx > 8 && dx > dy) {
                    setGesture((g) => ({ ...g, locked: true }));
                    document.body.style.overflow = 'hidden';
                    root.classList.add('gesture-lock');
                } else if (dy > 8 && dy > dx) {
                    setGesture((g) => ({ ...g, active: false }));
                    return;
                }
            }

            if (gesture.locked) {
                e.preventDefault();
                const w = root.clientWidth || window.innerWidth;
                const p = Math.min(1, dx / w);
                const cur = root.querySelector('[data-screen="current"]');
                const shadow = root.querySelector('.swipe-shadow');
                if (cur) {
                    cur.style.transition = 'none';
                    cur.style.transform = `translateX(${dx}px)`;
                }
                if (shadow) shadow.style.opacity = String(0.25 * (1 - p));
                setGesture((g) => ({ ...g, dx }));
            }
        };

        const end = () => {
            if (!gesture.locked) {
                setGesture({ active: false, startX: 0, startY: 0, dx: 0, locked: false });
                return;
            }
            const w = root.clientWidth || window.innerWidth;
            const commit = gesture.dx > w * 0.28;
            const cur = root.querySelector('[data-screen="current"]');
            const shadow = root.querySelector('.swipe-shadow');

            if (cur) {
                cur.style.transition = 'transform 260ms ease';
                cur.style.transform = commit ? `translateX(${w}px)` : 'translateX(0px)';
            }
            if (shadow) {
                shadow.style.transition = 'opacity 260ms ease';
                shadow.style.opacity = commit ? '0' : '0.25';
            }

            setTimeout(() => {
                document.body.style.overflow = '';
                root.classList.remove('gesture-lock');
                setGesture({ active: false, startX: 0, startY: 0, dx: 0, locked: false });
                if (commit && onSwipeBack) onSwipeBack();
            }, 280);
        };

        root.addEventListener('touchstart', start, { passive: true });
        root.addEventListener('touchmove', move, { passive: false });
        root.addEventListener('touchend', end, { passive: true });
        root.addEventListener('touchcancel', end, { passive: true });
        return () => {
            root.removeEventListener('touchstart', start);
            root.removeEventListener('touchmove', move);
            root.removeEventListener('touchend', end);
            root.removeEventListener('touchcancel', end);
        };
    }, [gesture.active, gesture.locked, gesture.dx, onSwipeBack]);

    return (
        <div ref={containerRef} className="animated-screen-container relative h-full w-full overflow-hidden">
            {prevNode && (
                <div
                    data-screen="previous"
                    className="absolute inset-0 will-change-transform"
                    dangerouslySetInnerHTML={{ __html: prevNode.outerHTML }}
                />
            )}
            <div data-screen="current" ref={currentRef} className="absolute inset-0 will-change-transform">
                <div className="swipe-shadow pointer-events-none absolute inset-0" style={{ background: 'rgba(0,0,0,0.25)', opacity: 0 }} />
                <div className="relative h-full w-full overflow-hidden">{children}</div>
            </div>
        </div>
    );
};
