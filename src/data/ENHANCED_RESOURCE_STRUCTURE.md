# Enhanced Resource Organization Structure

## Problem with Current Structure

Currently, resource screens and their data are separated:
- UI components in `src/screens/resources/`
- Data scattered in `src/data/` root directory
- No feature isolation
- Difficult to maintain and scale

## Recommended Structure

```
src/screens/resources/
??? loaner-pool/
?   ??? LoanerPoolScreen.jsx       // Main screen component
?   ??? data.js                    // All loaner pool data
?   ??? components/                // Feature-specific components
?   ?   ??? ProductCard.jsx
?   ?   ??? RequestForm.jsx
?   ?   ??? StatusBadge.jsx
?   ??? index.js                   // Export everything for easy importing
??? dealer-directory/
?   ??? DealerDirectoryScreen.jsx
?   ??? data.js
?   ??? components/
?   ?   ??? DealerCard.jsx
?   ?   ??? AddDealerModal.jsx
?   ?   ??? ContactList.jsx
?   ??? index.js
??? commission-rates/
?   ??? CommissionRatesScreen.jsx
?   ??? data.js
?   ??? components/
?   ?   ??? RateTable.jsx
?   ?   ??? TierCalculator.jsx
?   ??? index.js
??? contracts/
?   ??? ContractsScreen.jsx
?   ??? data.js
?   ??? components/
?   ?   ??? ContractCard.jsx
?   ?   ??? ContractDetails.jsx
?   ??? index.js
??? shared/
    ??? components/              // Shared resource components
    ?   ??? ResourceHeader.jsx
    ?   ??? SearchFilter.jsx
    ??? utils/
        ??? resourceHelpers.js
```

## Example Implementation

### Loaner Pool Feature

**src/screens/resources/loaner-pool/data.js**
```javascript
export const LOANER_POOL_PRODUCTS = [
    // ... product data
];

export const AVAILABILITY_STATUS = {
    AVAILABLE: 'available',
    RESERVED: 'reserved',
    OUT_FOR_LOAN: 'out-for-loan',
    MAINTENANCE: 'maintenance'
};

export const STATUS_COLORS = {
    // ... status styling
};
```

**src/screens/resources/loaner-pool/index.js**
```javascript
export { LoanerPoolScreen } from './LoanerPoolScreen.jsx';
export * from './data.js';
```

**src/screens/resources/loaner-pool/LoanerPoolScreen.jsx**
```javascript
import React from 'react';
import { LOANER_POOL_PRODUCTS, AVAILABILITY_STATUS } from './data.js';
import { ProductCard } from './components/ProductCard.jsx';

export const LoanerPoolScreen = (props) => {
    // Implementation using local data
};
```

### Commission Rates Feature

**src/screens/resources/commission-rates/data.js**
```javascript
export const COMMISSION_RATES_DATA = {
    standard: {
        name: 'Standard Commission Structure',
        tiers: [
            { from: 0, to: 50000, rate: 3.0 },
            { from: 50001, to: 100000, rate: 3.5 },
            // ... more tiers
        ]
    },
    // ... more rate structures
};

export const COMMISSION_TYPES = [
    { value: 'standard', label: 'Standard Sales Rep' },
    { value: 'dealer', label: 'Dealer' },
    { value: 'designer', label: 'Designer' }
];
```

### Dealer Directory Feature

**src/screens/resources/dealer-directory/data.js**
```javascript
export const DEALER_DIRECTORY_DATA = [
    {
        id: 1,
        name: "Business Furniture LLC",
        address: "4102 Meghan Beeler Court, South Bend, IN 46628",
        // ... dealer data
    }
];

export const DEALER_ROLES = [
    { value: 'sales', label: 'Sales' },
    { value: 'designer', label: 'Designer' },
    // ... more roles
];
```

## Migration Steps

1. **Create feature folders** for each resource
2. **Move screen components** to their respective feature folders
3. **Move data files** from `src/data/` to feature folders
4. **Update imports** throughout the application
5. **Create index.js files** for clean exports
6. **Update screen mapping** in routing configuration

## Benefits

1. **Self-contained features** - Everything for a feature in one place
2. **Easier maintenance** - Find and update feature code quickly
3. **Better collaboration** - Multiple developers can work on different features
4. **Scalable architecture** - Easy to add new resource tools
5. **Cleaner imports** - Import from feature folders instead of scattered locations
6. **Feature-specific components** - Reusable components within each feature

## Current vs. Improved Structure

### Before (Current)
```
src/
??? screens/resources/
?   ??? LoanerPoolScreen.jsx          ? Separated from data
?   ??? CommissionRatesScreen.jsx     ? Separated from data
?   ??? DealerDirectoryScreen.jsx     ? Separated from data
??? data/
    ??? loanerPool.js                 ? Far from UI component
    ??? commissionRates.js            ? Far from UI component
    ??? dealerDirectory.js            ? Far from UI component
```

### After (Improved)
```
src/screens/resources/
??? loaner-pool/
?   ??? LoanerPoolScreen.jsx          ? Co-located with data
?   ??? data.js                       ? Feature-specific data
??? commission-rates/
?   ??? CommissionRatesScreen.jsx     ? Co-located with data
?   ??? data.js                       ? Feature-specific data
??? dealer-directory/
    ??? DealerDirectoryScreen.jsx     ? Co-located with data
    ??? data.js                       ? Feature-specific data
```

This structure makes it much easier to:
- Find all code related to a specific resource
- Add new resource features
- Maintain and update existing features
- Test individual features in isolation
- Scale the application with more resources