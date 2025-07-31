import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export const AutoCompleteCombobox = ({ theme, label, placeholder, value, onChange, options = [] }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef(null);

    const filteredOptions = options.filter(option =>
        option.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelect = (option) => {
        onChange(option);
        setSearchTerm('');
        setIsOpen(false);
    };

    return (
        <div className="space-y-2" ref={containerRef}>
            {label && (
                <label className="block text-sm font-medium" style={{ color: theme.colors.textPrimary }}>
                    {label}
                </label>
            )}
            <div className="relative">
                <input
                    type="text"
                    placeholder={placeholder}
                    value={isOpen ? searchTerm : value}
                    onChange={(e) => {
                        setSearchTerm(e.target.value);
                        if (!isOpen) setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    className="w-full px-3 py-2 pr-8 rounded-lg border text-sm"
                    style={{
                        backgroundColor: theme.colors.surface,
                        border: `1px solid ${theme.colors.border}`,
                        color: theme.colors.textPrimary
                    }}
                />
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                >
                    <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                </button>

                {isOpen && (
                    <div
                        className="absolute z-10 w-full mt-1 rounded-lg border shadow-lg max-h-60 overflow-y-auto"
                        style={{
                            backgroundColor: theme.colors.surface,
                            border: `1px solid ${theme.colors.border}`
                        }}
                    >
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option, index) => (
                                <button
                                    key={index}
                                    type="button"
                                    onClick={() => handleSelect(option)}
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-black/5 dark:hover:bg-white/5 flex items-center justify-between"
                                    style={{ color: theme.colors.textPrimary }}
                                >
                                    <span>{option}</span>
                                    {value === option && (
                                        <Check className="w-4 h-4" style={{ color: theme.colors.accent }} />
                                    )}
                                </button>
                            ))
                        ) : (
                            <div className="px-3 py-2 text-sm" style={{ color: theme.colors.textSecondary }}>
                                No options found
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export const Button = ({ theme, onClick, children, className = '', type = 'button', ...props }) => {
    const baseClasses = 'px-3 py-2 rounded-lg font-medium text-sm transition-colors';
    const isSelected = className.includes('bg-accent');
    
    return (
        <button
            type={type}
            onClick={onClick}
            className={`${baseClasses} ${className}`}
            style={{
                backgroundColor: isSelected ? theme.colors.accent : theme.colors.subtle,
                color: isSelected ? 'white' : theme.colors.textPrimary,
                border: `1px solid ${theme.colors.border}`
            }}
            {...props}
        >
            {children}
        </button>
    );
};

export const Card = ({ theme, children, className = '' }) => {
    return (
        <div
            className={`rounded-xl border ${className}`}
            style={{
                backgroundColor: theme.colors.surface,
                border: `1px solid ${theme.colors.border}`,
                backdropFilter: theme.backdropFilter
            }}
        >
            {children}
        </div>
    );
};