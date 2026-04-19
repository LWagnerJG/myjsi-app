import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Award,
  History,
  MessageSquare,
  Package,
  Search,
  Sparkles,
  Tag,
  Truck,
  UserPlus,
  Wallet,
} from 'lucide-react';
import { EmptyState as SharedEmptyState } from '../../components/common/EmptyState.jsx';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { SegmentedToggle } from '../../components/common/GroupedToggle.jsx';
import { TabContent } from '../../components/common/TabContent.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { ScreenTopChrome } from '../../components/common/ScreenTopChrome.jsx';
import { usePersistentState } from '../../hooks/usePersistentState.js';
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
import { getMarketplacePalette } from './theme.js';

const EARNING_PROGRAMS = [
  { title: 'New dealer sign-ups', description: 'Bring a new dealer onboard.', amount: 750, icon: UserPlus, tone: 'success' },
  { title: 'Community activity', description: 'Posts, replies, and useful shares.', amount: 250, icon: Sparkles, tone: 'info' },
  { title: 'Product training', description: 'Finish LWYD learning modules.', amount: 100, icon: Award, tone: 'warning' },
  { title: 'Platform feedback', description: 'Feedback that improves the app.', amount: 100, icon: MessageSquare, tone: 'brand' },
];

const MARKETPLACE_STATE_VERSION = 1;

const getNextMarketplaceOrderId = (existingOrders) => {
  const highest = existingOrders.reduce((max, order) => {
    const match = String(order.id || '').match(/(\d+)$/);
    const value = match ? Number.parseInt(match[1], 10) : 1000;
    return Number.isFinite(value) ? Math.max(max, value) : max;
  }, 1000);

  return `MKT-${String(highest + 1).padStart(4, '0')}`;
};

const SectionHeader = ({ theme, palette, eyebrow, title, meta, icon: Icon, actionNode }) => (
  <div className="flex items-start justify-between gap-3 mb-4">
    <div className="min-w-0">
      <div className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4 shrink-0" style={{ color: theme.colors.textSecondary, opacity: 0.82 }} />}
        <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em]" style={{ color: theme.colors.textSecondary }}>
          {eyebrow}
        </p>
      </div>
      <p className="text-base font-semibold mt-2 leading-tight" style={{ color: theme.colors.textPrimary }}>
        {title}
      </p>
    </div>
    {actionNode || (meta && (
      <span
        className="text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
        style={{ backgroundColor: palette.panelSubtle, color: theme.colors.textSecondary, border: `1px solid ${palette.border}` }}
      >
        {meta}
      </span>
    ))}
  </div>
);

const getToneStyles = (tone, palette) => {
  if (tone === 'success') return { backgroundColor: palette.successSoft, color: palette.success };
  if (tone === 'info') return { backgroundColor: palette.infoSoft, color: palette.info };
  if (tone === 'warning') return { backgroundColor: palette.warningSoft, color: palette.warning };
  return { backgroundColor: palette.brandSoft, color: palette.brand };
};

export const MarketplaceScreen = ({ theme, userSettings }) => {
  const palette = useMemo(() => getMarketplacePalette(theme), [theme]);
  const defaultShirtSize = userSettings?.shirtSize || 'M';
  const checkoutTimerRef = useRef(null);

  const [activeTab, setActiveTab] = useState('shop');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllActivity, setShowAllActivity] = useState(false);
  const [cart, setCart] = usePersistentState('marketplace.lwyd.cart', [], { version: MARKETPLACE_STATE_VERSION });
  const [balance, setBalance] = usePersistentState('marketplace.lwyd.balance', INITIAL_BALANCE, { version: MARKETPLACE_STATE_VERSION });
  const [orders, setOrders] = usePersistentState('marketplace.lwyd.orders', INITIAL_ORDERS, { version: MARKETPLACE_STATE_VERSION });
  const [txnHistory, setTxnHistory] = usePersistentState('marketplace.lwyd.txn-history', BALANCE_HISTORY, { version: MARKETPLACE_STATE_VERSION });
  const [checkoutSuccess, setCheckoutSuccess] = useState(null);

  useEffect(() => () => {
    if (checkoutTimerRef.current) {
      window.clearTimeout(checkoutTimerRef.current);
    }
  }, []);

  const totalCartPrice = useMemo(() => cart.reduce((sum, item) => sum + item.qty * item.price, 0), [cart]);
  const cartItemCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

  const { cartQtyByProduct, cartQtyByVariant } = useMemo(() => {
    const byProduct = {};
    const byVariant = {};

    cart.forEach((item) => {
      byProduct[item.productId] = (byProduct[item.productId] || 0) + item.qty;
      const variantKey = `${item.productId}::${item.size || ''}`;
      byVariant[variantKey] = (byVariant[variantKey] || 0) + item.qty;
    });

    return { cartQtyByProduct: byProduct, cartQtyByVariant: byVariant };
  }, [cart]);

  const tabOptions = useMemo(() => [
    { value: 'shop', label: 'Shop', icon: Tag },
    { value: 'orders', label: 'Orders', icon: Package },
    { value: 'wallet', label: 'Wallet', icon: Wallet },
  ], []);

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
  }, [setCart]);

  const updateCartQty = useCallback((cartId, delta) => {
    setCart((previous) => previous.map((item) => (
      item.cartId === cartId
        ? { ...item, qty: Math.max(1, item.qty + delta) }
        : item
    )));
  }, [setCart]);

  const removeFromCart = useCallback((cartId) => {
    setCart((previous) => previous.filter((item) => item.cartId !== cartId));
  }, [setCart]);

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
  }, [setCart]);

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

  const currentOrders = useMemo(
    () => orders
      .filter((order) => order.status === 'processing' || order.status === 'shipped')
      .slice()
      .sort((left, right) => new Date(right.date) - new Date(left.date)),
    [orders],
  );

  const archivedOrders = useMemo(
    () => orders
      .filter((order) => order.status !== 'processing' && order.status !== 'shipped')
      .slice()
      .sort((left, right) => new Date(right.date) - new Date(left.date)),
    [orders],
  );

  const orderStatusCounts = useMemo(() => ({
    processing: orders.filter((order) => order.status === 'processing').length,
    shipped: orders.filter((order) => order.status === 'shipped').length,
    delivered: orders.filter((order) => order.status === 'delivered').length,
  }), [orders]);

  const handleCheckout = useCallback(() => {
    if (balance < totalCartPrice || cart.length === 0) return;

    hapticSuccess();

    const newOrder = {
      id: getNextMarketplaceOrderId(orders),
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
      description: cartItemCount === 1 ? cart[0].name : `${cartItemCount} LWYD items`,
      date: new Date().toISOString().split('T')[0],
      icon: 'shopping-bag',
    };

    setOrders((previous) => [newOrder, ...previous]);
    setBalance((previous) => previous - totalCartPrice);
    setTxnHistory((previous) => [newTxn, ...previous]);
    setCart([]);
    setActiveTab('orders');
    setCheckoutSuccess({ amount: totalCartPrice, orderId: newOrder.id });

    if (checkoutTimerRef.current) {
      window.clearTimeout(checkoutTimerRef.current);
    }

    checkoutTimerRef.current = window.setTimeout(() => {
      setCheckoutSuccess(null);
    }, 2200);
  }, [balance, cart, cartItemCount, orders, setBalance, setCart, setOrders, setTxnHistory, totalCartPrice]);

  const totalEarned = useMemo(
    () => txnHistory.filter((txn) => txn.type === 'credit').reduce((sum, txn) => sum + txn.amount, 0),
    [txnHistory],
  );

  const totalSpent = useMemo(
    () => Math.abs(txnHistory.filter((txn) => txn.type === 'debit').reduce((sum, txn) => sum + txn.amount, 0)),
    [txnHistory],
  );

  const visibleTransactions = useMemo(
    () => (showAllActivity ? txnHistory : txnHistory.slice(0, 6)),
    [showAllActivity, txnHistory],
  );

  const selectedCategoryName = useMemo(
    () => MARKETPLACE_CATEGORIES.find((category) => category.id === selectedCategory)?.name || 'All categories',
    [selectedCategory],
  );

  const shopStats = useMemo(() => ([
    { label: 'Collection', value: `${MARKETPLACE_PRODUCTS.length} items` },
    { label: 'Categories', value: `${MARKETPLACE_CATEGORIES.length - 1} sections` },
    { label: 'In cart', value: cartItemCount ? `${cartItemCount} queued` : 'Clear' },
  ]), [cartItemCount]);

  const orderStats = useMemo(() => ([
    { label: 'Processing', value: String(orderStatusCounts.processing), valueColor: theme.colors.warning },
    { label: 'Shipped', value: String(orderStatusCounts.shipped), valueColor: theme.colors.info },
    { label: 'Delivered', value: String(orderStatusCounts.delivered), valueColor: theme.colors.success },
  ]), [orderStatusCounts, theme]);

  const walletStats = useMemo(() => ([
    { label: 'Earned', value: formatElliottBucks(totalEarned), valueColor: theme.colors.success },
    { label: 'Redeemed', value: formatElliottBucks(totalSpent) },
    { label: 'Orders', value: `${orders.length} total` },
  ]), [orders.length, theme, totalEarned, totalSpent]);

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <ScreenTopChrome theme={theme} contentClassName="pt-2 pb-1">
        <SegmentedToggle
          value={activeTab}
          onChange={(value) => {
            if (value !== activeTab) hapticLight();
            setActiveTab(value);
          }}
          options={tabOptions}
          size="sm"
          theme={theme}
          fullWidth
        />
      </ScreenTopChrome>

      <div className="flex-1 overflow-y-auto scrollbar-hide" style={{ backgroundColor: theme.colors.background }}>
        <div className="max-w-content mx-auto w-full px-4 sm:px-6 lg:px-8 pb-8">
          <TabContent activeKey={activeTab} tabIndex={tabOptions.findIndex((option) => option.value === activeTab)}>
            {activeTab === 'shop' && (
              <div className="pt-4 space-y-4">
                <BalanceCard
                  balance={balance}
                  theme={theme}
                  eyebrow="LWYD shop"
                  title="Redeem your balance"
                  subtitle="A tighter edit of merch, drinkware, and team gear."
                  metricLabel="Available now"
                  metricCaption={cartItemCount ? `${cartItemCount} item${cartItemCount !== 1 ? 's' : ''} in cart` : 'Ready for your next redemption'}
                  stats={shopStats}
                />

                <GlassCard theme={theme} className="p-4 sm:p-5" style={{ boxShadow: palette.shadow }}>
                  <SectionHeader
                    theme={theme}
                    palette={palette}
                    icon={Search}
                    eyebrow="Browse"
                    title={searchQuery.trim() ? `${filteredProducts.length} result${filteredProducts.length !== 1 ? 's' : ''}` : 'Shop the collection'}
                    meta={selectedCategoryName}
                  />

                  <div className="space-y-3">
                    <StandardSearchBar
                      value={searchQuery}
                      onChange={setSearchQuery}
                      placeholder="Search merch or gear..."
                      theme={theme}
                    />

                    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                      {MARKETPLACE_CATEGORIES.map((category) => {
                        const active = selectedCategory === category.id;

                        return (
                          <button
                            key={category.id}
                            onClick={() => {
                              hapticLight();
                              setSelectedCategory(category.id);
                            }}
                            className="px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all active:scale-95 flex-shrink-0"
                            style={{
                              backgroundColor: active ? palette.brand : (palette.dark ? 'rgba(255,255,255,0.08)' : palette.panelSubtle),
                              color: active ? palette.brandInk : theme.colors.textSecondary,
                              border: `1px solid ${active ? palette.brand : palette.border}`,
                            }}
                          >
                            {category.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </GlassCard>

                {filteredProducts.length > 0 ? (
                  <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))' }}>
                    {filteredProducts.map((product) => (
                      <ProductCard
                        key={product.id}
                        product={product}
                        productQty={cartQtyByProduct[product.id] || 0}
                        variantQtyByKey={cartQtyByVariant}
                        onAdd={addToCart}
                        onRemoveOne={removeOneFromCart}
                        defaultSize={defaultShirtSize}
                        theme={theme}
                      />
                    ))}
                  </div>
                ) : (
                  <GlassCard theme={theme} className="py-2" style={{ boxShadow: palette.shadow }}>
                    <SharedEmptyState
                      icon={Search}
                      title="No products found"
                      description="Try a different search or switch categories to bring the collection back into view."
                      theme={theme}
                    />
                  </GlassCard>
                )}

                {cart.length > 0 && <div className="h-24" />}
              </div>
            )}

            {activeTab === 'orders' && (
              <div className="pt-4 space-y-5">
                <BalanceCard
                  balance={balance}
                  theme={theme}
                  eyebrow="LWYD orders"
                  title="Redemption status"
                  subtitle="Keep active shipments and delivered gear in one place."
                  metricLabel="Open orders"
                  metricValue={String(currentOrders.length)}
                  metricCaption={orders.length ? `${orders.length} total redemptions` : 'No orders yet'}
                  stats={orderStats}
                />

                {orders.length > 0 ? (
                  <div className="space-y-5">
                    {currentOrders.length > 0 && (
                      <section className="space-y-3">
                        <SectionHeader
                          theme={theme}
                          palette={palette}
                          icon={Truck}
                          eyebrow="Active"
                          title="Current fulfillment"
                          meta={`${currentOrders.length} live`}
                        />
                        <div className="space-y-3">
                          {currentOrders.map((order) => <OrderCard key={order.id} order={order} theme={theme} />)}
                        </div>
                      </section>
                    )}

                    {archivedOrders.length > 0 && (
                      <section className="space-y-3">
                        <SectionHeader
                          theme={theme}
                          palette={palette}
                          icon={History}
                          eyebrow="History"
                          title="Past orders"
                          meta={`${archivedOrders.length} archived`}
                        />
                        <div className="space-y-3">
                          {archivedOrders.map((order) => <OrderCard key={order.id} order={order} theme={theme} />)}
                        </div>
                      </section>
                    )}
                  </div>
                ) : (
                  <GlassCard theme={theme} className="py-2" style={{ boxShadow: palette.shadow }}>
                    <SharedEmptyState
                      icon={Package}
                      title="No orders yet"
                      description="Shop the LWYD collection to place your first redemption."
                      action={{
                        label: 'Start Shopping',
                        onClick: () => {
                          hapticLight();
                          setActiveTab('shop');
                        },
                      }}
                      theme={theme}
                    />
                  </GlassCard>
                )}
              </div>
            )}

            {activeTab === 'wallet' && (
              <div className="pt-4 space-y-4">
                <BalanceCard
                  balance={balance}
                  theme={theme}
                  eyebrow="LWYD wallet"
                  title="Rewards balance"
                  subtitle="Keep earnings, redemptions, and upcoming rewards in one clean ledger."
                  metricLabel="Available now"
                  metricCaption={balance > 0 ? 'Use on merch, apparel, and team favorites' : 'Earn more below to keep redeeming'}
                  stats={walletStats}
                />

                <GlassCard theme={theme} className="px-4 py-4 sm:px-5" style={{ boxShadow: palette.shadow }}>
                  <SectionHeader
                    theme={theme}
                    palette={palette}
                    icon={History}
                    eyebrow="Wallet activity"
                    title="Recent activity"
                    meta={txnHistory.length <= 6 ? `${txnHistory.length} entries` : null}
                    actionNode={txnHistory.length > 6 ? (
                      <button
                        onClick={() => setShowAllActivity((value) => !value)}
                        className="text-[0.6875rem] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all active:scale-95"
                        style={{ backgroundColor: palette.panelSubtle, color: theme.colors.textPrimary, border: `1px solid ${palette.border}` }}
                      >
                        {showAllActivity ? 'Show less' : 'Show all'}
                      </button>
                    ) : null}
                  />

                  {visibleTransactions.map((txn, index) => (
                    <TransactionRow key={txn.id} txn={txn} theme={theme} isLast={index === visibleTransactions.length - 1} />
                  ))}
                </GlassCard>

                <GlassCard theme={theme} className="p-4 sm:p-5" style={{ boxShadow: palette.shadow }}>
                  <SectionHeader
                    theme={theme}
                    palette={palette}
                    icon={Sparkles}
                    eyebrow="Programs"
                    title="Ways to earn"
                    meta={`${EARNING_PROGRAMS.length} programs`}
                  />

                  <div className="grid gap-3 sm:grid-cols-2">
                    {EARNING_PROGRAMS.map((item) => {
                      const Icon = item.icon;
                      const toneStyles = getToneStyles(item.tone, palette);

                      return (
                        <div
                          key={item.title}
                          className="rounded-[22px] p-4"
                          style={{ backgroundColor: palette.panelSubtle, border: `1px solid ${palette.border}` }}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={toneStyles}>
                              <Icon className="w-4 h-4" />
                            </div>
                            <span
                              className="text-[0.6875rem] font-bold flex-shrink-0 px-2.5 py-1.5 rounded-full"
                              style={toneStyles}
                            >
                              {formatElliottBucks(item.amount)}
                            </span>
                          </div>

                          <p className="text-sm font-semibold mt-4" style={{ color: theme.colors.textPrimary }}>
                            {item.title}
                          </p>
                          <p className="text-[0.75rem] mt-1.5 leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                            {item.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>
              </div>
            )}
          </TabContent>
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

      <CheckoutSuccess show={Boolean(checkoutSuccess)} theme={theme} amount={checkoutSuccess?.amount} orderId={checkoutSuccess?.orderId} />
    </div>
  );
};
