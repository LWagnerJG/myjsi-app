import React from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const SizePicker = ({ sizes, selected, onSelect, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {sizes.map(s => {
        const active = selected === s;
        return (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onSelect(s); }}
            className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
            style={{
              backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)'),
              color: active ? theme.colors.accentText : theme.colors.textSecondary,
              border: `1.5px solid ${active ? theme.colors.accent : theme.colors.border}`,
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
};
