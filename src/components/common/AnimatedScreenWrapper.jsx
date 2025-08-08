// AnimatedScreenWrapper.jsx
import React, { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';

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

    // Use useRef for gesture state to avoid stale closures
    const gestureRef = useRef({
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
    }, [screenKey, currentKey]);

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

    const handleTouchStart = useCallback((e) => {
        if (!onSwipeBack) return;
        
        const touch = e.touches?.[0];
        if (!touch) return;
        
        const x = touch.clientX;
        const y = touch.clientY;
        const EDGE = 28;
        
        // Only start gesture if touch begins near the left edge
        if (x > EDGE) {
            gestureRef.current = { active: false, startX: x, startY: y, dx: 0, locked: false };
            return;
        }
        
        gestureRef.current = { active: true, startX: x, startY: y, dx: 0, locked: false };
    }, [onSwipeBack]);

    const handleTouchMove = useCallback((e) => {
        const gesture = gestureRef.current;
        if (!gesture.active || !onSwipeBack) return;
        
        const touch = e.touches?.[0];
        if (!touch) return;

        const dx = Math.max(0, touch.clientX - gesture.startX);
        const dy = Math.abs(touch.clientY - gesture.startY);

        if (!gesture.locked) {
            if (dx > 8 && dx > dy) {
                // Lock to horizontal swipe
                gesture.locked = true;
                document.body.style.overflow = 'hidden';
                containerRef.current?.classList.add('gesture-lock');
            } else if (dy > 8 && dy > dx) {
                // Cancel gesture for vertical scroll
                gesture.active = false;
                return;
            }
        }

        if (gesture.locked) {
            e.preventDefault();
            
            const root = containerRef.current;
            if (!root) return;
            
            const w = root.clientWidth || window.innerWidth;
            const progress = Math.min(1, dx / w);
            const current = root.querySelector('[data-screen="current"]');
            const shadow = root.querySelector('.swipe-shadow');
            
            if (current) {
                current.style.transition = 'none';
                current.style.transform = `translateX(${dx}px)`;
            }
            if (shadow) {
                shadow.style.opacity = String(0.25 * (1 - progress));
            }
            
            gesture.dx = dx;
        }
    }, [onSwipeBack]);

    const handleTouchEnd = useCallback(() => {
        const gesture = gestureRef.current;
        if (!gesture.locked || !onSwipeBack) {
            gestureRef.current = { active: false, startX: 0, startY: 0, dx: 0, locked: false };
            return;
        }
        
        const root = containerRef.current;
        if (!root) return;
        
        const w = root.clientWidth || window.innerWidth;
        const shouldCommit = gesture.dx > w * 0.28; // 28% threshold
        const current = root.querySelector('[data-screen="current"]');
        const shadow = root.querySelector('.swipe-shadow');

        if (current) {
            current.style.transition = 'transform 260ms ease';
            current.style.transform = shouldCommit ? `translateX(${w}px)` : 'translateX(0px)';
        }
        if (shadow) {
            shadow.style.transition = 'opacity 260ms ease';
            shadow.style.opacity = shouldCommit ? '0' : '0.25';
        }

        setTimeout(() => {
            document.body.style.overflow = '';
            root.classList.remove('gesture-lock');
            gestureRef.current = { active: false, startX: 0, startY: 0, dx: 0, locked: false };
            if (shouldCommit) {
                onSwipeBack();
            }
        }, 280);
    }, [onSwipeBack]);

    useEffect(() => {
        const root = containerRef.current;
        if (!root || !onSwipeBack) return;

        root.addEventListener('touchstart', handleTouchStart, { passive: true });
        root.addEventListener('touchmove', handleTouchMove, { passive: false });
        root.addEventListener('touchend', handleTouchEnd, { passive: true });
        root.addEventListener('touchcancel', handleTouchEnd, { passive: true });
        
        return () => {
            root.removeEventListener('touchstart', handleTouchStart);
            root.removeEventListener('touchmove', handleTouchMove);
            root.removeEventListener('touchend', handleTouchEnd);
            root.removeEventListener('touchcancel', handleTouchEnd);
        };
    }, [handleTouchStart, handleTouchMove, handleTouchEnd, onSwipeBack]);

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
