﻿import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
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
    // --- CORE APP STATE ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [voiceMessage, setVoiceMessage] = useState('');
    const [swipeTranslateX, setSwipeTranslateX] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // --- SCREEN-SPECIFIC STATE ---
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
        lastName: 'Miller',
        email: 'luke.wagner@example.com',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
        tShirtSize: 'L',
        permissions: { salesData: true, commissions: true, projects: true, customerRanking: true, dealerRewards: true, submittingReplacements: true }
    });
    const [cart, setCart] = useState({});

    // --- COMMUNITY & AI STATE ---
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [polls, setPolls] = useState(INITIAL_POLLS);
    const [likedPosts, setLikedPosts] = useState({}); // Stores { postId: true } for liked posts
    const [pollChoices, setPollChoices] = useState({}); // Stores { pollId: chosenOptionId } for poll selections
    const [showCreateContentModal, setShowCreateContentModal] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);

    // --- GESTURE STATE ---
    const touchStartX = useRef(0);
    const touchStartY = useRef(0);
    const hasSwipeStarted = useRef(false);
    const isHorizontalSwipe = useRef(false);
    const swipeStartTime = useRef(0);
    const lastTouchX = useRef(0);

    // --- DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const previousScreen = navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null;
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- SIDE EFFECTS ---
    useEffect(() => {
        const themeColor = isDarkMode ? darkTheme.colors.background : lightTheme.colors.background;
        const metaThemeColor = document.querySelector("meta[name=theme-color]");
        if (metaThemeColor) {
            metaThemeColor.setAttribute("content", themeColor);
        }

        const preventDefaultGlobal = (e) => {
            if (currentScreen === 'home') {
                e.preventDefault();
            }
        };
        document.body.addEventListener('touchmove', preventDefaultGlobal, { passive: false });

        return () => {
            document.body.removeEventListener('touchmove', preventDefaultGlobal);
        };
    }, [currentScreen, isDarkMode, currentTheme]);

    useEffect(() => {
        setMembers(prevMembers => prevMembers.map(member =>
            member.id === currentUserId
                ? { ...member, firstName: userSettings.firstName, lastName: userSettings.lastName, email: userSettings.email }
                : member
        ));
    }, [userSettings, currentUserId]);

    // --- HANDLERS ---
    const handleNavigate = useCallback((screen) => {
        setIsTransitioning(true);
        setSwipeTranslateX(-window.innerWidth);
        setTimeout(() => {
            setNavigationHistory(prev => [...prev, screen]);
            setShowProfileMenu(false);
            setSwipeTranslateX(0);
            setIsTransitioning(false);
        }, 100);
    }, []);

    const handleHome = useCallback(() => {
        setNavigationHistory(['home']);
        setShowProfileMenu(false);
        setSwipeTranslateX(0);
        setIsTransitioning(false);
    }, []);

    const handleBack = useCallback(() => {
        if (navigationHistory.length > 1 && !isTransitioning) {
            setIsTransitioning(true);
            setSwipeTranslateX(window.innerWidth);
            setTimeout(() => {
                setNavigationHistory(prev => prev.slice(0, -1));
                setSwipeTranslateX(0);
                setIsTransitioning(false);
            }, 200);
        }
    }, [navigationHistory.length, isTransitioning]);

    const handleSaveSettings = useCallback(() => { setSuccessMessage("Settings Saved!"); setTimeout(() => setSuccessMessage(""), 2000); handleBack(); }, [handleBack]);

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

    const handleShowAlert = useCallback((message) => { setAlertInfo({ show: true, message }); }, []);
    const handleShowVoiceModal = useCallback((message) => { setVoiceMessage(message); setTimeout(() => setVoiceMessage(''), 1200); }, []);
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
    const handleCloseAIDropdown = useCallback(() => { setShowAIDropdown(false); }, []);

    // New handlers for managing likes and poll choices
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
        // You might also want to update the 'likes' count on the post object itself for immediate UI reflection
        setPosts(prevPosts =>
            prevPosts.map(post =>
                post.id === postId
                    ? { ...post, likes: likedPosts[postId] ? post.likes - 1 : post.likes + 1 }
                    : post
            )
        );
    }, [likedPosts]); // Added likedPosts to dependency array

    const handlePollVote = useCallback((pollId, optionId) => {
        setPollChoices(prev => ({
            ...prev,
            [pollId]: optionId,
        }));
    }, []);


    const handleTouchStart = (e) => {
        if (isTransitioning || navigationHistory.length <= 1) return;
        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        if (touchX < 50) {
            touchStartX.current = touchX;
            touchStartY.current = touchY;
            lastTouchX.current = touchX;
            hasSwipeStarted.current = true;
            isHorizontalSwipe.current = false;
            swipeStartTime.current = Date.now();
        }
    };

    const handleTouchMove = (e) => {
        if (!hasSwipeStarted.current || isTransitioning) return;
        const currentX = e.touches[0].clientX;
        const currentY = e.touches[0].clientY;
        const diffX = currentX - touchStartX.current;
        const diffY = Math.abs(currentY - touchStartY.current);

        if (!isHorizontalSwipe.current) {
            if (diffX > 15 && diffX > diffY * 1.5) { isHorizontalSwipe.current = true; }
            else if (diffY > 15) { hasSwipeStarted.current = false; return; }
        }

        if (isHorizontalSwipe.current) {
            e.preventDefault();
            const maxSwipe = window.innerWidth * 0.8;
            const resistance = Math.max(0, Math.min(maxSwipe, diffX));
            const easedTransform = resistance * (1 - resistance / (maxSwipe * 2));
            setSwipeTranslateX(Math.max(0, easedTransform));
            lastTouchX.current = currentX;
        }
    };

    const handleTouchEnd = () => {
        if (!hasSwipeStarted.current || isTransitioning) return;
        if (isHorizontalSwipe.current) {
            const swipeDistance = lastTouchX.current - touchStartX.current;
            const swipeTime = Date.now() - swipeStartTime.current;
            const swipeVelocity = swipeDistance / swipeTime;
            const shouldGoBack = swipeDistance > window.innerWidth * 0.25 || (swipeDistance > window.innerWidth * 0.15 && swipeVelocity > 0.3);
            if (shouldGoBack) { handleBack(); }
            else {
                setIsTransitioning(true);
                setSwipeTranslateX(0);
                setTimeout(() => setIsTransitioning(false), 150);
            }
        }
        hasSwipeStarted.current = false;
        isHorizontalSwipe.current = false;
        touchStartX.current = 0;
        touchStartY.current = 0;
        lastTouchX.current = 0;
        swipeStartTime.current = 0;
    };

    // --- RENDER LOGIC ---
    const renderScreen = (screenKey) => {
        if (!screenKey) return null;
        const screenParts = screenKey.split('/');
        const baseScreenKey = screenParts[0];
        const commonProps = { theme: currentTheme, onNavigate: handleNavigate, setSuccessMessage, showAlert: handleShowAlert, handleBack, userSettings, currentScreen: screenKey };

        if (baseScreenKey === 'products' && screenParts[1] === 'category' && screenParts[2]) return <ProductComparisonScreen {...commonProps} categoryId={screenParts[2]} />;
        if (baseScreenKey === 'products' && screenParts[1] === 'competitive-analysis' && screenParts[2]) return <CompetitiveAnalysisScreen {...commonProps} categoryId={screenParts[2]} />;
        if (baseScreenKey === 'resources' && screenParts.length > 1) return <ResourceDetailScreen {...commonProps} onUpdateCart={handleUpdateCart} />;
        if (screenKey === 'samples/cart') return <CartScreen {...commonProps} cart={cart} setCart={setCart} onUpdateCart={handleUpdateCart} />;

        const ScreenComponent = SCREEN_MAP[baseScreenKey];
        if (!ScreenComponent) return <PlaceholderScreen {...commonProps} category="Page Not Found" />;

        switch (baseScreenKey) {
            case 'home': return <ScreenComponent {...commonProps} onAskAI={handleAskAI} showAIDropdown={showAIDropdown} aiResponse={aiResponse} isAILoading={isAILoading} onCloseAIDropdown={handleCloseAIDropdown} onVoiceActivate={handleShowVoiceModal} />;
            case 'fabrics': return <ScreenComponent {...commonProps} />;
            case 'orders': return <ScreenComponent {...commonProps} setSelectedOrder={setSelectedOrder} />;
            case 'samples': return <ScreenComponent {...commonProps} cart={cart} onUpdateCart={handleUpdateCart} />;
            case 'settings': return <ScreenComponent {...commonProps} setUserSettings={setUserSettings} onSave={handleSaveSettings} />;
            case 'members': return <ScreenComponent {...commonProps} members={members} setMembers={setMembers} currentUserId={currentUserId} />;
            case 'projects': return <ScreenComponent {...commonProps} opportunities={opportunities} setSelectedOpportunity={setSelectedOpportunity} myProjects={myProjects} setSelectedProject={setSelectedProject} />;
            case 'community': return <ScreenComponent {...commonProps} openCreateContentModal={() => setShowCreateContentModal(true)} posts={posts} polls={polls} likedPosts={likedPosts} onToggleLike={handleToggleLike} pollChoices={pollChoices} onPollVote={handlePollVote} />;
            case 'new-lead': return <ScreenComponent {...commonProps} onSuccess={handleNewLeadSuccess} designFirms={designFirms} setDesignFirms={setDesignFirms} dealers={dealers} setDealers={setDealers} />;
            case 'add-new-install': return <AddNewInstallScreen {...commonProps} onAddInstall={handleAddNewInstall} />;
            default: return <ScreenComponent {...commonProps} />;
        }
    };

    return (
        <div className="h-screen w-screen font-sans flex flex-col relative overflow-hidden" style={{ backgroundColor: currentTheme.colors.background }} onTouchStart={handleTouchStart} onTouchMove={handleTouchMove} onTouchEnd={handleTouchEnd}>
            <AppHeader theme={currentTheme} userName={userSettings.firstName} isHome={currentScreen === 'home'} showBack={navigationHistory.length > 1} handleBack={handleBack} isDarkMode={isDarkMode} onToggleDark={() => setIsDarkMode(d => !d)} onHomeClick={handleHome} onProfileClick={() => setShowProfileMenu(p => !p)} />
            {previousScreen && (
                <div className={`absolute inset-0 ${isTransitioning ? 'transition-transform duration-200 ease-out' : ''} ${swipeTranslateX > 0 ? 'overflow-hidden' : (previousScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto')} scrollbar-hide`} style={{ paddingTop: '85px', backgroundColor: currentTheme.colors.background, transform: `translateX(${swipeTranslateX - window.innerWidth}px)`, willChange: 'transform' }}>
                    {renderScreen(previousScreen)}
                </div>
            )}
            <div className={`absolute inset-0 ${isTransitioning ? 'transition-transform duration-200 ease-out' : ''} ${currentScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`} style={{ paddingTop: '85px', backgroundColor: currentTheme.colors.background, transform: `translateX(${swipeTranslateX}px)`, willChange: 'transform' }}>
                {renderScreen(currentScreen)}
            </div>
            <div className="absolute inset-0 z-[100] pointer-events-none">
                {(showProfileMenu || selectedOrder || alertInfo.show || !!voiceMessage || selectedOpportunity || showCreateContentModal || selectedProject) && (
                    <div className="pointer-events-auto">
                        {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
                        {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />}
                        {selectedOpportunity && <ProjectDetailModal opportunity={selectedOpportunity} onClose={() => setSelectedOpportunity(null)} theme={currentTheme} onUpdate={handleUpdateOpportunity} />}
                        {showCreateContentModal && <CreateContentModal close={() => setShowCreateContentModal(false)} theme={currentTheme} onAdd={handleAddItem} />}
                        {selectedProject && <MyProjectDetailModal project={selectedProject} onClose={() => setSelectedProject(null)} theme={currentTheme} />}
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