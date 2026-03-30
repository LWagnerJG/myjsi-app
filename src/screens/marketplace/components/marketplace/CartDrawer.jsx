import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { ShoppingCart, ChevronDown, Trash2, Minus, Plus, CreditCard } from 'lucide-react';
import { FloatingCart } from '../../../../components/common/FloatingCart.jsx';
import { formatElliottBucks } from '../../data.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';

export const CartDrawer = ({ cart, balance, onUpdateQty, onRemove, onCheckout, theme }) => {
  const [expanded, setExpanded] = useState(false);
  const isDark = isDarkTheme(theme);
  const totalItems = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);
  const totalPrice = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);
  const canAfford = balance >= totalPrice;

  if (cart.length === 0) return null;

  return (
    <>
      {/* Floating cart pill — shared component */}
      {!expanded && (
        <FloatingCart
          itemCount={totalItems}
          label={`${formatElliottBucks(totalPrice)} · ${totalItems} item${totalItems !== 1 ? 's' : ''}`}
          onClick={() => setExpanded(true)}
          theme={theme}
        />
      )}

      {/* Expanded */}
      {expanded && createPortal(
        <div className="fixed inset-0" style={{ zIndex: UNIFIED_MODAL_Z }} onClick={() => setExpanded(false)}>
          <div className="absolute inset-0" style={getUnifiedBackdropStyle(true)} />
          <div
            className="absolute bottom-4 left-4 right-4 max-w-md mx-auto rounded-3xl overflow-hidden"
            style={{ backgroundColor: theme.colors.surface, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', maxHeight: '80vh' }}
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 cursor-pointer"
              onClick={() => setExpanded(false)}
              style={{ borderBottom: `1px solid ${theme.colors.border}` }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: theme.colors.accent }}>
                  <ShoppingCart className="w-5 h-5" style={{ color: theme.colors.accentText }} />
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: theme.colors.textPrimary }}>Your Cart</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </div>

            <div className="px-5 pb-5 pt-3 max-h-[65vh] overflow-y-auto scrollbar-hide flex flex-col gap-4">
              {/* Items */}
              <div>
                <p className="text-xs font-bold uppercase tracking-widest mb-2 px-1" style={{ color: theme.colors.textSecondary }}>Items</p>
                <div className="rounded-2xl overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.015)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                  <div className="px-3 py-1">
                    {cart.map((item, idx) => (
                      <div key={item.cartId}>
                        {idx > 0 && <div className="border-t mx-1" style={{ borderColor: theme.colors.border }} />}
                        <div className="flex items-center gap-3 py-2.5">
                          <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                            <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                              {item.size && `Size ${item.size} · `}{formatElliottBucks(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => item.qty === 1 ? onRemove(item.cartId) : onUpdateQty(item.cartId, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition"
                            >
                              {item.qty === 1 ? <Trash2 className="w-3.5 h-3.5" style={{ color: theme.colors.error }} /> : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />}
                            </button>
                            <span className="font-bold w-5 text-center text-xs" style={{ color: theme.colors.textPrimary }}>{item.qty}</span>
                            <button
                              onClick={() => onUpdateQty(item.cartId, 1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition"
                            >
                              <Plus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="rounded-2xl p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.02)', border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)'}` }}>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Subtotal</span>
                  <span className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{formatElliottBucks(totalPrice)}</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>Your Balance</span>
                  <span className="text-xs font-semibold" style={{ color: canAfford ? theme.colors.success : theme.colors.error }}>{formatElliottBucks(balance)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: theme.colors.border }}>
                  <span className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>Remaining After</span>
                  <span className="text-xs font-bold" style={{ color: canAfford ? theme.colors.success : theme.colors.error }}>
                    {canAfford ? formatElliottBucks(balance - totalPrice) : 'Insufficient'}
                  </span>
                </div>
              </div>

              {/* Checkout */}
              <button
                disabled={!canAfford || cart.length === 0}
                onClick={onCheckout}
                className="w-full px-5 py-3.5 rounded-full text-[13px] font-bold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                style={{
                  backgroundColor: canAfford ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : theme.colors.border),
                  color: canAfford ? theme.colors.accentText : theme.colors.textSecondary,
                }}
              >
                <CreditCard className="w-4 h-4" />
                {canAfford ? `Redeem ${formatElliottBucks(totalPrice)}` : 'Not Enough ElliottBucks'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
