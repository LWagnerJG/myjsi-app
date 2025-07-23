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
    const [navigationHistory, setNavigationHistory] = useState([]);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [swipeTranslateX, setSwipeTranslateX] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
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

    // --- REWORKED LOGIC: Refs for gesture handling and navigation ---
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const lastTouchX = useRef(0);
    const isSwipeInProgress = useRef(false);
    const navigationDirection = useRef('forward');

    const urlToScreen = useCallback((url) => {
        const path = url.replace(window.location.origin, '').replace('/', '') || 'home';
        return path;
    }, []);

    const screenToUrl = useCallback((screen) => {
        return screen === 'home' ? '/' : `/${screen}`;
    }, []);

    useEffect(() => {
        const currentPath = window.location.pathname;
        const initialScreen = currentPath === '/' ? 'home' : currentPath.substring(1);
        setNavigationHistory([initialScreen]);
    }, []);

    // Lock screen orientation to portrait
    useEffect(() => {
        const lockOrientation = async () => {
            try {
                if (screen && screen.orientation && screen.orientation.lock) {
                    await screen.orientation.lock('portrait');
                }
            } catch (error) {
                console.log('Screen orientation lock not supported');
            }
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

        return () => {
            document.body.style.position = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.body.style.overflow = '';
        };
    }, []);

    const currentScreen = navigationHistory[navigationHistory.length - 1] || 'home';
    const previousScreen = navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null;
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    useEffect(() => {
        const themeColor = isDarkMode ? darkTheme.colors.background : lightTheme.colors.background;
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", themeColor);
        }
    }, [isDarkMode, currentTheme]);

    // This effect correctly syncs React state to the browser URL
    useEffect(() => {
        if (currentScreen) {
            const newUrl = screenToUrl(currentScreen);
            if (window.location.pathname !== newUrl) {
                if (navigationDirection.current === 'forward') {
                    window.history.pushState({ screen: currentScreen }, '', newUrl);
                } else {
                    window.history.replaceState({ screen: currentScreen }, '', newUrl);
                }
            }
        }
    }, [currentScreen, screenToUrl]);

    // This effect correctly syncs browser back/forward events to the React state
    useEffect(() => {
        const handlePopState = (event) => {
            const screen = event.state?.screen || urlToScreen(window.location.pathname);
            setNavigationHistory(prev => {
                const existingIndex = prev.findIndex(s => s === screen);
                if (existingIndex !== -1) {
                    return prev.slice(0, existingIndex + 1);
                } else {
                    return [...prev, screen];
                }
            });
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [urlToScreen]);


    const handleNavigate = useCallback((screen) => {
        if (isTransitioning) return;
        navigationDirection.current = 'forward';
        setIsTransitioning(true);
        setSwipeTranslateX(-window.innerWidth);

        setTimeout(() => {
            setNavigationHistory(prev => [...prev, screen]);
            setShowProfileMenu(false);
            setSwipeTranslateX(0);
            setIsTransitioning(false);
        }, 200);
    }, [isTransitioning]);

    const handleHome = useCallback(() => {
        if (isTransitioning) return;
        navigationDirection.current = 'forward';
        setNavigationHistory(['home']);
        setShowProfileMenu(false);
        setSwipeTranslateX(0);
        setIsTransitioning(false);
    }, [isTransitioning]);

    // --- FUNDAMENTAL REDO START ---
    // A single, unified function to handle the entire back navigation process.
    // This is now used by both the header button and the swipe gesture.
    const handleBack = useCallback(() => {
        if (navigationHistory.length <= 1 || isTransitioning) {
            return;
        }

        navigationDirection.current = 'back';
        setIsTransitioning(true);
        // Animate the current screen fully out of view
        setSwipeTranslateX(window.innerWidth);

        // After the animation completes, update the history and reset for the new screen
        setTimeout(() => {
            setNavigationHistory(prev => prev.slice(0, -1));
            setSwipeTranslateX(0);
            setIsTransitioning(false);
        }, 200); // This duration should match your CSS transition time
    }, [navigationHistory.length, isTransitioning]);

    // Reworked touch handlers for more reliable gesture detection.
    const handleTouchStart = useCallback((e) => {
        // Only allow a swipe to start if not already animating and there's a page to go back to.
        if (isTransitioning || navigationHistory.length <= 1) return;

        const touch = e.touches[0];
        // Only initiate a swipe if the touch starts near the left edge of the screen.
        if (touch.clientX < 50) {
            touchStartX.current = touch.clientX;
            touchStartY.current = touch.clientY;
            lastTouchX.current = touch.clientX;
            isSwipeInProgress.current = true;
        }
    }, [isTransitioning, navigationHistory.length]);

    const handleTouchMove = useCallback((e) => {
        if (!isSwipeInProgress.current || isTransitioning) return;

        const touch = e.touches[0];
        const currentX = touch.clientX;
        lastTouchX.current = currentX;

        const diffX = currentX - touchStartX.current;
        const diffY = Math.abs(touch.clientY - touchStartY.current);

        // This is a vertical scroll, not a horizontal swipe, so we cancel the swipe.
        if (diffX < diffY) {
            isSwipeInProgress.current = false;
            return;
        }

        // Prevent the browser's default pull-to-refresh or other gestures
        e.preventDefault();

        // We only want to track positive (rightward) movement for the back swipe
        if (diffX > 0) {
            // Directly update the transform style for a responsive feel
            setSwipeTranslateX(diffX);
        }
    }, [isTransitioning]);

    const handleTouchEnd = useCallback(() => {
        if (!isSwipeInProgress.current || isTransitioning) return;

        // Reset the swipe flag immediately.
        isSwipeInProgress.current = false;

        const swipeDistance = lastTouchX.current - touchStartX.current;
        // Use a simple, reliable distance threshold. If the user swiped more than 1/4 of the screen, go back.
        const backThreshold = window.innerWidth / 4;

        if (swipeDistance > backThreshold) {
            // If the swipe is far enough, commit to the back navigation.
            handleBack();
        } else {
            // If the swipe wasn't far enough, animate the screen snapping back to place.
            setIsTransitioning(true);
            setSwipeTranslateX(0);
            setTimeout(() => {
                setIsTransitioning(false);
            }, 200);
        }
    }, [isTransitioning, handleBack]);
    // --- FUNDAMENTAL REDO END ---

    const handleSaveSettings = useCallback(() => {
        setSuccessMessage("Settings Saved!");
        setTimeout(() => setSuccessMessage(""), 2000);
        handleBack();
    }, [handleBack]);

    // (The rest of your handler functions remain unchanged)
    const handleAddDealer = useCallback((newDealerData) => {
        const newDealer = {
            id: dealerDirectory.length + 1,
            name: newDealerData.dealerName,
            address: 'N/A',
            bookings: 0,
            sales: 0,
            salespeople: [],
            designers: [],
            administration: [{ name: newDealerData.email, status: 'pending' }],
            installers: [],
            recentOrders: [],
            dailyDiscount: newDealerData.dailyDiscount,
        };
        setDealerDirectory(prev => [newDealer, ...prev]);
    }, [dealerDirectory]);

    const handleNewLeadSuccess = useCallback((newLead) => {
        const newOpportunity = {
            id: opportunities.length + 1,
            name: newLead.project,
            stage: newLead.projectStatus,
            value: `$${parseInt(String(newLead.estimatedList).replace(/[^0-9]/g, '')).toLocaleString()}`,
            company: newLead.dealer,
            ...newLead
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
        setMyProjects(prev => [{
            id: `proj${prev.length + 1}_${Date.now()}`,
            ...newInstall,
        }, ...prev]);
        handleBack();
    }, [handleBack]);

    const handleUpdateOpportunity = useCallback((updatedOpportunity) => {
        setOpportunities(prevOpps =>
            prevOpps.map(opp =>
                opp.id === updatedOpportunity.id
                    ? { ...updatedOpportunity, value: `$${updatedOpportunity.value.toLocaleString()}` }
                    : opp
            )
        );
        setSuccessMessage("Project Updated!");
        setTimeout(() => setSuccessMessage(""), 2000);
    }, []);

    const handleShowAlert = useCallback((message) => {
        setAlertInfo({ show: true, message });
    }, []);

    const handleShowVoiceModal = useCallback((message) => {
        setVoiceMessage(message);
        setTimeout(() => setVoiceMessage(''), 1200);
    }, []);

    const handleUpdateCart = useCallback((item, change) => {
        setCart(prev => {
            const newCart = { ...prev };
            const currentQty = newCart[item.id] || 0;
            const newQty = currentQty + change;
            if (newQty > 0) newCart[item.id] = newQty;
            else delete newCart[item.id];
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

    const handleCloseAIDropdown = useCallback(() => {
        setShowAIDropdown(false);
    }, []);

    const handleToggleLike = useCallback((postId) => {
        setLikedPosts(prev => {
            const newLikedPosts = { ...prev };
            if (newLikedPosts[postId]) {
                delete newLikedPosts[postId];
            } else {
                newLikedPosts[postId] = true;
            }
            return newLikedPosts;
        });
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, likes: likedPosts[postId] ? post.likes - 1 : post.likes + 1 }
                    : post
            )
        );
    }, [likedPosts]);

    const handlePollVote = useCallback((pollId, optionId) => {
        setPollChoices(prev => ({
            ...prev,
            [pollId]: optionId,
        }));
    }, []);

    const renderScreen = (screenKey) => {
        if (!screenKey) return null;
        const screenParts = screenKey.split('/');
        const baseScreenKey = screenParts[0];
        const commonProps = {
            theme: currentTheme,
            onNavigate: handleNavigate,
            setSuccessMessage,
            showAlert: handleShowAlert,
            handleBack,
            userSettings,
            currentScreen: screenKey,
            dealerDirectory,
            handleAddDealer
        };

        if (baseScreenKey === 'products' && screenParts[1] === 'category' && screenParts[2]) {
            return <ProductComparisonScreen {...commonProps} categoryId={screenParts[2]} />;
        }
        if (baseScreenKey === 'products' && screenParts[1] === 'competitive-analysis' && screenParts[2]) {
            return <CompetitiveAnalysisScreen {...commonProps} categoryId={screenParts[2]} />;
        }
        if (baseScreenKey === 'resources' && screenParts.length > 1) {
            return <ResourceDetailScreen {...commonProps} onUpdateCart={handleUpdateCart} />;
        }
        if (screenKey === 'samples/cart') {
            return <CartScreen {...commonProps} cart={cart} setCart={setCart} onUpdateCart={handleUpdateCart} />;
        }

        const ScreenComponent = SCREEN_MAP[baseScreenKey];
        if (!ScreenComponent) {
            return <PlaceholderScreen {...commonProps} category="Page Not Found" />;
        }

        switch (baseScreenKey) {
            case 'home':
                return <ScreenComponent {...commonProps} onAskAI={handleAskAI} showAIDropdown={showAIDropdown} aiResponse={aiResponse} isAILoading={isAILoading} onCloseAIDropdown={handleCloseAIDropdown} onVoiceActivate={handleShowVoiceModal} />;
            case 'fabrics':
                return <ScreenComponent {...commonProps} />;
            case 'orders':
                return <ScreenComponent {...commonProps} setSelectedOrder={setSelectedOrder} />;
            case 'samples':
                return <ScreenComponent {...commonProps} cart={cart} onUpdateCart={handleUpdateCart} />;
            case 'settings':
                return <ScreenComponent {...commonProps} setUserSettings={setUserSettings} onSave={handleSaveSettings} />;
            case 'members':
                return <ScreenComponent {...commonProps} members={members} setMembers={setMembers} currentUserId={currentUserId} />;
            case 'projects':
                return <ScreenComponent {...commonProps} opportunities={opportunities} setSelectedOpportunity={setSelectedOpportunity} myProjects={myProjects} setSelectedProject={setSelectedProject} />;
            case 'community':
                return <ScreenComponent {...commonProps} openCreateContentModal={() => setShowCreateContentModal(true)} posts={posts} polls={polls} likedPosts={likedPosts} onToggleLike={handleToggleLike} pollChoices={pollChoices} onPollVote={handlePollVote} />;
            case 'new-lead':
                return <ScreenComponent {...commonProps} onSuccess={handleNewLeadSuccess} designFirms={designFirms} setDesignFirms={setDesignFirms} dealers={dealers} setDealers={setDealers} />;
            case 'add-new-install':
                return <AddNewInstallScreen {...commonProps} onAddInstall={handleAddNewInstall} />;
            default:
                return <ScreenComponent {...commonProps} />;
        }
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
                theme={currentTheme}
                userName={userSettings.firstName}
                isHome={currentScreen === 'home'}
                showBack={navigationHistory.length > 1}
                handleBack={handleBack}
                isDarkMode={isDarkMode}
                onToggleDark={() => setIsDarkMode(d => !d)}
                onHomeClick={handleHome}
                onProfileClick={() => setShowProfileMenu(p => !p)}
            />

            {/* Previous screen for swipe animation */}
            {previousScreen && (
                <div
                    className={`absolute inset-0 ${isTransitioning ? 'transition-transform duration-200 ease-out' : ''} ${previousScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}
                    style={{
                        paddingTop: '85px',
                        backgroundColor: currentTheme.colors.background,
                        transform: `translateX(${swipeTranslateX - window.innerWidth}px)`,
                        willChange: 'transform',
                        zIndex: 1
                    }}
                >
                    {renderScreen(previousScreen)}
                </div>
            )}

            {/* Current screen */}
            <div
                className={`absolute inset-0 ${isTransitioning || isSwipeInProgress.current ? '' : 'transition-transform duration-200 ease-out'} ${currentScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}
                style={{
                    paddingTop: '85px',
                    backgroundColor: currentTheme.colors.background,
                    transform: `translateX(${swipeTranslateX}px)`,
                    willChange: 'transform',
                    zIndex: 2
                }}
            >
                {renderScreen(currentScreen)}
            </div>

            {/* Modals and overlays */}
            <div className="absolute inset-0 z-[100] pointer-events-none">
                {(showProfileMenu || selectedOrder || alertInfo.show || !!voiceMessage || selectedOpportunity || showCreateContentModal || selectedProject) && (
                    <div className="pointer-events-auto">
                        {showProfileMenu && (
                            <ProfileMenu
                                show={showProfileMenu}
                                onClose={() => setShowProfileMenu(false)}
                                onNavigate={handleNavigate}
                                toggleTheme={() => setIsDarkMode(d => !d)}
                                theme={currentTheme}
                                isDarkMode={isDarkMode}
                            />
                        )}
                        {selectedOrder && (
                            <OrderModal
                                order={selectedOrder}
                                onClose={() => setSelectedOrder(null)}
                                theme={currentTheme}
                            />
                        )}
                        {selectedOpportunity && (
                            <ProjectDetailModal
                                opportunity={selectedOpportunity}
                                onClose={() => setSelectedOpportunity(null)}
                                theme={currentTheme}
                                onUpdate={handleUpdateOpportunity}
                            />
                        )}
                        {showCreateContentModal && (
                            <CreateContentModal
                                close={() => setShowCreateContentModal(false)}
                                theme={currentTheme}
                                onAdd={handleAddItem}
                            />
                        )}
                        {selectedProject && (
                            <MyProjectDetailModal
                                project={selectedProject}
                                onClose={() => setSelectedProject(null)}
                                theme={currentTheme}
                            />
                        )}
                        <Modal
                            show={alertInfo.show}
                            onClose={() => setAlertInfo({ show: false, message: '' })}
                            title="Alert"
                            theme={currentTheme}
                        >
                            <p>{alertInfo.message}</p>
                        </Modal>
                        <SuccessToast
                            message={successMessage}
                            show={!!successMessage}
                            theme={currentTheme}
                        />

                        <VoiceModal
                            message={voiceMessage}
                            show={!!voiceMessage}
                            theme={currentTheme}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default App;