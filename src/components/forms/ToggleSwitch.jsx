import React from 'react';

export const ToggleSwitch = React.memo(({ checked, onChange, theme }) => {
    const isDark = theme?.name === 'dark';
    return (
        <button
            type="button"
            onClick={() => onChange({ target: { checked: !checked } })}
            className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ backgroundColor: checked ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.15)' : theme.colors.border) }}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}
                style={{ backgroundColor: isDark ? '#fff' : '#fff' }} />
        </button>
    );
});