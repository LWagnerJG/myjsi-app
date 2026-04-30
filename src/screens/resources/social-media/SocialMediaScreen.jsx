import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronDown, Copy, Instagram, Linkedin } from 'lucide-react';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { useToast } from '../../../components/common/ToastHost.jsx';
import { fieldTileSurface, modalCardSurface, isDarkTheme } from '../../../design-system/tokens.js';
import {
    DEFAULT_SOCIAL_VERTICAL,
    LAW_FIRM_LANDING_PAGE,
    SOCIAL_CAMPAIGNS,
    SOCIAL_VERTICALS,
} from './data.js';
import { LawFirmsLandingConcept } from './LawFirmsLandingConcept.jsx';

export const SocialMediaScreen = ({ theme }) => {
    const dark = isDarkTheme(theme);
    const toast = useToast();
    const menuRef = useRef(null);
    const [selectedVertical, setSelectedVertical] = useState(DEFAULT_SOCIAL_VERTICAL);
    const [menuOpen, setMenuOpen] = useState(false);

    const activeVertical = useMemo(
        () => SOCIAL_VERTICALS.find((item) => item.id === selectedVertical) || SOCIAL_VERTICALS[0],
        [selectedVertical],
    );

    const tiles = useMemo(() => {
        if (selectedVertical === DEFAULT_SOCIAL_VERTICAL) return SOCIAL_CAMPAIGNS;
        return SOCIAL_CAMPAIGNS.filter((item) => item.vertical === selectedVertical);
    }, [selectedVertical]);

    useEffect(() => {
        const handlePointerDown = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handlePointerDown);
        return () => document.removeEventListener('mousedown', handlePointerDown);
    }, []);

    const flash = (message) => toast?.push(message, { ttl: 2200 });

    const copyCaption = async (post) => {
        try {
            await navigator.clipboard.writeText(post.caption);
            flash('Caption copied');
        } catch {
            flash('Copy failed');
        }
    };

    const shareTo = async (post, platform, url) => {
        await copyCaption(post);
        window.open(url, '_blank', 'noopener');
        flash(`${platform} opened`);
    };

    const controlTile = fieldTileSurface(theme);

    // Easter egg: Law Firms takes over the entire viewport with a JSI-website mimic.
    if (selectedVertical === 'law-firms') {
        return (
            <LawFirmsLandingConcept
                concept={LAW_FIRM_LANDING_PAGE}
                onClose={() => setSelectedVertical(DEFAULT_SOCIAL_VERTICAL)}
            />
        );
    }

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 max-w-content mx-auto w-full">
                    <div className="flex items-center justify-between gap-4">
                        <div className="min-w-0">
                            <p
                                className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em]"
                                style={{ color: theme.colors.textSecondary, opacity: 0.62 }}
                            >
                                Social Media Kit
                            </p>
                            <h1
                                className="text-[1.35rem] sm:text-[1.55rem] font-semibold tracking-[-0.02em] mt-1"
                                style={{ color: theme.colors.textPrimary }}
                            >
                                {activeVertical.label}
                            </h1>
                        </div>

                        <div ref={menuRef} className="relative shrink-0">
                            <button
                                type="button"
                                onClick={() => setMenuOpen((open) => !open)}
                                className="h-11 rounded-full flex items-center gap-2 px-4 transition active:scale-95"
                                style={{
                                    ...controlTile,
                                    borderRadius: 999,
                                    minWidth: 168,
                                    justifyContent: 'space-between',
                                    boxShadow: dark ? '0 6px 18px rgba(0,0,0,0.18)' : '0 6px 16px rgba(53,53,53,0.06)',
                                }}
                            >
                                <span className="text-[0.8125rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>
                                    {activeVertical.label}
                                </span>
                                <ChevronDown className="w-4 h-4 shrink-0" style={{ color: theme.colors.textSecondary }} />
                            </button>

                            {menuOpen ? (
                                <div
                                    className="absolute right-0 mt-2 w-[14rem] max-h-[24rem] overflow-y-auto p-1.5 z-30"
                                    style={{ ...modalCardSurface(theme), transformOrigin: 'top right' }}
                                >
                                    {SOCIAL_VERTICALS.map((item) => {
                                        const selected = item.id === selectedVertical;
                                        return (
                                            <button
                                                key={item.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedVertical(item.id);
                                                    setMenuOpen(false);
                                                }}
                                                className="w-full text-left px-3 py-2.5 rounded-[14px] transition active:scale-[0.99] flex items-center justify-between gap-3"
                                                style={{
                                                    backgroundColor: selected ? `${item.accent || theme.colors.accent}14` : 'transparent',
                                                    color: theme.colors.textPrimary,
                                                }}
                                            >
                                                <span className="text-[0.8125rem] font-semibold">{item.label}</span>
                                                {selected ? (
                                                    <Check className="w-4 h-4" style={{ color: item.accent || theme.colors.accent }} />
                                                ) : null}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>

                <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-28 max-w-content mx-auto w-full">
                    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
                        {tiles.map((post) => (
                            <article
                                key={post.id}
                                className="rounded-[22px] overflow-hidden"
                                style={{
                                    backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.78)',
                                    border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(255,255,255,0.78)',
                                    boxShadow: dark ? '0 8px 22px rgba(0,0,0,0.18)' : '0 8px 22px rgba(53,53,53,0.05)',
                                }}
                            >
                                <div className="aspect-[4/3] overflow-hidden">
                                    <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" loading="lazy" />
                                </div>
                                <div className="p-4 space-y-3">
                                    <p
                                        className="text-[0.95rem] font-semibold tracking-[-0.01em]"
                                        style={{ color: theme.colors.textPrimary }}
                                    >
                                        {post.title}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <PillButton
                                            theme={theme}
                                            size="compact"
                                            onClick={() => shareTo(post, 'Instagram', 'https://www.instagram.com/jsifurniture/')}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Instagram className="w-3.5 h-3.5" /> IG
                                        </PillButton>
                                        <PillButton
                                            theme={theme}
                                            size="compact"
                                            onClick={() => shareTo(post, 'LinkedIn', 'https://www.linkedin.com/company/jsifurniture/')}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Linkedin className="w-3.5 h-3.5" /> LI
                                        </PillButton>
                                        <PillButton
                                            theme={theme}
                                            size="compact"
                                            onClick={() => copyCaption(post)}
                                            className="flex items-center gap-1.5"
                                        >
                                            <Copy className="w-3.5 h-3.5" /> Copy
                                        </PillButton>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>

                    {!tiles.length ? (
                        <div
                            className="mt-6 rounded-[20px] p-5 text-center"
                            style={{ ...controlTile, borderRadius: 20 }}
                        >
                            <p className="text-[0.875rem]" style={{ color: theme.colors.textSecondary }}>
                                Nothing here yet — switch verticals to keep exploring.
                            </p>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default SocialMediaScreen;
