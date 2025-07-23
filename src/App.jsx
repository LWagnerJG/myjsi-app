import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { lightTheme, darkTheme } from './data.jsx';
import { AppHeader, ProfileMenu, SCREEN_MAP } from './ui.jsx';

function App() {
    // --- Core State ---
    const [navigationHistory, setNavigationHistory] = useState(['home']);
    const [animation, setAnimation] = useState('idle'); // 'idle', 'forward', 'backward'
    const appContainerRef = useRef(null);

    // All other application state
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showProfileMenu, setShowProfileMenu] = useState(false);
    const [userSettings, setUserSettings] = useState({ firstName: 'Luke' });
    // ... add any other states like cart, orders, etc. here if needed

    const currentScreen = navigationHistory[navigationHistory.length - 1];
    const previousScreen = navigationHistory.length > 1 ? navigationHistory[navigationHistory.length - 2] : null;
    const currentTheme = useMemo(() => (isDarkMode ? darkTheme : lightTheme), [isDarkMode]);

    // --- One-time setup effect ---
    useEffect(() => {
        document.body.style.overflow = 'hidden'; // Prevents bounce on the whole page
    }, []);

    // --- Simplified Navigation ---
    const handleNavigate = useCallback((screen) => {
        if (animation !== 'idle') return;
        setAnimation('forward');
        setNavigationHistory(prev => [...prev, screen]);
        setTimeout(() => setAnimation('idle'), 350); // Animation duration + buffer
    }, [animation]);

    const handleBack = useCallback(() => {
        if (navigationHistory.length <= 1 || animation !== 'idle') return;
        setAnimation('backward');
        setTimeout(() => {
            setNavigationHistory(prev => prev.slice(0, -1));
            setAnimation('idle');
        }, 300); // Animation duration
    }, [navigationHistory.length, animation]);

    const handleHome = useCallback(() => {
        if (animation !== 'idle') return;
        if (navigationHistory.length > 1) {
            setAnimation('backward');
            setTimeout(() => {
                setNavigationHistory(['home']);
                setAnimation('idle');
            }, 300);
        }
    }, [animation, navigationHistory.length]);

    // --- FIX: Programmatic Event Listeners for Swipe Gesture ---
    useEffect(() => {
        const container = appContainerRef.current;
        if (!container) return;

        let touchStartX = 0;
        let isSwiping = false;

        const handleTouchStart = (e) => {
            if (animation !== 'idle' && navigationHistory.length > 1 && e.touches[0].clientX < 50) {
                isSwiping = true;
                touchStartX = e.touches[0].clientX;
            }
        };

        const handleTouchMove = (e) => {
            if (!isSwiping) return;
            // This is the key: we prevent the default browser scroll action, fixing the console error.
            e.preventDefault();
        };

        const handleTouchEnd = (e) => {
            if (!isSwiping) return;
            isSwiping = false;
            const touchEndX = e.changedTouches[0].clientX;
            const swipeDistance = touchEndX - touchStartX;
            if (swipeDistance > 80) { // A generous swipe threshold
                handleBack();
            }
        };

        container.addEventListener('touchstart', handleTouchStart, { passive: true });
        container.addEventListener('touchmove', handleTouchMove, { passive: false });
        container.addEventListener('touchend', handleTouchEnd, { passive: true });

        return () => {
            container.removeEventListener('touchstart', handleTouchStart);
            container.removeEventListener('touchmove', handleTouchMove);
            container.removeEventListener('touchend', handleTouchEnd);
        };
    }, [animation, navigationHistory.length, handleBack]);

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
            // Add other globally needed props here
            userSettings={userSettings}
        />;
    };

    return (
        // The ref is attached here, and overflow-hidden is REMOVED to fix the "cut-off" screen
        <div ref={appContainerRef} className="h-screen w-screen font-sans bg-gray-100 relative">
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

            <div className={`app-container anim-${animation}`}>
                {/* Previous Screen */}
                <div className="screen-container previous-screen">
                    <div className="h-full overflow-y-auto scrollbar-hide">
                        {renderScreen(previousScreen)}
                    </div>
                </div>

                {/* Current Screen */}
                <div className="screen-container current-screen">
                    <div className="h-full overflow-y-auto scrollbar-hide">
                        {renderScreen(currentScreen)}
                    </div>
                </div>
            </div>

            {showProfileMenu && <ProfileMenu show={showProfileMenu} onClose={() => setShowProfileMenu(false)} onNavigate={handleNavigate} toggleTheme={() => setIsDarkMode(d => !d)} theme={currentTheme} isDarkMode={isDarkMode} />}
        </div>
    );
}

export default App;