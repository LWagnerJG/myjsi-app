export const HOME_CHROME_PILL_HEIGHT = 56;

const HOME_CHROME_SURFACES = {
  primary: {
    light: {
      backgroundColor: 'rgba(255,255,255,0.60)',
      border: '1px solid rgba(255,255,255,0.80)',
      boxShadow: '0 4px 20px rgba(53,53,53,0.10)',
    },
    dark: {
      backgroundColor: 'rgba(255,255,255,0.08)',
      border: '1px solid rgba(255,255,255,0.12)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.30)',
    },
  },
  soft: {
    light: {
      backgroundColor: 'rgba(255,255,255,0.54)',
      border: '1px solid rgba(255,255,255,0.74)',
      boxShadow: '0 4px 18px rgba(53,53,53,0.08)',
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
    backgroundColor: active ? 'rgba(255,255,255,0.50)' : 'rgba(255,255,255,0.34)',
    border: '1px solid rgba(255,255,255,0.60)',
  };
}
