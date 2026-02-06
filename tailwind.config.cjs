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
                jsi: {
                    charcoal: '#353535',
                    white: '#FFFFFF',
                    stone: '#E3E0D8',
                    'warm-beige': '#F0EDE8',
                    'sage-grey': '#DFE2DD',
                    'light-grey': '#EAECE9',
                    success: '#4A7C59',
                    warning: '#C4956A',
                    error: '#B85C5C',
                    info: '#5B7B8C',
                },
            },
            fontFamily: {
                sans: ['"Neue Haas Grotesk Display Pro"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
            },
            borderRadius: {
                'card': '24px',
                'input': '24px',
                'pill': '9999px',
            },
            boxShadow: {
                'card': '0 4px 20px rgba(53,53,53,0.07), 0 2px 6px rgba(53,53,53,0.03)',
                'card-hover': '0 8px 32px rgba(53,53,53,0.12), 0 4px 12px rgba(53,53,53,0.06)',
                'modal': '0 24px 64px rgba(53,53,53,0.18), 0 12px 28px rgba(53,53,53,0.1)',
            },
            spacing: {
                'header': '72px',
                'header-lg': '76px',
            },
        }
    },
    plugins: [],
}
