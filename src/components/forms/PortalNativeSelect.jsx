import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown } from 'lucide-react';

export const PortalNativeSelect = ({
    label,
    value,
    onChange,
    options = [],
    placeholder = 'Select...',
    theme,
    required = false,
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
    const selectRef = useRef(null);
    const dropdownRef = useRef(null);

    // Calculate dynamic height based on number of options
    const calculateDropdownHeight = useCallback(() => {
        const optionHeight = 40; // Height per option (py-2.5 + text height)
        const padding = 16; // p-2 = 8px top + 8px bottom
        const maxVisibleOptions = 8; // Max options before scrolling
        const minHeight = 60; // Minimum dropdown height
        
        const visibleOptions = Math.min(options.length, maxVisibleOptions);
        const calculatedHeight = Math.max(minHeight, visibleOptions * optionHeight + padding);
        
        return {
            height: calculatedHeight,
            needsScroll: options.length > maxVisibleOptions
        };
    }, [options.length]);

    const updatePosition = useCallback(() => {
        if (selectRef.current) {
            const rect = selectRef.current.getBoundingClientRect();
            setPosition({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX,
                width: rect.width,
            });
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            updatePosition();
        }
    }, [isOpen, updatePosition]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                selectRef.current && 
                !selectRef.current.contains(event.target) &&
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
            window.addEventListener('resize', updatePosition);
            window.addEventListener('scroll', updatePosition, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
            window.removeEventListener('resize', updatePosition);
            window.removeEventListener('scroll', updatePosition, true);
        };
    }, [isOpen, updatePosition]);

    const handleToggle = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(!isOpen);
    }, [isOpen]);

    const handleSelect = useCallback((optionValue) => {
        onChange({ target: { value: optionValue } });
        setIsOpen(false);
    }, [onChange]);

    const selectedOption = options.find(opt => opt.value === value);
    const displayText = selectedOption ? selectedOption.label : placeholder;

    const { height: dropdownHeight, needsScroll } = calculateDropdownHeight();

    const DropdownContent = () => (
        <div
            ref={dropdownRef}
            className={`fixed shadow-2xl rounded-2xl border ${needsScroll ? 'overflow-y-scroll scrollbar-hide' : ''}`}
            style={{
                top: `${position.top}px`,
                left: `${position.left}px`,
                width: `${position.width}px`,
                height: `${dropdownHeight}px`,
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.border,
                zIndex: 99999,
                pointerEvents: 'auto',
            }}
            onMouseDown={(e) => e.stopPropagation()}
        >
            <div className="p-2">
                {options.length > 0 ? (
                    options.map((option, index) => (
                        <button
                            key={`${option.value}-${index}`}
                            type="button"
                            onMouseDown={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelect(option.value);
                            }}
                            onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleSelect(option.value);
                            }}
                            className="w-full px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 text-left transition-colors"
                            style={{ 
                                color: theme.colors.textPrimary,
                                backgroundColor: option.value === value ? theme.colors.accent + '20' : 'transparent',
                                pointerEvents: 'auto',
                            }}
                        >
                            {option.label}
                        </button>
                    ))
                ) : (
                    <div className="px-3 py-2 text-sm text-center" style={{ color: theme.colors.textSecondary }}>
                        No options available
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <div className="relative w-full" ref={selectRef}>
            {label && (
                <label className="block text-sm font-medium mb-1 px-1" style={{ color: theme.colors.textSecondary }}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            <button
                type="button"
                onClick={handleToggle}
                onMouseDown={(e) => e.stopPropagation()}
                className="w-full px-4 py-3 rounded-full border text-sm text-left flex items-center justify-between transition-all duration-200 hover:bg-black/5 dark:hover:bg-white/5 transform active:scale-95"
                style={{
                    backgroundColor: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    color: value ? theme.colors.textPrimary : theme.colors.textSecondary
                }}
            >
                <span className="truncate pr-2">{displayText}</span>
                <ChevronDown 
                    className={`w-4 h-4 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    style={{ color: theme.colors.textSecondary }}
                />
            </button>
            
            {isOpen && createPortal(<DropdownContent />, document.body)}
        </div>
    );
};
