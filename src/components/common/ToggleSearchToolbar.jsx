import React from 'react';
import { SegmentedToggle } from './GroupedToggle.jsx';
import StandardSearchBar from './StandardSearchBar.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';

/**
 * Shared chrome for screens that pair a segmented toggle with search.
 *
 * Desktop (md+): [toggles] [search flex] [trailing]
 * Mobile: row 1 = toggles (stretch) + trailing; row 2 = search full width.
 * Search height matches the toggle control height via size="control".
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
  className = '',
  toggleAriaLabel,
}) => {
  const dark = isDarkTheme(theme);
  const resolvedSearchStyle = searchStyle || {
    backgroundColor: dark ? 'rgba(255,255,255,0.06)' : '#FFFFFF',
    border: dark ? '1px solid rgba(255,255,255,0.10)' : '1px solid rgba(0,0,0,0.05)',
    boxShadow: dark ? '0 1px 6px rgba(0,0,0,0.18)' : '0 1px 4px rgba(53,53,53,0.05)',
    backdropFilter: 'none',
    WebkitBackdropFilter: 'none',
  };

  const desktopCols = trailing
    ? 'md:grid-cols-[auto_minmax(0,1fr)_auto]'
    : 'md:grid-cols-[auto_minmax(0,1fr)]';

  return (
    <div
      className={`grid grid-cols-[minmax(0,1fr)_auto] ${desktopCols} items-center gap-x-2.5 gap-y-2.5 ${className}`.trim()}
    >
      <div className="min-w-0 col-start-1 row-start-1">
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

      {trailing ? (
        <div className="col-start-2 row-start-1 md:col-start-3 justify-self-end">
          {trailing}
        </div>
      ) : null}

      {showSearch ? (
        <div className="col-span-2 md:col-span-1 md:col-start-2 row-start-2 md:row-start-1 min-w-0 w-full">
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
    </div>
  );
};

export default ToggleSearchToolbar;
