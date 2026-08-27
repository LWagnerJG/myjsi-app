import React from 'react';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * Canonical in-page header for top-level screens.
 * App bar stays logo + back + utilities; titles live here — not in AppHeader.
 *
 * title        — required H1
 * subtitle     — optional supporting line
 * action       — optional right-side control (button, chip, etc.)
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

  return (
    <div className={`flex items-start justify-between gap-3 pt-1 pb-3 ${className}`.trim()}>
      <div className="min-w-0 flex-1">
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
        <div className="flex-shrink-0 flex items-center gap-2 pt-0.5">
          {action}
        </div>
      ) : null}
    </div>
  );
});

PageHeader.displayName = 'PageHeader';

export default PageHeader;
