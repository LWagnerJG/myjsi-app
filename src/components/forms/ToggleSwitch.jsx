import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

export const ToggleSwitch = React.memo(({ checked, onChange, theme }) => {
    const dark = isDarkTheme(theme);
    const trackBg = checked
        ? theme.colors.accent
        : dark ? 'rgba(255,255,255,0.16)' : 'rgba(0,0,0,0.13)';

    return (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={() => onChange({ target: { checked: !checked } })}
            className="relative flex-shrink-0 transition-colors duration-200 focus:outline-none"
            style={{
                width: 44,
                height: 26,
                borderRadius: 999,
                backgroundColor: trackBg,
            }}
        >
            <span
                className="absolute transition-transform duration-200"
                style={{
                    top: 3,
                    left: 3,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.22)',
                    transform: checked ? 'translateX(18px)' : 'translateX(0)',
                }}
            />
        </button>
    );
});
