import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme, INITIAL_MEMBERS } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP, OrderModal, Modal, SuccessToast, PageTitle } from './ui.jsx';
import * as Data from './data.jsx';

function App() {
    // --- STATE ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [members, setMembers] = useState(INITIAL_MEMBERS);
    const [currentUserId, setCurrentUserId] = useState(1);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner' });

    const touchStartX = useRef(0);

    // --- DERIVED STATE ---
    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- EFFECT TO PREVENT SCROLLING ON MOBILE ---
    useEffect(() => {
        const preventDefault = (e) => e.preventDefault();

        // If on the home screen, disable touch scrolling on the document body
        if (currentScreen === 'home') {
            document.body.addEventListener('touchmove', preventDefault, { passive: false });
        } else {
            // Re-enable scrolling on all other screens
            document.body.removeEventListener('touchmove', preventDefault);
        }

        // Cleanup the event listener when the component unmounts or the screen changes
        return () => {
            document.body.removeEventListener('touchmove', preventDefault);
        };
    }, [currentScreen]); // This effect runs every time the screen changes

    // --- HANDLERS ---
    const handleNavigate = useCallback((screen) => { setNavigationHistory(prev => [...prev, screen]); }, []);
    const handleHome = useCallback(() => { setNavigationHistory(['home']); }, []);
    const handleBack = useCallback(() => { if (navigationHistory.length > 1) { setNavigationHistory(prev => prev.slice(0, -1)); } }, [navigationHistory.length]);
    const handleSaveSettings = useCallback(() => { setSuccessMessage("Settings Saved!"); setTimeout(() => setSuccessMessage(""), 2000); handleBack(); }, [handleBack]);

    const handleTouchStart = (e) => {
        if (e.targetTouches[0].clientX < 50) {
            touchStartX.current = e.targetTouches[0].clientX;
        } else {
            touchStartX.current = 0;
        }
    };
    const handleTouchEnd = (e) => {
        const touchEndX = e.changedTouches[0].clientX;
        if (touchStartX.current > 0 && touchEndX - touchStartX.current > 75) {
            handleBack();
        }
        touchStartX.current = 0;
    };

    const renderScreen = () => {
        const screenKey = currentScreen.split('/')[0];
        const ScreenComponent = SCREEN_MAP[screenKey];
        if (!ScreenComponent) return <PageTitle title="Not Found" theme={currentTheme} />;
        const props = { theme: currentTheme, onNavigate: handleNavigate, setSuccessMessage };

        switch (screenKey) {
            case 'orders': return <ScreenComponent {...props} setSelectedOrder={setSelectedOrder} />;
            case 'settings': return <ScreenComponent {...props} userSettings={userSettings} setUserSettings={setUserSettings} onSave={handleSaveSettings} />;
            case 'members': return <ScreenComponent {...props} members={members} setMembers={setMembers} currentUserId={currentUserId} />;
            default: return <ScreenComponent {...props} />;
        }
    };

    return (
        <div
            className="h-screen w-screen font-sans flex flex-col"
            style={{ backgroundColor: currentTheme.colors.background }}
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

            <main className={`flex-1 ${currentScreen === 'home' ? 'overflow-hidden' : 'overflow-y-auto'} scrollbar-hide`}>
                {renderScreen()}
            </main>

            <div className="absolute inset-0 pointer-events-none">
                {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
                {selectedOrder && <OrderModal order={selectedOrder} onClose={() => setSelectedOrder(null)} theme={currentTheme} />}
                <SuccessToast message={successMessage} show={!!successMessage} theme={currentTheme} />
            </div>
        </div>
    );
}

export default App;