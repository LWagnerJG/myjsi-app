import React from 'react';
import { ChevronRight } from 'lucide-react';
import { isDarkTheme, cardSurface } from '../../design-system/tokens.js';
import { HOME_SURFACE_DARK, HOME_SURFACE_LIGHT } from '../../design-system/homeChrome.js';

/**
 * Disambiguation screen shown when a series (e.g. "Harbor") exists in
 * multiple product categories (Guest, Lounge, Swivels).
 *
 * Shows a card for each category so the user can pick which one to explore.
 * If a series only has one category, routing skips this screen entirely.
 */
export const SeriesCategoryPickerScreen = ({ seriesSlug, categories, onNavigate, theme }) => {
  const dark = isDarkTheme(theme);
  const seriesName = categories[0]?.productName || seriesSlug;

  return (
    <div className="flex flex-col h-full app-header-offset">
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-8 max-w-content mx-auto w-full space-y-5">
          {/* Title */}
          <div className="space-y-1 px-1">
            <h1
              className="text-[1.375rem] font-bold tracking-tight"
              style={{ color: theme.colors.textPrimary }}
            >
              {seriesName}
            </h1>
            <p
              className="text-[0.875rem]"
              style={{ color: theme.colors.textSecondary }}
            >
              Available in {categories.length} categories
            </p>
          </div>

          {/* Category cards */}
          <div className="space-y-3">
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                onClick={() => onNavigate(`products/category/${cat.categoryId}`, { initialProductId: cat.productId })}
                className="w-full rounded-[20px] overflow-hidden transition-transform active:scale-[0.98]"
                style={{
                  ...cardSurface(theme),
                  backgroundColor: dark ? HOME_SURFACE_DARK : HOME_SURFACE_LIGHT,
                  boxShadow: 'none',
                }}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Thumbnail */}
                  <div
                    className="w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden flex items-center justify-center"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
                  >
                    <img
                      src={cat.image}
                      alt={`${seriesName} ${cat.categoryName}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                      loading="lazy"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 text-left">
                    <h3
                      className="text-[1rem] font-semibold tracking-tight"
                      style={{ color: theme.colors.textPrimary }}
                    >
                      {seriesName} {cat.categoryName}
                    </h3>
                    <p
                      className="text-[0.8125rem] mt-0.5"
                      style={{ color: theme.colors.textSecondary }}
                    >
                      View in {cat.categoryName}
                    </p>
                  </div>

                  {/* Chevron */}
                  <ChevronRight
                    className="w-5 h-5 flex-shrink-0"
                    style={{ color: theme.colors.textSecondary }}
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
