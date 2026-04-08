import React, { useState, useEffect, useCallback } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { HAT_SIZES, SHIRT_SIZES, formatElliottBucks } from '../../data.js';
import { SizePicker } from './SizePicker.jsx';

const CATEGORY_LABELS = {
  cups: 'Drinkware',
  shirts: 'Apparel',
  hats: 'Headwear',
};

export const ProductCard = React.memo(({ product, cartQty, onAdd, onRemoveOne, defaultSize, theme }) => {
  const isDark = isDarkTheme(theme);
  const sizes = product.hasSizes ? (product.sizeType === 'hat' ? HAT_SIZES : SHIRT_SIZES) : null;
  const initialSize = defaultSize && sizes?.includes(defaultSize) ? defaultSize : (sizes ? sizes[2] || sizes[0] : null);
  const [selectedSize, setSelectedSize] = useState(initialSize);

  useEffect(() => {
    if (defaultSize && sizes?.includes(defaultSize)) {
      setSelectedSize(defaultSize);
    }
  }, [defaultSize, sizes]);

  const handleAdd = useCallback((event) => {
    event.stopPropagation();
    if (sizes && !selectedSize) return;
    onAdd(product, selectedSize);
  }, [onAdd, product, selectedSize, sizes]);

  const handleRemoveOne = useCallback((event) => {
    event.stopPropagation();
    if (onRemoveOne) onRemoveOne(product.id, selectedSize);
  }, [onRemoveOne, product.id, selectedSize]);

  const inCart = cartQty > 0;
  const lowStock = product.stock <= 35;
  const categoryLabel = CATEGORY_LABELS[product.category] || 'Collection';
  const stockLabel = lowStock ? `${product.stock} left` : `${product.stock} available`;

  const badgeColors = {
    'Best Seller': { bg: theme.colors.successLight, text: theme.colors.success },
    'New': { bg: theme.colors.accent, text: theme.colors.accentText },
    'Popular': { bg: theme.colors.infoLight, text: theme.colors.info },
    'Fan Favorite': { bg: theme.colors.warningLight, text: theme.colors.warning },
  };

  return (
    <div
      className="overflow-hidden flex flex-col transition-all duration-200"
      style={{
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        border: inCart
          ? `1.5px solid ${theme.colors.accent}`
          : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'),
        boxShadow: isDark ? '0 2px 8px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      {/* Image — clean, no gradient overlay */}
      <div className="relative aspect-square overflow-hidden" style={{ borderRadius: '24px 24px 0 0' }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.16em]"
            style={{
              backgroundColor: badgeColors[product.badge]?.bg || theme.colors.accent,
              color: badgeColors[product.badge]?.text || theme.colors.accentText,
            }}
          >
            {product.badge}
          </span>
        )}

        {inCart && (
          <div
            className="absolute top-3 right-3 min-w-[28px] h-7 px-2 flex items-center justify-center font-bold text-xs"
            style={{
              borderRadius: 9999,
              backgroundColor: theme.colors.accent,
              color: theme.colors.accentText,
            }}
          >
            {cartQty}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-3.5 gap-2.5">
        <div>
          <h4 className="text-sm font-semibold leading-tight" style={{ color: theme.colors.textPrimary }}>
            {product.name}
          </h4>
          <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
            {categoryLabel} · {formatElliottBucks(product.price)}
          </p>
        </div>

        {lowStock && (
          <span
            className="self-start px-2.5 py-1 rounded-full text-[0.625rem] font-semibold"
            style={{
              backgroundColor: theme.colors.warningLight,
              color: theme.colors.warning,
            }}
          >
            {stockLabel}
          </span>
        )}

        {sizes && (
          <SizePicker sizes={sizes} selected={selectedSize} onSelect={setSelectedSize} theme={theme} />
        )}

        {inCart ? (
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={handleRemoveOne}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
              style={{
                backgroundColor: isDark ? 'rgba(184,92,92,0.18)' : 'rgba(184,92,92,0.10)',
                border: '1px solid rgba(184,92,92,0.30)',
              }}
              aria-label={cartQty === 1 ? 'Remove from cart' : 'Remove one'}
            >
              {cartQty === 1
                ? <Trash2 className="w-3.5 h-3.5" style={{ color: theme.colors.error }} />
                : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.error }} />}
            </button>

            <button
              onClick={handleAdd}
              disabled={sizes && !selectedSize}
              className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.accentText,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add another
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={sizes && !selectedSize}
            className="mt-auto w-full py-2.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.accentText,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add to cart
          </button>
        )}
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';
