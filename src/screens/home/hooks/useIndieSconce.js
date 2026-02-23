import { useState, useEffect, useRef, useCallback } from 'react';
import { useAnimation } from 'framer-motion';
import { hapticMedium } from '../../../utils/haptics.js';

export const useIndieSconce = (isDarkMode, onToggleTheme) => {
    const [lampOn, setLampOn] = useState(isDarkMode);
    const [lampLightReady, setLampLightReady] = useState(false);
    const lampAnim = useAnimation();
    const hasEnteredRef = useRef(false);
    const [lampRight, setLampRight] = useState('30%');

    // Sync lampOn when isDarkMode changes externally (e.g. from settings)
    useEffect(() => {
        setLampOn(isDarkMode);
        if (!isDarkMode) {
            setLampLightReady(false);
            hasEnteredRef.current = false;
        }
    }, [isDarkMode]);

    // Entrance animation when dark mode activates
    useEffect(() => {
        if (isDarkMode) {
            hasEnteredRef.current = false;
            setLampLightReady(false);
            lampAnim.set({ y: -70, opacity: 0, rotate: 0 });
            lampAnim.start(
                { y: 0, opacity: 1 },
                {
                    y: { duration: 0.9, ease: [0.16, 0.77, 0.29, 0.98] },
                    opacity: { duration: 0.5, ease: 'easeOut' },
                }
            ).then(() => {
                return lampAnim.start(
                    { rotate: [0, 2.0, -1.4, 0.8, -0.35, 0.12, 0] },
                    { rotate: { duration: 1.6, ease: [0.25, 0.1, 0.25, 1], times: [0, 0.15, 0.32, 0.50, 0.68, 0.84, 1] } }
                );
            }).then(() => {
                hasEnteredRef.current = true;
                setLampLightReady(true);
            });
        }
    }, [isDarkMode, lampAnim]);

    // Dynamically position lamp to the left of the greeting message
    useEffect(() => {
        const updateLampPosition = () => {
            const el = document.querySelector('[data-greeting-anchor]');
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const rightPx = window.innerWidth - rect.left + 8;
            setLampRight(`${rightPx}px`);
        };
        const raf = requestAnimationFrame(() => {
            updateLampPosition();
            setTimeout(updateLampPosition, 400);
        });
        window.addEventListener('resize', updateLampPosition);
        const el = document.querySelector('[data-greeting-anchor]');
        let ro = null;
        if (el) {
            ro = new ResizeObserver(updateLampPosition);
            ro.observe(el);
        }
        return () => {
            cancelAnimationFrame(raf);
            window.removeEventListener('resize', updateLampPosition);
            ro?.disconnect();
        };
    }, []);

    // Toggle lamp off → slide up, then switch to light mode
    const handleLampClick = useCallback((e) => {
        e.stopPropagation();
        e.preventDefault();
        hapticMedium();
        // Allow click immediately — cancel any running entrance animation
        setLampLightReady(false);
        lampAnim.stop();
        lampAnim.start(
            { y: -50, opacity: 0 },
            { duration: 0.38, ease: [0.4, 0, 0.7, 0.2] }
        ).then(() => {
            setLampOn(false);
            hasEnteredRef.current = false;
            if (isDarkMode && onToggleTheme) onToggleTheme();
        });
    }, [isDarkMode, onToggleTheme, lampAnim]);

    return {
        lampOn,
        lampLightReady,
        lampAnim,
        lampRight,
        handleLampClick
    };
};
