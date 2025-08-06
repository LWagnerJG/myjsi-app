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
    const [translateX, setTranslateX] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const startXRef = useRef(0);
    const containerRef = useRef(null);

    // Handle screen transitions
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
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
                setTranslateX(0);
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
            setTranslateX(Math.min(distance, window.innerWidth));
        }
    }, [isDragging]);

    const handleTouchEnd = useCallback(() => {
        if (!isDragging) return;
        
        setIsDragging(false);
        
        const containerWidth = containerRef.current?.offsetWidth || window.innerWidth;
        const swipeThreshold = containerWidth / 3;

        if (translateX > swipeThreshold) {
            // Complete the swipe
            setTranslateX(containerWidth);
            setTimeout(() => {
                if (onSwipeBack) {
                    onSwipeBack();
                }
            }, 200);
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

    const swipeProgress = Math.min(translateX / (window.innerWidth / 3), 1);

    return (
        <div 
            ref={containerRef}
            className="animated-screen-container"
            style={{ backgroundColor: 'inherit' }}
            {...touchHandlers}
        >
            {/* Swipe indicator */}
            {isDragging && translateX > 10 && (
                <div 
                    className="swipe-indicator"
                    style={{
                        opacity: swipeProgress,
                        transform: `translateX(${Math.min(translateX * 0.3, 60)}px)`,
                    }}
                >
                    <div className="swipe-arrow">?</div>
                </div>
            )}
            
            <div 
                className={`screen-slide current ${isAnimating ? `exiting ${direction}` : ''}`}
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.23, 1, 0.32, 1)',
                }}
            >
                {currentContent}
            </div>
            
            {isAnimating && nextContent && (
                <div className={`screen-slide next entering ${direction}`}>
                    {nextContent}
                </div>
            )}
        </div>
    );
};