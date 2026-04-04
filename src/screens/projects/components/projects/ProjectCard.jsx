import React from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const ProjectCard = ({ opp, theme, onClick }) => {
  const dark = isDarkTheme(theme);
  const border = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) displayValue = '$' + num.toLocaleString();
    }
  }

  return (
    <button onClick={onClick} className="w-full text-left" style={{ WebkitTapHighlightColor: 'transparent' }}>
      <div
        className="rounded-[22px] overflow-hidden transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]"
        style={{ backgroundColor: theme.colors.surface, border: `1px solid ${border}` }}
      >
        <div className="px-4 pt-4 pb-3">
          <p className="font-bold text-[15px] leading-snug" style={{ color: theme.colors.textPrimary }}>
            {opp.name}
          </p>
          <p className="mt-0.5 text-[12px] font-medium" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
            {opp.company || 'Unknown'}
          </p>
        </div>
        <div className="flex items-center justify-between px-4 py-3" style={{ borderTop: `1px solid ${border}` }}>
          <span className="text-[10px] font-bold uppercase tracking-[0.07em]" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
            List
          </span>
          <p className="font-black text-[19px] tabular-nums tracking-tight" style={{ color: theme.colors.textPrimary }}>
            {displayValue}
          </p>
        </div>
      </div>
    </button>
  );
};
