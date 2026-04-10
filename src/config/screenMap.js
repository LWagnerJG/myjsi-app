import React from 'react';

// Core screen component imports (eager - always needed)
import { HomeScreen } from '../screens/home/HomeScreen.jsx';
import { ResourcesScreen } from '../screens/resources/ResourcesScreen.jsx';
import { NewLeadScreen } from '../screens/projects/NewLeadScreen.jsx';
import { AddNewInstallScreen } from '../screens/projects/AddNewInstallScreen.jsx';

// Lazy-loaded primary screens for better code splitting
const SalesScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.SalesScreen })));
const CustomerRankingScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.CustomerRankingScreen })));
const IncentiveRewardsScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.IncentiveRewardsScreen })));
const CommissionsScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.CommissionsScreen })));
const OrdersScreen = React.lazy(() => import('../screens/orders/index.js').then(m => ({ default: m.OrdersScreen })));
const ProductsScreen = React.lazy(() => import('../screens/products/index.js').then(m => ({ default: m.ProductsScreen })));
const ProductComparisonScreen = React.lazy(() => import('../screens/products/index.js').then(m => ({ default: m.ProductComparisonScreen })));
const CompetitiveAnalysisScreen = React.lazy(() => import('../screens/products/index.js').then(m => ({ default: m.CompetitiveAnalysisScreen })));
const CommunityLibraryLayout = React.lazy(() => import('../screens/home/CommunityLibraryLayout.jsx').then(m => ({ default: m.CommunityLibraryLayout })));
const ReplacementsScreen = React.lazy(() => import('../screens/replacements/ReplacementsScreen.jsx').then(m => ({ default: m.ReplacementsScreen })));
const FeedbackScreen = React.lazy(() => import('../screens/feedback/index.js').then(m => ({ default: m.FeedbackScreen })));
const MembersScreen = React.lazy(() => import('../screens/members/index.js').then(m => ({ default: m.MembersScreen })));
const HelpScreen = React.lazy(() => import('../screens/help/HelpScreen.jsx').then(m => ({ default: m.HelpScreen })));
const LogoutScreen = React.lazy(() => import('../screens/logout/LogoutScreen.jsx').then(m => ({ default: m.LogoutScreen })));
const SettingsScreen = React.lazy(() => import('../screens/settings/index.js').then(m => ({ default: m.SettingsScreen })));
const SamplesScreen = React.lazy(() => import('../screens/samples/index.js').then(m => ({ default: m.SamplesScreen })));
const MarketplaceScreen = React.lazy(() => import('../screens/marketplace/index.js').then(m => ({ default: m.MarketplaceScreen })));
const PresentationsScreen = React.lazy(() => import('../screens/resources/presentations/index.js').then(m => ({ default: m.PresentationsScreen })));
const RfpResponderScreen = React.lazy(() => import('../screens/rfp/RfpResponderScreen.jsx').then(m => ({ default: m.default })));

// NOTE:
// Feature resource detail routes (e.g. 'lead-times', 'commission-rates', etc.) are now handled lazily
// in App.jsx and intentionally omitted here to allow code splitting. Keeping them out of SCREEN_MAP
// prevents accidental static inclusion in the main bundle.

export const SCREEN_MAP = {
  'home': HomeScreen,
  'orders': OrdersScreen,
  'sales': SalesScreen,
  'products': ProductsScreen,
  'resources': ResourcesScreen,
  'community': CommunityLibraryLayout, // swapped to new layout providing Community + Library toggle
  'replacements': ReplacementsScreen,
  'incentive-rewards': IncentiveRewardsScreen,
  'customer-rank': CustomerRankingScreen,
  'commissions': CommissionsScreen,
  'settings': SettingsScreen,
  'members': MembersScreen,
  'help': HelpScreen,
  'logout': LogoutScreen,
  'feedback': FeedbackScreen,
  'new-lead': NewLeadScreen,
  'add-new-install': AddNewInstallScreen,
  'product-comparison': ProductComparisonScreen,
  'competitive-analysis': CompetitiveAnalysisScreen,
  'marketplace': MarketplaceScreen,
  'presentations': PresentationsScreen,
  'rfp-responder': RfpResponderScreen,
  // 'new-dealer-signup' is lazy-loaded in App.jsx
};

export {
  ProductComparisonScreen,
  CompetitiveAnalysisScreen,
  SalesScreen,
  SamplesScreen,
};

const canWarmPreload = () => {
  if (typeof navigator === 'undefined') return false;

  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (conn?.saveData) return false;

  const effectiveType = String(conn?.effectiveType || '').toLowerCase();
  if (effectiveType.includes('2g')) return false;

  if (typeof navigator.deviceMemory === 'number' && navigator.deviceMemory <= 2) {
    return false;
  }

  return true;
};

// Warm only the highest-frequency destinations and skip on constrained devices.
const preloadMainScreens = () => {
  import('../screens/sales/index.js');
  import('../screens/orders/index.js');
  import('../screens/products/index.js');
  import('../screens/home/CommunityLibraryLayout.jsx');
};

if (typeof window !== 'undefined' && canWarmPreload()) {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(preloadMainScreens, { timeout: 4000 });
  } else {
    setTimeout(preloadMainScreens, 2000);
  }
}