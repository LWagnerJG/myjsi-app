import React, { useEffect, useState } from 'react';
import { ArrowRight, X } from 'lucide-react';

// === jsifurniture.com type system =========================================
// The real site loads Adobe Typekit kit `bfr0acp` which gives it
// `neue-haas-grotesk-display` (headings, weight 500) and
// `neue-haas-grotesk-text` (body). We load the same kit at runtime
// so this easter-egg page is rendered with the actual brand fonts.
const TYPEKIT_HREF = 'https://use.typekit.net/bfr0acp.css';
const FONT_DISPLAY = '"neue-haas-grotesk-display", "Helvetica Neue", Helvetica, Arial, sans-serif';
const FONT_TEXT = '"neue-haas-grotesk-text", "Helvetica Neue", Helvetica, Arial, sans-serif';

// === Brand palette (sampled from the live site) ===========================
const INK = '#353535';      // primary ink and JSI brand color
const HAIRLINE = '#ccc';     // hero hairline divider
const PAGE_BG = '#FFFFFF';
const SOFT_BG = '#F4F0E8';
const CARD_BG = '#EFEBE3';

// === JSI logo (extracted directly from jsifurniture.com SVG) =============
const JSILogo = ({ width = 76, color = INK, className = '' }) => (
    <svg
        width={width}
        viewBox="0 0 497 162"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ color, display: 'block' }}
        aria-label="JSI"
    >
        <g>
            <path
                d="M104.924,65.713C104.924,64.461 105.949,63.437 107.201,63.437L138.725,63.437C139.978,63.437 141.002,64.461 141.002,65.713L141.002,79.156L104.924,79.156L104.924,65.713ZM195.558,0.033L18.213,0.033C8.154,0.033 0,8.187 0,18.246L0,159.701C0,160.958 1.019,161.978 2.276,161.978L18.213,161.978C19.47,161.978 20.49,160.958 20.49,159.701L20.49,29.642C20.49,24.879 24.307,20.522 29.601,20.522L184.177,20.522C189.313,20.522 193.281,24.677 193.281,29.63L193.281,139.233C193.281,140.491 192.262,141.51 191.004,141.51L65.416,141.51C64.158,141.51 63.139,140.491 63.139,139.233L63.139,101.911C63.139,100.822 64.016,99.646 65.422,99.646L159.215,99.646C160.473,99.646 161.492,98.626 161.492,97.369L161.492,61.16C161.492,51.101 153.338,42.947 143.279,42.947L102.648,42.947C92.588,42.947 84.434,51.101 84.434,61.16L84.434,79.156L51.756,79.156C46.726,79.156 42.649,83.233 42.649,88.262L42.649,159.723C42.649,160.981 43.668,162 44.926,162L211.494,162C212.752,162 213.771,160.981 213.771,159.723L213.771,18.246C213.771,8.187 205.617,0.033 195.558,0.033Z"
                fill="currentColor"
            />
            <path
                d="M475.275,2.371L475.275,159.661C475.275,160.95 476.32,161.995 477.609,161.995L494.374,161.995C495.662,161.995 496.707,160.95 496.707,159.661L496.707,2.371C496.707,1.083 495.662,0.038 494.374,0.038L477.609,0.038C476.32,0.038 475.275,1.083 475.275,2.371Z"
                fill="currentColor"
            />
            <path
                d="M256.842,0.034C246.756,0.034 238.581,8.21 238.581,18.296L238.581,68.704C238.581,78.79 246.756,86.965 256.842,86.965L424.014,86.965C429.064,86.965 433.158,91.058 433.158,96.108L433.158,132.299C433.158,137.349 429.064,141.443 424.014,141.443L240.92,141.443C239.628,141.443 238.581,142.49 238.581,143.782L238.581,159.656C238.581,160.948 239.628,161.995 240.92,161.995L433.439,161.995C443.525,161.995 451.7,153.82 451.7,143.734L451.7,89.586C451.7,79.5 443.525,71.325 433.439,71.325L266.267,71.325C261.218,71.325 257.124,67.232 257.124,62.182L257.124,29.696C257.124,24.646 261.218,20.553 266.267,20.553L450.503,20.553C451.794,20.553 452.842,19.505 452.842,18.213L452.842,2.339C452.842,1.047 451.794,0 450.503,0L256.842,0.034Z"
                fill="currentColor"
            />
        </g>
    </svg>
);

// === jsifurniture.com "Explore More" pill button =========================
// Sweep-up label animation matches the .styles_button-field__6Kr_S style.
const SitePill = ({ children, dark = false, small = false }) => {
    const fg = dark ? '#FFFFFF' : INK;
    const bg = 'transparent';
    return (
        <button
            type="button"
            className="group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap"
            style={{
                fontFamily: FONT_TEXT,
                fontWeight: 600,
                fontSize: small ? 11 : 17,
                minWidth: small ? 130 : 170,
                height: small ? 30 : 45,
                borderRadius: 30,
                padding: '0 22px',
                color: fg,
                background: bg,
                border: `${small ? 1 : 1.5}px solid ${fg}`,
                letterSpacing: '0.01em',
                transition: 'background-color .25s ease, color .25s ease',
            }}
            onMouseEnter={(event) => {
                event.currentTarget.style.background = fg;
                event.currentTarget.style.color = dark ? INK : '#FFFFFF';
            }}
            onMouseLeave={(event) => {
                event.currentTarget.style.background = bg;
                event.currentTarget.style.color = fg;
            }}
        >
            <span>{children}</span>
            <ArrowRight style={{ width: small ? 14 : 18, height: small ? 14 : 18 }} className="transition group-hover:translate-x-0.5" />
        </button>
    );
};

// =========================================================================
export const LawFirmsLandingConcept = ({ concept, onClose }) => {
    const [activeNav, setActiveNav] = useState(concept.sections[0]?.label);

    // Inject Typekit on mount, remove on unmount.
    useEffect(() => {
        if (typeof document === 'undefined') return undefined;
        const id = 'jsi-typekit-bfr0acp';
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = TYPEKIT_HREF;
            document.head.appendChild(link);
        }
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    return (
        <div
            className="fixed inset-0 z-[60] overflow-y-auto scrollbar-hide"
            style={{
                background: PAGE_BG,
                color: INK,
                fontFamily: FONT_TEXT,
                fontSize: 17,
                lineHeight: 1.55,
                WebkitFontSmoothing: 'antialiased',
            }}
        >
            {/* ============ Site nav ============ */}
            <header
                className="sticky top-0 z-40 w-full"
                style={{
                    background: 'rgba(255,255,255,0.96)',
                    backdropFilter: 'saturate(1.1) blur(8px)',
                    borderBottom: `1px solid ${HAIRLINE}`,
                }}
            >
                <nav className="mx-auto flex items-center justify-between" style={{ maxWidth: 1440, padding: '18px 30px' }}>
                    <a href="#top" aria-label="JSI Home" style={{ color: INK }}>
                        <JSILogo width={76} color={INK} />
                    </a>
                    <ul
                        className="hidden lg:flex items-center"
                        style={{ gap: 36, fontFamily: FONT_TEXT, fontSize: 15, fontWeight: 500, color: INK, letterSpacing: '0.02em' }}
                    >
                        {['Spaces', 'Products', 'Inspiration', 'Resources', 'About', 'Contact'].map((item) => (
                            <li key={item} className="cursor-default" style={{ opacity: 0.92 }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                    <button
                        type="button"
                        onClick={onClose}
                        className="inline-flex items-center gap-2"
                        style={{
                            fontFamily: FONT_TEXT,
                            fontSize: 12,
                            fontWeight: 600,
                            letterSpacing: '0.14em',
                            textTransform: 'uppercase',
                            color: INK,
                            border: `1px solid ${INK}`,
                            borderRadius: 30,
                            height: 36,
                            padding: '0 16px',
                            background: 'transparent',
                        }}
                        aria-label="Exit Law Firm Spaces"
                    >
                        <X style={{ width: 14, height: 14 }} /> Close
                    </button>
                </nav>
            </header>

            <main id="top">
                {/* ============ Simple Hero — mirrors simple-hero_mainSection ============ */}
                <section className="relative" style={{ padding: '40px 0 0' }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <div
                            className="relative overflow-hidden text-white"
                            style={{ borderRadius: 30, aspectRatio: '2.6 / 1', width: '100%' }}
                        >
                            <img
                                src={concept.heroImage}
                                alt={concept.title}
                                className="absolute inset-0 w-full h-full object-cover"
                                style={{ borderRadius: 30 }}
                            />
                            <div
                                className="absolute inset-0"
                                style={{
                                    background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(0,0,0,0.65) 100%)',
                                    borderRadius: 30,
                                }}
                            />
                            <div
                                className="absolute left-0 right-0"
                                style={{ bottom: 40, padding: '0 50px' }}
                            >
                                <h1
                                    style={{
                                        fontFamily: FONT_DISPLAY,
                                        fontWeight: 500,
                                        color: '#FFFFFF',
                                        fontSize: 'clamp(48px, 7.6vw, 110px)',
                                        lineHeight: 1.02,
                                        letterSpacing: '-0.02em',
                                        margin: 0,
                                    }}
                                >
                                    {concept.title}
                                </h1>
                            </div>
                        </div>

                        {/* Hairline */}
                        <div style={{ width: '100%', height: 1, background: HAIRLINE, margin: '24px 0 0' }} />

                        {/* Subtext + numbered nav row (mirrors page sub-nav strip) */}
                        <div
                            className="flex flex-col lg:flex-row items-start lg:items-end justify-between"
                            style={{ gap: 24, padding: '24px 0 36px' }}
                        >
                            <p
                                style={{
                                    flex: 1,
                                    fontFamily: FONT_TEXT,
                                    fontSize: 19,
                                    lineHeight: 1.55,
                                    color: INK,
                                    maxWidth: 720,
                                    margin: 0,
                                }}
                            >
                                {concept.subtitle}
                            </p>
                            <div
                                className="flex flex-wrap items-center"
                                style={{ gap: 28, fontFamily: FONT_TEXT, fontSize: 15, color: INK }}
                            >
                                {concept.sections.map((section) => {
                                    const active = activeNav === section.label;
                                    return (
                                        <button
                                            key={section.number}
                                            type="button"
                                            onClick={() => setActiveNav(section.label)}
                                            className="inline-flex items-baseline"
                                            style={{ gap: 10, color: INK, fontFamily: FONT_TEXT }}
                                        >
                                            <span style={{ fontWeight: 600, color: active ? INK : '#9A9A9A' }}>{section.number}</span>
                                            <span
                                                style={{
                                                    fontWeight: 500,
                                                    borderBottom: active ? `1.5px solid ${INK}` : '1.5px solid transparent',
                                                    paddingBottom: 2,
                                                    transition: 'border-color .2s',
                                                }}
                                            >
                                                {section.label}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ Featured Products card grid (mirrors styles_card-outer) ============ */}
                <section style={{ padding: '60px 0 80px', background: PAGE_BG }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <div className="flex items-end justify-between mb-12 flex-wrap" style={{ gap: 24 }}>
                            <h2
                                style={{
                                    fontFamily: FONT_DISPLAY,
                                    fontWeight: 500,
                                    color: INK,
                                    fontSize: 'clamp(36px, 4.6vw, 60px)',
                                    lineHeight: 1.05,
                                    letterSpacing: '-0.02em',
                                    margin: 0,
                                }}
                            >
                                Featured Products
                            </h2>
                            <SitePill>Browse All</SitePill>
                        </div>

                        <div
                            className="overflow-x-auto scrollbar-hide -mx-[30px] px-[30px]"
                            style={{ paddingBottom: 30 }}
                        >
                            <div className="flex" style={{ gap: 20 }}>
                                {concept.featuredProducts.map((product) => (
                                    <article
                                        key={product.label}
                                        className="relative overflow-hidden flex-shrink-0"
                                        style={{
                                            width: 'min(450px, 85vw)',
                                            aspectRatio: '450 / 506',
                                            borderRadius: 45,
                                        }}
                                    >
                                        <img
                                            src={product.image}
                                            alt={product.label}
                                            className="absolute inset-0 w-full h-full"
                                            style={{ borderRadius: 45, objectFit: 'cover' }}
                                            loading="lazy"
                                        />
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                borderRadius: 45,
                                                background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.6) 100%)',
                                                pointerEvents: 'none',
                                            }}
                                        />
                                        <div
                                            className="absolute inset-0 flex flex-col justify-end"
                                            style={{ color: '#FFFFFF', padding: '0 0 26px' }}
                                        >
                                            <p
                                                style={{
                                                    fontFamily: FONT_TEXT,
                                                    fontSize: 14,
                                                    fontWeight: 600,
                                                    letterSpacing: '0.18em',
                                                    textTransform: 'uppercase',
                                                    opacity: 0.85,
                                                    padding: '6px 24px',
                                                    margin: 0,
                                                }}
                                            >
                                                {product.category}
                                            </p>
                                            <h3
                                                style={{
                                                    fontFamily: FONT_DISPLAY,
                                                    fontWeight: 500,
                                                    fontSize: 38,
                                                    lineHeight: '44px',
                                                    padding: '6px 24px',
                                                    margin: 0,
                                                }}
                                            >
                                                {product.label}
                                            </h3>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ Spaces grid (mirrors styles_grid 4-up) ============ */}
                <section style={{ padding: '40px 0 100px', background: PAGE_BG }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <h2
                            style={{
                                fontFamily: FONT_DISPLAY,
                                fontWeight: 500,
                                color: INK,
                                fontSize: 'clamp(36px, 4.6vw, 60px)',
                                lineHeight: 1.05,
                                letterSpacing: '-0.02em',
                                margin: '0 0 48px',
                                maxWidth: 900,
                            }}
                        >
                            A Space for Every Part of the Practice
                        </h2>

                        <div
                            className="grid"
                            style={{ gap: '4.5rem 2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
                        >
                            {concept.spaces.map((space) => (
                                <article key={space.slug}>
                                    <div
                                        className="overflow-hidden mb-6"
                                        style={{
                                            borderRadius: 30,
                                            aspectRatio: '4 / 3',
                                            background: CARD_BG,
                                        }}
                                    >
                                        <img
                                            src={space.image}
                                            alt={space.title}
                                            className="w-full h-full"
                                            style={{ objectFit: 'cover', borderRadius: 30 }}
                                            loading="lazy"
                                        />
                                    </div>
                                    <h3
                                        style={{
                                            fontFamily: FONT_DISPLAY,
                                            fontWeight: 500,
                                            fontSize: 28,
                                            lineHeight: 1.15,
                                            letterSpacing: '-0.01em',
                                            color: INK,
                                            margin: '0 0 12px',
                                        }}
                                    >
                                        {space.title}
                                    </h3>
                                    <p
                                        style={{
                                            fontFamily: FONT_TEXT,
                                            fontSize: 17,
                                            lineHeight: 1.55,
                                            color: INK,
                                            opacity: 0.86,
                                            margin: '0 0 22px',
                                            maxWidth: 460,
                                        }}
                                    >
                                        {space.body}
                                    </p>
                                    <SitePill>Explore More</SitePill>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ Designed Your Way — full-bleed editorial ============ */}
                <section style={{ background: SOFT_BG, padding: '90px 0' }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <div className="grid lg:grid-cols-12" style={{ gap: 48, alignItems: 'center' }}>
                            <div className="lg:col-span-6 order-2 lg:order-1">
                                <p
                                    style={{
                                        fontFamily: FONT_TEXT,
                                        fontSize: 13,
                                        fontWeight: 600,
                                        letterSpacing: '0.22em',
                                        textTransform: 'uppercase',
                                        color: INK,
                                        opacity: 0.6,
                                        margin: '0 0 18px',
                                    }}
                                >
                                    {concept.designedYourWay.eyebrow}
                                </p>
                                <h2
                                    style={{
                                        fontFamily: FONT_DISPLAY,
                                        fontWeight: 500,
                                        color: INK,
                                        fontSize: 'clamp(34px, 4.4vw, 56px)',
                                        lineHeight: 1.05,
                                        letterSpacing: '-0.02em',
                                        margin: '0 0 24px',
                                    }}
                                >
                                    {concept.designedYourWay.title}
                                </h2>
                                <p
                                    style={{
                                        fontFamily: FONT_TEXT,
                                        fontSize: 18,
                                        lineHeight: 1.6,
                                        color: INK,
                                        opacity: 0.86,
                                        maxWidth: 540,
                                        margin: '0 0 32px',
                                    }}
                                >
                                    {concept.designedYourWay.body}
                                </p>
                                <SitePill>Talk to Custom</SitePill>
                            </div>
                            <div className="lg:col-span-6 order-1 lg:order-2">
                                <div
                                    className="overflow-hidden"
                                    style={{ borderRadius: 30, aspectRatio: '4 / 3', background: CARD_BG }}
                                >
                                    <img
                                        src={concept.designedYourWay.image}
                                        alt="Designed Your Way"
                                        className="w-full h-full"
                                        style={{ objectFit: 'cover' }}
                                        loading="lazy"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ Featured Installation ============ */}
                <section style={{ padding: '100px 0', background: PAGE_BG }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <p
                            style={{
                                fontFamily: FONT_TEXT,
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: INK,
                                opacity: 0.6,
                                margin: '0 0 18px',
                            }}
                        >
                            {concept.installation.eyebrow}
                        </p>
                        <h2
                            style={{
                                fontFamily: FONT_DISPLAY,
                                fontWeight: 500,
                                color: INK,
                                fontSize: 'clamp(36px, 4.6vw, 60px)',
                                lineHeight: 1.05,
                                letterSpacing: '-0.02em',
                                margin: '0 0 40px',
                                maxWidth: 1000,
                            }}
                        >
                            {concept.installation.title}
                        </h2>
                        <div
                            className="overflow-hidden"
                            style={{ borderRadius: 30, aspectRatio: '2.6 / 1', background: CARD_BG }}
                        >
                            <img
                                src={concept.installation.image}
                                alt={concept.installation.title}
                                className="w-full h-full"
                                style={{ objectFit: 'cover' }}
                                loading="lazy"
                            />
                        </div>
                        <div className="grid lg:grid-cols-12 mt-8" style={{ gap: 32 }}>
                            <p
                                className="lg:col-span-7"
                                style={{
                                    fontFamily: FONT_TEXT,
                                    fontSize: 18,
                                    lineHeight: 1.6,
                                    color: INK,
                                    opacity: 0.86,
                                    margin: 0,
                                }}
                            >
                                {concept.installation.body}
                            </p>
                            <div className="lg:col-span-5 flex flex-col items-start lg:items-end" style={{ gap: 16 }}>
                                <p style={{ fontFamily: FONT_TEXT, fontSize: 13, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: INK, opacity: 0.6, margin: 0 }}>
                                    {concept.installation.meta}
                                </p>
                                <SitePill>View Installation</SitePill>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ============ Solutions / Contracts ============ */}
                <section style={{ padding: '70px 0', background: SOFT_BG }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <h2
                            style={{
                                fontFamily: FONT_DISPLAY,
                                fontWeight: 500,
                                color: INK,
                                fontSize: 'clamp(28px, 3.4vw, 44px)',
                                lineHeight: 1.1,
                                letterSpacing: '-0.02em',
                                margin: '0 0 36px',
                            }}
                        >
                            Procurement Solutions
                        </h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: 20 }}>
                            {concept.contracts.map((contract) => (
                                <div
                                    key={contract.label}
                                    style={{
                                        background: PAGE_BG,
                                        borderRadius: 30,
                                        padding: '32px 28px',
                                        border: `1px solid ${HAIRLINE}`,
                                    }}
                                >
                                    <p
                                        style={{
                                            fontFamily: FONT_DISPLAY,
                                            fontWeight: 500,
                                            color: INK,
                                            fontSize: 32,
                                            lineHeight: 1.1,
                                            letterSpacing: '-0.01em',
                                            margin: '0 0 8px',
                                        }}
                                    >
                                        {contract.label}
                                    </p>
                                    <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: INK, opacity: 0.7, margin: 0 }}>
                                        {contract.note}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ Literature & Resources ============ */}
                <section style={{ padding: '90px 0', background: PAGE_BG }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <div className="flex items-end justify-between mb-12 flex-wrap" style={{ gap: 24 }}>
                            <h2
                                style={{
                                    fontFamily: FONT_DISPLAY,
                                    fontWeight: 500,
                                    color: INK,
                                    fontSize: 'clamp(36px, 4.6vw, 56px)',
                                    lineHeight: 1.05,
                                    letterSpacing: '-0.02em',
                                    margin: 0,
                                }}
                            >
                                Literature &amp; Resources
                            </h2>
                            <SitePill>View All</SitePill>
                        </div>
                        <div
                            className="grid"
                            style={{ gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}
                        >
                            {concept.resources.map((resource) => (
                                <div key={resource.label}>
                                    <div
                                        className="overflow-hidden mb-5"
                                        style={{ borderRadius: 30, aspectRatio: '4 / 5', background: CARD_BG }}
                                    >
                                        <img
                                            src={resource.image}
                                            alt={resource.label}
                                            className="w-full h-full"
                                            style={{ objectFit: 'cover' }}
                                            loading="lazy"
                                        />
                                    </div>
                                    <p
                                        style={{
                                            fontFamily: FONT_TEXT,
                                            fontSize: 12,
                                            fontWeight: 600,
                                            letterSpacing: '0.18em',
                                            textTransform: 'uppercase',
                                            color: INK,
                                            opacity: 0.6,
                                            margin: '0 0 10px',
                                        }}
                                    >
                                        {resource.kind}
                                    </p>
                                    <p
                                        style={{
                                            fontFamily: FONT_DISPLAY,
                                            fontWeight: 500,
                                            fontSize: 24,
                                            lineHeight: 1.2,
                                            letterSpacing: '-0.01em',
                                            color: INK,
                                            margin: 0,
                                        }}
                                    >
                                        {resource.label}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ Talk to a Rep ============ */}
                <section style={{ padding: '90px 0', background: SOFT_BG }}>
                    <div className="mx-auto" style={{ maxWidth: 1440, padding: '0 30px' }}>
                        <p
                            style={{
                                fontFamily: FONT_TEXT,
                                fontSize: 13,
                                fontWeight: 600,
                                letterSpacing: '0.22em',
                                textTransform: 'uppercase',
                                color: INK,
                                opacity: 0.6,
                                margin: '0 0 18px',
                            }}
                        >
                            Still need help? Get in touch.
                        </p>
                        <h2
                            style={{
                                fontFamily: FONT_DISPLAY,
                                fontWeight: 500,
                                color: INK,
                                fontSize: 'clamp(36px, 4.6vw, 60px)',
                                lineHeight: 1.05,
                                letterSpacing: '-0.02em',
                                margin: '0 0 16px',
                            }}
                        >
                            Talk to a Rep
                        </h2>
                        <p
                            style={{
                                fontFamily: FONT_TEXT,
                                fontSize: 17,
                                lineHeight: 1.6,
                                color: INK,
                                opacity: 0.85,
                                maxWidth: 720,
                                margin: '0 0 48px',
                            }}
                        >
                            Our area of expertise includes solid wood, veneers, laminate, metal, solid surface and glass — and we partner with the design firm from concept through installation.
                        </p>
                        <div className="grid" style={{ gap: 24, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
                            {concept.reps.map((rep) => (
                                <div
                                    key={rep.name}
                                    style={{
                                        background: PAGE_BG,
                                        borderRadius: 30,
                                        padding: '36px 32px',
                                        border: `1px solid ${HAIRLINE}`,
                                    }}
                                >
                                    <div
                                        style={{
                                            width: 64,
                                            height: 64,
                                            borderRadius: '50%',
                                            background: SOFT_BG,
                                            color: INK,
                                            fontFamily: FONT_DISPLAY,
                                            fontSize: 22,
                                            fontWeight: 500,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            marginBottom: 22,
                                        }}
                                    >
                                        {rep.name.split(' ').map((n) => n[0]).join('')}
                                    </div>
                                    <p
                                        style={{
                                            fontFamily: FONT_DISPLAY,
                                            fontWeight: 500,
                                            fontSize: 24,
                                            lineHeight: 1.2,
                                            color: INK,
                                            margin: '0 0 6px',
                                        }}
                                    >
                                        {rep.name}
                                    </p>
                                    <p
                                        style={{
                                            fontFamily: FONT_TEXT,
                                            fontSize: 14,
                                            color: INK,
                                            opacity: 0.7,
                                            margin: '0 0 22px',
                                        }}
                                    >
                                        {rep.territory}
                                    </p>
                                    <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: INK, margin: '0 0 4px', fontWeight: 500 }}>{rep.email}</p>
                                    <p style={{ fontFamily: FONT_TEXT, fontSize: 15, color: INK, margin: 0, fontWeight: 500 }}>{rep.phone}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ============ Footer (mirrors footer_footer__ grid) ============ */}
                <footer style={{ background: INK, color: '#FFFFFF' }}>
                    <div
                        className="mx-auto"
                        style={{
                            maxWidth: 1440,
                            padding: '64px 30px',
                            display: 'grid',
                            gridTemplateColumns: '116px 1fr auto',
                            gridTemplateAreas: '"logo columns newsletter" "divider divider divider" "bottom bottom bottom"',
                            gap: '0 80px',
                            fontFamily: FONT_TEXT,
                        }}
                    >
                        <div style={{ gridArea: 'logo' }}>
                            <JSILogo width={116} color="#FFFFFF" />
                            <p style={{ marginTop: 24, fontSize: 14, lineHeight: 1.6, color: 'rgba(255,255,255,0.78)' }}>
                                225 Clay Street<br />Jasper, IN 47546
                            </p>
                        </div>

                        <div
                            style={{
                                gridArea: 'columns',
                                display: 'grid',
                                gridTemplateColumns: 'repeat(3, 1fr)',
                                gap: '2rem',
                                lineHeight: 2.2,
                                fontSize: 15,
                                letterSpacing: '0.5px',
                            }}
                        >
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: 6 }}>About Us</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li>Our Story</li>
                                    <li>Our Craft</li>
                                    <li>Sustainability</li>
                                    <li>Design Studio</li>
                                    <li>Careers</li>
                                    <li>Podcast</li>
                                </ul>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: 6 }}>Showrooms</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li>Chicago</li>
                                    <li>Washington DC</li>
                                </ul>
                            </div>
                            <div>
                                <p style={{ fontWeight: 700, marginBottom: 6 }}>Contact Us</p>
                                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                                    <li>P 800.457.4511</li>
                                    <li>F 812.482.1548</li>
                                </ul>
                            </div>
                        </div>

                        <div style={{ gridArea: 'newsletter', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minWidth: 320 }}>
                            <p style={{ fontWeight: 700, fontSize: 23, marginTop: 10 }}>Join Our Email List</p>
                            <div
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    border: '2px solid #FFFFFF',
                                    marginTop: 15,
                                    borderRadius: 30,
                                    paddingLeft: 20,
                                    height: 50,
                                    width: 324,
                                    background: '#1f1f1f',
                                }}
                            >
                                <input
                                    type="email"
                                    placeholder="Email Address"
                                    aria-label="Email Address"
                                    style={{
                                        flex: 1,
                                        border: 'none',
                                        background: 'transparent',
                                        fontSize: 14,
                                        fontWeight: 600,
                                        color: '#cfcfcf',
                                        outline: 'none',
                                        height: '100%',
                                    }}
                                />
                                <button
                                    type="button"
                                    style={{
                                        background: '#FFFFFF',
                                        color: INK,
                                        border: 'none',
                                        height: 46,
                                        width: 46,
                                        borderRadius: '50%',
                                        margin: 2,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                    aria-label="Submit email"
                                >
                                    <ArrowRight style={{ width: 18, height: 18 }} />
                                </button>
                            </div>
                            <div style={{ marginTop: 22, fontSize: 13, letterSpacing: '0.06em' }}>
                                <span style={{ opacity: 0.7, marginRight: 14 }}>Follow us</span>
                                <span style={{ opacity: 0.85 }}>Instagram · LinkedIn · Facebook · YouTube · Pinterest</span>
                            </div>
                        </div>

                        <div style={{ gridArea: 'divider', height: 1, background: 'rgba(255,255,255,0.18)', margin: '40px 0' }} />

                        <div
                            style={{
                                gridArea: 'bottom',
                                display: 'flex',
                                justifyContent: 'space-between',
                                flexWrap: 'wrap',
                                gap: 16,
                                fontSize: 12,
                                letterSpacing: '0.08em',
                                color: 'rgba(255,255,255,0.72)',
                            }}
                        >
                            <p style={{ margin: 0 }}>© 2026 JSI. ALL RIGHTS RESERVED.</p>
                            <p style={{ margin: 0 }}>Privacy · Jasper Group · Klem · JSI</p>
                        </div>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default LawFirmsLandingConcept;
