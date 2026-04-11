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
      backgroundColor: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.30)',
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
      backgroundColor: 'rgba(255,255,255,0.12)',
      border: '1px solid rgba(255,255,255,0.11)',
      boxShadow: '0 4px 18px rgba(0,0,0,0.26)',
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
      backgroundColor: active ? 'rgba(255,255,255,0.14)' : 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.10)',
    };
  }

  return {
    backgroundColor: active ? 'rgba(255,255,255,0.32)' : 'rgba(255,255,255,0.18)',
    border: 'none',
  };
}
