import React from 'react';
import { SegmentedToggle } from './GroupedToggle.jsx';
import StandardSearchBar from './StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * Shared chrome for screens that pair a segmented toggle with search.
 *
 * Desktop (md+): [toggles] [search flex] [trailing]
 * Mobile default: row 1 = toggles + trailing; row 2 = search full width.
 * Mobile trailingMobile="below": row 1 = toggles full width; row 2 = search;
 *   row 3 = trailing actions (phone-native, avoids overcrowding).
 */
export const ToggleSearchToolbar = ({
  theme,
  value,
  onChange,
  options,
  toggleSize = 'sm',
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  searchId,
  searchStyle,
  showSearch = true,
  trailing = null,
  trailingMobile = 'inline',
  className = '',
  toggleAriaLabel,
}) => {
  const dark = isDarkTheme(theme);
  const resolvedSearchStyle = searchStyle || {
    backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
    border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.06)',
    boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.18)' : '0 1px 4px rgba(53,53,53,0.05)',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  };

  const stackTrailingOnMobile = Boolean(trailing) && trailingMobile === 'below';
  const desktopCols = trailing
    ? 'md:grid-cols-[auto_minmax(0,1fr)_auto]'
    : 'md:grid-cols-[auto_minmax(0,1fr)]';
  const mobileCols = stackTrailingOnMobile
    ? 'grid-cols-1'
    : 'grid-cols-[minmax(0,1fr)_auto]';

  return (
    <div
      className={`grid ${mobileCols} ${desktopCols} items-center gap-x-2.5 gap-y-2.5 ${className}`.trim()}
    >
      <div className={`min-w-0 col-start-1 row-start-1 ${stackTrailingOnMobile ? '' : ''}`.trim()}>
        <SegmentedToggle
          value={value}
          onChange={onChange}
          options={options}
          size={toggleSize}
          theme={theme}
          fullWidth
          ariaLabel={toggleAriaLabel}
          className="w-full"
        />
      </div>

      {trailing && !stackTrailingOnMobile ? (
        <div className="col-start-2 row-start-1 md:col-start-3 justify-self-end">
          {trailing}
        </div>
      ) : null}

      {showSearch ? (
        <div
          className={`min-w-0 w-full ${
            stackTrailingOnMobile
              ? 'col-span-1 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1'
              : 'col-span-2 md:col-span-1 md:col-start-2 row-start-2 md:row-start-1'
          }`}
        >
          <StandardSearchBar
            id={searchId}
            value={searchValue}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
            theme={theme}
            size="control"
            style={resolvedSearchStyle}
          />
        </div>
      ) : null}

      {trailing && stackTrailingOnMobile ? (
        <div className="col-span-1 row-start-3 md:col-span-1 md:col-start-3 md:row-start-1 justify-self-stretch md:justify-self-end">
          {trailing}
        </div>
      ) : null}
    </div>
  );
};

export default ToggleSearchToolbar;
