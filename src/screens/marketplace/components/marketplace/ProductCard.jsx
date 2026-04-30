import React, { useState, useEffect, useCallback } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { HAT_SIZES, SHIRT_SIZES, formatElliottBucks } from '../../data.js';
import { SizePicker } from './SizePicker.jsx';
import { getMarketplacePalette } from '../../theme.js';

const CATEGORY_LABELS = {
  cups: 'Drinkware',
  shirts: 'Apparel',
  hats: 'Headwear',
};

export const ProductCard = React.memo(({ product, productQty, variantQtyByKey, onAdd, onRemoveOne, defaultSize, theme }) => {
  const palette = getMarketplacePalette(theme);
  const sizes = product.hasSizes ? (product.sizeType === 'hat' ? HAT_SIZES : SHIRT_SIZES) : null;
  const initialSize = defaultSize && sizes?.includes(defaultSize) ? defaultSize : (sizes ? sizes[2] || sizes[0] : null);
  const [selectedSize, setSelectedSize] = useState(initialSize);

  useEffect(() => {
    if (defaultSize && sizes?.includes(defaultSize)) {
      setSelectedSize(defaultSize);
    }
  }, [defaultSize, sizes]);

  const selectedVariantKey = `${product.id}::${selectedSize || ''}`;
  const selectedQty = variantQtyByKey?.[selectedVariantKey] || 0;

  const handleAdd = useCallback((event) => {
    event.stopPropagation();
    if (sizes && !selectedSize) return;
    onAdd(product, selectedSize);
  }, [onAdd, product, selectedSize, sizes]);

  const handleRemoveOne = useCallback((event) => {
    event.stopPropagation();
    if (onRemoveOne) onRemoveOne(product.id, selectedSize);
  }, [onRemoveOne, product.id, selectedSize]);

  const inCart = selectedQty > 0;
  const hasAnyInCart = productQty > 0;
  const lowStock = product.stock <= 35;
  const categoryLabel = CATEGORY_LABELS[product.category] || 'Collection';
  const stockLabel = lowStock ? `${product.stock} left` : `${product.stock} available`;

  const badgeColors = {
    'Best Seller': { bg: palette.successSoft, text: palette.success },
    'New': { bg: palette.brand, text: palette.brandInk },
    'Popular': { bg: palette.infoSoft, text: palette.info },
    'Fan Favorite': { bg: palette.warningSoft, text: palette.warning },
  };

  return (
    <div
      className="overflow-hidden flex flex-col transition-all duration-200"
      style={{
        borderRadius: 26,
        backgroundColor: theme.colors.surface,
        border: hasAnyInCart ? `1.5px solid ${palette.brand}` : `1px solid ${palette.border}`,
        boxShadow: palette.shadow,
      }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ borderRadius: '26px 26px 0 0', backgroundColor: palette.panelSubtle }}>
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

        {hasAnyInCart && (
          <div
            className="absolute top-3 right-3 min-w-[30px] h-7 px-2.5 flex items-center justify-center font-bold text-xs"
            style={{
              borderRadius: 9999,
              backgroundColor: palette.brand,
              color: palette.brandInk,
            }}
          >
            {productQty}
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-4 gap-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
              {categoryLabel}
            </p>
            <h4 className="text-[0.9375rem] font-semibold leading-tight mt-1" style={{ color: theme.colors.textPrimary }}>
              {product.name}
            </h4>
          </div>
          <span
            className="px-2.5 py-1 rounded-full text-[0.6875rem] font-bold whitespace-nowrap"
            style={{ backgroundColor: palette.panelStrong, color: theme.colors.textPrimary }}
          >
            {formatElliottBucks(product.price)}
          </span>
        </div>

        <p
          className="text-[0.75rem] leading-snug"
          style={{
            color: theme.colors.textSecondary,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {product.description}
        </p>

        <div className="flex items-center gap-2 flex-wrap min-h-[28px]">
          {lowStock ? (
            <span
              className="self-start px-2.5 py-1 rounded-full text-[0.625rem] font-semibold"
              style={{
                backgroundColor: palette.warningSoft,
                color: palette.warning,
              }}
            >
              {stockLabel}
            </span>
          ) : (
            <span className="text-[0.6875rem] font-medium" style={{ color: theme.colors.textSecondary }}>
              {stockLabel}
            </span>
          )}
        </div>

        {sizes && (
          <SizePicker sizes={sizes} selected={selectedSize} onSelect={setSelectedSize} theme={theme} />
        )}

        {sizes && hasAnyInCart && !inCart && (
          <p className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary }}>
            {productQty} in cart across other size{productQty > 1 ? 's' : ''}
          </p>
        )}

        {inCart ? (
          <div className="flex items-center gap-2 mt-auto">
            <button
              onClick={handleRemoveOne}
              className="flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-90"
              style={{
                backgroundColor: palette.errorSoft,
                border: `1px solid ${palette.errorSoft}`,
              }}
              aria-label={selectedQty === 1 ? 'Remove from cart' : 'Remove one'}
            >
              {selectedQty === 1
                ? <Trash2 className="w-4 h-4" style={{ color: palette.error }} />
                : <Minus className="w-4 h-4" style={{ color: palette.error }} />}
            </button>

            <div className="min-w-[2rem] text-center text-sm font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>
              {selectedQty}
            </div>

            <button
              onClick={handleAdd}
              disabled={sizes && !selectedSize}
              className="flex-1 h-10 flex items-center justify-center gap-1.5 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40"
              style={{
                backgroundColor: palette.brand,
                color: palette.brandInk,
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
            className="mt-auto w-full py-2.75 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{
              backgroundColor: palette.brand,
              color: palette.brandInk,
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
