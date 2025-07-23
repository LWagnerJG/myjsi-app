import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP } from './ui.jsx';

// --- Main App Component ---
function App() {
    // --- BASIC NAVIGATION STATE ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);

    // --- All other application state ---
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userSettings, setUserSettings] = useState({ id: 1, firstName: 'Luke', lastName: 'Wagner' });
    // ... add any other states like cart, orders, etc. here if needed from your data.jsx or ui.jsx

    const currentScreen = navigationHistory[navigationHistory.length - 1];
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

    // --- STABLE NAVIGATION LOGIC ---
    const handleNavigate = useCallback((screen) => {
        setNavigationHistory(prev => [...prev, screen]);
    }, []);

    const handleBack = useCallback(() => {
        if (navigationHistory.length > 1) {
            setNavigationHistory(prev => prev.slice(0, -1));
        }
    }, [navigationHistory.length]);

    const handleHome = useCallback(() => {
        setNavigationHistory(['home']);
    }, []);

    // --- Render function for screens ---
    const renderScreen = (screenKey) => {
        if (!screenKey) return null;
        const ScreenComponent = SCREEN_MAP[screenKey];
        if (!ScreenComponent) return <div>Screen not found: {screenKey}</div>;

        // Pass only the necessary props
        return <ScreenComponent
            theme={currentTheme}
            onNavigate={handleNavigate}
            handleBack={handleBack}
            userSettings={userSettings}
        // Add any other props your components might need here
        />;
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

            {/* Simple, stable container for the current screen */}
            <div className="flex-1 pt-[88px] overflow-y-auto scrollbar-hide">
                {renderScreen(currentScreen)}
            </div>

            {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
        </div>
    );
}

export default App;