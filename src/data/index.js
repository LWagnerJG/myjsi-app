// Centralized data exports (legacy) - many modules migrated to screen folders
export * from './theme/themeData.js';
export * from './navigation.js';

// Backward compatibility shims: re-export feature data that moved to screen folders
export { 
  YTD_SALES_DATA, 
  MONTHLY_SALES_DATA, 
  SALES_VERTICALS_DATA, 
  CUSTOMER_RANK_DATA, 
  INCENTIVE_REWARDS_DATA 
} from '../screens/sales/data.js';

export { INITIAL_POSTS, INITIAL_WINS, INITIAL_POLLS, SOCIAL_MEDIA_POSTS } from '../screens/community/data.js';

// Projects data (already migrated)
export { INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD } from '../screens/projects/data.js';