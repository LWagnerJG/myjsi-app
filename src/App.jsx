import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react'; // Add useRef
import { lightTheme, darkTheme, INITIAL_MEMBERS } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP, OrderModal, Modal, SuccessToast, PageTitle } from './ui.jsx';

function App() {
    // --- STATE ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);

    // ... (other existing state remains the same)
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [alertInfo, setAlertInfo] = useState({ show: false, message: '' });
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [userSettings, setUserSettings] = useState({
        id: 1,
        firstName: 'Luke',
        lastName: 'Miller',
        email: 'luke.wagner@example.com',
        homeAddress: '5445 N Deerwood Lake Rd, Jasper, IN 47546',
        tShirtSize: 'L'
    });

    // NEW: A ref to store the starting X-position of a touch
    const touchStartX = useRef(0);

    // --- DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- HANDLERS ---
    const handleNavigate = useCallback((screen) => { setNavigationHistory(prev => [...prev, screen]); }, []);
    const handleHome = useCallback(() => { setNavigationHistory(['home']); }, []);
    const handleBack = useCallback(() => { if (navigationHistory.length > 1) { setNavigationHistory(prev => prev.slice(0, -1)); } }, [navigationHistory.length]);
    const handleSaveSettings = useCallback(() => { setSuccessMessage("Settings Saved!"); setTimeout(() => setSuccessMessage(""), 2000); handleBack(); }, [handleBack]);

    // NEW: Handler to capture the start of a swipe
    const handleTouchStart = (e) => {
        // Only track touches that start near the left edge of the screen
        if (e.targetTouches[0].clientX < 50) {
            touchStartX.current = e.targetTouches[0].clientX;
        } else {
            touchStartX.current = 0; // Reset if the touch starts elsewhere
        }
    };

    // NEW: Handler to detect the end of a swipe and navigate back if it's valid
    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        // Check if the swipe started near the edge and was long enough to the right
        if (touchStartX.current > 0 && touchEndX - touchStartX.current > 75) {
            handleBack();
        }
        touchStartX.current = 0; // Reset for the next touch
    };

    const renderScreen = () => {
        // ... (renderScreen logic remains the same)
        const ScreenComponent = SCREEN_MAP[currentScreen.split('/')[0]];

        if (!ScreenComponent) return <PageTitle title="Not Found" theme={currentTheme} />;

        const props = {
            theme: currentTheme,
            onNavigate: handleNavigate,
            setSuccessMessage,
        };

        switch (currentScreen) {
            case 'orders':
                return <ScreenComponent {...props} setSelectedOrder={setSelectedOrder} />;
            case 'settings':
                return <ScreenComponent {...props} userSettings={userSettings} setUserSettings={setUserSettings} onSave={handleSaveSettings} />;
            case 'members':
                return <ScreenComponent {...props} members={members} setMembers={setMembers} currentUserId={currentUserId} />;
            default:
                return <ScreenComponent {...props} />;
        }
    };

    return (
        <div
            className="h-screen w-screen font-sans flex flex-col"
            style={{ backgroundColor: currentTheme.colors.background }}
            // NEW: Added touch handlers to the main app container
            onTouchStart={handleTouchStart}
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

            <main className={`flex-1 overflow-y-auto scrollbar-hide`}>
                {renderScreen()}
            </main>

            <div className="absolute inset-0 pointer-events-none">
                {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
                {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />}
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
                {/* VoiceModal and other modals can go here if needed */}
            </div>
        </div>
    );
}

export default App;