﻿import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { lightTheme, darkTheme, INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_MEMBERS, INITIAL_POSTS, INITIAL_POLLS, DEALER_DIRECTORY_DATA, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, EMPTY_LEAD } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP, VoiceModal, OrderModal, SuccessToast, ProductComparisonScreen, ResourceDetailScreen, CreateContentModal, AddNewInstallScreen, Modal, CartScreen, CompetitiveAnalysisScreen, NewLeadScreen } from './ui.jsx';

// Helper component to handle the routing logic cleanly
const ScreenRouter = (props) => {
    const { screenKey, ...rest } = props;
    if (!screenKey) return null;

    const screenParts = screenKey.split('/');
    const baseScreenKey = screenParts[0];

    // Special case routing for screens with dynamic parts
    if (baseScreenKey === 'products' && screenParts[1] === 'category') {
        return <ProductComparisonScreen {...rest} categoryId={screenParts[2]} />;
    }
    if (baseScreenKey === 'products' && screenParts[1] === 'competitive-analysis') {
        return <CompetitiveAnalysisScreen {...rest} />;
    }
    if (baseScreenKey === 'resources' && screenParts.length > 1) {
        return <ResourceDetailScreen {...rest} />;
    }

    const ScreenComponent = SCREEN_MAP[baseScreenKey];
    if (!ScreenComponent) {
        return <div>Screen not found: {screenKey}</div>;
    }

    return <ScreenComponent {...rest} />;
};


function App() {
    // Core State
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner', homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [cart, setCart] = useState({});
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });

    // State for Screen Components
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [selectedProject, setSelectedProject] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
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

    // Derived State
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

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

    // Handlers
    const handleNavigate = useCallback((screen) => setNavigationHistory(prev => [...prev, screen]), []);
    const handleBack = useCallback(() => { if (navigationHistory.length > 1) setNavigationHistory(prev => prev.slice(0, -1)); }, [navigationHistory.length]);
    const handleHome = useCallback(() => setNavigationHistory(['home']), []);
    const handleVoiceActivate = useCallback((message) => { setVoiceMessage(message); setTimeout(() => setVoiceMessage(''), 1500); }, []);
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
        setLikedPosts(prev => ({ ...prev, [postId]: !prev[postId] }));
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, likes: likedPosts[postId] ? post.likes - 1 : post.likes + 1 } : post));
    }, [likedPosts]);
    const handlePollVote = useCallback((pollId, optionId) => setPollChoices(prev => ({ ...prev, [pollId]: optionId })), []);
    const handleAddItem = useCallback((type, obj) => { if (type === 'post') setPosts(prev => [obj, ...prev]); if (type === 'poll') setPolls(prev => [obj, ...prev]); }, []);
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

    // Create a single props object to pass to the router
    const screenProps = {
        theme: currentTheme,
        onNavigate: handleNavigate,
        handleBack,
        userSettings,
        setSuccessMessage,
        showAlert: handleShowAlert,
        currentScreen: currentScreen,
        // Screen-specific props
        opportunities, setSelectedOpportunity,
        myProjects, setSelectedProject,
        selectedOrder, setSelectedOrder,
        members, setMembers, currentUserId,
        posts, polls, likedPosts, onToggleLike: handleToggleLike, pollChoices, onPollVote: handlePollVote, openCreateContentModal: () => setShowCreateContentModal(true),
        cart, setCart, onUpdateCart: handleUpdateCart,
        dealerDirectory, handleAddDealer,
        onAddInstall: handleAddNewInstall,
        newLeadData, onNewLeadChange: handleNewLeadChange,
        designFirms, setDesignFirms, dealers, setDealers,
        onSuccess: (submittedLead) => {
            setOpportunities(prev => [...prev, {
                id: opportunities.length + 1, name: submittedLead.project, stage: submittedLead.projectStatus,
                value: `$${parseInt(String(submittedLead.estimatedList).replace(/[^0-9]/g, '') || '0').toLocaleString()}`,
                company: submittedLead.dealer, ...submittedLead
            }]);
            handleNavigate('projects');
            setSuccessMessage("Lead Created!");
            setNewLeadData(EMPTY_LEAD); // Reset form state after success
            setTimeout(() => setSuccessMessage(""), 2000);
        }
    };

    return (
        <div className="h-screen w-screen font-sans flex flex-col relative" style={{ backgroundColor: currentTheme.colors.background }}>
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
            <div className="flex-1 pt-[88px] overflow-y-auto scrollbar-hide">
                {/* The new router component handles rendering */}
                <ScreenRouter screenKey={currentScreen} {...screenProps} />
            </div>
            {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
            <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
            <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />
            <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
            {showCreateContentModal && <CreateContentModal close={() => setShowCreateContentModal(false)} theme={currentTheme} onAdd={handleAddItem} />}
            <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}><p>{alertInfo.message}</p></Modal>
        </div>
    );
}

export default App;