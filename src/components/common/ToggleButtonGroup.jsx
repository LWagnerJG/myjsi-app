import React from 'react';

export const ToggleButtonGroup = ({ value, onChange, options, theme }) => {
    const selectedIndex = options.findIndex((opt) => opt.value === value);

    return (
        <div
            className="w-full flex p-1 rounded-full relative"
            style={{ backgroundColor: theme.colors.subtle }}
        >
            <div
                className="absolute top-1 bottom-1 rounded-full transition-transform duration-300 ease-in-out"
                style={{
                    width: `calc(${100 / options.length}% - 4px)`,
                    backgroundColor: theme.colors.surface,
                    transform: `translateX(calc(${selectedIndex * 100}% + ${selectedIndex * 4}px))`,
                    boxShadow: `0 1px 4px ${theme.colors.shadow}`,
                    border: `1px solid ${theme.colors.border}`,
                }}
            />

            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className="flex-1 py-2 px-1 text-center text-sm font-semibold rounded-full transition-colors duration-300 relative z-10"
                    style={{
                        color: opt.value === value ? theme.colors.accent : theme.colors.textSecondary,
                    }}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
};
