import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme, INITIAL_MEMBERS, INITIAL_OPPORTUNITIES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, INITIAL_POSTS, INITIAL_POLLS, MY_PROJECTS_DATA } from './data.jsx';
import {
    AppHeader, ProfileMenu, SCREEN_MAP, OrderModal, Modal, SuccessToast,
    ResourceDetailScreen, CartScreen, VoiceModal, ProductComparisonScreen,
    CompetitiveAnalysisScreen, PlaceholderScreen, FabricsScreen, ProjectDetailModal, CreateContentModal,
    AddNewInstallScreen, MyProjectDetailModal
} from './ui.jsx';
import * as Data from './data.jsx';

// --- Main App Component ---
function App() {
    // --- Core State for Navigation ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isAnimating, setIsAnimating] = useState(false);

    // --- Ref for the main container is no longer needed for swipe ---
    const appContainerRef = useRef(null);

    // --- All other application state remains the same ---
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [userSettings, setUserSettings] = useState({
        id: 1, firstName: 'Luke', lastName: 'Wagner', email: 'luke.wagner@example.com',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546', tShirtSize: 'L',
        permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true }
    });
    const [cart, setCart] = useState({});
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [selectedProject, setSelectedProject] = useState(null);
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({});
    const [pollChoices, setPollChoices] = useState({});
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);

    // --- Derived state and memoization ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const previousScreen = navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null;
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- One-time setup effect ---
    useEffect(() => {
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
    }, []);

    // --- Simplified Navigation Logic ---
    const handleNavigate = useCallback((screen) => {
        if (isAnimating) return;
        setIsAnimating(true);
        setNavigationHistory(prev => [...prev, screen]);
        // Reset animation state after a brief delay
        setTimeout(() => setIsAnimating(false), 350);
    }, [isAnimating]);

    const handleBack = useCallback(() => {
        if (navigationHistory.length <= 1 || isAnimating) return;
        setIsAnimating(true);
        // Wait for animation to complete before updating navigation
        setTimeout(() => {
            setNavigationHistory(prev => prev.slice(0, -1));
            // Reset animation state after navigation update
            setTimeout(() => setIsAnimating(false), 50);
        }, 300);
    }, [navigationHistory.length, isAnimating]);

    const handleHome = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setTimeout(() => {
            setNavigationHistory(['home']);
            setTimeout(() => setIsAnimating(false), 50);
        }, 300);
    }, [isAnimating]);

    // --- REMOVED: The entire useEffect for swipe back implementation has been deleted. ---

    const handleSaveSettings = useCallback(() => {
        setSuccessMessage("Settings Saved!");
        setTimeout(() => setSuccessMessage(""), 2000);
        handleBack();
    }, [handleBack]);

    const handleNewLeadSuccess = useCallback((newLead) => {
        setOpportunities(prev => [...prev, {
            id: opportunities.length + 1, name: newLead.project, stage: newLead.projectStatus,
            value: `$${parseInt(String(newLead.estimatedList).replace(/[^0-9]/g, '')).toLocaleString()}`,
            company: newLead.dealer, ...newLead
        }]);
        handleNavigate('projects');
        setSuccessMessage("Lead Created!");
        setTimeout(() => setSuccessMessage(""), 2000);
    }, [opportunities.length, handleNavigate]);

    const renderScreen = (screenKey) => {
        if (!screenKey) return null;
        const screenParts = screenKey.split('/');
        const baseScreenKey = screenParts[0];
        const commonProps = { theme: currentTheme, onNavigate: handleNavigate, handleBack };

        const ScreenComponent = SCREEN_MAP[baseScreenKey];
        if (!ScreenComponent) return <PlaceholderScreen {...commonProps} category="Page Not Found" />;

        const allProps = {
            ...commonProps,
            userSettings,
            setSuccessMessage,
            showAlert: (message) => setAlertInfo({ show: true, message }),
            ...(baseScreenKey === 'samples' && { cart, onUpdateCart: (item, change) => setCart(p => ({ ...p, [item.id]: (p[item.id] || 0) + change > 0 ? (p[item.id] || 0) + change : undefined })) }),
            ...(baseScreenKey === 'settings' && { setUserSettings, onSave: handleSaveSettings }),
            ...(baseScreenKey === 'projects' && { opportunities, setSelectedOpportunity, myProjects, setSelectedProject }),
        };

        return <ScreenComponent {...allProps} />;
    };

    const animationClass = isAnimating ? 'is-animating' : '';

    return (
        <div ref={appContainerRef} className="h-screen w-screen font-sans flex flex-col relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }}>
            <AppHeader
                theme={currentTheme} userName={userSettings.firstName} isHome={currentScreen === 'home'}
                showBack={navigationHistory.length > 1} handleBack={handleBack} isDarkMode={isDarkMode}
                onToggleDark={() => setIsDarkMode(d => !d)} onHomeClick={handleHome} onProfileClick={() => setShowProfileMenu(p => !p)}
            />

            <div className="flex-1 relative">
                <div className={`screen-container ${animationClass} previous-screen`}>
                    <div className="h-full overflow-y-auto scrollbar-hide">
                        {renderScreen(previousScreen)}
                    </div>
                </div>

                <div className={`screen-container ${animationClass} current-screen`}>
                    <div className="h-full overflow-y-auto scrollbar-hide">
                        {renderScreen(currentScreen)}
                    </div>
                </div>
            </div>

            {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
            {/* ... other modals ... */}
        </div>
    );
}

export default App;