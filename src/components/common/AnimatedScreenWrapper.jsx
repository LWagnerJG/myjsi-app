import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AnimatedScreenWrapper.css';

export const AnimatedScreenWrapper = ({ children, screenKey, direction = 'forward', onSwipeBack, previousScreenContent }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentScreenKey, setCurrentScreenKey] = useState(screenKey);
    const [currentContent, setCurrentContent] = useState(children);
    const [nextContent, setNextContent] = useState(null);
    const animationTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);
    
    // Simple swipe state
    const [swipeDistance, setSwipeDistance] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isSwipeNavigating, setIsSwipeNavigating] = useState(false);
    const startXRef = useRef(0);
    const containerRef = useRef(null);

    // Handle standard navigation animations
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setCurrentScreenKey(screenKey);
            setCurrentContent(children);
            return;
        }

        // Don't trigger regular navigation animation if we're in the middle of a swipe navigation
        if (isSwipeNavigating) {
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
                setIsSwipeNavigating(false); // Reset swipe navigation state
            }, 300);
        } else {
            setCurrentContent(children);
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [screenKey, children, currentScreenKey, isSwipeNavigating]);

    // Simplified touch handlers
    const handleTouchStart = useCallback((e) => {
        if (!onSwipeBack || isAnimating || isSwipeNavigating) return;
        
        const touch = e.touches[0];
        if (touch.clientX < 50) { // Only from left edge
            startXRef.current = touch.clientX;
            setIsDragging(true);
        }
    }, [onSwipeBack, isAnimating, isSwipeNavigating]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || isSwipeNavigating) return;
        
        const touch = e.touches[0];
        const distance = touch.clientX - startXRef.current;
        
        if (distance > 0) {
            e.preventDefault();
            setSwipeDistance(Math.min(distance, window.innerWidth));
        }
    }, [isDragging, isSwipeNavigating]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging || isSwipeNavigating) return;
        
        setIsDragging(false);
        
        // Simple threshold - if swiped more than 100px, go back
        if (swipeDistance > 100) {
            setIsSwipeNavigating(true); // Prevent regular navigation animation
            setSwipeDistance(window.innerWidth); // Complete the swipe animation
            
            // Trigger navigation after a brief delay to ensure smooth animation
            setTimeout(() => {
                onSwipeBack();
            }, 150);
        } else {
            // Snap back if threshold not met
            setSwipeDistance(0);
        }
    }, [isDragging, swipeDistance, onSwipeBack, isSwipeNavigating]);

    const touchHandlers = onSwipeBack ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: () => {
            setIsDragging(false);
            setSwipeDistance(0);
        },
    } : {};

    return (
        <div 
            ref={containerRef}
            className="animated-screen-container"
            {...touchHandlers}
        >
            {/* Previous Screen - only visible during swipe */}
            {onSwipeBack && previousScreenContent && (
                <div 
                    className="screen-slide swipe-preview"
                    style={{
                        visibility: isDragging && swipeDistance > 0 ? 'visible' : 'hidden',
                        transform: `translateX(${-25 + (swipeDistance / window.innerWidth) * 25}%)`,
                        opacity: swipeDistance / window.innerWidth,
                    }}
                >
                    {previousScreenContent}
                </div>
            )}

            {/* Current Screen */}
            <div 
                className={`screen-slide current ${isAnimating ? `exiting ${direction}` : ''}`}
                style={{
                    transform: `translateX(${swipeDistance}px)`,
                    transition: isDragging || isSwipeNavigating ? 'none' : 'transform 0.3s ease-out'
                }}
            >
                {currentContent}
            </div>
            
            {/* Next Screen - only during standard navigation */}
            {isAnimating && nextContent && !isSwipeNavigating && (
                <div className={`screen-slide next entering ${direction}`}>
                    {nextContent}
                </div>
            )}
        </div>
    );
};