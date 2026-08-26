import React from 'react';
import { ToggleSearchToolbar } from '../../components/common/ToggleSearchToolbar.jsx';

export const ORDER_VIEW_OPTIONS = [
  { value: 'shipDate', label: 'Ship' },
  { value: 'date', label: 'PO' },
  { value: 'samples', label: 'Samples' },
];

/** Shared orders chrome — Ship / PO / Samples + search (+ trailing filters). */
export const OrdersViewToolbar = ({
  theme,
  dateType,
  onDateTypeChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search orders...',
  trailing = null,
}) => (
  <ToggleSearchToolbar
    theme={theme}
    value={dateType}
    onChange={onDateTypeChange}
    options={ORDER_VIEW_OPTIONS}
    toggleSize="sm"
    searchValue={searchTerm}
    onSearchChange={onSearchChange}
    searchPlaceholder={searchPlaceholder}
    searchId="orders-main-search"
    trailing={trailing}
    trailingMobile="below"
    toggleAriaLabel="Order views"
  />
);
