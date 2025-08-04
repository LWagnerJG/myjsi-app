import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_MEMBERS, INITIAL_POSTS, INITIAL_POLLS, DEALER_DIRECTORY_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD, lightTheme, darkTheme } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP, VoiceModal, SuccessToast, NewLeadScreen } from './ui.jsx';
import { OrderDetailScreen } from './screens/orders/OrderDetailScreen.jsx';
import { SalesScreen } from './screens/sales/SalesScreen.jsx';
import { Modal } from './components/common/Modal.jsx';
import { ProductComparisonScreen, CompetitiveAnalysisScreen, CartScreen, ResourceDetailScreen, CreateContentModal, AddNewInstallScreen } from './screens/utility/UtilityScreens.jsx';
import { AnimatedScreenWrapper } from './components/common/AnimatedScreenWrapper.jsx';

// Import resource screens
import { CommissionRatesScreen } from './screens/resources/CommissionRatesScreen.jsx';
import { LeadTimesScreen } from './screens/resources/LeadTimesScreen.jsx';
import { ContractsScreen } from './screens/resources/ContractsScreen.jsx';
import { DealerDirectoryScreen } from './screens/resources/DealerDirectoryScreen.jsx';
import { DiscontinuedFinishesScreen } from './screens/resources/DiscontinuedFinishesScreen.jsx';
import { DesignDaysScreen } from './screens/resources/DesignDaysScreen.jsx';
import { SocialMediaScreen } from './screens/resources/SocialMediaScreen.jsx';
import { SampleDiscountsScreen } from './screens/resources/SampleDiscountsScreen.jsx';
import { SearchFabricsScreen } from './screens/resources/SearchFabricsScreen.jsx';
import { InstallInstructionsScreen } from './screens/resources/InstallInstructionsScreen.jsx';
import { LoanerPoolScreen } from './screens/resources/LoanerPoolScreen.jsx';
import { PresentationsScreen } from './screens/resources/PresentationsScreen.jsx';
import { RequestFieldVisitScreen } from './screens/resources/RequestFieldVisitScreen.jsx';
import { NewDealerSignUpScreen } from './screens/resources/NewDealerSignUpScreen.jsx';
import { RequestComYardageScreen } from './screens/resources/RequestComYardageScreen.jsx';


const ScreenRouter = (props) => {
    const { screenKey, ...rest } = props;
    if (!screenKey) return null;

    const screenParts = screenKey.split('/');
    const baseScreenKey = screenParts[0];

    // Handle specific resource sub-routes
    if (screenKey === 'resources/commission-rates') {
        return <CommissionRatesScreen {...rest} />;
    }
    if (screenKey === 'resources/lead-times') {
        return <LeadTimesScreen {...rest} />;
    }
    if (screenKey === 'resources/contracts') {
        return <ContractsScreen {...rest} />;
    }
    if (screenKey === 'resources/dealer-directory') {
        return <DealerDirectoryScreen {...rest} />;
    }
    if (screenKey === 'resources/discontinued_finishes') {
        return <DiscontinuedFinishesScreen {...rest} />;
    }
    if (screenKey === 'resources/design_days') {
        return <DesignDaysScreen {...rest} />;
    }
    if (screenKey === 'resources/social_media') {
        return <SocialMediaScreen {...rest} />;
    }
    if (screenKey === 'resources/sample_discounts') {
        return <SampleDiscountsScreen {...rest} />;
    }
    if (screenKey === 'resources/loaner_pool') {
        return <LoanerPoolScreen {...rest} />;
    }
    if (screenKey === 'resources/install_instructions') {
        return <InstallInstructionsScreen {...rest} />;
    }
    if (screenKey === 'resources/presentations') {
        return <PresentationsScreen {...rest} />;
    }
    if (screenKey === 'resources/request_field_visit') {
        return <RequestFieldVisitScreen {...rest} />;
    }
    if (screenKey === 'resources/dealer_registration') {
        return <NewDealerSignUpScreen {...rest} />;
    }

    // Handle fabric-related routes
    if (screenKey === 'fabrics/search_form') {
        return <SearchFabricsScreen {...rest} />;
    }
    if (screenKey === 'fabrics/com_request') {
        return <RequestComYardageScreen {...rest} />;
    }

    // Handle samples sub-routes
    if (screenKey === 'samples/cart') {
        return <CartScreen {...rest} />;
    }

    // Handle product sub-routes
    if (baseScreenKey === 'products' && screenParts[1] === 'category' && screenParts.length === 3) {
        return <ProductComparisonScreen {...rest} categoryId={screenParts[2]} />;
    }
    if (baseScreenKey === 'products' && screenParts[1] === 'category' && screenParts[3] === 'competition') {
        return <CompetitiveAnalysisScreen {...rest} categoryId={screenParts[2]} />;
    }

    // Handle order sub-routes
    if (baseScreenKey === 'orders' && screenParts.length > 1) {
        return <OrderDetailScreen {...rest} />;
    }

    // Fallback for any other resource detail pages
    if (baseScreenKey === 'resources' && screenParts.length > 1) {
        return <ResourceDetailScreen {...rest} />;
    }

    // Default screen mapping
    const ScreenComponent = SCREEN_MAP[baseScreenKey];
    if (!ScreenComponent) {
        return <div>Screen not found: {screenKey}</div>;
    }

    return <ScreenComponent {...rest} />;
};

function App() {
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [lastNavigationDirection, setLastNavigationDirection] = useState('forward');
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner', homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [cart, setCart] = useState({});
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });

    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [selectedProject, setSelectedProject] = useState(null);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({});
    const [pollChoices, setPollChoices] = useState({});
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);
    const [dealerDirectory, setDealerDirectory] = useState(DEALER_DIRECTORY_DATA);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [newLeadData, setNewLeadData] = useState(EMPTY_LEAD);

    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    useEffect(() => {
        // Remove problematic body styles and use proper viewport handling
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.overflow = '';
        
        // Ensure proper viewport meta tag
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        
        // Set dynamic viewport height on iOS
        const setAppHeight = () => {
            const vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--app-height', `${window.innerHeight}px`);
        };
        
        setAppHeight();
        window.addEventListener('resize', setAppHeight);
        window.addEventListener('orientationchange', setAppHeight);
        
        return () => {
            window.removeEventListener('resize', setAppHeight);
            window.removeEventListener('orientationchange', setAppHeight);
        };
    }, []);

    const handleNavigate = useCallback((screen) => {
        setLastNavigationDirection('forward');
        setNavigationHistory(prev => [...prev, screen]);
    }, []);
    
    const handleBack = useCallback(() => { 
        if (navigationHistory.length > 1) {
            setLastNavigationDirection('backward');
            setNavigationHistory(prev => prev.slice(0, -1));
        }
    }, [navigationHistory.length]);
    
    const handleHome = useCallback(() => {
        setLastNavigationDirection('backward');
        setNavigationHistory(['home']);
    }, []);
    
    const handleVoiceActivate = useCallback((message) => { 
        setVoiceMessage(message); 
        setTimeout(() => setVoiceMessage(''), 1500); 
    }, []);
    
    // Add AI search handler
    const handleAskAI = useCallback((query) => {
        // For now, just show the query in the voice modal
        // Later this could be connected to an actual AI service
        setVoiceMessage(`AI Search: ${query}`);
        setTimeout(() => setVoiceMessage(''), 2500);
    }, []);

    const handleUpdateCart = useCallback((item, change) => {
        setCart(prevCart => {
            const newCart = { ...prevCart };
            const currentQty = newCart[item.id] || 0;
            const newQty = currentQty + change;
            if (newQty > 0) newCart[item.id] = newQty; else delete newCart[item.id];
            return newCart;
        });
    }, []);
    const handleToggleLike = useCallback((postId) => {
        setLikedPosts(prev => {
            const isLiked = !!prev[postId];
            const newLikedPosts = { ...prev };
            if (isLiked) {
                delete newLikedPosts[postId];
            } else {
                newLikedPosts[postId] = true;
            }
            
            setPosts(prevPosts => prevPosts.map(post => 
                post.id === postId 
                    ? { ...post, likes: isLiked ? post.likes - 1 : post.likes + 1 } 
                    : post
            ));

            return newLikedPosts;
        });
    }, []);

    const handlePollVote = useCallback((pollId, optionId) => setPollChoices(prev => ({ ...prev, [pollId]: optionId })), []);
    const handleAddItem = useCallback((type, obj) => {
        const newItem = { ...obj, id: Date.now() }; // Ensure unique ID
        if (type === 'post') setPosts(prev => [newItem, ...prev]);
        if (type === 'poll') setPolls(prev => [newItem, ...prev]);
        setShowCreateContentModal(false); // Close modal after adding
    }, []);
    const handleAddDealer = useCallback((newDealerData) => {
        const newDealer = { id: dealerDirectory.length + 1, name: newDealerData.dealerName, address: 'N/A', bookings: 0, sales: 0, salespeople: [], designers: [], administration: [{ name: newDealerData.email, status: 'pending' }], installers: [], recentOrders: [], dailyDiscount: newDealerData.dailyDiscount };
        setDealerDirectory(prev => [newDealer, ...prev]);
    }, [dealerDirectory.length]);
    const handleAddNewInstall = useCallback((newInstall) => {
        setMyProjects(prev => [{ id: `proj${prev.length + 1}_${Date.now()}`, ...newInstall }, ...prev]);
        handleBack();
    }, [handleBack]);
    const handleShowAlert = useCallback((message) => setAlertInfo({ show: true, message }), []);
    const handleNewLeadChange = useCallback((updates) => {
        setNewLeadData(prev => ({ ...prev, ...updates }));
    }, []);

    const screenProps = {
        theme: currentTheme,
        onNavigate: handleNavigate,
        onAskAI: handleAskAI,
        onVoiceActivate: handleVoiceActivate,
        handleBack,
        userSettings,
        setUserSettings,
        setSuccessMessage,
        showAlert: handleShowAlert,
        currentScreen: currentScreen,
        opportunities, 
        setOpportunities,
        myProjects, 
        setSelectedProject,
        members, 
        setMembers, 
        currentUserId,
        posts, polls, likedPosts, onToggleLike: handleToggleLike, pollChoices, onPollVote: handlePollVote, openCreateContentModal: () => setShowCreateContentModal(true),
        cart, setCart, onUpdateCart: handleUpdateCart,
        dealerDirectory, handleAddDealer,
        onAddInstall: handleAddNewInstall,
        newLeadData, onNewLeadChange: handleNewLeadChange,
        designFirms, setDesignFirms, dealers, setDealers,
        isDarkMode,
        onToggleTheme: () => setIsDarkMode(d => !d),
        onSuccess: (submittedLead) => {
            setOpportunities(prev => [...prev, {
                id: opportunities.length + 1, name: submittedLead.project, stage: submittedLead.projectStatus,
                value: `$${parseInt(String(submittedLead.estimatedList).replace(/[^0-9]/g, '') || '0').toLocaleString()}`,
                company: submittedLead.dealer, ...submittedLead
            }]);
            handleNavigate('projects');
            setSuccessMessage("Lead Created!");
            setNewLeadData(EMPTY_LEAD);
            setTimeout(() => setSuccessMessage(""), 2000);
        }
    };

    return (
        <div 
            className="h-screen-safe w-screen font-sans flex flex-col relative" 
            style={{ 
                backgroundColor: currentTheme.colors.background,
                '--background-color': currentTheme.colors.background
            }}
        >
            <AppHeader
                theme={currentTheme}
                userName={userSettings.firstName}
                showBack={navigationHistory.length > 1}
                handleBack={handleBack}
                onHomeClick={handleHome}
                onProfileClick={() => setShowProfileMenu(p => !p)}
                isDarkMode={isDarkMode}
                onToggleDark={() => setIsDarkMode(d => !d)}
            />
            <div 
                className="flex-1 pt-[88px] overflow-hidden"
                style={{ backgroundColor: currentTheme.colors.background }}
            >
                <AnimatedScreenWrapper 
                    screenKey={currentScreen} 
                    direction={lastNavigationDirection}
                    onSwipeBack={navigationHistory.length > 1 ? handleBack : null}
                >
                    <ScreenRouter screenKey={currentScreen} {...screenProps} />
                </AnimatedScreenWrapper>
            </div>
            {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
            <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
            <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
            {showCreateContentModal && <CreateContentModal close={() => setShowCreateContentModal(false)} theme={currentTheme} onAdd={handleAddItem} />}
            <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}><p>{alertInfo.message}</p></Modal>
        </div>
    );
}

export default App;