import React, { useState, useEffect, useCallback } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { HAT_SIZES, SHIRT_SIZES, formatElliottBucks } from '../../data.js';
import { SizePicker } from './SizePicker.jsx';
import { getMarketplacePalette } from '../../theme.js';

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
  const stockLabel = lowStock ? `Only ${product.stock} left` : `${product.stock} available`;

  return (
    <div
      className="overflow-hidden flex flex-col transition-all duration-200"
      style={{
        borderRadius: 24,
        backgroundColor: theme.colors.surface,
        border: hasAnyInCart ? `1.5px solid ${palette.brand}` : `1px solid ${palette.border}`,
        boxShadow: palette.shadow,
      }}
    >
      <div className="relative aspect-square overflow-hidden" style={{ borderRadius: '24px 24px 0 0', backgroundColor: palette.panelSubtle }}>
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover"
        />

        {product.badge && (
          <span
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.14em]"
            style={{
              backgroundColor: palette.dark ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.92)',
              color: theme.colors.textPrimary,
              backdropFilter: 'blur(6px)',
            }}
          >
            {product.badge}
          </span>
        )}

        {hasAnyInCart && (
          <div
            className="absolute top-3 right-3 min-w-[28px] h-7 px-2.5 flex items-center justify-center font-bold text-xs"
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
          <h4 className="text-[0.9375rem] font-semibold leading-snug min-w-0" style={{ color: theme.colors.textPrimary }}>
            {product.name}
          </h4>
          <span className="text-[0.9375rem] font-bold whitespace-nowrap tabular-nums" style={{ color: theme.colors.textPrimary }}>
            {formatElliottBucks(product.price)}
          </span>
        </div>

        <p className="text-[0.6875rem] font-medium" style={{ color: lowStock ? palette.warning : theme.colors.textSecondary }}>
          {stockLabel}
        </p>

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
                backgroundColor: palette.panelSubtle,
                border: `1px solid ${palette.border}`,
              }}
              aria-label={selectedQty === 1 ? 'Remove from cart' : 'Remove one'}
            >
              {selectedQty === 1
                ? <Trash2 className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                : <Minus className="w-4 h-4" style={{ color: theme.colors.textPrimary }} />}
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
            className="mt-auto w-full h-10 rounded-full text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
