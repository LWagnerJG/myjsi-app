import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AnimatedScreenWrapper.css';

export const AnimatedScreenWrapper = ({ children, screenKey, direction = 'forward', onSwipeBack }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentScreenKey, setCurrentScreenKey] = useState(screenKey);
    const [currentContent, setCurrentContent] = useState(children);
    const [nextContent, setNextContent] = useState(null);
    const animationTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);
    
    // State for the swipe gesture
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const containerRef = useRef(null);

    // Standard navigation animation (when using back button)
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
                // Reset position after a standard navigation completes
                setTranslateX(0);
            }, 300); // CSS animation duration
        } else {
            // If only content changes, not the screen key
            setCurrentContent(children);
        }

        return () => {
            if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
        };
    }, [screenKey, children, currentScreenKey]);

    // Touch handlers for swipe-to-go-back
    const handleTouchStart = useCallback((e) => {
        if (isAnimating || !onSwipeBack) return;
        
        const touch = e.touches[0];
        if (touch.clientX < 50) { // Only from left edge
            startXRef.current = touch.clientX;
            setIsDragging(true);
        }
    }, [isAnimating, onSwipeBack]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const currentX = touch.clientX;
        const distance = currentX - startXRef.current;
        
        if (distance > 0) {
            e.preventDefault();
            setTranslateX(distance);
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;
        
        setIsDragging(false);
        
        const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const swipeThreshold = containerWidth / 3; // Swipe 1/3 of the screen

        if (translateX > swipeThreshold) {
            // Animate out fully
            setTranslateX(containerWidth);
            // Trigger navigation after animation
            setTimeout(() => {
                onSwipeBack();
            }, 300);
        } else {
            // Snap back
            setTranslateX(0);
        }
    }, [isDragging, translateX, onSwipeBack]);

    const touchHandlers = onSwipeBack ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
    } : {};

    // Apply transition only when not dragging
    const transitionStyle = !isDragging ? 'transform 0.3s ease-out' : 'none';

    return (
        <div 
            ref={containerRef}
            className="animated-screen-container"
            {...touchHandlers}
        >
            {/* Current Screen */}
            <div 
                className={`screen-slide current ${isAnimating && direction === 'backward' ? 'exiting backward-manual' : isAnimating ? `exiting ${direction}` : ''}`}
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: transitionStyle,
                }}
            >
                {currentContent}
            </div>
            
            {/* Next Screen (for standard navigation) */}
            {isAnimating && nextContent && (
                <div className={`screen-slide next entering ${direction}`}>
                    {nextContent}
                </div>
            )}
        </div>
    );
};