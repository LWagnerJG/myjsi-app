import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

export const PopoverPortal = ({ anchorEl, onClose, children }) => {
    const popoverRef = useRef(null);
    const [position, setPosition] = useState({ top: -9999, left: -9999 });

    useLayoutEffect(() => {
        if (anchorEl && popoverRef.current) {
            const anchorRect = anchorEl.getBoundingClientRect();
            const popoverRect = popoverRef.current.getBoundingClientRect();

            let top = anchorRect.bottom + 8;
            let left = anchorRect.right - popoverRect.width;

            if (top + popoverRect.height > window.innerHeight - 20) {
                top = anchorRect.top - popoverRect.height - 8;
            }
            if (left < 20) {
                left = 20;
            }
            if (left + popoverRect.width > window.innerWidth - 20) {
                left = window.innerWidth - popoverRect.width - 20;
            }

            setPosition({ top, left });
        }
    }, [anchorEl]);

    useEffect(() => {
        const handleOutsideClick = (e) => {
            if (popoverRef.current && !popoverRef.current.contains(e.target) && !anchorEl.contains(e.target)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleOutsideClick);
        return () => document.removeEventListener('mousedown', handleOutsideClick);
    }, [anchorEl, onClose]);

    return ReactDOM.createPortal(
        <div ref={popoverRef} className="fixed z-[1001] animate-fade-in" style={{ top: position.top, left: position.left }}>
            {children}
        </div>,
        document.body
    );
};
