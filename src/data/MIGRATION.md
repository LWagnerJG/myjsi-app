# Data Refactoring Migration Guide

This document outlines the data refactoring from a single `data.jsx` file to a feature-based organization.

## New Data Structure

```
src/data/
??? index.js                 // Central export file
??? theme/
?   ??? themeData.js        // Theme configurations
??? navigation.js           // Menu and app navigation data
??? sales.js               // Sales, verticals, incentives data
??? products.js            // Product catalogs, lead times, fabrics
??? orders.js              // Order data and status configurations
??? projects.js            // Project opportunities and lead data
??? community.js           // Social posts, polls, and community data
??? samples.js             // Sample products and categories
??? resources.js           // Resource links, loaner pool, contracts
??? replacements.js        // Replacement request data
??? members.js             // User and member management data
```

## Migration Map

### Theme Data (`src/data/theme/themeData.js`)
- `lightTheme`
- `darkTheme` 
- `logoLight`

### Navigation (`src/data/navigation.js`)
- `MENU_ITEMS`
- `allApps`

### Sales (`src/data/sales.js`)
- `YTD_SALES_DATA`
- `MONTHLY_SALES_DATA`
- `SALES_VERTICALS_DATA`
- `CUSTOMER_RANK_DATA`
- `INCENTIVE_REWARDS_DATA`

### Products (`src/data/products.js`)
- `LEAD_TIMES_DATA`
- `FABRICS_DATA`
- `JSI_MODELS`
- `JSI_LAMINATES`
- `JSI_VENEERS`
- `VISION_MATERIALS`
- `PRODUCT_DATA`

### Orders (`src/data/orders.js`)
- `ORDER_DATA`
- `STATUS_COLORS`

### Projects (`src/data/projects.js`)
- `MY_PROJECTS_DATA`
- `INITIAL_OPPORTUNITIES`
- `STAGES`
- `EMPTY_LEAD`
- `URGENCY_LEVELS`
- `PO_TIMEFRAMES`
- `COMPETITORS`
- `DISCOUNT_OPTIONS`
- `WIN_PROBABILITY_OPTIONS`
- `INITIAL_DESIGN_FIRMS`
- `INITIAL_DEALERS`
- `VERTICALS`
- `DAILY_DISCOUNT_OPTIONS`

### Community (`src/data/community.js`)
- `INITIAL_POSTS`
- `INITIAL_WINS`
- `INITIAL_POLLS`
- `SOCIAL_MEDIA_POSTS`

### Samples (`src/data/samples.js`)
- `SAMPLE_PRODUCTS`
- `SAMPLE_CATEGORIES`
- `SAMPLES_DATA`

### Resources (`src/data/resources.js`)
- `RESOURCES_DATA`
- `LOANER_POOL_PRODUCTS`
- `CONTRACTS_DATA`
- `DEALER_DIRECTORY_DATA`
- `REWARDS_DATA`

### Replacements (`src/data/replacements.js`)
- `REPLACEMENT_REQUESTS_DATA`

### Members (`src/data/members.js`)
- `INITIAL_MEMBERS`
- `PERMISSION_LABELS`
- `USER_TITLES`
- `EMPTY_USER`

## How to Import

### Method 1: Import from central index
```javascript
import { lightTheme, darkTheme, MENU_ITEMS, YTD_SALES_DATA } from './data/index.js';
```

### Method 2: Import specific feature files
```javascript
import { lightTheme, darkTheme } from './data/theme/themeData.js';
import { MENU_ITEMS } from './data/navigation.js';
import { YTD_SALES_DATA } from './data/sales.js';
```

## Benefits

1. **Improved Maintainability** - Easier to find and update related data
2. **Better Organization** - Clear separation of concerns by feature domain
3. **Enhanced Collaboration** - Multiple developers can work on different features
4. **Reduced Merge Conflicts** - Fewer changes to the same large file
5. **Easier Testing** - More focused data imports for unit tests
6. **Better Tree Shaking** - Only import the data you need

## Migration Steps Completed

1. ? Created feature-based folder structure
2. ? Moved data constants to appropriate feature files
3. ? Created central index.js for easy importing
4. ? Updated App.jsx imports
5. ? Maintained all original export names for backward compatibility

## Next Steps

- Update individual screen components to import from specific feature files
- Consider further breaking down large data files if needed
- Add TypeScript definitions for better type safety