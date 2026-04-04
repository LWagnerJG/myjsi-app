import React, { useState, useMemo, useCallback } from 'react';
import {
  Award,
  CheckCircle,
  Clock,
  Gift,
  History,
  Package,
  Search,
  Sparkles,
  Tag,
  Truck,
  Wallet,
  X,
} from 'lucide-react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { hapticLight, hapticMedium, hapticSuccess } from '../../utils/haptics.js';
import {
  BALANCE_HISTORY,
  INITIAL_BALANCE,
  INITIAL_ORDERS,
  MARKETPLACE_CATEGORIES,
  MARKETPLACE_PRODUCTS,
  formatElliottBucks,
} from './data.js';
import { BalanceCard } from './components/marketplace/BalanceCard.jsx';
import { CartDrawer } from './components/marketplace/CartDrawer.jsx';
import { CheckoutSuccess } from './components/marketplace/CheckoutSuccess.jsx';
import { OrderCard } from './components/marketplace/OrderCard.jsx';
import { ProductCard } from './components/marketplace/ProductCard.jsx';
import { TransactionRow } from './components/marketplace/TransactionRow.jsx';

const EARNING_PROGRAMS = [
  { title: 'Sign up new dealers', desc: 'Bonus for each new dealer onboarded.', amount: '✦ 750' },
  { title: 'Stay active in community', desc: 'Replies, shares, and consistent engagement.', amount: '✦ 50–250' },
  { title: 'Complete product training', desc: 'Finish learning modules for product knowledge.', amount: '✦ 100' },
  { title: 'Send platform feedback', desc: 'Thoughtful feedback that improves the app.', amount: '✦ 100' },
];

const EmptyState = ({ icon: Icon, title, description, actionLabel, onAction, theme, isDark }) => (
  <GlassCard theme={theme} className="py-14 px-6 text-center">
    <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)' }}>
      <Icon className="w-7 h-7" style={{ color: theme.colors.textSecondary }} />
    </div>
    <p className="text-sm font-semibold mb-1" style={{ color: theme.colors.textPrimary }}>{title}</p>
    <p className="text-xs max-w-xs mx-auto" style={{ color: theme.colors.textSecondary }}>{description}</p>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="mt-5 px-5 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95"
        style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
      >
        {actionLabel}
      </button>
    )}
  </GlassCard>
);

export const MarketplaceScreen = ({ theme, userSettings }) => {
  const isDark = isDarkTheme(theme);
  const defaultShirtSize = userSettings?.shirtSize || 'M';

  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [balance, setBalance] = useState(INITIAL_BALANCE);
  const [orders, setOrders] = useState(INITIAL_ORDERS);
  const [txnHistory, setTxnHistory] = useState(BALANCE_HISTORY);
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);

  const tabOptions = useMemo(() => [
    { value: 'shop', label: 'Shop', icon: Tag, badge: cartItemCount || undefined },
    { value: 'orders', label: 'Orders', icon: Package },
    { value: 'wallet', label: 'Wallet', icon: Wallet },
  ], [cartItemCount]);

  const addToCart = useCallback((product, size) => {
    hapticMedium();

    setCart((previous) => {
      const existing = previous.find((item) => item.productId === product.id && item.size === size);

      if (existing) {
        return previous.map((item) => (
          item.cartId === existing.cartId
            ? { ...item, qty: item.qty + 1 }
            : item
        ));
      }

      return [
        ...previous,
        {
          cartId: `cart-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          productId: product.id,
          name: product.name,
          image: product.image,
          price: product.price,
          size,
          qty: 1,
        },
      ];
    });
  }, []);

  const updateCartQty = useCallback((cartId, delta) => {
    setCart((previous) => previous.map((item) => (
      item.cartId === cartId
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item
    )));
  }, []);

  const removeFromCart = useCallback((cartId) => {
    setCart((previous) => previous.filter((item) => item.cartId !== cartId));
  }, []);

  const removeOneFromCart = useCallback((productId, size) => {
    setCart((previous) => {
      const existing = previous.find((item) => item.productId === productId && item.size === size);

      if (!existing) return previous;
      if (existing.qty === 1) return previous.filter((item) => item.cartId !== existing.cartId);

      return previous.map((item) => (
        item.cartId === existing.cartId
          ? { ...item, qty: item.qty - 1 }
          : item
      ));
    });
  }, []);

  const totalCartPrice = useMemo(() => cart.reduce((sum, item) => sum + item.qty * item.price, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const filteredProducts = useMemo(() => {
    let list = MARKETPLACE_PRODUCTS;

    if (selectedCategory !== 'all') {
      list = list.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      list = list.filter((product) => (
        product.name.toLowerCase().includes(query)
        || product.description.toLowerCase().includes(query)
      ));
    }

    return list;
  }, [searchQuery, selectedCategory]);

  const cartQtyByProduct = useMemo(() => {
    const map = {};
    cart.forEach((item) => {
      map[item.productId] = (map[item.productId] || 0) + item.qty;
    });
    return map;
  }, [cart]);

  const handleCheckout = useCallback(() => {
    if (balance < totalCartPrice || cart.length === 0) return;

    hapticSuccess();

    const newOrder = {
      id: `MKT-${1005 + orders.length}`,
      date: new Date().toISOString().split('T')[0],
      status: 'processing',
      total: totalCartPrice,
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        qty: item.qty,
        size: item.size,
        price: item.price * item.qty,
      })),
      tracking: null,
      estimatedDelivery: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      deliveredDate: null,
    };

    const newTxn = {
      id: `txn-${Date.now()}`,
      type: 'debit',
      amount: -totalCartPrice,
      description: cart.length === 1 ? cart[0].name : `${cart.length} LWYD items`,
      date: new Date().toISOString().split('T')[0],
      icon: 'shopping-bag',
    };

    setOrders((previous) => [newOrder, ...previous]);
    setBalance((previous) => previous - totalCartPrice);
    setTxnHistory((previous) => [newTxn, ...previous]);
    setCart([]);
    setCheckoutSuccess(true);
    setTimeout(() => setCheckoutSuccess(false), 2200);
  }, [balance, cart, orders.length, totalCartPrice]);

  const totalEarned = useMemo(() => txnHistory.filter((txn) => txn.type === 'credit').reduce((sum, txn) => sum + txn.amount, 0), [txnHistory]);
  const totalSpent = useMemo(() => Math.abs(txnHistory.filter((txn) => txn.type === 'debit').reduce((sum, txn) => sum + txn.amount, 0)), [txnHistory]);
  const filteredCategoryCount = selectedCategory === 'all' ? MARKETPLACE_CATEGORIES.length - 1 : 1;

  const orderSummary = useMemo(() => ([
    { label: 'Processing', key: 'processing', icon: Clock, color: theme.colors.warning, bg: theme.colors.warningLight },
    { label: 'Shipped', key: 'shipped', icon: Truck, color: theme.colors.info, bg: theme.colors.infoLight },
    { label: 'Delivered', key: 'delivered', icon: CheckCircle, color: theme.colors.success, bg: theme.colors.successLight },
  ]), [theme]);

  const shopStats = useMemo(() => ([
    { label: 'Collection', value: `${MARKETPLACE_PRODUCTS.length} picks` },
    { label: 'Categories', value: `${filteredCategoryCount} active` },
    { label: 'In cart', value: cartItemCount ? `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''}` : 'Nothing yet' },
  ]), [cartItemCount, filteredCategoryCount]);

  const walletStats = useMemo(() => ([
    { label: 'Earned', value: formatElliottBucks(totalEarned) },
    { label: 'Spent', value: formatElliottBucks(totalSpent) },
    { label: 'Orders', value: `${orders.length} total` },
  ]), [orders.length, totalEarned, totalSpent]);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-shrink-0 px-4 pt-2 pb-1" style={{ background: theme.colors.background }}>
        <div className="max-w-2xl mx-auto w-full flex justify-center">
          <SegmentedToggle
            value={activeTab}
            onChange={(val) => { hapticLight(); setActiveTab(val); }}
            options={tabOptions}
            size="md"
            theme={theme}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-2xl mx-auto w-full px-4 pb-8">
          {activeTab === 'shop' && (
            <div className="pt-4 space-y-4">
              <BalanceCard
                balance={balance}
                theme={theme}
                eyebrow="LWYD Rewards"
                title="Marketplace"
                subtitle="Redeem ElliottBucks for branded gear, apparel, and team favorites."
                stats={shopStats}
              />

              {/* Search & filters — no wrapper card, lives directly in the flow */}
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search merch..."
                    className="w-full pl-10 pr-10 py-3 text-[13px] outline-none transition"
                    style={{
                      borderRadius: 9999,
                      background: isDark ? 'rgba(255,255,255,0.05)' : theme.colors.inputBackground,
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

                <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                  {MARKETPLACE_CATEGORIES.map((category) => {
                    const active = selectedCategory === category.id;
                    const count = category.id === 'all'
                      ? MARKETPLACE_PRODUCTS.length
                      : MARKETPLACE_PRODUCTS.filter((product) => product.category === category.id).length;

                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
                        style={{
                          backgroundColor: active ? theme.colors.accent : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)'),
                          color: active ? theme.colors.accentText : theme.colors.textSecondary,
                          border: `1px solid ${active ? theme.colors.accent : theme.colors.border}`,
                        }}
                      >
                        {category.name} <span className="opacity-70">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                  {filteredProducts.map((product) => (
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
                <EmptyState
                  icon={Search}
                  title="No products found"
                  description="Try adjusting your search or switch categories to bring the collection back into view."
                  theme={theme}
                  isDark={isDark}
                />
              )}

              {cart.length > 0 && <div className="h-24" />}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="pt-4 space-y-4">
              <GlassCard theme={theme} className="p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>
                      Order tracking
                    </p>
                    <h3 className="text-lg font-semibold mt-2" style={{ color: theme.colors.textPrimary }}>
                      Your orders
                    </h3>
                  </div>

                  <div className="rounded-2xl px-4 py-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>
                      Orders placed
                    </p>
                    <p className="text-2xl font-semibold mt-1" style={{ color: theme.colors.textPrimary }}>{orders.length}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5">
                  {orderSummary.map((summary) => {
                    const count = orders.filter((order) => order.status === summary.key).length;
                    const SummaryIcon = summary.icon;

                    return (
                      <div key={summary.key} className="rounded-2xl p-3 text-center" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.02)' }}>
                        <div className="w-9 h-9 rounded-2xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: summary.bg }}>
                          <SummaryIcon className="w-4 h-4" style={{ color: summary.color }} />
                        </div>
                        <p className="text-xl font-bold" style={{ color: theme.colors.textPrimary }}>{count}</p>
                        <p className="text-[11px] font-medium" style={{ color: theme.colors.textSecondary }}>{summary.label}</p>
                      </div>
                    );
                  })}
                </div>
              </GlassCard>

              {orders.length > 0 ? (
                <div className="space-y-3">
                  {orders.map((order) => <OrderCard key={order.id} order={order} theme={theme} />)}
                </div>
              ) : (
                <EmptyState
                  icon={Package}
                  title="No orders yet"
                  description="Shop the LWYD collection to place your first order and start a cleaner redemption history."
                  actionLabel="Start shopping"
                  onAction={() => setActiveTab('shop')}
                  theme={theme}
                  isDark={isDark}
                />
              )}
            </div>
          )}

          {activeTab === 'wallet' && (
            <div className="pt-4 space-y-4">
              <BalanceCard
                balance={balance}
                theme={theme}
                eyebrow="LWYD Wallet"
                title="Rewards balance"
                subtitle="Track earnings, redemptions, and upcoming rewards."
                stats={walletStats}
              />

              <GlassCard theme={theme} className="px-4 py-4 sm:px-5">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <History className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>Recent activity</p>
                    </div>
                    <p className="text-sm font-semibold mt-2" style={{ color: theme.colors.textPrimary }}>Recent activity</p>
                  </div>

                  <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.03)', color: theme.colors.textSecondary }}>
                    {txnHistory.length} entries
                  </span>
                </div>

                {txnHistory.map((txn, index) => (
                  <TransactionRow key={txn.id} txn={txn} theme={theme} isLast={index === txnHistory.length - 1} />
                ))}
              </GlassCard>

              <GlassCard theme={theme} className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4" style={{ color: theme.colors.warning }} />
                      <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>Ways to earn</p>
                    </div>
                    <p className="text-sm font-semibold mt-2" style={{ color: theme.colors.textPrimary }}>Ways to earn</p>
                  </div>

                  <Gift className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.accent }} />
                </div>

                <div className="space-y-0">
                  {EARNING_PROGRAMS.map((item, index) => (
                    <div key={item.title} className={`flex items-start gap-3 py-3 ${index !== EARNING_PROGRAMS.length - 1 ? 'border-b' : ''}`} style={{ borderColor: theme.colors.border }}>
                      <div className="w-8 h-8 rounded-2xl flex-shrink-0 flex items-center justify-center mt-0.5" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)' }}>
                        <Award className="w-3 h-3" style={{ color: theme.colors.accent }} />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold" style={{ color: theme.colors.textPrimary }}>{item.title}</p>
                        <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>{item.desc}</p>
                      </div>

                      <span className="text-[11px] font-bold flex-shrink-0 px-2.5 py-1.5 rounded-full" style={{ backgroundColor: isDark ? 'rgba(74,124,89,0.15)' : 'rgba(74,124,89,0.08)', color: theme.colors.success }}>
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

      <CheckoutSuccess show={checkoutSuccess} theme={theme} />
    </div>
  );
};
