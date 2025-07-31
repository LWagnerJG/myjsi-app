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
    const touchCurrentRef = useRef({ x: 0, y: 0 });
    const containerRef = useRef(null);
    const swipeThreshold = 0.3; // 30% of screen width to trigger back navigation
    const velocityThreshold = 0.5; // Minimum velocity to trigger navigation
    const lastTouchTimeRef = useRef(0);
    const lastTouchXRef = useRef(0);

    useEffect(() => {
        // Skip animation on first render
        if (isFirstRender.current) {
            isFirstRender.current = false;
            setCurrentScreenKey(screenKey);
            setCurrentContent(children);
            return;
        }

        if (screenKey !== currentScreenKey) {
            // Clear any existing timeout
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }

            setIsAnimating(true);
            setNextContent(children);
            
            // Complete animation
            animationTimeoutRef.current = setTimeout(() => {
                setCurrentScreenKey(screenKey);
                setCurrentContent(children);
                setNextContent(null);
                setIsAnimating(false);
            }, 280);
        } else {
            // Update content if screenKey is same but children changed
            setCurrentContent(children);
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [screenKey, currentScreenKey, children]);

    const handleTouchStart = useCallback((e) => {
        if (isAnimating || !onSwipeBack) return;
        
        const touch = e.touches[0];
        touchStartRef.current = { x: touch.clientX, y: touch.clientY };
        touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
        lastTouchTimeRef.current = Date.now();
        lastTouchXRef.current = touch.clientX;
        setIsDragging(true);
    }, [isAnimating, onSwipeBack]);

    const handleTouchMove = useCallback((e) => {
        if (!isDragging || isAnimating || !onSwipeBack) return;

        const touch = e.touches[0];
        touchCurrentRef.current = { x: touch.clientX, y: touch.clientY };
        
        const deltaX = touch.clientX - touchStartRef.current.x;
        const deltaY = Math.abs(touch.clientY - touchStartRef.current.y);
        
        // Only handle horizontal swipes from the left edge (first 50px)
        const isFromLeftEdge = touchStartRef.current.x <= 50;
        const isHorizontalSwipe = Math.abs(deltaX) > deltaY && Math.abs(deltaX) > 10;
        const isRightwardSwipe = deltaX > 0;
        
        if (isFromLeftEdge && isHorizontalSwipe && isRightwardSwipe) {
            e.preventDefault(); // Prevent scrolling
            
            const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
            const progress = Math.min(Math.max(deltaX / containerWidth, 0), 1);
            
            setIsSwipeActive(true);
            setSwipeProgress(progress);
        } else if (isSwipeActive && !isRightwardSwipe) {
            // Cancel swipe if user moves back left
            setIsSwipeActive(false);
            setSwipeProgress(0);
        }
    }, [isDragging, isAnimating, onSwipeBack, isSwipeActive]);

    const handleTouchEnd = useCallback((e) => {
        if (!isDragging || !onSwipeBack) return;
        
        setIsDragging(false);
        
        if (!isSwipeActive) return;
        
        const touch = e.changedTouches[0];
        const deltaX = touch.clientX - touchStartRef.current.x;
        const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const progress = deltaX / containerWidth;
        
        // Calculate velocity
        const currentTime = Date.now();
        const timeDelta = currentTime - lastTouchTimeRef.current;
        const velocity = Math.abs(touch.clientX - lastTouchXRef.current) / timeDelta;
        
        // Trigger navigation if:
        // 1. Swiped past threshold (30% of screen width), OR
        // 2. High velocity swipe (even if short distance)
        const shouldNavigateBack = progress >= swipeThreshold || velocity >= velocityThreshold;
        
        if (shouldNavigateBack) {
            // Trigger back navigation
            setIsAnimating(true);
            onSwipeBack();
            
            // Complete the swipe animation
            setSwipeProgress(1);
            setTimeout(() => {
                setIsSwipeActive(false);
                setSwipeProgress(0);
            }, 280);
        } else {
            // Snap back to original position
            setSwipeProgress(0);
            setTimeout(() => {
                setIsSwipeActive(false);
            }, 200);
        }
    }, [isDragging, onSwipeBack, isSwipeActive, swipeThreshold, velocityThreshold]);

    // Touch event handlers for the container
    const touchHandlers = onSwipeBack ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd, // Handle touch cancellation
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
                    transform: isSwipeActive && !isAnimating 
                        ? `translateX(${swipeProgress * 100}%) translateZ(0)` 
                        : undefined,
                    transition: isSwipeActive && !isAnimating 
                        ? swipeProgress === 0 ? 'transform 0.2s ease-out' : 'none'
                        : undefined
                }}
            >
                {currentContent}
            </div>
            
            {/* Next Screen - only during animation */}
            {isAnimating && nextContent && (
                <div 
                    className={`screen-slide next entering ${direction}`}
                >
                    {nextContent}
                </div>
            )}
            
            {/* Previous Screen Preview - only during swipe */}
            {isSwipeActive && !isAnimating && (
                <div 
                    className="screen-slide swipe-preview"
                    style={{
                        transform: `translateX(${-100 + (swipeProgress * 100)}%) translateZ(0)`,
                        opacity: swipeProgress * 0.8,
                        filter: `brightness(${0.7 + (swipeProgress * 0.3)})` // Subtle darkening effect
                    }}
                >
                    {/* This would show the previous screen content */}
                    <div className="swipe-preview-placeholder">
                        <div className="swipe-back-indicator">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Swipe Progress Indicator */}
            {isSwipeActive && !isAnimating && (
                <div 
                    className="swipe-progress-indicator"
                    style={{
                        opacity: swipeProgress,
                        transform: `scale(${0.8 + (swipeProgress * 0.2)})`
                    }}
                >
                    <div className="swipe-back-hint">Swipe to go back</div>
                </div>
            )}
        </div>
    );
};