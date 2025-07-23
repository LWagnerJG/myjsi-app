import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { lightTheme, darkTheme, INITIAL_OPPORTUNITIES, MY_PROJECTS_DATA, INITIAL_MEMBERS, INITIAL_POSTS, INITIAL_POLLS, DEALER_DIRECTORY_DATA } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP, VoiceModal, OrderModal, SuccessToast, ProductComparisonScreen, ResourceDetailScreen, CreateContentModal, AddNewInstallScreen, Modal } from './ui.jsx';

function App() {
    // Core State
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner' });
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

    // Screen Router
    const renderScreen = (screenKey) => {
        if (!screenKey) return null;
        const screenParts = screenKey.split('/');
        const baseScreenKey = screenParts[0];

        const commonProps = { theme: currentTheme, onNavigate: handleNavigate, handleBack, userSettings, setSuccessMessage, currentScreen: screenKey, showAlert: handleShowAlert };

        if (baseScreenKey === 'products' && screenParts.length > 1) return <ProductComparisonScreen {...commonProps} categoryId={screenParts[2]} />;
        if (baseScreenKey === 'resources' && screenParts.length > 1) return <ResourceDetailScreen {...commonProps} onUpdateCart={handleUpdateCart} dealerDirectory={dealerDirectory} handleAddDealer={handleAddDealer} />;

        const ScreenComponent = SCREEN_MAP[baseScreenKey];
        if (!ScreenComponent) return <div>Screen not found: {screenKey}</div>;

        const allProps = {
            ...commonProps,
            ...(baseScreenKey === 'home' && { onVoiceActivate: handleVoiceActivate }),
            ...(baseScreenKey === 'projects' && { opportunities, setSelectedOpportunity, myProjects, setSelectedProject }),
            ...(baseScreenKey === 'samples' && { cart, onUpdateCart: handleUpdateCart }),
            ...(baseScreenKey === 'orders' && { setSelectedOrder }),
            ...(baseScreenKey === 'members' && { members, setMembers, currentUserId }),
            ...(baseScreenKey === 'community' && { posts, polls, likedPosts, onToggleLike: handleToggleLike, pollChoices, onPollVote: handlePollVote, openCreateContentModal: () => setShowCreateContentModal(true) }),
            ...(baseScreenKey === 'add-new-install' && { onAddInstall: handleAddNewInstall }),
        };

        return <ScreenComponent {...allProps} />;
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
            <div className="flex-1 pt-[88px] overflow-y-auto scrollbar-hide">{renderScreen(currentScreen)}</div>
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