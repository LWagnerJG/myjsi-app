/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}"
    ],
    safelist: [
        // positioning & layering
        "fixed", "absolute",
        "z-[9999]",

        // overflow overrides
        "overflow-visible", "overflow-y-visible",
        "max-h-none",

        // dropdown flip helpers
        "top-full", "bottom-full",
        "mt-1", "mb-1",

        // rounding
        "rounded-lg", "rounded-xl", "rounded-2xl", "rounded-full",
    ],
    theme: {
        extend: {
            colors: {
                // JSI Primary Colors
                'jsi-white': '#FFFFFF',
                'jsi-dark': '#353535',
                'jsi-beige': '#E3E0D8',
                'jsi-light': '#F0EDE8',
                'jsi-sage': '#DFE2DD',
                'jsi-health': '#EAECE9',
            },
            fontFamily: {
                'grotesk': ['"Neue Haas Grotesk Display Pro"', 'Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
            },
            fontSize: {
                // JSI Typography Scale (scaled for web)
                'h1': ['3rem', { lineHeight: '1.1', fontWeight: '700' }],      // 48px
                'h2': ['2.25rem', { lineHeight: '1.15', fontWeight: '700' }],  // 36px
                'h3': ['1.875rem', { lineHeight: '1.2', fontWeight: '600' }],  // 30px
                'h4': ['1.5rem', { lineHeight: '1.25', fontWeight: '600' }],   // 24px
                'h5': ['1.25rem', { lineHeight: '1.3', fontWeight: '500' }],   // 20px
                'h6': ['1rem', { lineHeight: '1.4', fontWeight: '500' }],      // 16px
                'h7': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],  // 14px
                'h8': ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }], // 13px
                'h9': ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }],   // 12px
            },
        }
    },
    plugins: [],
}
