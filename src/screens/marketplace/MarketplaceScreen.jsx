// src/screens/marketplace/MarketplaceScreen.jsx
// LWYD Marketplace — ElliottBucks rewards shop
import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import {
  Package, Truck, CheckCircle, Clock,
  ShoppingBag, Search, Wallet,
  Tag, TrendingUp, History, Gift,
  Award, X
} from 'lucide-react';
import { hapticMedium, hapticSuccess, hapticLight } from '../../utils/haptics.js';
import {
  MARKETPLACE_PRODUCTS, MARKETPLACE_CATEGORIES,
  INITIAL_BALANCE, BALANCE_HISTORY, INITIAL_ORDERS,
  formatElliottBucks,
} from './data.js';

import { ProductCard } from './components/marketplace/ProductCard.jsx';
import { CartDrawer } from './components/marketplace/CartDrawer.jsx';
import { OrderCard } from './components/marketplace/OrderCard.jsx';
import { BalanceCard } from './components/marketplace/BalanceCard.jsx';
import { TransactionRow } from './components/marketplace/TransactionRow.jsx';
import { CheckoutSuccess } from './components/marketplace/CheckoutSuccess.jsx';

// ============================================
// MAIN SCREEN
// ============================================
export const MarketplaceScreen = ({ theme, userSettings }) => {
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
                    <span className="ml-1 min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold flex items-center justify-center" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
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
                      className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
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
                  <p className="text-sm font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>No products found</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Try adjusting your search or category filter.</p>
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
                      <p className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>{s.label}</p>
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
                  <p className="text-sm font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>No orders yet</p>
                  <p className="text-xs" style={{ color: theme.colors.textSecondary }}>Shop the LWYD collection to place your first order.</p>
                  <button
                    onClick={() => setActiveTab('shop')}
                    className="mt-4 px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95"
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
                  <p className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>Total Earned</p>
                </GlassCard>
                <GlassCard theme={theme} className="p-4 text-center">
                  <ShoppingBag className="w-5 h-5 mx-auto mb-2" style={{ color: theme.colors.error }} />
                  <p className="text-lg font-bold" style={{ color: theme.colors.textPrimary }}>
                    {formatElliottBucks(Math.abs(txnHistory.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0)))}
                  </p>
                  <p className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>Total Spent</p>
                </GlassCard>
              </div>

              {/* Transaction history */}
              <GlassCard theme={theme} className="px-4 py-3">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                  <p className="text-xs font-bold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Transaction History</p>
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
                        <p className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{item.title}</p>
                        <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{item.desc}</p>
                      </div>
                      <span className="text-[11px] font-bold flex-shrink-0 px-2 py-1 rounded-full" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.08)', color: theme.colors.success }}>
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
