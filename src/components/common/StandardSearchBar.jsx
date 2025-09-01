import React from 'react';
import { SearchInput } from './SearchInput.jsx';

// Standardized 56px pill search used across feature screens (matches Orders / AppHeader styling)
// Props: value, onChange (event or value), placeholder, theme, className, onVoiceClick, id
export const StandardSearchBar = ({ value, onChange, placeholder='Search...', theme, className='', onVoiceClick, id }) => {
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
      variant="header"
      className={className}
      inputClassName=""
    />
  );
};

export default StandardSearchBar;
