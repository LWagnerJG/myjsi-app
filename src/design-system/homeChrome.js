export const HOME_CHROME_PILL_HEIGHT = 56;

export const HOME_SURFACE_LIGHT = 'rgba(255,255,255,0.78)';
export const HOME_SURFACE_DARK = 'rgba(42,42,42,0.82)';

const HOME_CHROME_SURFACES = {
  primary: {
    light: {
      backgroundColor: HOME_SURFACE_LIGHT,
      border: 'none',
      boxShadow: 'none',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
    dark: {
      backgroundColor: 'rgba(255,255,255,0.055)',
      border: 'none',
      boxShadow: '0 2px 14px rgba(0,0,0,0.24)',
    },
  },
  soft: {
    light: {
      backgroundColor: HOME_SURFACE_LIGHT,
      border: 'none',
      boxShadow: 'none',
      backdropFilter: 'none',
      WebkitBackdropFilter: 'none',
    },
    dark: {
      backgroundColor: 'rgba(255,255,255,0.07)',
      border: 'none',
      boxShadow: '0 2px 12px rgba(0,0,0,0.22)',
    },
  },
};

export function getHomeChromePillStyles(isDark, { tone = 'primary' } = {}) {
  const palette = HOME_CHROME_SURFACES[tone]?.[isDark ? 'dark' : 'light'] || HOME_CHROME_SURFACES.primary.light;

  return {
    height: HOME_CHROME_PILL_HEIGHT,
    borderRadius: 9999,
    backdropFilter: 'blur(20px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(20px) saturate(1.6)',
    ...palette,
  };
}

export function getHomeChromeIconButtonStyles(isDark, { active = false } = {}) {
  if (isDark) {
    return {
      backgroundColor: active ? 'rgba(255,255,255,0.095)' : 'rgba(255,255,255,0.058)',
      border: 'none',
    };
  }

  return {
    backgroundColor: active ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
    border: 'none',
  };
}
