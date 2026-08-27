import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';
import { JSI_COLORS } from '../../design-system/tokens.js';

const TONE = {
  neutral: { fg: null, bgLight: 'rgba(53,53,53,0.06)', bgDark: 'rgba(255,255,255,0.08)' },
  active: { fg: JSI_COLORS.info, bgLight: 'rgba(91,123,140,0.12)', bgDark: 'rgba(91,123,140,0.22)' },
  success: { fg: JSI_COLORS.success, bgLight: 'rgba(74,124,89,0.12)', bgDark: 'rgba(74,124,89,0.22)' },
  warning: { fg: JSI_COLORS.warning, bgLight: 'rgba(196,149,106,0.14)', bgDark: 'rgba(196,149,106,0.22)' },
  error: { fg: JSI_COLORS.error, bgLight: 'rgba(184,92,92,0.12)', bgDark: 'rgba(184,92,92,0.22)' },
};

/**
 * One status chip for list rows, hubs, and timelines.
 * tone: neutral | active | success | warning | error
 * showDot: small leading indicator (default true)
 */
export const StatusChip = React.memo(({
  theme,
  label,
  tone = 'neutral',
  showDot = true,
  className = '',
  color,
  icon: Icon,
  style = {},
}) => {
  const dark = isDarkTheme(theme);
  const palette = TONE[tone] || TONE.neutral;
  const fg = color || palette.fg || (dark ? 'rgba(240,240,240,0.78)' : theme?.colors?.textSecondary || '#6A6762');
  const bg = dark ? palette.bgDark : palette.bgLight;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold whitespace-nowrap ${className}`.trim()}
      style={{ backgroundColor: bg, color: fg, ...style }}
    >
      {Icon ? (
        <Icon className="w-3 h-3 flex-shrink-0" style={{ color: fg }} aria-hidden="true" />
      ) : showDot ? (
        <span
          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: fg }}
          aria-hidden="true"
        />
      ) : null}
      {label}
    </span>
  );
});

StatusChip.displayName = 'StatusChip';

export default StatusChip;
