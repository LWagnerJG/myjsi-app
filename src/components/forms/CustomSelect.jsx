import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useDropdownPosition } from '../../ui';

export function CustomSelect({ label, value, onChange, options, placeholder, theme, onOpen }) {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = React.useRef(null);
    const [, checkPosition] = useDropdownPosition(wrapperRef);

    // close on outside click
    React.useEffect(() => {
        const handler = e => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        checkPosition();
        onOpen?.();
        setIsOpen(o => !o);
    };

    const handleSelect = val => {
        onChange({ target: { value: val } });
        setIsOpen(false);
    };

    const selectedLabel = options.find(o => o.value === value)?.label || placeholder;

    return (
        <div ref={wrapperRef} className="relative overflow-visible space-y-1">
            {label && (
                <label className="block text-xs font-semibold px-4" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}

            <button
                type="button"
                onClick={handleOpen}
                className="w-full px-4 py-3 border rounded-lg text-left flex justify-between items-center shadow-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{
                    backgroundColor: theme.colors.subtle,
                    borderColor: theme.colors.border,
                    color: value ? theme.colors.textPrimary : theme.colors.textSecondary
                }}
            >
                <span className="pr-6">{selectedLabel}</span>
                <ChevronDown className={`absolute right-4 w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} style={{ color: theme.colors.textSecondary }} />
            </button>

            {isOpen && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-2xl shadow-lg p-2 max-h-80 overflow-y-auto scrollbar-hide">
                    {options.map(opt => (
                        <button
                            key={opt.value}
                            type="button"
                            onClick={() => handleSelect(opt.value)}
                            className="block w-full text-left p-2 rounded-lg hover:bg-gray-100"
                            style={{ color: theme.colors.textPrimary }}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}