// Design System Tokens - JSI Visual Identity
// ============================================
// Brand Philosophy: Modern, Accessible, Confident
// Typography: Neue Haas Grotesk Display Pro
// Color Approach: Earth-toned, warm, grounded (NO pure black)

// ============================================
// JSI BRAND COLOR PALETTE
// ============================================
export const JSI_COLORS = {
  // Primary Colors
  charcoal: '#353535',        // Primary text & action color (replaces pure black)
  white: '#FFFFFF',           // High contrast pairing

  // Earth-Toned Neutrals (for backgrounds & soft tonal variations)
  stone: '#E3E0D8',           // Warm neutral
  warmBeige: '#F0EDE8',       // Soft background
  sageGrey: '#DFE2DD',        // Cool neutral
  lightGrey: '#EAECE9',       // Lightest neutral

  // Semantic Colors (adjusted to work with JSI palette)
  success: '#4A7C59',         // Earthy green
  warning: '#C4956A',         // Warm amber
  error: '#B85C5C',           // Muted red
  info: '#5B7B8C',            // Slate blue
};

// ============================================
// TYPOGRAPHY - Neue Haas Grotesk Display Pro
// ============================================
// Based on JSI Digital Style Guide 1.0 Typography & Styles
// Heading levels from style guide: H1 Grotesk 185, H2 Grotesk 132, H3 Grotesk 110,
// H4 Grotesk 72, H5 Grotesk 58, H6 Grotesk 44, H7 Grotesk 26, H8 Grotesk 18/16
// Converting design system scale to responsive rem units
export const JSI_TYPOGRAPHY = {
  fontFamily: '"Neue Haas Grotesk Display Pro", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',

  // Primary Heading Levels from Style Guide (H1-H8)
  // Style guide scale: H1=185, H2=132, H3=110, H4=72, H5=58, H6=44, H7=26, H8=18/16
  // Converted to practical web sizes maintaining proportional hierarchy
  headings: {
    h1: { size: '4.5rem', mobileSize: '2.5rem', weight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' },  // 72px / 40px (Grotesk 185 scale)
    h2: { size: '3.25rem', mobileSize: '2rem', weight: 700, lineHeight: 1.1, letterSpacing: '-0.015em' },    // 52px / 32px (Grotesk 132 scale)
    h3: { size: '2.75rem', mobileSize: '1.75rem', weight: 600, lineHeight: 1.15, letterSpacing: '-0.01em' },  // 44px / 28px (Grotesk 110 scale)
    h4: { size: '2rem', mobileSize: '1.5rem', weight: 600, lineHeight: 1.2, letterSpacing: '-0.005em' },     // 32px / 24px (Grotesk 72 scale)
    h5: { size: '1.625rem', mobileSize: '1.25rem', weight: 600, lineHeight: 1.25, letterSpacing: '0' },      // 26px / 20px (Grotesk 58 scale)
    h6: { size: '1.375rem', mobileSize: '1.125rem', weight: 600, lineHeight: 1.3, letterSpacing: '0' },      // 22px / 18px (Grotesk 44 scale)
    h7: { size: '1.125rem', mobileSize: '1rem', weight: 500, lineHeight: 1.35, letterSpacing: '0' },          // 18px / 16px (Grotesk 26 scale)
    h8: { size: '1rem', mobileSize: '0.875rem', weight: 500, lineHeight: 1.4, letterSpacing: '0' },           // 16px / 14px (Grotesk 18/16 scale)
  },

  // Body text scale (standardized across app)
  // 10px micro → 11px caption → 12px small → 13px compact → 14px body → 15px large → 16px+ headings
  body: {
    large: { size: '1.125rem', weight: 400, lineHeight: 1.6 },    // 18px - text-lg
    default: { size: '1rem', weight: 400, lineHeight: 1.6 },      // 16px - text-base
    bodyLarge: { size: '0.9375rem', weight: 400, lineHeight: 1.5 }, // 15px - card titles
    body: { size: '0.875rem', weight: 400, lineHeight: 1.5 },     // 14px - text-sm (standard body)
    compact: { size: '0.8125rem', weight: 400, lineHeight: 1.5 }, // 13px - body compact
    small: { size: '0.75rem', weight: 500, lineHeight: 1.4 },     // 12px - text-xs (form labels)
    caption: { size: '0.6875rem', weight: 500, lineHeight: 1.3 }, // 11px - captions, meta
    micro: { size: '0.625rem', weight: 600, lineHeight: 1.3 },    // 10px - badges, tracking text
  },

  // Font weights
  weights: {
    light: 300,
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
};

// ============================================
// DESIGN TOKENS (Updated for JSI)
// ============================================
export const DESIGN_TOKENS = {
  // Spacing scale
  spacing: {
    xs: '0.25rem',   // 4px
    sm: '0.5rem',    // 8px
    md: '1rem',      // 16px
    lg: '1.5rem',    // 24px
    xl: '2rem',      // 32px
    '2xl': '3rem',   // 48px
    '3xl': '4rem',   // 64px
  },

  // Border radius - JSI uses pill shapes for interactive elements
  borderRadius: {
    none: '0',
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',           // Content cards
    '2xl': '32px',
    pill: '9999px',       // Primary buttons, badges, tags (STRICT)
    full: '9999px',       // Circular elements
  },

  // Typography (reference to JSI_TYPOGRAPHY - matches style guide hierarchy)
  typography: {
    fontFamily: JSI_TYPOGRAPHY.fontFamily,
    h1: { size: '4.5rem', weight: 700, lineHeight: 1.05, letterSpacing: '-0.02em' },   // Grotesk 185 scale
    h2: { size: '3.25rem', weight: 700, lineHeight: 1.1, letterSpacing: '-0.015em' },  // Grotesk 132 scale
    h3: { size: '2.75rem', weight: 600, lineHeight: 1.15, letterSpacing: '-0.01em' },  // Grotesk 110 scale
    h4: { size: '2rem', weight: 600, lineHeight: 1.2, letterSpacing: '-0.005em' },     // Grotesk 72 scale
    h5: { size: '1.625rem', weight: 600, lineHeight: 1.25, letterSpacing: '0' },       // Grotesk 58 scale
    h6: { size: '1.375rem', weight: 600, lineHeight: 1.3, letterSpacing: '0' },       // Grotesk 44 scale
    h7: { size: '1.125rem', weight: 500, lineHeight: 1.35, letterSpacing: '0' },       // Grotesk 26 scale
    h8: { size: '1rem', weight: 500, lineHeight: 1.4, letterSpacing: '0' },            // Grotesk 18/16 scale
    body: { size: '1rem', weight: 400, lineHeight: 1.6 },
    bodyLarge: { size: '1.125rem', weight: 400, lineHeight: 1.6 },
    small: { size: '0.875rem', weight: 400, lineHeight: 1.5 },
    tiny: { size: '0.75rem', weight: 500, lineHeight: 1.4 },
    micro: { size: '0.625rem', weight: 500, lineHeight: 1.3 },
  },

  // Shadows - minimal, clean
  shadows: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.04)',
    md: '0 1px 4px rgba(0,0,0,0.05)',
    lg: '0 2px 8px rgba(0,0,0,0.06)',
    xl: '0 4px 16px rgba(0,0,0,0.08)',
    '2xl': '0 8px 32px rgba(0,0,0,0.1)',
    card: 'none',
    cardHover: '0 4px 16px rgba(0,0,0,0.08)',
    button: 'none',
    buttonHover: '0 2px 8px rgba(0,0,0,0.08)',
    modal: '0 16px 48px rgba(0,0,0,0.12)',
    drawer: '0 -4px 16px rgba(0,0,0,0.08)',
  },

  // Dark mode shadows - lighter than before
  shadowsDark: {
    none: 'none',
    sm: '0 1px 2px rgba(0,0,0,0.15)',
    md: '0 1px 4px rgba(0,0,0,0.2)',
    lg: '0 2px 8px rgba(0,0,0,0.25)',
    xl: '0 4px 16px rgba(0,0,0,0.3)',
    '2xl': '0 8px 32px rgba(0,0,0,0.35)',
    card: 'none',
    cardHover: '0 4px 16px rgba(0,0,0,0.25)',
    button: 'none',
    buttonHover: '0 2px 8px rgba(0,0,0,0.2)',
    modal: '0 16px 48px rgba(0,0,0,0.4)',
    drawer: '0 -4px 16px rgba(0,0,0,0.25)',
  },

  // Transitions - smooth, confident
  transitions: {
    instant: '0ms',
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '250ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '400ms cubic-bezier(0.4, 0, 0.2, 1)',
    bounce: '400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
    spring: '300ms cubic-bezier(0.3, 1, 0.3, 1)',
    elegant: '350ms cubic-bezier(0.25, 0.1, 0.25, 1)',
  },

  // Z-index scale - carefully layered for proper stacking
  zIndex: {
    base: 0,
    dropdown: 10,
    sticky: 20,
    header: 30,           // App header - should stay visible above modals
    navigation: 40,       // Bottom nav / side rail
    overlay: 50,          // Modal backdrop - dims content but not header
    modalBackdrop: 50,    // Alias for overlay
    modal: 60,            // Modal content - above nav
    popover: 70,          // Popovers/dropdowns in modals
    tooltip: 80,
    toast: 90,
  },

  // Max-width for responsive layouts
  maxWidth: {
    sm: '480px',
    md: '640px',
    lg: '768px',
    xl: '896px',
    '2xl': '1024px',
    '3xl': '1152px',
    '4xl': '1280px',
    '5xl': '1440px',
    '6xl': '1680px',
    '7xl': '1920px',
    content: '1440px', // Standard JSI content capping
  },

  // Navigation heights for layout calculations
  layout: {
    headerHeight: '76px',
    mobileNavHeight: '80px',        // Mobile bottom nav bar height
    mobileNavBottomOffset: '16px',  // Bottom offset of mobile nav
    desktopSidebarWidth: '96px',    // lg:pl-24 = 6rem = 96px
  },

  // Blur effects for overlays (JSI brand - Style Guide Page 17)
  blur: {
    light: 'blur(24px)',      // Background Blur 24
    medium: 'blur(34px)',     // Background Blur 34
    heavy: 'blur(44px)',      // Background Blur 44
  },

  // Backdrop filter values (glassmorphism)
  backdropBlur: {
    frost24: '24px',
    frost34: '34px',
    frost44: '44px',
  },

  // Frost glass button presets (simplified)
  frost: {
    dark: {
      background: '#2A2A2A',
      color: '#FFFFFF',
      backdropFilter: 'none',
      boxShadow: 'none',
    },
    light: {
      background: '#FFFFFF',
      color: '#353535',
      backdropFilter: 'none',
      boxShadow: 'none',
    },
  },
};

// ============================================
// STATUS STYLES (Updated for JSI palette)
// ============================================
export const STATUS_STYLES = {
  success: {
    bg: `${JSI_COLORS.success}15`,
    color: JSI_COLORS.success,
    darkBg: `${JSI_COLORS.success}25`,
    darkColor: '#6B9B7A'
  },
  warning: {
    bg: `${JSI_COLORS.warning}15`,
    color: JSI_COLORS.warning,
    darkBg: `${JSI_COLORS.warning}25`,
    darkColor: '#D4A87A'
  },
  error: {
    bg: `${JSI_COLORS.error}15`,
    color: JSI_COLORS.error,
    darkBg: `${JSI_COLORS.error}25`,
    darkColor: '#C87070'
  },
  info: {
    bg: `${JSI_COLORS.info}15`,
    color: JSI_COLORS.info,
    darkBg: `${JSI_COLORS.info}25`,
    darkColor: '#7B9BAC'
  },
  pending: {
    bg: `${JSI_COLORS.charcoal}10`,
    color: '#666666',
    darkBg: `${JSI_COLORS.charcoal}20`,
    darkColor: '#999999'
  },
  accent: {
    bg: `${JSI_COLORS.charcoal}08`,
    color: JSI_COLORS.charcoal,
    darkBg: `${JSI_COLORS.charcoal}15`,
    darkColor: '#555555'
  },
  new: {
    bg: JSI_COLORS.charcoal,
    color: JSI_COLORS.white,
    darkBg: JSI_COLORS.white,
    darkColor: JSI_COLORS.charcoal
  },
  quickship: {
    bg: JSI_COLORS.success,
    color: JSI_COLORS.white,
    darkBg: '#6B9B7A',
    darkColor: JSI_COLORS.white
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

// Get spacing value
export const spacing = (key) => DESIGN_TOKENS.spacing[key] || DESIGN_TOKENS.spacing.md;

// Get border radius
export const radius = (key) => DESIGN_TOKENS.borderRadius[key] || DESIGN_TOKENS.borderRadius.md;

// Check if dark theme
export const isDarkTheme = (theme) => {
  const bg = (theme?.colors?.background || '').toLowerCase();
  return bg.startsWith('#0') || bg.startsWith('#1') || bg.startsWith('#2') ||
    bg.startsWith('rgb(0') || bg.startsWith('rgb(1') || bg.startsWith('rgb(2');
};

// Get shadow based on theme
export const shadow = (key, theme) => {
  const shadows = isDarkTheme(theme) ? DESIGN_TOKENS.shadowsDark : DESIGN_TOKENS.shadows;
  return shadows[key] || shadows.md;
};

// Get transition
export const transition = (key) => DESIGN_TOKENS.transitions[key] || DESIGN_TOKENS.transitions.normal;

// Get max-width class
export const getMaxWidthClass = (size = 'lg') => {
  const map = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-3xl',
    xl: 'max-w-4xl',
    '2xl': 'max-w-5xl',
    '3xl': 'max-w-6xl',
    '4xl': 'max-w-7xl',
    '5xl': 'max-w-[1440px]',
    '6xl': 'max-w-[1680px]',
    '7xl': 'max-w-[1920px]',
    content: 'max-w-[1440px]',
  };
  return map[size] || map.lg;
};

// Get JSI color
export const getJSIColor = (key) => JSI_COLORS[key] || JSI_COLORS.charcoal;

// Get typography style
export const getTypography = (variant) => {
  return DESIGN_TOKENS.typography[variant] || DESIGN_TOKENS.typography.body;
};

// ============================================
// STYLE UTILITIES FOR CONSISTENCY
// ============================================

// Text color for use on accent backgrounds (buttons, badges)
// Always use this instead of hardcoding '#fff' or '#FFFFFF'
export const getAccentTextColor = () => JSI_COLORS.white;

// Primary button styles (filled accent background)
export const getPrimaryButtonStyles = (theme) => ({
  backgroundColor: theme?.colors?.accent || JSI_COLORS.charcoal,
  color: JSI_COLORS.white,
  border: 'none',
  boxShadow: DESIGN_TOKENS.shadows.button,
});

// Secondary button styles (outlined/subtle)
export const getSecondaryButtonStyles = (theme) => ({
  backgroundColor: theme?.colors?.surface || JSI_COLORS.white,
  color: theme?.colors?.textPrimary || JSI_COLORS.charcoal,
  border: `1.5px solid ${theme?.colors?.border || JSI_COLORS.stone}`,
  boxShadow: 'none',
});

// Input field styles
export const getInputStyles = (theme) => ({
  backgroundColor: theme?.colors?.surface || JSI_COLORS.white,
  color: theme?.colors?.textPrimary || JSI_COLORS.charcoal,
  border: `1px solid ${theme?.colors?.border || JSI_COLORS.stone}`,
  borderRadius: DESIGN_TOKENS.borderRadius.lg,
});

// Toggle/pill button styles (for segmented controls)
export const getToggleButtonStyles = (theme, isActive) => ({
  backgroundColor: isActive
    ? (theme?.colors?.accent || JSI_COLORS.charcoal)
    : (theme?.colors?.surface || JSI_COLORS.white),
  color: isActive
    ? JSI_COLORS.white
    : (theme?.colors?.textSecondary || '#666666'),
  borderColor: isActive
    ? (theme?.colors?.accent || JSI_COLORS.charcoal)
    : (theme?.colors?.border || JSI_COLORS.stone),
});

// Card shadow utility
export const getCardShadow = (variant = 'elevated', theme) => {
  const shadows = isDarkTheme(theme) ? DESIGN_TOKENS.shadowsDark : DESIGN_TOKENS.shadows;
  switch (variant) {
    case 'elevated': return shadows.card;
    case 'hover': return shadows.cardHover;
    case 'modal': return shadows.modal;
    case 'minimal': return shadows.md;
    default: return shadows.none;
  }
};

// Drawer shadow (for bottom sheets / cart drawers)
export const getDrawerShadow = (isExpanded) => ({
  expanded: '0 -6px 22px -4px rgba(0,0,0,0.25)',
  collapsed: '0 -6px 14px -2px rgba(0,0,0,0.18), 0 -1px 0 rgba(0,0,0,0.08)',
})[isExpanded ? 'expanded' : 'collapsed'];
