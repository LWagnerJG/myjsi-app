import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * Canonical in-page header for top-level screens.
 * App bar stays logo + back + utilities; titles live here — not in AppHeader.
 *
 * Mobile (~390): H1/subtitle hidden — app bar is enough wayfinding.
 * Desktop (md+ / ~1280): title + optional subhead shown for dual-surface demos.
 *
 * title        — required H1 (desktop only)
 * subtitle     — optional supporting line (desktop only)
 * action       — optional right-side control (button, chip, etc.) — kept on mobile
 * className    — outer spacing; default matches content gutters when used inside padded layouts
 */
export const PageHeader = React.memo(({
  theme,
  title,
  subtitle = null,
  action = null,
  className = '',
  titleClassName = '',
  subtitleClassName = '',
}) => {
  const dark = isDarkTheme(theme);

  // No title block on phone and no action → collapse entirely (no empty padding).
  const shellClass = action
    ? `flex items-start justify-between gap-3 pt-1 pb-3 ${className}`.trim()
    : `hidden md:flex items-start justify-between gap-3 pt-1 pb-3 ${className}`.trim();

  return (
    <div className={shellClass}>
      <div className="min-w-0 flex-1 hidden md:block">
        <h1
          className={`text-[1.625rem] font-bold tracking-tight leading-tight ${titleClassName}`.trim()}
          style={{ color: theme.colors.textPrimary, fontFamily: 'var(--jsi-font)' }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            className={`mt-1 text-[0.8125rem] font-medium leading-relaxed ${subtitleClassName}`.trim()}
            style={{ color: theme.colors.textSecondary, opacity: dark ? 0.78 : 0.72 }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? (
        <div className="flex-shrink-0 flex items-center gap-2 pt-0.5 md:pt-0.5 w-full md:w-auto justify-end">
          {action}
        </div>
      ) : null}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
