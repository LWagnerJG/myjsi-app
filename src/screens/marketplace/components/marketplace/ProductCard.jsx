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
        backgroundColor: isDark ? '#2A2A2A' : '#FFFFFF',
        border: inCart
          ? `1.5px solid ${theme.colors.accent}`
          : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)'),
        boxShadow: inCart
          ? (isDark ? '0 18px 34px rgba(0,0,0,0.28)' : '0 18px 36px rgba(53,53,53,0.10)')
          : (isDark ? '0 10px 24px rgba(0,0,0,0.18)' : '0 10px 24px rgba(0,0,0,0.05)'),
      }}
    >
      <div className="relative aspect-[4/4.2] overflow-hidden" style={{ borderRadius: '24px 24px 0 0' }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 h-24" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.45) 100%)' }} />

        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-[0.16em]"
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
            className="absolute top-3 right-3 min-w-[34px] h-8 px-2.5 flex items-center justify-center font-bold text-sm shadow-lg"
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

      <div className="flex-1 flex flex-col p-4 gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>
              {categoryLabel}
            </p>
            <h4 className="text-[15px] font-semibold leading-tight mt-1" style={{ color: theme.colors.textPrimary }}>
              {product.name}
            </h4>
          </div>

          <span
            className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.05)',
              color: theme.colors.textPrimary,
            }}
          >
            {formatElliottBucks(product.price)}
          </span>
        </div>

        <p
          className="text-xs leading-relaxed flex-1"
          style={{
            color: theme.colors.textSecondary,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 54,
          }}
        >
          {product.description}
        </p>

        <div className="flex flex-wrap items-center gap-2">
          <span
            className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]"
            style={{
              backgroundColor: lowStock ? theme.colors.warningLight : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.03)'),
              color: lowStock ? theme.colors.warning : theme.colors.textSecondary,
            }}
          >
            {stockLabel}
          </span>

          {product.hasSizes && (
            <span
              className="px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.12em]"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.03)',
                color: theme.colors.textSecondary,
              }}
            >
              {product.sizeType === 'hat' ? 'Multiple fits' : 'Full size run'}
            </span>
          )}
        </div>

        {sizes && (
          <SizePicker sizes={sizes} selected={selectedSize} onSelect={setSelectedSize} theme={theme} />
        )}

        {inCart ? (
          <div className="mt-1 flex items-center gap-2">
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
                ? <Trash2 className="w-3.5 h-3.5" style={{ color: '#B85C5C' }} />
                : <Minus className="w-3.5 h-3.5" style={{ color: '#B85C5C' }} />}
            </button>

            <button
              onClick={handleAdd}
              disabled={sizes && !selectedSize}
              className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40"
              style={{
                backgroundColor: theme.colors.accent,
                color: theme.colors.accentText,
                border: `1px solid ${theme.colors.accent}`,
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
            className="mt-1 w-full py-3 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: theme.colors.accent,
              color: theme.colors.accentText,
              border: `1px solid ${theme.colors.accent}`,
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
