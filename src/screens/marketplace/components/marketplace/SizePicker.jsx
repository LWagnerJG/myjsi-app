import React from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { getMarketplacePalette } from '../../theme.js';

export const SizePicker = ({ sizes, selected, onSelect, theme }) => {
  const isDark = isDarkTheme(theme);
  const palette = getMarketplacePalette(theme);

  return (
    <div className="mt-1">
      <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] mb-2" style={{ color: theme.colors.textSecondary }}>
        Size
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
              className="min-w-[42px] px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: active ? palette.brand : (isDark ? 'rgba(255,255,255,0.09)' : palette.panelSubtle),
                color: active ? palette.brandInk : theme.colors.textSecondary,
                border: `1px solid ${active ? palette.brand : palette.border}`,
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
