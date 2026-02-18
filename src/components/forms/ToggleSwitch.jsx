import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const ToggleSwitch = React.memo(({ checked, onChange, theme }) => {
    const dark = isDarkTheme(theme);
    const trackBg = checked
        ? theme.colors.accent
        : (dark ? 'rgba(255,255,255,0.15)' : theme.colors.border);
    const thumbBg = checked && dark ? '#1A1A1A' : '#FFFFFF';
    return (
        <button
            type="button"
            onClick={() => onChange({ target: { checked: !checked } })}
            className="relative w-11 h-6 rounded-full transition-colors duration-200 flex-shrink-0"
            style={{ backgroundColor: trackBg }}
        >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`}
                style={{ backgroundColor: thumbBg }} />
        </button>
    );
});