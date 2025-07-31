import React from 'react';

export const GroupedToggle = ({ value, onChange, options, theme }) => {
  return (
    <div
      className="w-full flex rounded-full p-1.5"
      style={{ backgroundColor: theme.colors.subtle }}
    >
      {options.map((opt, idx) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className="flex-1 relative py-3 px-2 text-center text-base font-bold rounded-full transition-all duration-200 ease-out"
          style={{
            color:
              value === opt.value
                ? theme.colors.accent
                : theme.colors.textSecondary,
            backgroundColor:
              value === opt.value
                ? theme.colors.surface
                : 'transparent',
            boxShadow:
              value === opt.value
                ? `0 2px 8px ${theme.colors.shadow}`
                : 'none',
            border:
              value === opt.value
                ? `1px solid ${theme.colors.border}`
                : '1px solid transparent',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
};
