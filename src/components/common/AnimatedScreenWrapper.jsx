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
            }, 300); // Slightly longer for smoother feel
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
        // Only initiate swipe from the left edge of the screen
        if (touch.clientX > 50) {
            return;
        }
        
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
        
        // Prioritize vertical scroll if the swipe is more vertical than horizontal
        if (Math.abs(deltaY) > Math.abs(deltaX) && !isSwipeActive) {
            setIsDragging(false); // Cancel horizontal swipe
            return;
        }
        
        const isRightwardSwipe = deltaX > 0;
        
        if (isRightwardSwipe) {
            e.preventDefault(); // Prevent default browser actions like scrolling
            
            const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
            const progress = Math.min(Math.max(deltaX / containerWidth, 0), 1);
            
            if (!isSwipeActive) setIsSwipeActive(true);
            setSwipeProgress(progress);
        }
    }, [isDragging, isAnimating, onSwipeBack, isSwipeActive]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging || !onSwipeBack || !isSwipeActive) {
            setIsDragging(false);
            return;
        }
        
        setIsDragging(false);
        
        const deltaX = touchCurrentRef.current.x - touchStartRef.current.x;
        const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const progress = deltaX / containerWidth;
        
        // Calculate velocity
        const currentTime = Date.now();
        const timeDelta = currentTime - lastTouchTimeRef.current;
        const velocity = Math.abs(touchCurrentRef.current.x - lastTouchXRef.current) / (timeDelta || 1);
        
        const shouldNavigateBack = progress >= swipeThreshold || velocity >= velocityThreshold;
        
        if (shouldNavigateBack) {
            onSwipeBack();
        } else {
            // Snap back smoothly
            setSwipeProgress(0);
            setTimeout(() => {
                setIsSwipeActive(false);
            }, 300); // Match animation duration
        }
    }, [isDragging, onSwipeBack, isSwipeActive, swipeThreshold, velocityThreshold]);

    // Touch event handlers for the container
    const touchHandlers = onSwipeBack ? {
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
    } : {};

    const transitionStyle = isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)';

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
                        transform: `translateX(${-25 + (swipeProgress * 25)}%) scale(${0.95 + (swipeProgress * 0.05)})`,
                        opacity: swipeProgress,
                        transition: transitionStyle,
                        visibility: isSwipeActive || (isAnimating && direction === 'backward') ? 'visible' : 'hidden',
                    }}
                >
                    {previousScreenContent}
                </div>
            )}

            {/* Current Screen */}
            <div 
                className={`screen-slide current ${isAnimating ? `exiting ${direction}` : ''}`}
                style={{
                    transform: `translateX(${swipeProgress * 100}%)`,
                    transition: transitionStyle,
                    boxShadow: `0 10px 30px rgba(0,0,0,${swipeProgress * 0.2})`,
                }}
            >
                {currentContent}
            </div>
            
            {/* Next Screen (for forward navigation) */}
            {isAnimating && nextContent && (
                <div 
                    className={`screen-slide next entering ${direction}`}
                >
                    {nextContent}
                </div>
            )}
        </div>
    );
};