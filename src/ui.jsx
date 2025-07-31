import React from 'react';
import ReactDOM from 'react-dom';

// Import extracted components
export { useDropdownPosition } from './hooks/useDropdownPosition.js';
export { Card, Icon } from './components/common/BasicComponents.jsx';
export { SuccessToast, VoiceModal } from './components/feedback/ToastsAndModals.jsx';
export { ProfileMenu } from './components/navigation/ProfileMenu.jsx';
export { AppHeader } from './components/navigation/AppHeader.jsx';
export { HomeScreen } from './screens/home/HomeScreen.jsx';

// Re-export screen mapping and utility components
export { 
    SCREEN_MAP,
    ResourceDetailScreen,
    ProductComparisonScreen,
    CreateContentModal,
    AddNewInstallScreen,
    CompetitiveAnalysisScreen,
    NewLeadScreen,
} from './config/screenMap.js';