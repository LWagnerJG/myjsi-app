// Core screen component imports (eager)
import { SalesScreen, CustomerRankingScreen, IncentiveRewardsScreen, CommissionsScreen } from '../screens/sales/index.js';
import { OrdersScreen } from '../screens/orders/index.js';
import { ProductsScreen, ProductComparisonScreen, CompetitiveAnalysisScreen } from '../screens/products/index.js';
import { ResourcesScreen } from '../screens/resources/ResourcesScreen.jsx';
import { ProjectsScreen, NewLeadScreen, AddNewInstallScreen } from '../screens/projects/index.js';
import { CommunityScreen, CreateContentModal } from '../screens/community/index.js';
import { ReplacementsScreen } from '../screens/replacements/ReplacementsScreen.jsx';
import { FeedbackScreen } from '../screens/feedback/index.js';
import { MembersScreen } from '../screens/members/index.js';
import { HelpScreen } from '../screens/help/HelpScreen.jsx';
import { LogoutScreen } from '../screens/logout/LogoutScreen.jsx';
import { HomeScreen } from '../screens/home/HomeScreen.jsx';
import { SettingsScreen } from '../screens/settings/index.js';
import { ResourceDetailScreen } from '../screens/utility/UtilityScreens.jsx';

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
  'community': CommunityScreen,
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
};