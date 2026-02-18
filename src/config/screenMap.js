import React from 'react';

// Core screen component imports (eager - always needed)
import { HomeScreen } from '../screens/home/HomeScreen.jsx';
import { ResourcesScreen } from '../screens/resources/ResourcesScreen.jsx';
import { ProjectsScreen, NewLeadScreen, AddNewInstallScreen } from '../screens/projects/index.js';
import { ResourceDetailScreen } from '../screens/utility/UtilityScreens.jsx';

// Lazy-loaded primary screens for better code splitting
const SalesScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.SalesScreen })));
const CustomerRankingScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.CustomerRankingScreen })));
const IncentiveRewardsScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.IncentiveRewardsScreen })));
const CommissionsScreen = React.lazy(() => import('../screens/sales/index.js').then(m => ({ default: m.CommissionsScreen })));
const OrdersScreen = React.lazy(() => import('../screens/orders/index.js').then(m => ({ default: m.OrdersScreen })));
const ProductsScreen = React.lazy(() => import('../screens/products/index.js').then(m => ({ default: m.ProductsScreen })));
const ProductComparisonScreen = React.lazy(() => import('../screens/products/index.js').then(m => ({ default: m.ProductComparisonScreen })));
const CompetitiveAnalysisScreen = React.lazy(() => import('../screens/products/index.js').then(m => ({ default: m.CompetitiveAnalysisScreen })));
const CommunityScreen = React.lazy(() => import('../screens/community/index.js').then(m => ({ default: m.CommunityScreen })));
const CreateContentModal = React.lazy(() => import('../screens/community/index.js').then(m => ({ default: m.CreateContentModal })));
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
  'projects': ProjectsScreen,
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
  // 'new-dealer-signup' is lazy-loaded in App.jsx
};

export {
  ResourceDetailScreen,
  ProductComparisonScreen,
  CompetitiveAnalysisScreen,
  AddNewInstallScreen,
  SettingsScreen,
  NewLeadScreen,
  MembersScreen,
  SalesScreen,
  CustomerRankingScreen,
  IncentiveRewardsScreen,
  CommissionsScreen,
  CommunityScreen,
  CreateContentModal,
  SamplesScreen,
  MarketplaceScreen,
};