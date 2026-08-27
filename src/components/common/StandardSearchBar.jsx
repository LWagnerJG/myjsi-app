import React from 'react';
import { SearchInput } from './SearchInput.jsx';

// Standardized search pill used across feature screens.
// size="control" (default): matches SegmentedToggle / CTA height (--jsi-ctrl-h)
// size="md": 56px standalone search (home-adjacent contexts only)
export const StandardSearchBar = ({
  value,
  onChange,
  placeholder = 'Search...',
  theme,
  className = '',
  id,
  autoFocus = false,
  inputRef,
  style,
  inputClassName = '',
  onKeyDown,
  size = 'control',
}) => {
  const handleChange = (e) => {
    // Accept both synthetic event and raw value handlers
    const val = e?.target ? e.target.value : e;
    if (onChange) onChange(val);
  };
  return (
    <SearchInput
      id={id}
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      theme={theme}
      className={className}
      inputClassName={inputClassName}
      autoFocus={autoFocus}
      inputRef={inputRef}
      style={style}
      onKeyDown={onKeyDown}
      size={size}
    />
  );
};

export default StandardSearchBar;
