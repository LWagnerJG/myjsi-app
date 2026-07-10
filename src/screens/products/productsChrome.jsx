import React from 'react';
import { ToggleSearchToolbar } from '../../components/common/ToggleSearchToolbar.jsx';

export const PRODUCT_VIEW_OPTIONS = [
  { value: 'categories', label: 'Categories' },
  { value: 'families', label: 'Our Families' },
  { value: 'custom', label: 'Custom' },
];

export const productViewPath = (view) => {
  if (view === 'families') return 'products/families';
  if (view === 'custom') return 'products/custom';
  return 'products';
};

export const productViewFromScreen = (currentScreen) => {
  const parts = String(currentScreen || 'products').split('/');
  if (parts[0] !== 'products') return 'categories';
  if (parts[1] === 'families') return 'families';
  if (parts[1] === 'custom' || (parts[1] === 'category' && parts[2] === 'customs')) return 'custom';
  return 'categories';
};

export const toSeriesSlug = (series) => String(series || '')
  .toLowerCase()
  .trim()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-+|-+$/g, '');

/** Shared products chrome — Categories / Our Families / Custom + search. */
export const ProductsViewToolbar = ({
  theme,
  activeView,
  onViewChange,
  searchTerm,
  onSearchChange,
  searchPlaceholder = 'Search products...',
  trailing = null,
}) => (
  <ToggleSearchToolbar
    theme={theme}
    value={activeView}
    onChange={onViewChange}
    options={PRODUCT_VIEW_OPTIONS}
    toggleSize="sm"
    searchValue={searchTerm}
    onSearchChange={onSearchChange}
    searchPlaceholder={searchPlaceholder}
    searchId="products-main-search"
    trailing={trailing}
    toggleAriaLabel="Product views"
  />
);
