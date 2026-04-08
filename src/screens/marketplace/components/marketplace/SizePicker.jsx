import React from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const SizePicker = ({ sizes, selected, onSelect, theme }) => {
  const isDark = isDarkTheme(theme);

  return (
    <div className="mt-2.5">
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: theme.colors.textSecondary }}>
        Select size
      </p>
      <div className="flex flex-wrap gap-1.5">
        {sizes.map((size) => {
          const active = selected === size;

          return (
            <button
              key={size}
              onClick={(event) => {
                event.stopPropagation();
                onSelect(size);
              }}
              className="min-w-[42px] px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(53,53,53,0.03)'),
                color: active ? theme.colors.accentText : theme.colors.textSecondary,
                border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
              }}
            >
              {size}
            </button>
          );
        })}
      </div>
    </div>
  );
};
