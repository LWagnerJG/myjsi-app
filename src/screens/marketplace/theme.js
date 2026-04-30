import { isDarkTheme } from '../../design-system/tokens.js';

export const getMarketplacePalette = (theme) => {
  const dark = isDarkTheme(theme);

  return {
    dark,
    brand: dark ? '#D7AD6B' : '#A26B2A',
    brandInk: dark ? '#201A13' : '#FFFFFF',
    brandSoft: dark ? 'rgba(215,173,107,0.18)' : 'rgba(162,107,42,0.12)',
    panel: dark ? 'rgba(255,255,255,0.08)' : '#F3EFE7',
    panelStrong: dark ? 'rgba(255,255,255,0.12)' : '#E7E1D6',
    panelSubtle: dark ? 'rgba(255,255,255,0.05)' : '#F8F5EE',
    border: dark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.08)',
    hairline: dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.06)',
    shadow: dark ? '0 10px 30px rgba(0,0,0,0.24)' : '0 12px 30px rgba(32,24,14,0.07)',
    textPrimary: theme.colors.textPrimary,
    textSecondary: theme.colors.textSecondary,
    success: theme.colors.success,
    successSoft: theme.colors.successLight || (dark ? 'rgba(74,124,89,0.18)' : 'rgba(74,124,89,0.10)'),
    warning: theme.colors.warning,
    warningSoft: theme.colors.warningLight || (dark ? 'rgba(196,149,106,0.18)' : 'rgba(196,149,106,0.10)'),
    info: theme.colors.info,
    infoSoft: theme.colors.infoLight || (dark ? 'rgba(91,123,140,0.18)' : 'rgba(91,123,140,0.10)'),
    error: theme.colors.error || '#B85C5C',
    errorSoft: theme.colors.errorLight || (dark ? 'rgba(184,92,92,0.18)' : 'rgba(184,92,92,0.10)'),
  };
};