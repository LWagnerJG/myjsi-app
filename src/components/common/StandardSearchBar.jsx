import React from 'react';
import { SearchInput } from './SearchInput.jsx';

// Standardized search pill used across feature screens.
// size="md" (default): 56px standalone search
// size="control": matches SegmentedToggle / CTA height (--jsi-ctrl-h) for toolbar rows
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
  size = 'md',
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
      size={size}
    />
  );
};

export default StandardSearchBar;
