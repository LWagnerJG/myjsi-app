/**
 * Scan demo controls (Simulate next scan, DEMO DATA chrome, connection reset).
 * On in local/dev builds, and when VITE_SCAN_DEMO=true is set for a demo deploy.
 * Production stays Camera-scan-first without scripted demo CTAs.
 */
export const isScanDemoEnabled = () =>
    import.meta.env.DEV === true || import.meta.env.VITE_SCAN_DEMO === 'true';
