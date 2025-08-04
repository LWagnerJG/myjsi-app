import React, { useState, useEffect, useRef, useCallback } from 'react';
import './AnimatedScreenWrapper.css';

export const AnimatedScreenWrapper = ({ children, screenKey, direction = 'forward', onSwipeBack }) => {
    const [isAnimating, setIsAnimating] = useState(false);
    const [currentScreenKey, setCurrentScreenKey] = useState(screenKey);
    const [currentContent, setCurrentContent] = useState(children);
    const [nextContent, setNextContent] = useState(null);
    const animationTimeoutRef = useRef(null);
    const isFirstRender = useRef(true);
    
    // Simple swipe state
    const [swipeDistance, setSwipeDistance] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
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

    // Simplified touch handlers
    const handleTouchStart = useCallback((e) => {
        if (!onSwipeBack || isAnimating) return;
        
        const touch = e.touches[0];
        if (touch.clientX < 50) { // Only from left edge
            startXRef.current = touch.clientX;
            setIsDragging(true);
        }
    }, [onSwipeBack, isAnimating]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging) return;
        
        const touch = e.touches[0];
        const distance = touch.clientX - startXRef.current;
        
        if (distance > 0) {
            e.preventDefault();
            setSwipeDistance(Math.min(distance, window.innerWidth));
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;
        
        setIsDragging(false);
        
        // Simple threshold - if swiped more than 100px, go back
        if (swipeDistance > 100) {
            onSwipeBack();
        }
        
        // Reset swipe distance
        setSwipeDistance(0);
    }, [isDragging, swipeDistance, onSwipeBack]);

    const touchHandlers = onSwipeBack ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
    } : {};

    return (
        <div 
            ref={containerRef}
            className="animated-screen-container"
            {...touchHandlers}
        >
            {/* Current Screen */}
            <div 
                className={`screen-slide current ${isAnimating ? `exiting ${direction}` : ''}`}
                style={{
                    transform: `translateX(${swipeDistance}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s ease-out'
                }}
            >
                {currentContent}
            </div>
            
            {/* Next Screen - only during standard navigation */}
            {isAnimating && nextContent && (
                <div className={`screen-slide next entering ${direction}`}>
                    {nextContent}
                </div>
            )}
        </div>
    );
};