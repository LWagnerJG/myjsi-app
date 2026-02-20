// src/screens/marketplace/MarketplaceScreen.jsx
// LWYD Marketplace — ElliottBucks rewards shop
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { FloatingCart } from '../../components/common/FloatingCart.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
  ShoppingCart, Plus, Minus, Trash2, X, ChevronDown, ChevronRight,
  Package, Truck, CheckCircle, Clock, Award, Star, Trophy,
  Target, UserPlus, ShoppingBag, Search, ArrowLeft, Wallet,
  Tag, TrendingUp, History, Gift, CreditCard, Ban
} from 'lucide-react';
import { hapticMedium, hapticSuccess, hapticLight } from '../../utils/haptics.js';
import {
  MARKETPLACE_PRODUCTS, MARKETPLACE_CATEGORIES, SHIRT_SIZES, HAT_SIZES,
  INITIAL_BALANCE, BALANCE_HISTORY, INITIAL_ORDERS,
  getProductById, formatElliottBucks, ORDER_STATUS_CONFIG,
} from './data.js';

// ============================================
// UTILITIES
// ============================================
const TXN_ICONS = { award: Award, star: Star, trophy: Trophy, target: Target, 'user-plus': UserPlus, 'shopping-bag': ShoppingBag, 'check-circle': CheckCircle };
const getIcon = (key) => TXN_ICONS[key] || Gift;

// ============================================
// SIZE PICKER (inline pill row)
// ============================================
const SizePicker = ({ sizes, selected, onSelect, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div className="flex flex-wrap gap-1.5 mt-2">
      {sizes.map(s => {
        const active = selected === s;
        return (
          <button
            key={s}
            onClick={(e) => { e.stopPropagation(); onSelect(s); }}
            className="px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all active:scale-95"
            style={{
              backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)'),
              color: active ? theme.colors.accentText : theme.colors.textSecondary,
              border: `1.5px solid ${active ? theme.colors.accent : theme.colors.border}`,
            }}
          >
            {s}
          </button>
        );
      })}
    </div>
  );
};

// ============================================
// PRODUCT CARD
// ============================================
const ProductCard = React.memo(({ product, cartQty, onAdd, onRemoveOne, defaultSize, theme }) => {
  const isDark = isDarkTheme(theme);
  const sizes = product.hasSizes ? (product.sizeType === 'hat' ? HAT_SIZES : SHIRT_SIZES) : null;
  // Default to user's shirt size setting, fall back to index 2 (M) or first
  const initialSize = defaultSize && sizes?.includes(defaultSize) ? defaultSize : (sizes ? sizes[2] || sizes[0] : null);
  const [selectedSize, setSelectedSize] = useState(initialSize);

  // Re-sync if defaultSize changes (e.g. user updates shirt size in Settings)
  useEffect(() => {
    if (defaultSize && sizes?.includes(defaultSize)) setSelectedSize(defaultSize);
  }, [defaultSize]);

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
            className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
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
          className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-[12px] font-bold"
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
        <h4 className="text-[14px] font-bold leading-tight" style={{ color: theme.colors.textPrimary }}>
          {product.name}
        </h4>
        <p className="text-[11px] leading-relaxed flex-1" style={{ color: theme.colors.textSecondary }}>
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
              className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-full text-[12px] font-bold transition-all active:scale-[0.97] disabled:opacity-40"
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
            className="mt-1 w-full py-2.5 rounded-full text-[12px] font-bold transition-all active:scale-[0.97] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

// ============================================
// CART DRAWER (bottom sheet style)
// ============================================
const CartDrawer = ({ cart, balance, onUpdateQty, onRemove, onCheckout, theme }) => {
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
      {expanded && (
        <div className="fixed inset-0 z-30" onClick={() => setExpanded(false)}>
          <div className="absolute inset-0 bg-black/30" />
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
                  <p className="font-bold text-[14px]" style={{ color: theme.colors.textPrimary }}>Your Cart</p>
                  <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{totalItems} item{totalItems !== 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronDown className="w-5 h-5" style={{ color: theme.colors.textSecondary }} />
            </div>

            <div className="px-5 pb-5 pt-3 max-h-[65vh] overflow-y-auto scrollbar-hide flex flex-col gap-4">
              {/* Items */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-widest mb-2 px-1" style={{ color: theme.colors.textSecondary }}>Items</p>
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
                            <p className="font-semibold truncate text-[12px]" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                            <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                              {item.size && `Size ${item.size} · `}{formatElliottBucks(item.price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => item.qty === 1 ? onRemove(item.cartId) : onUpdateQty(item.cartId, -1)}
                              className="w-7 h-7 flex items-center justify-center rounded-full active:scale-90 transition"
                            >
                              {item.qty === 1 ? <Trash2 className="w-3.5 h-3.5" style={{ color: '#B85C5C' }} /> : <Minus className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />}
                            </button>
                            <span className="font-bold w-5 text-center text-[12px]" style={{ color: theme.colors.textPrimary }}>{item.qty}</span>
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
                  <span className="text-[12px]" style={{ color: theme.colors.textSecondary }}>Subtotal</span>
                  <span className="text-[12px] font-semibold" style={{ color: theme.colors.textPrimary }}>{formatElliottBucks(totalPrice)}</span>
                </div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-[12px]" style={{ color: theme.colors.textSecondary }}>Your Balance</span>
                  <span className="text-[12px] font-semibold" style={{ color: canAfford ? theme.colors.success : theme.colors.error }}>{formatElliottBucks(balance)}</span>
                </div>
                <div className="border-t pt-2 mt-2 flex justify-between" style={{ borderColor: theme.colors.border }}>
                  <span className="text-[12px] font-bold" style={{ color: theme.colors.textPrimary }}>Remaining After</span>
                  <span className="text-[12px] font-bold" style={{ color: canAfford ? theme.colors.success : theme.colors.error }}>
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
        </div>
      )}
    </>
  );
};

// ============================================
// ORDER CARD
// ============================================
const OrderCard = ({ order, theme }) => {
  const [open, setOpen] = useState(false);
  const isDark = isDarkTheme(theme);
  const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.processing;
  const StatusIcon = order.status === 'delivered' ? CheckCircle : order.status === 'shipped' ? Truck : order.status === 'cancelled' ? Ban : Clock;

  return (
    <GlassCard theme={theme} className="overflow-hidden">
      <button className="w-full text-left px-4 py-3.5 flex items-center gap-3" onClick={() => setOpen(o => !o)}>
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
          <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold" style={{ color: theme.colors.textPrimary }}>{order.id}</p>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          <p className="text-[11px] mt-0.5" style={{ color: theme.colors.textSecondary }}>
            {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {formatElliottBucks(order.total)}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 transition-transform" style={{ color: theme.colors.textSecondary, transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
          {/* Items */}
          <div className="pt-3">
            <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.colors.textSecondary }}>Items</p>
            {order.items.map((item, i) => {
              const prod = getProductById(item.productId);
              return (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                    {prod?.image ? <img src={prod.image} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 m-auto" style={{ color: theme.colors.textSecondary }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                    <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
                      Qty {item.qty}{item.size ? ` · Size ${item.size}` : ''} · {formatElliottBucks(item.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipping info */}
          {(order.tracking || order.estimatedDelivery) && (
            <div className="rounded-xl p-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.02)' }}>
              {order.tracking && (
                <div className="flex items-center gap-2 mb-1.5">
                  <Truck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                  <p className="text-[11px] font-mono" style={{ color: theme.colors.textPrimary }}>{order.tracking}</p>
                </div>
              )}
              {order.status === 'delivered' && order.deliveredDate && (
                <p className="text-[11px]" style={{ color: theme.colors.success }}>
                  Delivered {new Date(order.deliveredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
              {order.status === 'shipped' && order.estimatedDelivery && (
                <p className="text-[11px]" style={{ color: theme.colors.info }}>
                  Estimated delivery {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
              {order.status === 'processing' && order.estimatedDelivery && (
                <p className="text-[11px]" style={{ color: theme.colors.warning }}>
                  Ships by {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};

// ============================================
// BALANCE CARD (hero top section)
// ============================================
const BalanceCard = ({ balance, theme }) => {
  const isDark = isDarkTheme(theme);
  return (
    <div
      className="rounded-3xl p-5 relative overflow-hidden"
      style={{
        background: isDark
          ? 'linear-gradient(135deg, #2A2A2A 0%, #353535 100%)'
          : 'linear-gradient(135deg, #353535 0%, #4A4A4A 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full" style={{ background: 'rgba(255,255,255,0.04)' }} />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full" style={{ background: 'rgba(255,255,255,0.03)' }} />

      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <Wallet className="w-4 h-4 text-white/60" />
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/60">ElliottBucks Balance</p>
        </div>
        <p className="text-4xl font-bold text-white tracking-tight">
          {formatElliottBucks(balance)}
        </p>
        <p className="text-[11px] text-white/50 mt-1">Redeem for exclusive LWYD merchandise</p>
      </div>
    </div>
  );
};

// ============================================
// TRANSACTION HISTORY ROW
// ============================================
const TransactionRow = ({ txn, theme, isLast }) => {
  const Icon = getIcon(txn.icon);
  const isCredit = txn.type === 'credit';
  return (
    <div className={`flex items-center gap-3 py-3 ${!isLast ? 'border-b' : ''}`} style={{ borderColor: theme.colors.border }}>
      <div
        className="w-9 h-9 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ backgroundColor: isCredit ? theme.colors.successLight : theme.colors.errorLight }}
      >
        <Icon className="w-4 h-4" style={{ color: isCredit ? theme.colors.success : theme.colors.error }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{txn.description}</p>
        <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>
          {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </p>
      </div>
      <span className="text-[13px] font-bold flex-shrink-0" style={{ color: isCredit ? theme.colors.success : theme.colors.error }}>
        {isCredit ? '+' : ''}{formatElliottBucks(txn.amount)}
      </span>
    </div>
  );
};

// ============================================
// CHECKOUT SUCCESS OVERLAY
// ============================================
const CheckoutSuccess = ({ show, theme }) => {
  if (!show) return null;
  const prefersReduced = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center pointer-events-none">
      <div className="absolute inset-0" style={{ background: show ? 'rgba(0,0,0,0.35)' : 'rgba(0,0,0,0)', transition: prefersReduced ? 'none' : 'background 320ms ease' }} />
      <div
        className="relative px-10 py-8 rounded-3xl text-center"
        style={{
          background: theme.colors.surface,
          color: theme.colors.textPrimary,
          border: `1px solid ${theme.colors.border}`,
          transform: show ? 'scale(1)' : 'scale(.9)',
          opacity: show ? 1 : 0.9,
          transition: prefersReduced ? 'none' : 'transform 480ms cubic-bezier(.3,1,.3,1), opacity 360ms ease',
          boxShadow: '0 6px 24px -4px rgba(0,0,0,0.12)',
        }}
      >
        <CheckCircle className="w-10 h-10 mx-auto mb-3" style={{ color: '#4A7C59' }} />
        <p className="font-bold text-[15px]">Order Placed!</p>
        <p className="text-[12px] mt-1" style={{ color: theme.colors.textSecondary }}>Your LWYD merch is on its way.</p>
      </div>
    </div>
  );
};

// ============================================
// MAIN SCREEN
// ============================================
export const MarketplaceScreen = ({ theme, onNavigate, userSettings }) => {
  const isDark = isDarkTheme(theme);

  // Default shirt size from user's settings (Settings screen stores as shirtSize)
  const defaultShirtSize = userSettings?.shirtSize || 'M';

  // Tabs: shop | orders | wallet
  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [txnHistory, setTxnHistory] = useState(BALANCE_HISTORY);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  // Cart helpers
  const addToCart = useCallback((product, size) => {
    hapticMedium();
    setCart(prev => {
      const existing = prev.find(i => i.productId === product.id && i.size === size);
      if (existing) {
        return prev.map(i => i.cartId === existing.cartId ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, {
        cartId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        productId: product.id,
        name: product.name,
        image: product.image,
        price: product.price,
        size,
        qty: 1,
      }];
    });
  }, []);

  const updateCartQty = useCallback((cartId, delta) => {
    setCart(prev => prev.map(i => i.cartId === cartId ? { ...i, qty: Math.max(1, i.qty + delta) } : i));
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setCart(prev => prev.filter(i => i.cartId !== cartId));
  }, []);

  const totalCartPrice = useMemo(() => cart.reduce((s, i) => s + i.qty * i.price, 0), [cart]);

  const handleCheckout = useCallback(() => {
    if (balance < totalCartPrice || cart.length === 0) return;
    hapticSuccess();

    // Create order
    const newOrder = {
      id: `MKT-${1005 + orders.length}`,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      total: totalCartPrice,
      items: cart.map(i => ({ productId: i.productId, name: i.name, qty: i.qty, size: i.size, price: i.price * i.qty })),
      tracking: null,
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      deliveredDate: null,
    };

    // Debit balance
    const newTxn = {
      id: `txn-${Date.now()}`,
      type: 'debit',
      amount: -totalCartPrice,
      description: cart.length === 1 ? cart[0].name : `${cart.length} LWYD items`,
      date: new Date().toISOString().split('T')[0],
      icon: 'shopping-bag',
    };

    setOrders(prev => [newOrder, ...prev]);
    setBalance(prev => prev - totalCartPrice);
    setTxnHistory(prev => [newTxn, ...prev]);
    setCart([]);
    setCheckoutSuccess(true);
    setTimeout(() => setCheckoutSuccess(false), 2200);
  }, [balance, totalCartPrice, cart, orders.length]);

  // Filtered products
  const filteredProducts = useMemo(() => {
    let list = MARKETPLACE_PRODUCTS;
    if (selectedCategory !== 'all') list = list.filter(p => p.category === selectedCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    return list;
  }, [selectedCategory, searchQuery]);

  // Cart qty per product id (for qty badges on tiles)
  const cartQtyByProduct = useMemo(() => {
    const map = {};
    cart.forEach(i => { map[i.productId] = (map[i.productId] || 0) + i.qty; });
    return map;
  }, [cart]);

  // Add removeOneFromCart for tile minus/trash
  const removeOneFromCart = useCallback((productId, size) => {
    setCart(prev => {
      const existing = prev.find(i => i.productId === productId && i.size === size);
      if (!existing) return prev;
      if (existing.qty === 1) return prev.filter(i => i.cartId !== existing.cartId);
      return prev.map(i => i.cartId === existing.cartId ? { ...i, qty: i.qty - 1 } : i);
    });
  }, []);


  const tabs = [
    { id: 'shop', label: 'Shop', icon: Tag },
    { id: 'orders', label: 'Orders', icon: Package },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
  ];

  const cartItemCount = useMemo(() => cart.reduce((s, i) => s + i.qty, 0), [cart]);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      {/* Tab bar */}
      <div className="flex-shrink-0 px-4 pt-1" style={{ background: theme.colors.background }}>
        <div className="max-w-2xl mx-auto w-full">
          <div className="flex gap-1 border-b" style={{ borderColor: theme.colors.border }}>
            {tabs.map(tab => {
              const isActive = activeTab === tab.id;
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => { hapticLight(); setActiveTab(tab.id); }}
                  className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-all"
                  style={{ color: isActive ? theme.colors.accent : theme.colors.textSecondary, background: 'transparent' }}
                >
                  <TabIcon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === 'orders' && orders.some(o => o.status === 'shipped') && (
                    <span className="w-2 h-2 rounded-full bg-blue-400 absolute top-2 right-1" />
                  )}
                  {tab.id === 'shop' && cartItemCount > 0 && (
                    <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                      {cartItemCount}
                    </span>
                  )}
                  {isActive && <span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full" style={{ backgroundColor: theme.colors.accent }} />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-2xl mx-auto w-full px-4 pb-8">

          {/* ===================== SHOP TAB ===================== */}
          {activeTab === 'shop' && (
            <div className="pt-4 space-y-4">
              {/* Balance mini card */}
              <BalanceCard balance={balance} theme={theme} />

              {/* Search — pill-shaped to match app header */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search LWYD merch..."
                  className="w-full pl-10 pr-10 py-3 text-[13px] outline-none transition"
                  style={{
                    borderRadius: 9999,
                    background: isDark ? 'rgba(255,255,255,0.07)' : theme.colors.inputBackground,
                    border: `1px solid ${theme.colors.border}`,
                    color: theme.colors.textPrimary,
                  }}
                />
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: theme.colors.textSecondary }} />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center rounded-full"
                    style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.07)' }}
                  >
                    <X className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />
                  </button>
                )}
              </div>

              {/* Category pills */}
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {MARKETPLACE_CATEGORIES.map(cat => {
                  const active = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className="px-4 py-2 rounded-full text-[12px] font-semibold whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
                      style={{
                        backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)'),
                        color: active ? theme.colors.accentText : theme.colors.textSecondary,
                        border: `1.5px solid ${active ? theme.colors.accent : theme.colors.border}`,
                      }}
                    >
                      {cat.name}
                    </button>
                  );
                })}
              </div>

              {/* Product grid */}
              {filteredProducts.length > 0 ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))' }}>
                  {filteredProducts.map(product => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      cartQty={cartQtyByProduct[product.id] || 0}
                      onAdd={addToCart}
                      onRemoveOne={removeOneFromCart}
                      defaultSize={defaultShirtSize}
                      theme={theme}
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-16">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)' }}>
                    <Search className="w-7 h-7" style={{ color: theme.colors.textSecondary }} />
                  </div>
                  <p className="text-[14px] font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>No products found</p>
                  <p className="text-[12px]" style={{ color: theme.colors.textSecondary }}>Try adjusting your search or category filter.</p>
                </div>
              )}

              {/* Bottom spacer for cart pill */}
              {cart.length > 0 && <div className="h-24" />}
            </div>
          )}

          {/* ===================== ORDERS TAB ===================== */}
          {activeTab === 'orders' && (
            <div className="pt-4 space-y-3">
              {/* Status summary */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Processing', key: 'processing', icon: Clock, color: '#C4956A', bg: 'rgba(196,149,106,0.12)' },
                  { label: 'Shipped', key: 'shipped', icon: Truck, color: '#5B7B8C', bg: 'rgba(91,123,140,0.12)' },
                  { label: 'Delivered', key: 'delivered', icon: CheckCircle, color: '#4A7C59', bg: 'rgba(74,124,89,0.12)' },
                ].map(s => {
                  const count = orders.filter(o => o.status === s.key).length;
                  const SIcon = s.icon;
                  return (
                    <GlassCard key={s.key} theme={theme} className="p-3 text-center">
                      <div className="w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: s.bg }}>
                        <SIcon className="w-4 h-4" style={{ color: s.color }} />
                      </div>
                      <p className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{count}</p>
                      <p className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>{s.label}</p>
                    </GlassCard>
                  );
                })}
              </div>

              {/* Order list */}
              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map(order => <OrderCard key={order.id} order={order} theme={theme} />)}
                </div>
              ) : (
                <div className="flex flex-col items-center py-16">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)' }}>
                    <Package className="w-7 h-7" style={{ color: theme.colors.textSecondary }} />
                  </div>
                  <p className="text-[14px] font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>No orders yet</p>
                  <p className="text-[12px]" style={{ color: theme.colors.textSecondary }}>Shop the LWYD collection to place your first order.</p>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="mt-4 px-5 py-2.5 rounded-full text-[12px] font-bold transition-all active:scale-95"
                    style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
                  >
                    Start Shopping
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ===================== WALLET TAB ===================== */}
          {activeTab === 'wallet' && (
            <div className="pt-4 space-y-4">
              <BalanceCard balance={balance} theme={theme} />

              {/* Quick stats */}
              <div className="grid grid-cols-2 gap-3">
                <GlassCard theme={theme} className="p-4 text-center">
                  <TrendingUp className="w-5 h-5 mx-auto mb-2" style={{ color: theme.colors.success }} />
                  <p className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                    {formatElliottBucks(txnHistory.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0))}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>Total Earned</p>
                </GlassCard>
                <GlassCard theme={theme} className="p-4 text-center">
                  <ShoppingBag className="w-5 h-5 mx-auto mb-2" style={{ color: theme.colors.error }} />
                  <p className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                    {formatElliottBucks(Math.abs(txnHistory.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)))}
                  </p>
                  <p className="text-[10px] font-medium" style={{ color: theme.colors.textSecondary }}>Total Spent</p>
                </GlassCard>
              </div>

              {/* Transaction history */}
              <GlassCard theme={theme} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                  <p className="text-[12px] font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Transaction History</p>
                </div>
                {txnHistory.map((txn, i) => (
                  <TransactionRow key={txn.id} txn={txn} theme={theme} isLast={i === txnHistory.length - 1} />
                ))}
              </GlassCard>

              {/* How to earn */}
              <GlassCard theme={theme} className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Gift className="w-4 h-4" style={{ color: theme.colors.accent }} />
                  <p className="text-[13px] font-bold" style={{ color: theme.colors.textPrimary }}>How to Earn ElliottBucks</p>
                </div>
                <div className="space-y-2.5">
                  {[
                    { title: 'Sign Up New Dealers', desc: 'Bonus for each new dealer onboarded', amount: 'EB 750 each' },
                    { title: 'Community Engagement', desc: 'Share content, help teammates, stay active', amount: 'EB 50–250' },
                    { title: 'Complete Training', desc: 'Finish product training modules', amount: 'EB 100 each' },
                    { title: 'Submit Feedback', desc: 'Help improve the platform', amount: 'EB 100' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 py-1">
                      <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)' }}>
                        <Award className="w-3 h-3" style={{ color: theme.colors.accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[12px] font-semibold" style={{ color: theme.colors.textPrimary }}>{item.title}</p>
                        <p className="text-[10px]" style={{ color: theme.colors.textSecondary }}>{item.desc}</p>
                      </div>
                      <span className="text-[10px] font-bold flex-shrink-0 px-2 py-1 rounded-full" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.08)', color: theme.colors.success }}>
                        {item.amount}
                      </span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          )}
        </div>
      </div>

      {/* Cart drawer (shop tab only) */}
      {activeTab === 'shop' && (
        <CartDrawer
          cart={cart}
          balance={balance}
          onUpdateQty={updateCartQty}
          onRemove={removeFromCart}
          onCheckout={handleCheckout}
          theme={theme}
        />
      )}

      {/* Checkout success overlay */}
      <CheckoutSuccess show={checkoutSuccess} theme={theme} />
    </div>
  );
};
