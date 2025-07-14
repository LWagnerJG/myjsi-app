import React, { useRef, useState, useEffect } from 'react'
import ReactDOM from 'react-dom'


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

    // Calculate position (and flip up/down) on mount and whenever parentRef moves
    useEffect(() => {
        if (!parentRef.current) return

        const rect = parentRef.current.getBoundingClientRect()
        const dropdownHeight = 320  // must match your max-h-80
        let top = rect.bottom + 4
        if (top + dropdownHeight > window.innerHeight) {
            top = rect.top - dropdownHeight - 4
        }

        setPos({
            top,
            left: rect.left,
            width: rect.width
        })
    }, [parentRef.current])

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

    return ReactDOM.createPortal(
        <div
            ref={portalRef}
            className="fixed z-[9999] pointer-events-auto"
            style={{
                top: `${pos.top}px`,
                left: `${pos.left}px`,
                width: `${pos.width}px`
            }}
        >
            {children}
        </div>,
        document.body
    )
}