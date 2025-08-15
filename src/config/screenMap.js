// Screen component imports
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

// Import feature-based resource screens
import { LoanerPoolScreen } from '../screens/resources/loaner-pool/index.js';
import { DealerDirectoryScreen } from '../screens/resources/dealer-directory/index.js';
import { CommissionRatesScreen } from '../screens/resources/commission-rates/index.js';
import { ContractsScreen } from '../screens/resources/contracts/index.js';
import { LeadTimesScreen } from '../screens/resources/lead-times/index.js';
import { SampleDiscountsScreen } from '../screens/resources/sample-discounts/index.js';
import { DesignDaysScreen } from '../screens/resources/design-days/index.js';
import { DiscontinuedFinishesScreen } from '../screens/resources/discontinued-finishes/index.js';
import { RequestComYardageScreen } from '../screens/resources/request-com-yardage/index.js';

// Import newly organized resource screens
import { SocialMediaScreen } from '../screens/resources/social-media/index.js';
import { InstallInstructionsScreen } from '../screens/resources/install-instructions/index.js';
import { PresentationsScreen } from '../screens/resources/presentations/index.js';
import { RequestFieldVisitScreen } from '../screens/resources/request-field-visit/index.js';
import { NewDealerSignUpScreen } from '../screens/resources/new-dealer-signup/index.js';
import { SearchFabricsScreen } from '../screens/resources/search-fabrics/index.js';
import { ComColRequest } from '../screens/resources/search-fabrics/ComColRequest.jsx';

// Import remaining utility screens
import { ResourceDetailScreen } from '../screens/utility/UtilityScreens.jsx';

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

    // Feature-based resource screens
    'loaner-pool': LoanerPoolScreen,
    'dealer-directory': DealerDirectoryScreen,
    'commission-rates': CommissionRatesScreen,
    'contracts': ContractsScreen,
    'lead-times': LeadTimesScreen,
    'sample-discounts': SampleDiscountsScreen,
    'design-days': DesignDaysScreen,
    'discontinued-finishes': DiscontinuedFinishesScreen,

    // Newly organized resource screens  
    'social-media': SocialMediaScreen,
    'install-instructions': InstallInstructionsScreen,
    'presentations': PresentationsScreen,
    'request-field-visit': RequestFieldVisitScreen,
    'new-dealer-signup': NewDealerSignUpScreen,
    'request-com-yardage': RequestComYardageScreen,
    'search-fabrics': SearchFabricsScreen,
    'comcol-request': ComColRequest,
};

// Export components that are still needed in other parts of the app
export {
    // Utility components
    ResourceDetailScreen,

    // Feature-organized components
    ProductComparisonScreen,
    CompetitiveAnalysisScreen,
    AddNewInstallScreen,
    SettingsScreen,
    NewLeadScreen,
    MembersScreen,

    // Resource components
    LoanerPoolScreen,
    DealerDirectoryScreen,
    CommissionRatesScreen,
    ContractsScreen,
    LeadTimesScreen,
    SampleDiscountsScreen,
    DesignDaysScreen,
    DiscontinuedFinishesScreen,
    SocialMediaScreen,
    InstallInstructionsScreen,
    PresentationsScreen,
    RequestFieldVisitScreen,
    NewDealerSignUpScreen,
    SearchFabricsScreen,
    ComColRequest,

    // Sales components
    SalesScreen,
    CustomerRankingScreen,
    IncentiveRewardsScreen,
    CommissionsScreen,

    // Community components
    CommunityScreen,
    CreateContentModal,
};