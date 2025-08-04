import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AnimatedScreenWrapper.css';

export const AnimatedScreenWrapper = ({ children, screenKey, direction = 'forward', onSwipeBack }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentScreenKey, setCurrentScreenKey] = useState(screenKey);
    const [currentContent, setCurrentContent] = useState(children);
    const [nextContent, setNextContent] = useState(null);
    const animationTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);
    
    // Swipe gesture state
    const [isSwipeActive, setIsSwipeActive] = useState(false);
    const [swipeProgress, setSwipeProgress] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const touchStartRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const swipeThreshold = 0.3; // 30% of screen width to trigger back

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setCurrentScreenKey(screenKey);
            setCurrentContent(children);
            return;
        }

        if (screenKey !== currentScreenKey) {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }

            setIsAnimating(true);
            setNextContent(children);
            
            animationTimeoutRef.current = setTimeout(() => {
                setCurrentScreenKey(screenKey);
                setCurrentContent(children);
                setNextContent(null);
                setIsAnimating(false);
            }, 300);
        } else {
            setCurrentContent(children);
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [screenKey, children, currentScreenKey]);

    const handleTouchStart = useCallback((e) => {
        if (isAnimating || !onSwipeBack) return;
        
        const touch = e.touches[0];
        if (touch.clientX > 50) return; // Only from left edge

        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        setIsDragging(true);
    }, [isAnimating, onSwipeBack]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);

        if (!isSwipeActive && Math.abs(deltaX) > deltaY && deltaX > 10) {
            setIsSwipeActive(true);
        }
        
        if (isSwipeActive) {
            e.preventDefault();
            const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
            const progress = Math.min(Math.max(deltaX / containerWidth, 0), 1);
            setSwipeProgress(progress);
        }
    }, [isDragging, isSwipeActive]);

    const handleTouchEnd = useCallback(() => {
        if (!isSwipeActive) {
            setIsDragging(false);
            return;
        }
        
        const shouldNavigateBack = swipeProgress > swipeThreshold;
        
        if (shouldNavigateBack) {
            onSwipeBack();
        }

        // Reset styles with a transition
        setIsDragging(false);
        setSwipeProgress(0); 
        setTimeout(() => {
            setIsSwipeActive(false);
        }, 300);

    }, [isSwipeActive, swipeProgress, onSwipeBack, swipeThreshold]);

    const touchHandlers = onSwipeBack ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
    } : {};

    const transitionStyle = !isDragging ? 'transform 0.3s ease-out' : 'none';

    return (
        <div 
            ref={containerRef}
            className="animated-screen-container"
            {...touchHandlers}
        >
            {/* Previous Screen Placeholder */}
            <div 
                className="screen-slide swipe-preview"
                style={{
                    transform: `translateX(${-50 + (swipeProgress * 50)}%)`,
                    visibility: isSwipeActive ? 'visible' : 'hidden',
                    transition: transitionStyle,
                }}
            />

            {/* Current Screen */}
            <div 
                className={`screen-slide current ${isAnimating ? `exiting ${direction}` : ''}`}
                style={{
                    transform: `translateX(${swipeProgress * 100}%)`,
                    transition: transitionStyle,
                    boxShadow: isSwipeActive ? `0 0 20px rgba(0,0,0,${swipeProgress * 0.15})` : 'none'
                }}
            >
                {currentContent}
            </div>
            
            {/* Next Screen */}
            {isAnimating && nextContent && (
                <div className={`screen-slide next entering ${direction}`}>
                    {nextContent}
                </div>
            )}
        </div>
    );
};