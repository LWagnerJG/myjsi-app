// Central design tokens for spacing, radii, shadows, animation, z-index, etc.
// Consuming components should use these tokens to avoid magic numbers.
export const spacing = Object.freeze({
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
});

export const radii = Object.freeze({
  xs: 4,
  sm: 6,
  md: 10,
  lg: 16,
  xl: 24,
  pill: 999,
});

export const shadows = Object.freeze({
  xs: '0 1px 2px rgba(0,0,0,0.06)',
  sm: '0 2px 4px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.12)',
  lg: '0 8px 24px rgba(0,0,0,0.18)',
});

export const transitions = Object.freeze({
  fast: '120ms cubic-bezier(.4,0,.2,1)',
  base: '200ms cubic-bezier(.4,0,.2,1)',
  slow: '360ms cubic-bezier(.4,0,.2,1)',
});

export const z = Object.freeze({
  header: 50,
  overlay: 1000,
  modal: 1100,
  toast: 1200,
});

export const opacities = Object.freeze({
  hover: 0.08,
  active: 0.16,
});

export const designTokens = { spacing, radii, shadows, transitions, z, opacities };

// Helper to apply px unit quickly
export const px = (n) => `${n}px`;
