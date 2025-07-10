import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme, INITIAL_MEMBERS, INITIAL_OPPORTUNITIES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from './data.jsx';
import {
    AppHeader, ProfileMenu, SCREEN_MAP, OrderModal, Modal, SuccessToast, PageTitle,
    ResourceDetailScreen, CartScreen, VoiceModal, ProductComparisonScreen,
    CompetitiveAnalysisScreen, PlaceholderScreen, FabricsScreen
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
    const [swipeTranslateX, setSwipeTranslateX] = useState(0); // New state for swipe animation
    const [isTransitioning, setIsTransitioning] = useState(false); // New state to control CSS transition

    // --- SCREEN-SPECIFIC STATE ---
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [opportunities, setOpportunities] = useState(INITIAL_OPPORTUNITIES);
    const [designFirms, setDesignFirms] = useState(INITIAL_DESIGN_FIRMS);
    const [dealers, setDealers] = useState(INITIAL_DEALERS);
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

    // --- GESTURE & AI STATE ---
    const touchStartX = useRef(0);
    const touchStartY = useRef(0); // New: Store initial Y position
    const isSwipingHorizontal = useRef(false); // New: Flag to confirm horizontal swipe intent

    const [aiResponse, setAiResponse] = useState('');
    const [isAILoading, setIsAILoading] = useState(false);
    const [showAIDropdown, setShowAIDropdown] = useState(false);

    // --- DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const previousScreen = navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null; // Only get if there's a previous screen
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- SIDE EFFECTS ---
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();
        // Lock scrolling on home screen for mobile
        if (currentScreen === 'home') {
            document.body.addEventListener('touchmove', preventDefault, { passive: false });
        } else {
            document.body.removeEventListener('touchmove', preventDefault);
        }
        return () => document.body.removeEventListener('touchmove', preventDefault);
    }, [currentScreen]);

    useEffect(() => {
        setMembers(prevMembers => prevMembers.map(member =>
            member.id === currentUserId
                ? { ...member, firstName: userSettings.firstName, lastName: userSettings.lastName, email: userSettings.email }
                : member
        ));
    }, [userSettings, currentUserId]);


    // --- HANDLERS ---
    const handleNavigate = useCallback((screen) => {
        setNavigationHistory(prev => [...prev, screen]);
        setShowProfileMenu(false);
        setSwipeTranslateX(0);
        setIsTransitioning(false);
    }, []);

    const handleHome = useCallback(() => {
        setNavigationHistory(['home']);
        setShowProfileMenu(false);
        setSwipeTranslateX(0);
        setIsTransitioning(false);
    }, []);

    const handleBack = useCallback(() => {
        if (navigationHistory.length > 1 && !isTransitioning) {
            setIsTransitioning(true); // Enable CSS transition for smooth snap
            setSwipeTranslateX(window.innerWidth); // Animate current screen off to the right
            setTimeout(() => {
                setNavigationHistory(prev => prev.slice(0, -1));
                setSwipeTranslateX(0); // Reset for next screen (previous one is now current)
                setIsTransitioning(false); // Disable transition after state update
            }, 300); // Match CSS transition duration
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
        };
        setOpportunities(prev => [...prev, newOpportunity]);
        handleNavigate('projects');
        setSuccessMessage("Lead Created!");
        setTimeout(() => setSuccessMessage(""), 2000);
    }, [opportunities, handleNavigate]);
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

    // Gesture handler for swiping back
    const handleTouchStart = (e) => {
        if (isTransitioning || navigationHistory.length <= 1) return;

        // Check if touch starts from the far left edge (e.g., first 30 pixels)
        const touchX = e.targetTouches[0].clientX;
        if (touchX < 30) { // Define a trigger zone (e.g., 30 pixels from left)
            touchStartX.current = touchX;
            touchStartY.current = e.targetTouches[0].clientY; // Store initial Y
            isSwipingHorizontal.current = false; // Reset horizontal swipe flag
            setIsTransitioning(false); // Disable transition during active drag
        } else {
            touchStartX.current = 0; // Not a left-edge swipe
        }
    };

    const handleTouchMove = (e) => {
        if (touchStartX.current === 0 || isTransitioning) return;

        const currentTouchX = e.targetTouches[0].clientX;
        const currentTouchY = e.targetTouches[0].clientY;
        const diffX = currentTouchX - touchStartX.current;
        const diffY = Math.abs(currentTouchY - touchStartY.current);

        // Determine if it's primarily a horizontal swipe
        // If horizontal movement is significantly greater than vertical movement
        if (diffX > 5 && diffX > diffY * 1.5) { // Thresholds: at least 5px horizontal, and 1.5x horizontal vs vertical
            isSwipingHorizontal.current = true;
            e.preventDefault(); // Prevent vertical scrolling
        }

        if (isSwipingHorizontal.current) {
            let newTranslateX = diffX;
            if (newTranslateX < 0) newTranslateX = 0; // Ensure it doesn't go left past start

            setSwipeTranslateX(newTranslateX);
        }
    };

    const handleTouchEnd = (e) => {
        if (touchStartX.current === 0 || isTransitioning) return;

        const touchEndX = e.changedTouches[0].clientX;
        const swipeDistance = touchEndX - touchStartX.current;

        // Threshold for a successful "back" swipe (e.g., 25% of screen width)
        const swipeThreshold = window.innerWidth * 0.25;

        if (isSwipingHorizontal.current && swipeDistance > swipeThreshold && navigationHistory.length > 1) {
            handleBack(); // Trigger the animated back navigation
        } else {
            // If swipe not long enough or not horizontal, snap back to original position
            setIsTransitioning(true); // Enable transition for snapping back
            setSwipeTranslateX(0);
            setTimeout(() => {
                setIsTransitioning(false); // Disable transition after snap back
            }, 300); // Match CSS transition duration
        }
        touchStartX.current = 0; // Reset
        touchStartY.current = 0; // Reset Y
        isSwipingHorizontal.current = false; // Reset horizontal swipe flag
    };

    // --- RENDER LOGIC ---
    // renderScreen now takes an optional 'screenKey' prop
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
        };

        if (baseScreenKey === 'products' && screenParts[1] === 'category' && screenParts[2]) {
            return <ProductComparisonScreen {...commonProps} categoryId={screenParts[2]} />;
        }
        if (baseScreenKey === 'products' && screenParts[1] === 'competitive-analysis' && screenParts[2]) {
            return <CompetitiveAnalysisScreen {...commonProps} categoryId={screenParts[2]} />;
        }
        if (baseScreenKey === 'resources' && screenParts.length > 1) {
            return <ResourceDetailScreen {...commonProps} />;
        }
        if (screenKey === 'samples/cart') {
            return <CartScreen {...commonProps} cart={cart} setCart={setCart} onUpdateCart={handleUpdateCart} />;
        }

        const ScreenComponent = SCREEN_MAP[baseScreenKey];
        if (!ScreenComponent) return <PlaceholderScreen {...commonProps} category="Page Not Found" />;

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
                return <ScreenComponent {...commonProps} opportunities={opportunities} />;
            case 'new-lead':
                return <ScreenComponent {...commonProps} onSuccess={handleNewLeadSuccess} designFirms={designFirms} setDesignFirms={setDesignFirms} dealers={dealers} setDealers={setDealers} />;
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

            {/* Container for the previous screen (rendered behind current) */}
            {previousScreen && (
                <div
                    className={`absolute inset-0 pt-[72px] ${isTransitioning ? 'transition-transform duration-300' : ''} ${previousScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}
                    style={{
                        backgroundColor: currentTheme.colors.background,
                        transform: `translateX(${swipeTranslateX - window.innerWidth}px)`
                    }}
                >
                    {renderScreen(previousScreen)}
                </div>
            )}

            {/* Container for the current screen, animated on swipe */}
            <div
                className={`absolute inset-0 pt-[72px] ${isTransitioning ? 'transition-transform duration-300' : ''} ${currentScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}
                style={{
                    backgroundColor: currentTheme.colors.background,
                    transform: `translateX(${swipeTranslateX}px)`
                }}
            >
                {renderScreen(currentScreen)}
            </div>


            <div className="absolute inset-0 pointer-events-none">
                {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
                {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />}
                <Modal show={alertInfo.show} onClose={() => setAlertInfo({ show: false, message: '' })} title="Alert" theme={currentTheme}><p>{alertInfo.message}</p></Modal>
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
                <VoiceModal message={voiceMessage} show={!!voiceMessage} theme={currentTheme} />
            </div>
        </div>
    );
}

export default App;