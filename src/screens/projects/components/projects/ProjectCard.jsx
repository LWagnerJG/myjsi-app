import React from 'react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';

export const ProjectCard = ({ opp, theme, onClick }) => {
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
      <GlassCard
        theme={theme}
        className="p-4 motion-card motion-tap hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="mb-3">
          <p className="font-semibold text-[0.9375rem] leading-snug truncate" style={{ color: theme.colors.textPrimary }}>
            {opp.name}
          </p>
          <p className="mt-1 text-[0.8125rem] font-medium truncate" style={{ color: theme.colors.accent, opacity: 0.8 }}>
            {opp.company || 'Unknown'}
          </p>
        </div>
        <div className="flex items-baseline justify-end gap-1.5">
          <span className="text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: theme.colors.textSecondary }}>
            List
          </span>
          <p className="font-bold text-xl tracking-tight" style={{ color: theme.colors.textPrimary }}>
            {displayValue}
          </p>
        </div>
      </GlassCard>
    </button>
  );
};
