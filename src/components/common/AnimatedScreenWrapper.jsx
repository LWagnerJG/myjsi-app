import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import './AnimatedScreenWrapper.css';

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

    const gesture = useRef({ active: false, locked: false, startX: 0, startY: 0, dx: 0 });

    useLayoutEffect(() => {
        if (screenKey !== currentKey) {
            setPrevNode(prevChildrenRef.current);
            setCurrentKey(screenKey);
            setAnimating(true);
        }
        prevChildrenRef.current = children;
    }, [screenKey, children, currentKey]);

    useEffect(() => {
        if (!animating || !containerRef.current) return;

        const root = containerRef.current;
        const cur = root.querySelector('[data-role="current"]');
        const prev = root.querySelector('[data-role="previous"]');

        [cur, prev].forEach(el => el && (el.className = 'panel'));

        if (direction === 'forward') {
            prev && prev.classList.add('panel', 'exit-left');
            cur && cur.classList.add('panel', 'enter-right');
        } else {
            prev && prev.classList.add('panel', 'exit-right');
            cur && cur.classList.add('panel', 'enter-left');
        }

        const done = () => {
            setPrevNode(null);
            setAnimating(false);
        };

        const t = setTimeout(done, 320);
        return () => clearTimeout(t);
    }, [animating, direction]);

    const onTouchStart = useCallback((e) => {
        if (!onSwipeBack) return;
        const t = e.touches?.[0]; if (!t) return;

        if (t.clientX > 28 || window.innerWidth > 768) { 
            gesture.current = { active: false, locked: false, startX: 0, startY: 0, dx: 0 }; 
            return; 
        }
        gesture.current = { active: true, locked: false, startX: t.clientX, startY: t.clientY, dx: 0 };
    }, [onSwipeBack]);

    const onTouchMove = useCallback((e) => {
        const g = gesture.current;
        if (!g.active || !onSwipeBack) return;
        const t = e.touches?.[0]; if (!t) return;

        const dx = Math.max(0, t.clientX - g.startX);
        const dy = Math.abs(t.clientY - g.startY);

        if (!g.locked) {
            if (dx > 12 && dx > dy * 1.5) {
                g.locked = true;
                document.body.style.overflow = 'hidden';
                containerRef.current?.classList.add('gesture-lock');
            } else if (dy > 12 || dx < dy) {
                g.active = false; return;
            }
        }

        if (g.locked) {
            e.preventDefault();
            g.dx = dx;

            const root = containerRef.current;
            const cur = root?.querySelector('[data-role="current"]');
            const shadow = root?.querySelector('.swipe-shadow');

            if (cur) {
                cur.style.transition = 'none';
                cur.style.transform = `translateX(${dx}px)`;
            }
            if (shadow) {
                const w = root?.clientWidth || window.innerWidth;
                const p = Math.min(1, dx / w);
                shadow.style.opacity = String(0.25 * (1 - p));
            }
        }
    }, [onSwipeBack]);

    const onTouchEnd = useCallback(() => {
        const g = gesture.current;
        if (!g.locked || !onSwipeBack) { gesture.current = { active: false, locked: false, startX: 0, startY: 0, dx: 0 }; return; }

        const root = containerRef.current;
        const cur = root?.querySelector('[data-role="current"]');
        const shadow = root?.querySelector('.swipe-shadow');
        const w = root?.clientWidth || window.innerWidth;
        const commit = g.dx > w * 0.28;

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
            root?.classList.remove('gesture-lock');
            gesture.current = { active: false, locked: false, startX: 0, startY: 0, dx: 0 };
            if (commit) onSwipeBack();
        }, 280);
    }, [onSwipeBack]);

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

    return (
        <div ref={containerRef} className="animated-screen-container">
            {prevNode && (
                <div data-role="previous" className="panel">
                    {prevNode}
                </div>
            )}
            <div data-role="current" className="panel">
                <div className="swipe-shadow" />
                <div className="panel-content">{children}</div>
            </div>
        </div>
    );
};
