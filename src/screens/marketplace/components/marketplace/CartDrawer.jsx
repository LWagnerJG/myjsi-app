import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { ShoppingCart, ChevronDown, Trash2, Minus, Plus, CreditCard } from 'lucide-react';
import { FloatingCart } from '../../../../components/common/FloatingCart.jsx';
import { formatElliottBucks } from '../../data.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';
import { getMarketplacePalette } from '../../theme.js';

export const CartDrawer = ({ cart, balance, onUpdateQty, onRemove, onCheckout, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const isDark = isDarkTheme(theme);
  const palette = getMarketplacePalette(theme);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);
  const canAfford = balance >= totalPrice;
  const remaining = Math.max(0, totalPrice - balance);

  if (cart.length === 0) return null;

  return (
    <>
      {/* Floating cart pill — shared component */}
      {!expanded && (
        <FloatingCart
          itemCount={totalItems}
          label={`Review Cart · ${formatElliottBucks(totalPrice)}`}
          onClick={() => setExpanded(true)}
          theme={theme}
        />
      )}

      {/* Expanded */}
      {expanded && createPortal(
        <div className="fixed inset-0" style={{ zIndex: UNIFIED_MODAL_Z }} onClick={() => setExpanded(false)}>
          <div className="absolute inset-0" style={getUnifiedBackdropStyle(true)} />
          <div
            className="absolute bottom-4 left-4 right-4 max-w-md mx-auto rounded-[28px] overflow-hidden"
            style={{ backgroundColor: theme.colors.surface, boxShadow: palette.shadow, border: `1px solid ${palette.border}`, maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer"
              onClick={() => setExpanded(false)}
              style={{ borderBottom: `1px solid ${palette.hairline}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: palette.brand }}>
                  <ShoppingCart className="w-5 h-5" style={{ color: palette.brandInk }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>LWYD Cart</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{totalItems} item{totalItems !== 1 ? 's' : ''} ready to redeem</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </div>

            <div className="px-5 pb-5 pt-3 max-h-[65vh] overflow-y-auto scrollbar-hide flex flex-col gap-4">
              {/* Items */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: theme.colors.textSecondary }}>Items</p>
                <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: palette.panelSubtle, border: `1px solid ${palette.border}` }}>
                  <div className="px-3 py-1">
                    {cart.map((item, idx) => (
                      <div key={item.cartId}>
                        {idx > 0 && <div className="border-t mx-1" style={{ borderColor: palette.hairline }} />}
                        <div className="flex items-center gap-3 py-3">
                          <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${palette.border}` }}>
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-[0.8125rem]" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                            <p className="text-[0.6875rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                              {item.size && `Size ${item.size} · `}{formatElliottBucks(item.price)} each
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            <p className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                              {formatElliottBucks(item.qty * item.price)}
                            </p>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => item.qty === 1 ? onRemove(item.cartId) : onUpdateQty(item.cartId, -1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition"
                                style={{ backgroundColor: item.qty === 1 ? palette.errorSoft : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') }}
                              >
                                {item.qty === 1 ? <Trash2 className="w-3.5 h-3.5" style={{ color: palette.error }} /> : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />}
                              </button>
                              <span className="font-bold w-5 text-center text-xs tabular-nums" style={{ color: theme.colors.textPrimary }}>{item.qty}</span>
                              <button
                                onClick={() => onUpdateQty(item.cartId, 1)}
                                className="w-8 h-8 flex items-center justify-center rounded-full active:scale-90 transition"
                                style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }}
                              >
                                <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-[24px] p-4" style={{ backgroundColor: palette.panel, border: `1px solid ${palette.border}` }}>
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: theme.colors.textSecondary }}>Summary</p>
                <div className="flex justify-between mb-2">
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Redeem now</span>
                  <span className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{formatElliottBucks(totalPrice)}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Your Balance</span>
                  <span className="text-xs font-semibold" style={{ color: canAfford ? theme.colors.success : palette.error }}>{formatElliottBucks(balance)}</span>
                </div>
                <div className="border-t pt-3 mt-3 flex justify-between" style={{ borderColor: palette.hairline }}>
                  <span className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>After redemption</span>
                  <span className="text-xs font-bold" style={{ color: canAfford ? theme.colors.success : palette.error }}>
                    {canAfford ? formatElliottBucks(balance - totalPrice) : `Need ${formatElliottBucks(remaining)}`}
                  </span>
                </div>
              </div>

              {/* Checkout */}
              <button
                disabled={!canAfford || cart.length === 0}
                onClick={onCheckout}
                className="w-full px-5 py-3.5 rounded-full text-[0.8125rem] font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  backgroundColor: canAfford ? palette.brand : (isDark ? 'rgba(255,255,255,0.10)' : theme.colors.border),
                  color: canAfford ? palette.brandInk : theme.colors.textSecondary,
                }}
              >
                <CreditCard className="w-4 h-4" />
                {canAfford ? `Redeem ${formatElliottBucks(totalPrice)}` : `Need ${formatElliottBucks(remaining)}`}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
