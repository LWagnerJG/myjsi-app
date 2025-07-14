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
        extend: {}
    },
    plugins: [],
}
