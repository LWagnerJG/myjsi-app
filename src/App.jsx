import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { lightTheme, darkTheme, INITIAL_MEMBERS, INITIAL_OPPORTUNITIES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS, INITIAL_POSTS, INITIAL_POLLS, MY_PROJECTS_DATA } from './data.jsx';
import {
    AppHeader, ProfileMenu, SCREEN_MAP, OrderModal, Modal, SuccessToast, PageTitle,
    ResourceDetailScreen, CartScreen, VoiceModal, ProductComparisonScreen,
    CompetitiveAnalysisScreen, PlaceholderScreen, FabricsScreen, ProjectDetailModal, CreateContentModal,
    AddNewInstallScreen, MyProjectDetailModal, ProbabilitySlider, FormInput, CustomSelect
} from './ui.jsx';
import * as Data from './data.jsx';

function App() {
    // --- SIMPLIFIED STATE & REFS ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [swipeTranslateX, setSwipeTranslateX] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const touchStartX = useRef(0);
    const isSwiping = useRef(false);

    // --- UNCHANGED STATE ---
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
    const [selectedOpportunity, setSelectedOpportunity] = useState(null);
    const [myProjects, setMyProjects] = useState(MY_PROJECTS_DATA);
    const [selectedProject, setSelectedProject] = useState(null);
    const [userSettings, setUserSettings] = useState({
        id: 1,
        firstName: 'Luke',
        lastName: 'Wagner',
        email: 'luke.wagner@example.com',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
        tShirtSize: 'L',
        permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true }
    });
    const [cart, setCart] = useState({});
    const [dealerDirectory, setDealerDirectory] = useState(Data.DEALER_DIRECTORY_DATA);
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({});
    const [pollChoices, setPollChoices] = useState({});
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);

    // --- CORE DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1] || 'home';
    const previousScreen = navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null;
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // Lock screen orientation & viewport settings
    useEffect(() => {
        const lockOrientation = async () => {
            try {
                if (screen && screen.orientation && screen.orientation.lock) await screen.orientation.lock('portrait');
            } catch (error) { console.log('Screen orientation lock not supported'); }
        };
        lockOrientation();
        let viewportMeta = document.querySelector('meta[name="viewport"]');
        if (!viewportMeta) {
            viewportMeta = document.createElement('meta');
            viewportMeta.name = 'viewport';
            document.head.appendChild(viewportMeta);
        }
        viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.overflow = 'hidden';
    }, []);

    // --- FIXED NAVIGATION LOGIC ---
    const handleNavigate = useCallback((screen) => {
        if (isAnimating) return;
        setIsAnimating(true);

        // Add new screen to history first
        setNavigationHistory(prev => [...prev, screen]);

        // Start with new screen positioned off-screen to the right
        setSwipeTranslateX(window.innerWidth);

        // Animate the new screen sliding in from right
        setTimeout(() => {
            setSwipeTranslateX(0);
            setTimeout(() => setIsAnimating(false), 300);
        }, 20);
    }, [isAnimating]);

    const handleBack = useCallback(() => {
        if (navigationHistory.length <= 1 || isAnimating) return;
        setIsAnimating(true);

        // Animate current screen sliding out to the right
        setSwipeTranslateX(window.innerWidth);

        // After animation completes, update history
        setTimeout(() => {
            setNavigationHistory(prev => prev.slice(0, -1));
            setSwipeTranslateX(0);
            setIsAnimating(false);
        }, 300);
    }, [navigationHistory.length, isAnimating]);

    const handleHome = useCallback(() => {
        if (isAnimating) return;
        setIsAnimating(true);
        setSwipeTranslateX(-window.innerWidth);
        setTimeout(() => {
            setNavigationHistory(['home']);
            setIsAnimating(false);
            setSwipeTranslateX(0);
        }, 300);
    }, [isAnimating]);

    // --- ROBUST TOUCH HANDLERS ---
    const handleTouchStart = useCallback((e) => {
        if (navigationHistory.length <= 1 || isAnimating) return;
        // Only start swipe if touch is near the left edge
        if (e.touches[0].clientX < 50) {
            isSwiping.current = true;
            touchStartX.current = e.touches[0].clientX;
        }
    }, [navigationHistory.length, isAnimating]);

    const handleTouchMove = useCallback((e) => {
        if (!isSwiping.current) return;
        const currentX = e.touches[0].clientX;
        const diffX = currentX - touchStartX.current;
        // Only track rightward drags for back-swipe
        if (diffX > 0) {
            setSwipeTranslateX(diffX);
        }
    }, []);

    const handleTouchEnd = useCallback(() => {
        if (!isSwiping.current) return;
        isSwiping.current = false;

        // If swiped far enough, complete the back navigation
        if (swipeTranslateX > window.innerWidth / 4) {
            setIsAnimating(true);
            setSwipeTranslateX(window.innerWidth);

            setTimeout(() => {
                setNavigationHistory(prev => prev.slice(0, -1));
                setSwipeTranslateX(0);
                setIsAnimating(false);
            }, 300);
        } else {
            // Snap back to original position
            setIsAnimating(true);
            setSwipeTranslateX(0);
            setTimeout(() => setIsAnimating(false), 300);
        }
    }, [swipeTranslateX]);

    // --- UNCHANGED HANDLERS & RENDER LOGIC ---
    const handleSaveSettings = useCallback(() => {
        setSuccessMessage("Settings Saved!");
        setTimeout(() => setSuccessMessage(""), 2000);
        handleBack();
    }, [handleBack]);

    const handleAddDealer = useCallback((newDealerData) => {
        const newDealer = {
            id: dealerDirectory.length + 1,
            name: newDealerData.dealerName, address: 'N/A', bookings: 0, sales: 0, salespeople: [],
            designers: [], administration: [{ name: newDealerData.email, status: 'pending' }],
            installers: [], recentOrders: [], dailyDiscount: newDealerData.dailyDiscount,
        };
        setDealerDirectory(prev => [newDealer, ...prev]);
    }, [dealerDirectory]);

    const handleNewLeadSuccess = useCallback((newLead) => {
        const newOpportunity = {
            id: opportunities.length + 1, name: newLead.project, stage: newLead.projectStatus,
            value: `$${parseInt(String(newLead.estimatedList).replace(/[^0-9]/g, '')).toLocaleString()}`,
            company: newLead.dealer, ...newLead
        };
        setOpportunities(prev => [...prev, newOpportunity]);
        handleNavigate('projects');
        setSuccessMessage("Lead Created!");
        setTimeout(() => setSuccessMessage(""), 2000);
    }, [opportunities, handleNavigate]);

    const handleAddItem = useCallback((type, obj) => {
        if (type === 'post') setPosts(prev => [obj, ...prev]);
        if (type === 'poll') setPolls(prev => [obj, ...prev]);
    }, []);

    const handleAddNewInstall = useCallback((newInstall) => {
        setMyProjects(prev => [{ id: `proj${prev.length + 1}_${Date.now()}`, ...newInstall }, ...prev]);
        handleBack();
    }, [handleBack]);

    const handleUpdateOpportunity = useCallback((updatedOpportunity) => {
        setOpportunities(prevOpps =>
            prevOpps.map(opp => opp.id === updatedOpportunity.id ? { ...updatedOpportunity, value: `$${updatedOpportunity.value.toLocaleString()}` } : opp)
        );
        setSuccessMessage("Project Updated!");
        setTimeout(() => setSuccessMessage(""), 2000);
    }, []);

    const handleShowAlert = useCallback((message) => setAlertInfo({ show: true, message }), []);
    const handleShowVoiceModal = useCallback((message) => { setVoiceMessage(message); setTimeout(() => setVoiceMessage(''), 1200); }, []);
    const handleUpdateCart = useCallback((item, change) => {
        setCart(prev => {
            const newCart = { ...prev };
            const currentQty = newCart[item.id] || 0;
            const newQty = currentQty + change;
            if (newQty > 0) newCart[item.id] = newQty; else delete newCart[item.id];
            return newCart;
        });
    }, []);
    const handleAskAI = useCallback(async (prompt) => {
        if (!prompt) return;
        setShowAIDropdown(true);
        setIsAILoading(true);
        setTimeout(() => {
            setAiResponse(`This is a simulated AI response for: "${prompt}"`);
            setIsAILoading(false);
        }, 1500);
    }, []);
    const handleCloseAIDropdown = useCallback(() => setShowAIDropdown(false), []);
    const handleToggleLike = useCallback((postId) => {
        setLikedPosts(prev => {
            const newLikedPosts = { ...prev };
            if (newLikedPosts[postId]) { delete newLikedPosts[postId]; } else { newLikedPosts[postId] = true; }
            return newLikedPosts;
        });
        setPosts(prevPosts => prevPosts.map(post => post.id === postId ? { ...post, likes: likedPosts[postId] ? post.likes - 1 : post.likes + 1 } : post));
    }, [likedPosts]);
    const handlePollVote = useCallback((pollId, optionId) => { setPollChoices(prev => ({ ...prev, [pollId]: optionId, })); }, []);

    const renderScreen = (screenKey) => {
        if (!screenKey) return null;
        const screenParts = screenKey.split('/');
        const baseScreenKey = screenParts[0];
        const commonProps = {
            theme: currentTheme, onNavigate: handleNavigate, setSuccessMessage, showAlert: handleShowAlert,
            handleBack, userSettings, currentScreen: screenKey, dealerDirectory, handleAddDealer
        };
        if (baseScreenKey === 'products' && screenParts[1] === 'category' && screenParts[2]) return <ProductComparisonScreen {...commonProps} categoryId={screenParts[2]} />;
        if (baseScreenKey === 'products' && screenParts[1] === 'competitive-analysis' && screenParts[2]) return <CompetitiveAnalysisScreen {...commonProps} categoryId={screenParts[2]} />;
        if (baseScreenKey === 'resources' && screenParts.length > 1) return <ResourceDetailScreen {...commonProps} onUpdateCart={handleUpdateCart} />;
        if (screenKey === 'samples/cart') return <CartScreen {...commonProps} cart={cart} setCart={setCart} onUpdateCart={handleUpdateCart} />;
        const ScreenComponent = SCREEN_MAP[baseScreenKey];
        if (!ScreenComponent) return <PlaceholderScreen {...commonProps} category="Page Not Found" />;
        switch (baseScreenKey) {
            case 'home': return <ScreenComponent {...commonProps} onAskAI={handleAskAI} showAIDropdown={showAIDropdown} aiResponse={aiResponse} isAILoading={isAILoading} onCloseAIDropdown={handleCloseAIDropdown} onVoiceActivate={handleShowVoiceModal} />;
            case 'samples': return <ScreenComponent {...commonProps} cart={cart} onUpdateCart={handleUpdateCart} />;
            case 'settings': return <ScreenComponent {...commonProps} setUserSettings={setUserSettings} onSave={handleSaveSettings} />;
            case 'projects': return <ScreenComponent {...commonProps} opportunities={opportunities} setSelectedOpportunity={setSelectedOpportunity} myProjects={myProjects} setSelectedProject={setSelectedProject} />;
            case 'community': return <ScreenComponent {...commonProps} openCreateContentModal={() => setShowCreateContentModal(true)} posts={posts} polls={polls} likedPosts={likedPosts} onToggleLike={handleToggleLike} pollChoices={pollChoices} onPollVote={handlePollVote} />;
            case 'new-lead': return <ScreenComponent {...commonProps} onSuccess={handleNewLeadSuccess} designFirms={designFirms} setDesignFirms={setDesignFirms} dealers={dealers} setDealers={setDealers} />;
            case 'add-new-install': return <AddNewInstallScreen {...commonProps} onAddInstall={handleAddNewInstall} />;
            default: return <ScreenComponent {...commonProps} />;
        }
    };

    // Memoized screen rendering for better performance
    const renderCurrentScreen = useMemo(() => {
        return renderScreen(currentScreen);
    }, [currentScreen]);

    const renderPreviousScreen = useMemo(() => {
        return previousScreen ? renderScreen(previousScreen) : null;
    }, [previousScreen]);

    // Define styles for the screen containers with GPU acceleration
    const screenContainerStyle = {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        paddingTop: '85px',
        backgroundColor: currentTheme.colors.background,
        willChange: 'transform',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        transition: isAnimating ? 'transform 0.3s ease-out' : 'none',
    };

    return (
        <div
            className="h-screen w-screen font-sans flex flex-col relative overflow-hidden"
            style={{ backgroundColor: currentTheme.colors.background }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <AppHeader
                theme={currentTheme} userName={userSettings.firstName} isHome={currentScreen === 'home'}
                showBack={navigationHistory.length > 1} handleBack={handleBack} isDarkMode={isDarkMode}
                onToggleDark={() => setIsDarkMode(d => !d)} onHomeClick={handleHome} onProfileClick={() => setShowProfileMenu(p => !p)}
            />

            <div className="flex-1 relative overflow-hidden">
                {/* Previous screen (for swipe-back animation) */}
                {previousScreen && (
                    <div style={{
                        ...screenContainerStyle,
                        transform: `translate3d(${swipeTranslateX - window.innerWidth}px, 0, 0)`,
                        zIndex: 1
                    }}>
                        <div className="h-full overflow-y-auto scrollbar-hide">{renderPreviousScreen}</div>
                    </div>
                )}
                {/* Current screen */}
                <div style={{
                    ...screenContainerStyle,
                    transform: `translate3d(${swipeTranslateX}px, 0, 0)`,
                    zIndex: 2
                }}>
                    <div className="h-full overflow-y-auto scrollbar-hide">{renderCurrentScreen}</div>
                </div>
            </div>

            {/* Modals and overlays */}
            <div className="absolute inset-0 z-[100] pointer-events-none">
                {(showProfileMenu || selectedOrder || alertInfo.show || !!voiceMessage || selectedOpportunity || showCreateContentModal || selectedProject) && (
                    <div className="pointer-events-auto">
                        {showProfileMenu && (<ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />)}
                        {selectedOrder && (<OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />)}
                        {selectedOpportunity && (<ProjectDetailModal opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} theme={currentTheme} onUpdate={handleUpdateOpportunity} />)}
                        {showCreateContentModal && (<CreateContentModal close={() => setShowCreateContentModal(false)} theme={currentTheme} onAdd={handleAddItem} />)}
                        {selectedProject && (<MyProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} theme={currentTheme} />)}
                        <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}><p>{alertInfo.message}</p></Modal>
                        <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
                        <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;