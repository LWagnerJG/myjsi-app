import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AnimatedScreenWrapper.css';

export const AnimatedScreenWrapper = ({ children, screenKey, direction = 'forward', onSwipeBack, previousScreenContent }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentScreenKey, setCurrentScreenKey] = useState(screenKey);
    const [currentContent, setCurrentContent] = useState(children);
    const [nextContent, setNextContent] = useState(null);
    const animationTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);
    
    // Swipe gesture state
    const [isDragging, setIsDragging] = useState(false);
    const [translateX, setTranslateX] = useState(0);
    const touchStartRef = useRef({ x: 0 });
    const containerRef = useRef(null);
    const swipeThreshold = 0.3; // 30% of screen width

    // Standard forward/backward navigation
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (screenKey !== currentScreenKey) {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);

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
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, [screenKey, children, currentScreenKey]);

    // --- Simplified Swipe Gesture Handling ---

    const handleTouchStart = useCallback((e) => {
        if (isAnimating || !onSwipeBack) return;
        
        const touch = e.touches[0];
        // Only allow swipe from the left edge
        if (touch.clientX < 50) {
            touchStartRef.current.x = touch.clientX;
            setIsDragging(true);
        }
    }, [isAnimating, onSwipeBack]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging) return;

        const touch = e.touches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;

        // Only swipe right
        if (deltaX > 0) {
            e.preventDefault();
            setTranslateX(deltaX);
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;

        const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const progress = translateX / containerWidth;

        setIsDragging(false);

        if (progress > swipeThreshold) {
            // Animate out and trigger navigation
            setTranslateX(containerWidth);
            onSwipeBack();
            setTimeout(() => setTranslateX(0), 300); // Reset after animation
        } else {
            // Snap back
            setTranslateX(0);
        }
    }, [isDragging, translateX, onSwipeBack, swipeThreshold]);

    const touchHandlers = onSwipeBack ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
    } : {};

    // Use a simple ease-out transition only when not dragging
    const transitionStyle = !isDragging ? 'transform 0.3s ease-out' : 'none';

    return (
        <div 
            ref={containerRef}
            className="animated-screen-container"
            {...touchHandlers}
        >
            {/* Previous Screen Preview */}
            {onSwipeBack && (
                <div 
                    className="screen-slide swipe-preview"
                    style={{ 
                        // The previous screen is always visible underneath
                        visibility: isDragging || (isAnimating && direction === 'backward') ? 'visible' : 'hidden'
                    }}
                >
                    {previousScreenContent}
                </div>
            )}

            {/* Current Screen */}
            <div 
                className={`screen-slide current ${isAnimating ? `exiting ${direction}` : ''}`}
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: transitionStyle,
                    // Add a subtle shadow when swiping
                    boxShadow: isDragging ? '0 0 20px rgba(0,0,0,0.15)' : 'none'
                }}
            >
                {currentContent}
            </div>
            
            {/* Next Screen (for forward navigation) */}
            {isAnimating && nextContent && (
                <div className={`screen-slide next entering ${direction}`}>
                    {nextContent}
                </div>
            )}
        </div>
    );
};