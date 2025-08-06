// Screen component imports
import { SalesScreen } from '../screens/sales/SalesScreen.jsx';
import { CustomerRankingScreen } from '../screens/sales/CustomerRankingScreen.jsx';
import { IncentiveRewardsScreen } from '../screens/sales/IncentiveRewardsScreen.jsx';
import { CommissionsScreen } from '../screens/sales/CommissionsScreen.jsx';
import { OrdersScreen } from '../screens/orders/OrdersScreen.jsx';
import { ProductsScreen } from '../screens/products/ProductsScreen.jsx';
import { ResourcesScreen } from '../screens/resources/ResourcesScreen.jsx';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen.jsx';
import { CommunityScreen } from '../screens/community/CommunityScreen.jsx';
import { SamplesScreen } from '../screens/samples/SamplesScreen.jsx';
import { CommissionRatesScreen } from '../screens/resources/CommissionRatesScreen.jsx';
import { SampleDiscountsScreen } from '../screens/resources/SampleDiscountsScreen.jsx';
import { LeadTimesScreen } from '../screens/resources/LeadTimesScreen.jsx';
import { HomeScreen } from '../screens/home/HomeScreen.jsx';
import { NewLeadScreen } from '../screens/projects/NewLeadScreen.jsx';
import { ReplacementsScreen } from '../screens/replacements/ReplacementsScreen.jsx';

// Import utility screens
import {
    ResourceDetailScreen,
    MembersScreen,
    ProductComparisonScreen,
    FeedbackScreen,
    HelpScreen,
    LogoutScreen,
    CreateContentModal,
    AddNewInstallScreen,
    CartScreen,
    CompetitiveAnalysisScreen,
    SettingsScreen
} from '../screens/utility/UtilityScreens.jsx';

export const SCREEN_MAP = {
    'home': HomeScreen,
    'orders': OrdersScreen,
    'sales': SalesScreen,
    'products': ProductsScreen,
    'resources': ResourcesScreen,
    'projects': ProjectsScreen,
    'community': CommunityScreen,
    'samples': SamplesScreen,
    'samples/cart': CartScreen,
    'replacements': ReplacementsScreen,
    'incentive-rewards': IncentiveRewardsScreen,
    'customer-rank': CustomerRankingScreen,
    'commissions': CommissionsScreen,
    'commission-rates': CommissionRatesScreen,
    'sample-discounts': SampleDiscountsScreen,
    'lead-times': LeadTimesScreen,
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

// Export utility components that are still needed in other parts of the app
export {
    ResourceDetailScreen,
    ProductComparisonScreen,
    CreateContentModal,
    AddNewInstallScreen,
    CartScreen,
    CompetitiveAnalysisScreen,
    NewLeadScreen
};