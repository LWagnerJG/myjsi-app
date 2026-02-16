// JSI Digital Brand Themes
// Aligned with JSI Digital Style Guide 1.0
// Primary accent: JSI Charcoal (#353535)

export const lightTheme = {
    colors: {
        // Core colors
        background: '#F0EDE8', // jsi-warm-beige
        surface: '#FFFFFF',
        primary: '#353535', // jsi-charcoal
        accent: '#353535',
        secondary: '#353535',
        textPrimary: '#353535',
        textSecondary: '#5B7B8C', // jsi-info for secondary text
        border: '#E3E0D8', // jsi-stone
        shadow: 'rgba(53, 53, 53, 0.1)',
        subtle: '#DFE2DD', // jsi-sage-grey

        // Semantic colors - for consistent usage across components
        accentText: '#FFFFFF', // Text on accent/primary buttons
        inputBackground: '#FFFFFF', // Form input backgrounds
        overlay: 'rgba(0, 0, 0, 0.5)', // Modal/drawer overlays

        // Status colors
        success: '#4A7C59',
        successLight: 'rgba(74, 124, 89, 0.12)',
        warning: '#C4956A',
        warningLight: 'rgba(196, 149, 106, 0.12)',
        error: '#B85C5C',
        errorLight: 'rgba(184, 92, 92, 0.12)',
        destructive: '#B85C5C',
        destructiveLight: 'rgba(184, 92, 92, 0.12)',
        destructiveBorder: 'rgba(184, 92, 92, 0.25)',
        info: '#5B7B8C',
        infoLight: 'rgba(91, 123, 140, 0.12)',

        // Interactive states
        hoverLight: 'rgba(0, 0, 0, 0.05)',
        activeLight: 'rgba(0, 0, 0, 0.08)',
        focusRing: 'rgba(53, 53, 53, 0.2)',

        // Special feature colors
        quickShip: '#D4AF37', // Gold for QuickShip badges
        overlayDark: 'rgba(0, 0, 0, 0.6)', // Dark scrim for overlays on images
    },
};

export const darkTheme = {
    colors: {
        // Core colors
        background: '#1A1A1A',
        surface: '#282828',
        primary: '#FFFFFF',
        accent: '#FFFFFF',
        secondary: '#BBBBBB',
        textPrimary: '#FFFFFF',
        textSecondary: '#AAAAAA',
        border: 'rgba(255, 255, 255, 0.1)',
        shadow: 'rgba(0, 0, 0, 0.4)',
        subtle: 'rgba(255, 255, 255, 0.05)',

        // Semantic colors - for consistent usage across components
        accentText: '#1A1A1A', // Text on accent/primary buttons (dark on light)
        inputBackground: 'rgba(255, 255, 255, 0.08)', // Form input backgrounds
        overlay: 'rgba(0, 0, 0, 0.7)', // Modal/drawer overlays

        // Status colors
        success: '#6B9B7A',
        successLight: 'rgba(107, 155, 122, 0.2)',
        warning: '#D4A87A',
        warningLight: 'rgba(212, 168, 122, 0.2)',
        error: '#C87070',
        errorLight: 'rgba(200, 112, 112, 0.2)',
        destructive: '#C87070',
        destructiveLight: 'rgba(200, 112, 112, 0.2)',
        destructiveBorder: 'rgba(200, 112, 112, 0.4)',
        info: '#7B9BAC',
        infoLight: 'rgba(123, 155, 172, 0.2)',

        // Interactive states
        hoverLight: 'rgba(255, 255, 255, 0.05)',
        activeLight: 'rgba(255, 255, 255, 0.08)',
        focusRing: 'rgba(255, 255, 255, 0.3)',

        // Special feature colors
        quickShip: '#D4AF37', // Gold for QuickShip badges
        overlayDark: 'rgba(0, 0, 0, 0.7)', // Dark scrim for overlays on images
    },
};


export const logoLight = 'https://i.imgur.com/qskYhB0.png';