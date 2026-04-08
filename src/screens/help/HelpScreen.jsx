import React, { useState, useMemo } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PillButton } from '../../components/common/JSIButtons.jsx';
import StandardSearchBar from '../../components/common/StandardSearchBar.jsx';
import { ChevronDown, ChevronUp, Mail, Phone, Info, Search, BookOpen, ShoppingCart, Layout, FolderKanban, Palette, HelpCircle, Keyboard } from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';

const Pill = ({ children, theme }) => (
    <span
        className="px-2.5 py-1 rounded-full text-xs font-semibold"
        style={{
            border: `1px solid ${theme.colors.border}`,
            backgroundColor: theme.colors.surface,
            color: theme.colors.textSecondary,
        }}
    >
        {children}
    </span>
);

const QAItem = ({ q, a, theme, defaultOpen = false }) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div
            className="rounded-2xl border"
            style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}
        >
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between gap-3 p-4 rounded-2xl"
            >
                <div className="flex items-center gap-2 text-left">
                    <Info className="w-4 h-4" style={{ color: theme.colors.accent }} />
                    <span className="font-semibold" style={{ color: theme.colors.textPrimary }}>
                        {q}
                    </span>
                </div>
                {open ? (
                    <ChevronUp className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                ) : (
                    <ChevronDown className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                )}
            </button>
            {open && (
                <div className="px-4 pb-4 -mt-2 text-sm leading-relaxed" style={{ color: theme.colors.textSecondary }}>
                    {a}
                </div>
            )}
        </div>
    );
};

export const HelpScreen = ({ theme }) => {
    const dark = isDarkTheme(theme);
    const [query, setQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState(null);

    const categories = [
        { id: 'getting-started', label: 'Getting Started', icon: BookOpen, color: '#4A7C59' },
        { id: 'navigation', label: 'Navigation', icon: Layout, color: '#5B7B8C' },
        { id: 'projects', label: 'Projects & Leads', icon: FolderKanban, color: '#C4956A' },
        { id: 'samples', label: 'Samples & Cart', icon: ShoppingCart, color: '#8C7B63' },
        { id: 'appearance', label: 'Appearance', icon: Palette, color: '#6A6762' },
        { id: 'shortcuts', label: 'Shortcuts', icon: Keyboard, color: '#5B7B8C' },
    ];

    const faqs = [
        { cat: 'getting-started', q: 'How do I get started with MyJSI?', a: 'Start on the Home screen. Your pinned apps are in the grid at the top — tap any tile to jump into that area. Long-press and drag tiles to reorder them. Use the search bar to find anything quickly.' },
        { cat: 'getting-started', q: 'What is the Home screen app grid?', a: 'The app grid shows your pinned apps. You can long-press to enter edit mode, then drag to reorder or remove tiles. Tap the edit pencil to add or remove apps.' },
        { cat: 'getting-started', q: 'How do I use the global search?', a: 'Tap "Ask me anything" on Home. Start typing to jump to areas of the app, search products, or start a conversation with the assistant.' },
        { cat: 'navigation', q: 'Can I swipe back to the previous screen?', a: 'Yes. Swipe from the left edge to go back, or use the back arrow in the top bar.' },
        { cat: 'navigation', q: 'How do I switch between tabs?', a: 'Each screen with tabs shows them at the top. Tap to switch. On Community, you can also tap channel chips to filter by sub-community.' },
        { cat: 'navigation', q: 'Where is the sidebar / main menu?', a: 'The main navigation is at the bottom of the screen on mobile, or in the left sidebar on desktop. Tap any icon to navigate.' },
        { cat: 'projects', q: 'How do I create a new lead or project?', a: 'From the Projects screen, tap New Lead. Fill in the basic details and tap Save. You can edit value, stage, and competitors any time from the project details page.' },
        { cat: 'projects', q: 'How do I track project stages?', a: 'Projects move through pipeline stages shown as tabs. Tap a stage to filter. Each project card shows its current stage, value, and health indicator.' },
        { cat: 'projects', q: 'Can I add notes or files to a project?', a: 'Yes. Open a project and scroll to the notes section. You can attach files, PDFs, and images from the project detail view.' },
        { cat: 'samples', q: 'Where can I see sample finishes and add to cart?', a: 'Go to Samples. Tap a tile to add it to the cart. Use the +/- controls on each tile to adjust quantities. The cart drawer appears at the bottom and updates right away.' },
        { cat: 'samples', q: 'How do I order a full set of samples?', a: 'On the Samples screen, tap "Full JSI Set" at the top, or use the set button within a specific category to add all finishes from that group.' },
        { cat: 'samples', q: 'My cart did not update. What should I try?', a: 'Check your connection and try again. If the issue continues, clear the cart from the drawer and re-add items. You can also contact support below.' },
        { cat: 'appearance', q: 'How do I switch between light and dark mode?', a: 'Open the profile button in the top bar and toggle the theme switch. You can also find it under Settings > Appearance.' },
        { cat: 'appearance', q: 'Can I customize the accent color?', a: 'Not yet — the accent color follows the JSI brand palette. This may be available in a future update.' },
        { cat: 'shortcuts', q: 'Are there keyboard shortcuts?', a: 'Yes. Press Ctrl+/ (or ⌘/) to focus the search bar on Community. Most list screens support arrow-key navigation when focused.' },
        { cat: 'shortcuts', q: 'Can I use voice to navigate?', a: 'Voice input is available in the Home search bar — tap the microphone icon to activate.' },
    ];

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        let items = faqs;
        if (activeCategory) items = items.filter(f => f.cat === activeCategory);
        if (q) items = items.filter(f => f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q));
        return items;
    }, [query, activeCategory]);

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
            <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-4 scrollbar-hide">
                
                {/* Search */}
                <div className="pt-1">
                    <StandardSearchBar
                        value={query}
                        onChange={setQuery}
                        placeholder="Search help topics..."
                        theme={theme}
                    />
                </div>

                {/* Category chips */}
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                    <button
                        onClick={() => setActiveCategory(null)}
                        className="text-[0.6875rem] font-semibold px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95 border"
                        style={{
                            color: !activeCategory ? theme.colors.accentText : theme.colors.textSecondary,
                            borderColor: !activeCategory ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                            backgroundColor: !activeCategory ? theme.colors.accent : 'transparent',
                        }}
                    >
                        All
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                            className="text-[0.6875rem] font-medium px-3 py-1.5 rounded-full flex-shrink-0 whitespace-nowrap transition-all active:scale-95 border flex items-center gap-1.5"
                            style={{
                                color: activeCategory === cat.id ? theme.colors.accentText : theme.colors.textSecondary,
                                borderColor: activeCategory === cat.id ? theme.colors.accent : (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'),
                                backgroundColor: activeCategory === cat.id ? theme.colors.accent : 'transparent',
                            }}
                        >
                            <cat.icon className="w-3 h-3" />
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* FAQs */}
                <GlassCard theme={theme} className="p-4 space-y-3">
                    {filtered.length === 0 ? (
                        <div className="py-8 text-center">
                            <HelpCircle className="w-8 h-8 mx-auto mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.2 }} />
                            <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>No results found</p>
                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>Try a different search or category.</p>
                        </div>
                    ) : (
                        filtered.map((item, i) => (
                            <QAItem key={i} q={item.q} a={item.a} theme={theme} defaultOpen={i === 0 && !query && !activeCategory} />
                        ))
                    )}
                </GlassCard>

                {/* Contact Support */}
                <GlassCard theme={theme} className="p-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-full flex-shrink-0" style={{ backgroundColor: `${theme.colors.accent}12` }}>
                            <Mail className="w-5 h-5" style={{ color: theme.colors.accent }} />
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>
                                Contact Support
                            </h3>
                            <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
                                Weekdays 8:00 AM – 5:00 PM (ET)
                            </p>
                            <div className="mt-3 flex flex-wrap gap-2">
                                <PillButton
                                    type="button"
                                    size="compact"
                                    theme={theme}
                                    onClick={() => window.location.href = 'mailto:customerservice@jaspergroup.us.com?subject=MyJSI%20Support'}
                                >
                                    <Mail className="inline w-4 h-4 mr-1" />
                                    customerservice@jaspergroup.us.com
                                </PillButton>

                                <PillButton
                                    type="button"
                                    size="compact"
                                    theme={theme}
                                    onClick={() => window.location.href = 'tel:+18124827035'}
                                >
                                    <Phone className="inline w-4 h-4 mr-1" />
                                    (812) 482-7035
                                </PillButton>
                            </div>
                        </div>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
};
