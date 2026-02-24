import React from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const ProjectCard = ({ opp, theme, onClick }) => {
  let displayValue = opp.value;
  if (displayValue != null) {
    if (typeof displayValue === 'number') displayValue = '$' + displayValue.toLocaleString();
    else if (typeof displayValue === 'string' && !displayValue.trim().startsWith('$')) {
      const num = parseFloat(displayValue.replace(/[^0-9.]/g,'')); if(!isNaN(num)) displayValue = '$'+num.toLocaleString();
    }
  }
  const isDark = isDarkTheme(theme);
  return (
    <button onClick={onClick} className="w-full text-left group" style={{ WebkitTapHighlightColor:'transparent' }}>
      <div
        className="p-4 transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        style={{
          backgroundColor: isDark ? theme.colors.surface : '#fff',
          border: isDark ? `1px solid ${theme.colors.border}` : '1px solid rgba(0,0,0,0.06)',
          borderRadius: 16,
          boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.35)' : '0 1px 6px rgba(0,0,0,0.05)',
        }}
      >
        <div className="mb-3">
          <p className="font-semibold text-[15px] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>{opp.name}</p>
          <p className="mt-1 text-[13px] font-medium truncate" style={{ color: theme.colors.accent, opacity: 0.8 }}>{opp.company||'Unknown'}</p>
        </div>
        <div className="flex items-baseline justify-end gap-1.5">
          <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>List</span>
          <p className="font-bold text-xl tracking-tight" style={{ color: theme.colors.textPrimary }}>{displayValue}</p>
        </div>
      </div>
    </button>
  );
};
