import React, { useState, useEffect, useCallback } from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { Trash2, Minus, Plus } from 'lucide-react';
import { HAT_SIZES, SHIRT_SIZES, formatElliottBucks } from '../../data.js';
import { SizePicker } from './SizePicker.jsx';

export const ProductCard = React.memo(({ product, cartQty, onAdd, onRemoveOne, defaultSize, theme }) => {
  const isDark = isDarkTheme(theme);
  const sizes = product.hasSizes ? (product.sizeType === 'hat' ? HAT_SIZES : SHIRT_SIZES) : null;
  // Default to user's shirt size setting, fall back to index 2 (M) or first
  const initialSize = defaultSize && sizes?.includes(defaultSize) ? defaultSize : (sizes ? sizes[2] || sizes[0] : null);
  const [selectedSize, setSelectedSize] = useState(initialSize);

  // Re-sync if defaultSize changes (e.g. user updates shirt size in Settings)
  useEffect(() => {
    if (defaultSize && sizes?.includes(defaultSize)) setSelectedSize(defaultSize);
  }, [defaultSize, sizes]);

  const handleAdd = useCallback((e) => {
    e.stopPropagation();
    if (sizes && !selectedSize) return;
    onAdd(product, selectedSize);
  }, [product, selectedSize, onAdd, sizes]);

  const handleRemoveOne = useCallback((e) => {
    e.stopPropagation();
    if (onRemoveOne) onRemoveOne(product.id, selectedSize);
  }, [product.id, selectedSize, onRemoveOne]);

  const inCart = cartQty > 0;

  const badgeColors = {
    'Best Seller': { bg: '#4A7C59', text: '#fff' },
    'New': { bg: theme.colors.accent, text: theme.colors.accentText },
    'Popular': { bg: '#5B7B8C', text: '#fff' },
    'Fan Favorite': { bg: '#C4956A', text: '#fff' },
  };

  const cardBg = isDark ? '#2A2A2A' : '#FFFFFF';
  const cardBorder = inCart
    ? `2px solid ${theme.colors.accent}`
    : isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)';

  return (
    <div
      className="overflow-hidden flex flex-col transition-all duration-200"
      style={{
        borderRadius: 20,
        backgroundColor: cardBg,
        border: cardBorder,
        transform: inCart ? 'scale(1.02)' : 'scale(1)',
      }}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden" style={{ borderRadius: '20px 20px 0 0' }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
        />
        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider"
            style={{
              backgroundColor: badgeColors[product.badge]?.bg || theme.colors.accent,
              color: badgeColors[product.badge]?.text || '#fff',
            }}
          >
            {product.badge}
          </span>
        )}
        {/* Cart qty badge — top-right when in cart */}
        {inCart && (
          <div
            className="absolute top-3 right-3 min-w-[28px] h-7 px-2 flex items-center justify-center font-bold text-sm shadow-lg"
            style={{
              borderRadius: 9999,
              backgroundColor: isDark ? '#FFFFFF' : '#353535',
              color: isDark ? '#1A1A1A' : '#FFFFFF',
            }}
          >
            {cartQty}
          </div>
        )}
        {/* Price badge */}
        <span
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold"
          style={{
            backgroundColor: isDark ? 'rgba(0,0,0,0.75)' : 'rgba(255,255,255,0.92)',
            color: theme.colors.textPrimary,
            backdropFilter: 'blur(8px)',
          }}
        >
          {formatElliottBucks(product.price)}
        </span>
      </div>

      {/* Info */}
      <div className="flex-1 flex flex-col p-4 gap-2">
        <h4 className="text-sm font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>
          {product.name}
        </h4>
        <p className="text-xs leading-relaxed flex-1" style={{ color: theme.colors.textSecondary }}>
          {product.description}
        </p>

        {/* Size picker */}
        {sizes && (
          <SizePicker sizes={sizes} selected={selectedSize} onSelect={setSelectedSize} theme={theme} />
        )}

        {/* Add / qty controls */}
        {inCart ? (
          <div className="mt-1 flex items-center gap-2">
            {/* Remove one (shows Trash when qty=1) */}
            <button
              onClick={handleRemoveOne}
              className="flex items-center justify-center w-9 h-9 rounded-full transition-all active:scale-90"
              style={{
                backgroundColor: isDark ? 'rgba(184,92,92,0.18)' : 'rgba(184,92,92,0.10)',
                border: '1.5px solid rgba(184,92,92,0.30)',
              }}
              aria-label={cartQty === 1 ? 'Remove from cart' : 'Remove one'}
            >
              {cartQty === 1
                ? <Trash2 className="w-3.5 h-3.5" style={{ color: '#B85C5C' }} />
                : <Minus className="w-3.5 h-3.5" style={{ color: '#B85C5C' }} />}
            </button>
            {/* Add another */}
            <button
              onClick={handleAdd}
              disabled={sizes && !selectedSize}
              className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40"
              style={{
                backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.08)',
                color: theme.colors.textPrimary,
                border: `1.5px solid ${theme.colors.border}`,
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add Another
            </button>
          </div>
        ) : (
          <button
            onClick={handleAdd}
            disabled={sizes && !selectedSize}
            className="mt-1 w-full py-2.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.09)' : 'rgba(53,53,53,0.07)',
              color: theme.colors.textPrimary,
              border: `1.5px solid ${theme.colors.border}`,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
});
ProductCard.displayName = 'ProductCard';
