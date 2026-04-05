import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import { Layers, Sparkles, FolderOpen } from 'lucide-react';
import {
    PRESENTATIONS_DATA, PRESENTATION_CATEGORIES, MOCK_PRESENTATION_PDF_BASE64,
    INITIAL_MY_DECKS
} from './data.js';

import { PresentationCard } from './components/PresentationCard.jsx';
import { MyDeckCard } from './components/MyDeckCard.jsx';
import { PresentationBuilder } from './components/PresentationBuilder.jsx';
import { SlidePreviewModal } from './components/SlidePreviewModal.jsx';

// â”€â”€â”€ Tab pill â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const TAB_CONFIG = [
    { id: 'browse', label: 'Browse', Icon: Layers },
    { id: 'my-decks', label: 'My Decks', Icon: FolderOpen },
    { id: 'builder', label: 'Builder', Icon: Sparkles },
];

// â”€â”€â”€ PresentationsScreen â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const PresentationsScreen = ({ theme, screenParams }) => {
    const isDark = isDarkTheme(theme);

    // Determine initial tab from nav params
    const initialTab = screenParams?.openBuilder ? 'builder' : 'browse';
    const [activeTab, setActiveTab] = useState(initialTab);

    // Browse state
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [search, setSearch] = useState('');
    const [preview, setPreview] = useState(null);

    // My Decks state
    const [myDecks, setMyDecks] = useState(INITIAL_MY_DECKS);
    const myDeckIds = useMemo(() => new Set(myDecks.map(d => String(d.id))), [myDecks]);

    const categories = useMemo(() => ['all', ...PRESENTATION_CATEGORIES], []);

    const filtered = useMemo(() => {
        return PRESENTATIONS_DATA.filter(p => {
            const catOk = selectedCategory === 'all' || p.category === selectedCategory;
            if (!catOk) return false;
            if (!search.trim()) return true;
            const t = search.toLowerCase();
            return p.title.toLowerCase().includes(t) || p.description.toLowerCase().includes(t) || p.category.toLowerCase().includes(t);
        });
    }, [selectedCategory, search]);

    const downloadMock = useCallback((p) => {
        const a = document.createElement('a');
        a.href = MOCK_PRESENTATION_PDF_BASE64;
        a.download = (p.title || 'presentation').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.pdf';
        document.body.appendChild(a); a.click(); a.remove();
    }, []);

    const sharePresentation = useCallback(async (p) => {
        const text = `${p.title} â€” ${p.description || ''}`;
        if (navigator.share) { try { await navigator.share({ title: p.title, text }); } catch (_) { /* no-op */ } }
        else { navigator.clipboard?.writeText(text); }
    }, []);

    const handleAddToMyDecks = useCallback((p) => {
        setMyDecks(prev => {
            if (prev.some(d => String(d.id) === String(p.id))) return prev;
            return [{
                id: String(p.id),
                title: p.title,
                createdAt: p.lastUpdated,
                updatedAt: p.lastUpdated,
                source: 'library',
                slideCount: (p.slides || []).length,
                format: p.type === 'PDF' ? 'pdf' : 'pptx',
                thumbnailUrl: p.thumbnailUrl,
                prompt: null,
            }, ...prev];
        });
    }, []);

    const handleDeckGenerated = useCallback((deck) => {
        setMyDecks(prev => {
            if (prev.some(d => d.id === deck.id)) return prev;
            return [deck, ...prev];
        });
        setActiveTab('my-decks');
    }, []);

    const handleDeleteDeck = useCallback((deckId) => {
        setMyDecks(prev => prev.filter(d => d.id !== deckId));
    }, []);

    const colors = theme.colors;
    const borderColor = colors.border;

    return (
        <div className="flex flex-col h-full app-header-offset" style={{ background: colors.background }}>

            {/* â”€â”€ Tab bar â”€â”€ */}
            <div className="px-4 pt-3 pb-2 flex gap-2">
                {TAB_CONFIG.map(({ id, label, Icon }) => {
                    const active = activeTab === id;
                    return (
                        <button key={id} onClick={() => setActiveTab(id)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-xs font-semibold transition-all"
                            style={{
                                background: active ? colors.accent : (isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.05)'),
                                color: active ? (colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF')) : colors.textSecondary,
                                border: `1px solid ${active ? colors.accent : borderColor}`,
                            }}>
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                            {id === 'my-decks' && myDecks.length > 0 && (
                                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold"
                                    style={{ background: active ? 'rgba(255,255,255,0.25)' : `${colors.accent}20`, color: active ? (isDark ? '#1A1A1A' : '#FFF') : colors.accent }}>
                                    {myDecks.length}
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* â”€â”€ Tab content â”€â”€ */}
            <AnimatePresence mode="wait">
                {activeTab === 'browse' && (
                    <motion.div key="browse" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.18 }}
                        className="flex-1 flex flex-col overflow-hidden">
                        {/* Search + categories */}
                        <div className="px-4 pb-2 space-y-2">
                            <StandardSearchBar value={search} onChange={setSearch} placeholder="Search presentationsâ€¦" theme={theme} />
                            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                                {categories.map(cat => {
                                    const active = selectedCategory === cat;
                                    return (
                                        <PillButton key={cat} onClick={() => setSelectedCategory(cat)} isSelected={active} size="compact" theme={theme} className="whitespace-nowrap flex-shrink-0">
                                            {cat === 'all' ? 'All' : cat}
                                        </PillButton>
                                    );
                                })}
                            </div>
                        </div>
                        {/* List */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-32 space-y-4">
                            {filtered.length ? filtered.map(p => (
                                <PresentationCard key={p.id} p={p} theme={theme}
                                    onAddToMyDecks={handleAddToMyDecks} myDeckIds={myDeckIds}
                                    onDownload={() => downloadMock(p)} onShare={() => sharePresentation(p)}
                                    onViewFull={(pres) => setPreview({ pres, idx: 0 })} />
                            )) : (
                                <GlassCard theme={theme} className="p-10 text-center">
                                    <p className="font-semibold" style={{ color: colors.textPrimary }}>No presentations found</p>
                                    <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Try a different search or filter.</p>
                                </GlassCard>
                            )}
                        </div>
                    </motion.div>
                )}

                {activeTab === 'my-decks' && (
                    <motion.div key="my-decks" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}
                        className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-32 pt-1 space-y-4">
                        {myDecks.length === 0 ? (
                            <GlassCard theme={theme} className="p-10 text-center">
                                <FolderOpen className="w-10 h-10 mx-auto mb-3 opacity-20" style={{ color: colors.textPrimary }} />
                                <p className="font-semibold" style={{ color: colors.textPrimary }}>No saved decks yet</p>
                                <p className="text-sm mt-1 mb-4" style={{ color: colors.textSecondary }}>Generate one in the Builder or save from Browse.</p>
                                <button onClick={() => setActiveTab('builder')}
                                    className="px-5 py-2.5 rounded-2xl text-[13px] font-semibold"
                                    style={{ background: colors.accent, color: colors.accentText || (isDark ? '#1A1A1A' : '#FFF') }}>
                                    Open Builder
                                </button>
                            </GlassCard>
                        ) : myDecks.map(deck => (
                            <MyDeckCard key={deck.id} deck={deck} theme={theme}
                                onDownload={() => downloadMock(deck)}
                                onShare={() => sharePresentation(deck)}
                                onDelete={() => handleDeleteDeck(deck.id)} />
                        ))}
                    </motion.div>
                )}

                {activeTab === 'builder' && (
                    <motion.div key="builder" initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }} transition={{ duration: 0.18 }}
                        className="flex-1 overflow-y-auto scrollbar-hide">
                        <PresentationBuilder theme={theme} onDeckGenerated={handleDeckGenerated} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <AnimatePresence>
                {preview && (
                    <SlidePreviewModal preview={preview} theme={theme}
                        onClose={() => setPreview(null)}
                        onDownload={() => downloadMock(preview.pres)}
                        onShare={() => sharePresentation(preview.pres)} />
                )}
            </AnimatePresence>
        </div>
    );
};

