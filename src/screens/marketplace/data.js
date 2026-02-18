// Marketplace data — LWYD (Love What You Do) branded merchandise
// ElliottBucks currency system with product catalog, orders & shipments

// ============================================
// PRODUCT CATALOG
// ============================================
export const MARKETPLACE_CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'cups', name: 'Drinkware' },
  { id: 'shirts', name: 'Apparel' },
  { id: 'hats', name: 'Headwear' },
];

export const SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', '2XL', '3XL'];
export const HAT_SIZES = ['S/M', 'L/XL', 'One Size'];

export const MARKETPLACE_PRODUCTS = [
  // ——— Drinkware ———
  {
    id: 'cup-001',
    name: 'LWYD Ceramic Mug',
    description: 'Premium 14oz ceramic mug with matte charcoal finish and embossed LWYD logo.',
    price: 120,
    category: 'cups',
    image: 'https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop',
    badge: 'Best Seller',
    stock: 50,
  },
  {
    id: 'cup-002',
    name: 'LWYD Insulated Tumbler',
    description: '20oz double-wall vacuum insulated stainless steel tumbler. Keeps drinks cold 24hrs, hot 12hrs.',
    price: 200,
    category: 'cups',
    image: 'https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=400&h=400&fit=crop',
    badge: null,
    stock: 35,
  },
  {
    id: 'cup-003',
    name: 'LWYD Travel Bottle',
    description: '32oz wide-mouth sport bottle with flip cap. BPA-free, dishwasher safe. Earth-tone stone finish.',
    price: 175,
    category: 'cups',
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
    badge: 'New',
    stock: 40,
  },

  // ——— Apparel (T-Shirts) ———
  {
    id: 'shirt-001',
    name: 'LWYD Classic Tee',
    description: 'Soft cotton crew-neck with the Love What You Do wordmark across the chest. Charcoal on warm beige.',
    price: 250,
    category: 'shirts',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
    badge: 'Popular',
    stock: 100,
    hasSizes: true,
  },
  {
    id: 'shirt-002',
    name: 'LWYD Vintage Wash Tee',
    description: 'Garment-dyed heavyweight cotton with faded LWYD crest print. Relaxed fit, broken-in feel.',
    price: 300,
    category: 'shirts',
    image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&h=400&fit=crop',
    badge: null,
    stock: 75,
    hasSizes: true,
  },
  {
    id: 'shirt-003',
    name: 'LWYD Performance Tee',
    description: 'Moisture-wicking athletic blend with reflective LWYD badge. Ideal for the active rep.',
    price: 275,
    category: 'shirts',
    image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop',
    badge: null,
    stock: 60,
    hasSizes: true,
  },
  {
    id: 'shirt-004',
    name: 'LWYD Pocket Tee',
    description: 'Henley-collar pocket tee with subtle LWYD embroidery. Premium ring-spun cotton.',
    price: 280,
    category: 'shirts',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    badge: 'New',
    stock: 45,
    hasSizes: true,
  },
  {
    id: 'shirt-005',
    name: 'LWYD Long Sleeve',
    description: 'Classic long-sleeve with LWYD printed on the left cuff. Mid-weight jersey knit.',
    price: 325,
    category: 'shirts',
    image: 'https://images.unsplash.com/photo-1503341504253-dff4f94032de?w=400&h=400&fit=crop',
    badge: null,
    stock: 55,
    hasSizes: true,
  },

  // ——— Headwear (Hats) ———
  {
    id: 'hat-001',
    name: 'LWYD Bucket Hat',
    description: 'Relaxed-fit cotton twill bucket hat with embroidered LWYD logo. UPF 50+ sun protection.',
    price: 200,
    category: 'hats',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop',
    badge: 'Fan Favorite',
    stock: 30,
    hasSizes: true,
    sizeType: 'hat',
  },
  {
    id: 'hat-002',
    name: 'LWYD Dad Cap',
    description: 'Unstructured six-panel cap with curved brim and adjustable strap. Tonal LWYD embroidery.',
    price: 150,
    category: 'hats',
    image: 'https://images.unsplash.com/photo-1588850561407-ed78c334e67a?w=400&h=400&fit=crop',
    badge: null,
    stock: 60,
    hasSizes: false,
  },
  {
    id: 'hat-003',
    name: 'LWYD Snapback',
    description: 'Flat-brim structured snapback with woven LWYD patch. One size fits most.',
    price: 175,
    category: 'hats',
    image: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=400&h=400&fit=crop',
    badge: null,
    stock: 45,
    hasSizes: false,
  },
];

// ============================================
// ELLIOTTBUCKS ACCOUNT
// ============================================
export const INITIAL_BALANCE = 2500;

export const BALANCE_HISTORY = [
  { id: 'txn-001', type: 'credit', amount: 500, description: 'Q4 Sales Bonus', date: '2026-02-15', icon: 'award' },
  { id: 'txn-002', type: 'credit', amount: 250, description: 'Community Engagement Reward', date: '2026-02-10', icon: 'star' },
  { id: 'txn-003', type: 'debit',  amount: -120, description: 'LWYD Ceramic Mug', date: '2026-02-08', icon: 'shopping-bag' },
  { id: 'txn-004', type: 'credit', amount: 1000, description: 'Annual LWYD Award', date: '2026-01-28', icon: 'trophy' },
  { id: 'txn-005', type: 'credit', amount: 300, description: 'Project Milestone Bonus', date: '2026-01-20', icon: 'target' },
  { id: 'txn-006', type: 'debit',  amount: -250, description: 'LWYD Classic Tee (L)', date: '2026-01-15', icon: 'shopping-bag' },
  { id: 'txn-007', type: 'credit', amount: 750, description: 'New Dealer Sign-Up Bonus', date: '2026-01-05', icon: 'user-plus' },
  { id: 'txn-008', type: 'credit', amount: 100, description: 'Feedback Survey Completed', date: '2025-12-28', icon: 'check-circle' },
];

// ============================================
// MOCK ORDERS / SHIPMENTS
// ============================================
export const INITIAL_ORDERS = [
  {
    id: 'MKT-1001',
    date: '2026-02-08',
    status: 'delivered',
    total: 120,
    items: [{ productId: 'cup-001', name: 'LWYD Ceramic Mug', qty: 1, size: null, price: 120 }],
    tracking: 'EB9284710394US',
    estimatedDelivery: '2026-02-12',
    deliveredDate: '2026-02-11',
  },
  {
    id: 'MKT-1002',
    date: '2026-01-15',
    status: 'delivered',
    total: 250,
    items: [{ productId: 'shirt-001', name: 'LWYD Classic Tee', qty: 1, size: 'L', price: 250 }],
    tracking: 'EB7381946201US',
    estimatedDelivery: '2026-01-22',
    deliveredDate: '2026-01-20',
  },
  {
    id: 'MKT-1003',
    date: '2026-02-16',
    status: 'shipped',
    total: 375,
    items: [
      { productId: 'hat-001', name: 'LWYD Bucket Hat', qty: 1, size: 'L/XL', price: 200 },
      { productId: 'cup-003', name: 'LWYD Travel Bottle', qty: 1, size: null, price: 175 },
    ],
    tracking: 'EB4829173650US',
    estimatedDelivery: '2026-02-22',
    deliveredDate: null,
  },
  {
    id: 'MKT-1004',
    date: '2026-02-17',
    status: 'processing',
    total: 300,
    items: [{ productId: 'shirt-002', name: 'LWYD Vintage Wash Tee', qty: 1, size: 'M', price: 300 }],
    tracking: null,
    estimatedDelivery: '2026-02-26',
    deliveredDate: null,
  },
];

// ============================================
// HELPERS
// ============================================
export const getProductById = (id) => MARKETPLACE_PRODUCTS.find(p => p.id === id) || null;

export const formatElliottBucks = (amount) => {
  const abs = Math.abs(amount);
  const prefix = amount < 0 ? '-' : '';
  return `${prefix}EB ${abs.toLocaleString()}`;
};

export const ORDER_STATUS_CONFIG = {
  processing: { label: 'Processing', color: '#C4956A', bg: 'rgba(196,149,106,0.12)' },
  shipped:    { label: 'Shipped',    color: '#5B7B8C', bg: 'rgba(91,123,140,0.12)' },
  delivered:  { label: 'Delivered',  color: '#4A7C59', bg: 'rgba(74,124,89,0.12)' },
  cancelled:  { label: 'Cancelled',  color: '#B85C5C', bg: 'rgba(184,92,92,0.12)' },
};
