import React, { useRef, useState, useEffect } from 'react'
import { createPortal } from 'react-dom';

import {
    DROPDOWN_MAX_HEIGHT,
    DROPDOWN_PORTAL_HEIGHT,
    DROPDOWN_MIN_WIDTH,
    DROPDOWN_SIDE_PADDING,
    DROPDOWN_GAP,
} from './constants/dropdown.js';

export function DropdownPortal({ parentRef, onClose, children }) {
    const portalRef = useRef(null)
    const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
    const [isPositioned, setIsPositioned] = useState(false)

    // Calculate position (and flip up/down) on mount and whenever parentRef moves
    useEffect(() => {
        if (!parentRef.current) return

        const rect = parentRef.current.getBoundingClientRect()
        
        // Try to get the actual dropdown height from children if available
        let dropdownHeight = 320; // Default fallback
        
        // Look for height in children's style or calculate from content
        if (React.isValidElement(children)) {
            const childProps = React.Children.toArray(children)[0]?.props;
            if (childProps?.style?.maxHeight) {
                const heightValue = childProps.style.maxHeight;
                if (typeof heightValue === 'string' && heightValue.includes('px')) {
                    dropdownHeight = parseInt(heightValue) || 320;
                } else if (typeof heightValue === 'number') {
                    dropdownHeight = heightValue;
                }
            }
        }
        
        let top = rect.bottom + 4
        if (top + dropdownHeight > window.innerHeight) {
            top = rect.top - dropdownHeight - 4
        }

        setPos({
            top,
            left: rect.left,
            width: rect.width
        })
        
        // Set positioned flag immediately for autocomplete components
        setIsPositioned(true)
    }, [parentRef.current, children])

    // Reset positioning flag when portal opens
    useEffect(() => {
        setIsPositioned(false)
        // Set positioned flag after a microtask to ensure position is applied
        const timer = setTimeout(() => {
            setIsPositioned(true)
        }, 0)
        
        return () => clearTimeout(timer)
    }, [])

    // Close when clicking outside
    useEffect(() => {
        function handleOutsideClick(e) {
            if (
                portalRef.current &&
                !portalRef.current.contains(e.target) &&
                parentRef.current &&
                !parentRef.current.contains(e.target)
            ) {
                onClose()
            }
        }
        document.addEventListener('mousedown', handleOutsideClick)
        return () => document.removeEventListener('mousedown', handleOutsideClick)
    }, [onClose, parentRef])

    return createPortal(
        <div
            ref={portalRef}
            className="fixed z-[9999] pointer-events-auto"
            style={{
                top: `${pos.top}px`,
                left: `${pos.left}px`,
                width: `${pos.width}px`,
                opacity: isPositioned ? 1 : 0,
                visibility: isPositioned ? 'visible' : 'hidden',
                transition: 'opacity 0.1s ease-out'
            }}
        >
            {children}
        </div>,
        document.body
    )
}