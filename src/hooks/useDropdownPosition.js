import { useState, useEffect, useCallback } from 'react';
import {
    DROPDOWN_MAX_HEIGHT,
} from '../constants/dropdown.js';

// Utility hook for dropdown positioning
export const useDropdownPosition = (elementRef) => {
    const [direction, setDirection] = useState('down');
    const checkPosition = useCallback(() => {
        if (!elementRef.current) return;
        const rect = elementRef.current.getBoundingClientRect();
        const spaceBelow = window.innerHeight - rect.bottom;
        const spaceAbove = rect.top;
        const flip = spaceBelow < DROPDOWN_MAX_HEIGHT && spaceAbove > DROPDOWN_MAX_HEIGHT;
        setDirection(flip ? 'up' : 'down');
    }, [elementRef]);

    useEffect(() => {
        checkPosition();
        window.addEventListener('resize', checkPosition);
        return () => window.removeEventListener('resize', checkPosition);
    }, [checkPosition]);

    return [direction, checkPosition];
};
