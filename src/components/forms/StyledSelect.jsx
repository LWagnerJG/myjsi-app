import React from 'react';
import { ChevronDown } from 'lucide-react';

export const StyledSelect = ({ label, value, onChange, options, placeholder, theme }) => {
    const selectId = React.useId();

    const selectStyles = {
        backgroundColor: theme.colors.surface,
        color: theme.colors.textPrimary,
        borderColor: theme.colors.border,
        borderWidth: '1px',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        appearance: 'none',
    };

    return (
        <div className="space-y-2">
            {label && (
                <label htmlFor={selectId} className="block text-sm font-semibold px-3" style={{ color: theme.colors.textSecondary }}>
                    {label}
                </label>
            )}
            <div className="relative">
                <select
                    id={selectId}
                    value={value}
                    onChange={onChange}
                    className="w-full pl-4 pr-10 py-3 rounded-2xl text-base transition-colors focus:outline-none focus-ring"
                    style={selectStyles}
                >
                    {placeholder && <option value="">{placeholder}</option>}
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
                </div>
            </div>
        </div>
    );
};