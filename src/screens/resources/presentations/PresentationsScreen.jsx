import React, { useState, useRef, useEffect, useMemo, useLayoutEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { PillButton } from '../../../components/common/JSIButtons.jsx';
import { isDarkTheme } from '../../../design-system/tokens.js';
import {
    Download, Share2, ChevronLeft, ChevronRight, Layers, Sparkles,
    FolderOpen, Plus, X, FileText, File, Send, Loader2,
    Check, ChevronDown, Trash2, LayoutGrid, Clock
} from 'lucide-react';
import {
    PRESENTATIONS_DATA, PRESENTATION_CATEGORIES, MOCK_PRESENTATION_PDF_BASE64,
    BUILDER_PROMPT_SUGGESTIONS, BUILDER_EXPORT_FORMATS, INITIAL_MY_DECKS
} from './data.js';

// â”€â”€â”€ Shared style helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';
const CARD_SHADOW_HOVER = '0 8px 28px rgba(0,0,0,0.11), 0 2px 6px rgba(0,0,0,0.07)';

// â”€â”€â”€ SlideCarousel â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SlideCarousel = ({ pres, theme, onViewFull }) => {
    const [idx, setIdx] = useState(0);
    const slides = pres.slides || [];
    if (!slides.length) return null;
    const next = () => setIdx(i => (i + 1) % slides.length);
    const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length);
    return (
        <div className="relative group" aria-label={`${pres.title} slide preview`}>
            <div className="aspect-video w-full rounded-xl overflow-hidden" style={{ background: theme.colors.surfaceAlt || '#f5f5f5', border: `1px solid ${theme.colors.border}` }}>
                <img src={slides[idx].image} alt={slides[idx].caption} className="w-full h-full object-cover" loading="lazy" />
            </div>
            {slides.length > 1 && (
                <>
                    <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 left-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous">
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={next} className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next">
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all"
                        style={{ width: i === idx ? 18 : 6, height: 6, background: i === idx ? theme.colors.accent : 'rgba(255,255,255,0.55)' }} />
                ))}
            </div>
            <button onClick={onViewFull} className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[10px] font-semibold transition-opacity"
                style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
                View
            </button>
        </div>
    );
};

// â”€â”€â”€ PresentationCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PresentationCard = ({ p, theme, onAddToMyDecks, myDeckIds, onDownload, onShare, onViewFull }) => {
    const isDark = isDarkTheme(theme);
    const inMyDecks = myDeckIds.has(String(p.id));
    return (
        <div className="rounded-3xl overflow-hidden transition-all duration-300"
            style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}>
            <div className="p-4">
                <SlideCarousel pres={p} theme={theme} onViewFull={() => onViewFull(p)} />
            </div>
            <div className="px-5 pb-5 space-y-3">
                <div className="space-y-1.5">
                    <h3 className="font-semibold text-[15px] leading-snug" style={{ color: theme.colors.textPrimary }}>{p.title}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-medium">
                        <span className="px-2 py-0.5 rounded-full" style={{ background: `${theme.colors.accent}18`, color: theme.colors.accent }}>{p.category}</span>
                        <span style={{ color: theme.colors.textSecondary }}>{p.type} Â· {p.size}</span>
                        <span style={{ color: theme.colors.textSecondary }}>Updated {new Date(p.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: theme.colors.textSecondary }}>{p.description}</p>
                </div>
                <div className="flex gap-2 pt-1">
                    <button onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF') }}>
                        <Download className="w-4 h-4" /> Download
                    </button>
                    <button onClick={onShare}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                    <button onClick={() => onAddToMyDecks(p)}
                        title={inMyDecks ? 'In My Decks' : 'Save to My Decks'}
                        className="flex items-center justify-center w-10 rounded-2xl transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${inMyDecks ? theme.colors.accent : theme.colors.border}`, color: inMyDecks ? theme.colors.accent : theme.colors.textSecondary, background: inMyDecks ? `${theme.colors.accent}12` : 'transparent' }}>
                        {inMyDecks ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    </button>
                </div>
            </div>
        </div>
    );
};

// â”€â”€â”€ MyDeckCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MyDeckCard = ({ deck, theme, onDownload, onShare, onDelete }) => {
    const isDark = isDarkTheme(theme);
    const isGenerated = deck.source === 'generated';
    return (
        <div className="rounded-3xl overflow-hidden transition-all duration-300"
            style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: CARD_SHADOW }}>
            {/* Thumbnail */}
            <div className="aspect-video w-full overflow-hidden relative"
                style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f0ede8' }}>
                {deck.thumbnailUrl
                    ? <img src={deck.thumbnailUrl} alt={deck.title} className="w-full h-full object-cover" loading="lazy" />
                    : <div className="w-full h-full flex items-center justify-center"><LayoutGrid className="w-8 h-8 opacity-20" style={{ color: theme.colors.textPrimary }} /></div>
                }
                {isGenerated && (
                    <span className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                        style={{ background: `${theme.colors.accent}CC`, color: theme.colors.accentText || '#FFF' }}>
                        <Sparkles className="w-2.5 h-2.5" /> AI Generated
                    </span>
                )}
                <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase"
                    style={{ background: 'rgba(0,0,0,0.45)', color: '#FFF' }}>
                    {deck.format}
                </span>
            </div>
            <div className="px-4 py-4 space-y-3">
                <div className="space-y-1">
                    <h3 className="font-semibold text-[14px] leading-snug" style={{ color: theme.colors.textPrimary }}>{deck.title}</h3>
                    {deck.prompt && (
                        <p className="text-[11px] leading-relaxed line-clamp-2" style={{ color: theme.colors.textSecondary }}>{deck.prompt}</p>
                    )}
                    <div className="flex items-center gap-1 text-[11px]" style={{ color: theme.colors.textSecondary }}>
                        <Clock className="w-3 h-3" />
                        <span>{new Date(deck.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {deck.slideCount && <span>Â· {deck.slideCount} slides</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF') }}>
                        <Download className="w-3.5 h-3.5" /> Download
                    </button>
                    <button onClick={onShare}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
                        <Share2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={onDelete}
                        className="flex items-center justify-center w-10 rounded-2xl transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

// â”€â”€â”€ PresentationBuilder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const PresentationBuilder = ({ theme, onDeckGenerated }) => {
    const isDark = isDarkTheme(theme);
    const [prompt, setPrompt] = useState('');
    const [exportFormat, setExportFormat] = useState('pptx');
    const [phase, setPhase] = useState('idle'); // idle | generating | done
    const [generatedDeck, setGeneratedDeck] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const textRef = useRef(null);

    const accentBg = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)';
    const borderColor = theme.colors.border;

    const handleGenerate = useCallback(() => {
        if (!prompt.trim()) return;
        setPhase('generating');
        // Simulate AI generation (2.8 s)
        setTimeout(() => {
            const deck = {
                id: `deck-${Date.now()}`,
                title: prompt.slice(0, 60).replace(/\b\w/g, c => c.toUpperCase()).trim(),
                createdAt: new Date().toISOString().slice(0, 10),
                updatedAt: new Date().toISOString().slice(0, 10),
                source: 'generated',
                prompt: prompt.trim(),
                slideCount: Math.floor(Math.random() * 8) + 8,
                format: exportFormat,
                thumbnailUrl: `https://placehold.co/600x338/${isDark ? '353535/ffffff' : '1a1a1a/ffffff'}?text=${encodeURIComponent(prompt.slice(0, 24))}`,
            };
            setGeneratedDeck(deck);
            setPhase('done');
        }, 2800);
    }, [prompt, exportFormat, isDark]);

    const handleSaveToMyDecks = useCallback(() => {
        if (generatedDeck) onDeckGenerated(generatedDeck);
    }, [generatedDeck, onDeckGenerated]);

    const handleDownload = useCallback(() => {
        const a = document.createElement('a');
        a.href = MOCK_PRESENTATION_PDF_BASE64;
        const ext = exportFormat === 'pptx' ? '.pptx' : '.pdf';
        a.download = (generatedDeck?.title || 'presentation').replace(/[^a-z0-9]+/gi, '-').toLowerCase() + ext;
        document.body.appendChild(a); a.click(); a.remove();
    }, [generatedDeck, exportFormat]);

    const handleReset = () => { setPhase('idle'); setGeneratedDeck(null); setPrompt(''); };

    return (
        <div className="px-4 pb-32 pt-1 space-y-4">
            {/* Header card */}
            <div className="rounded-3xl p-5 space-y-1"
                style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)', border: `1px solid ${borderColor}` }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: theme.colors.accent }}>
                        <Sparkles className="w-4.5 h-4.5" style={{ color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFF') }} />
                    </div>
                    <div>
                        <p className="font-bold text-[15px]" style={{ color: theme.colors.textPrimary }}>Presentation Builder</p>
                        <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>AI-powered Â· exports to PPTX or PDF</p>
                    </div>
                </div>
                <p className="text-[13px] leading-relaxed pt-1" style={{ color: theme.colors.textSecondary }}>
                    Describe what you need â€” target audience, products, message â€” and JSI's AI engine will generate a branded deck ready to download or save to My Decks.
                </p>
            </div>

            {/* Prompt area */}
            <AnimatePresence mode="wait">
                {phase === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                        {/* Textarea */}
                        <div className="relative rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${prompt.length > 0 ? theme.colors.accent : borderColor}`, transition: 'border-color 0.2s', background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF', boxShadow: CARD_SHADOW }}>
                            <textarea
                                ref={textRef}
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                rows={4}
                                placeholder="e.g. Create a pitch for Riverside Medical covering lounge seating and training room solutionsâ€¦"
                                className="w-full px-4 pt-4 pb-2 text-[14px] resize-none outline-none bg-transparent leading-relaxed"
                                style={{ color: theme.colors.textPrimary }}
                            />
                            <div className="flex items-center justify-between px-4 pb-3 pt-1">
                                <span className="text-[11px]" style={{ color: prompt.length > 300 ? '#ef4444' : theme.colors.textSecondary }}>{prompt.length}/500</span>
                                {prompt.length > 0 && (
                                    <button onClick={() => setPrompt('')} className="rounded-full p-1 transition-colors hover:bg-black/5">
                                        <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div key="suggestions" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                    <p className="text-[11px] font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: theme.colors.textSecondary }}>Quick Starts</p>
                                    <div className="flex flex-wrap gap-2">
                                        {BUILDER_PROMPT_SUGGESTIONS.map(s => (
                                            <button key={s.label} onClick={() => { setPrompt(s.prompt); setShowSuggestions(false); }}
                                                className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-95"
                                                style={{ border: `1px solid ${borderColor}`, color: theme.colors.textSecondary, background: accentBg }}>
                                                {s.label}
                                            </button>
                                        ))}
                                        <button onClick={() => setShowSuggestions(false)} className="px-3 py-1.5 rounded-full text-[12px] font-medium transition-all" style={{ color: theme.colors.textSecondary }}>
                                            <X className="w-3 h-3 inline mr-1" />Hide
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Export format selector */}
                        <div className="flex items-center gap-3">
                            <p className="text-[12px] font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Export as</p>
                            <div className="flex gap-2">
                                {BUILDER_EXPORT_FORMATS.map(f => (
                                    <button key={f.id} onClick={() => setExportFormat(f.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                                        style={{
                                            border: `1.5px solid ${exportFormat === f.id ? theme.colors.accent : borderColor}`,
                                            color: exportFormat === f.id ? theme.colors.accent : theme.colors.textSecondary,
                                            background: exportFormat === f.id ? `${theme.colors.accent}12` : 'transparent',
                                        }}>
                                        {f.id === 'pptx' ? <LayoutGrid className="w-3 h-3" /> : <File className="w-3 h-3" />}
                                        {f.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Generate button */}
                        <button
                            onClick={handleGenerate}
                            disabled={!prompt.trim() || prompt.length > 500}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl font-semibold text-[15px] transition-all active:scale-[0.98] disabled:opacity-40"
                            style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF') }}>
                            <Sparkles className="w-4.5 h-4.5" />
                            Generate Presentation
                        </button>
                    </motion.div>
                )}

                {phase === 'generating' && (
                    <motion.div key="generating" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}
                        className="rounded-3xl p-10 flex flex-col items-center gap-5 text-center"
                        style={{ background: isDark ? 'rgba(255,255,255,0.04)' : '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: CARD_SHADOW }}>
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: theme.colors.accent }} />
                            <div className="relative w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${theme.colors.accent}22` }}>
                                <Loader2 className="w-7 h-7 animate-spin" style={{ color: theme.colors.accent }} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="font-bold text-[16px]" style={{ color: theme.colors.textPrimary }}>Building your deckâ€¦</p>
                            <p className="text-[13px] leading-relaxed max-w-[260px]" style={{ color: theme.colors.textSecondary }}>
                                JSI's AI is crafting slides, selecting content & applying brand styles.
                            </p>
                        </div>
                    </motion.div>
                )}

                {phase === 'done' && generatedDeck && (
                    <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-4">
                        {/* Success banner */}
                        <div className="rounded-2xl px-4 py-3 flex items-center gap-3"
                            style={{ background: `${theme.colors.accent}15`, border: `1px solid ${theme.colors.accent}30` }}>
                            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: `${theme.colors.accent}25` }}>
                                <Check className="w-3.5 h-3.5" style={{ color: theme.colors.accent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold" style={{ color: theme.colors.textPrimary }}>Deck ready</p>
                                <p className="text-[11px] truncate" style={{ color: theme.colors.textSecondary }}>{generatedDeck.slideCount} slides Â· {generatedDeck.format.toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Generated deck preview */}
                        <div className="rounded-3xl overflow-hidden" style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: CARD_SHADOW }}>
                            <div className="aspect-video w-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : '#f0ede8' }}>
                                <img src={generatedDeck.thumbnailUrl} alt={generatedDeck.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="px-4 py-4 space-y-3">
                                <div>
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: theme.colors.accent }} />
                                        <h3 className="font-semibold text-[14px] leading-snug" style={{ color: theme.colors.textPrimary }}>{generatedDeck.title}</h3>
                                    </div>
                                    <p className="text-[11px] mt-1.5 line-clamp-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>{generatedDeck.prompt}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleDownload}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.97]"
                                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFF') }}>
                                        <Download className="w-3.5 h-3.5" /> Download {generatedDeck.format.toUpperCase()}
                                    </button>
                                    <button onClick={handleSaveToMyDecks}
                                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.97]"
                                        style={{ border: `1.5px solid ${borderColor}`, color: theme.colors.textPrimary }}>
                                        <FolderOpen className="w-3.5 h-3.5" /> Save
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleReset}
                            className="w-full py-3 rounded-2xl text-[13px] font-semibold transition-all active:scale-[0.97]"
                            style={{ border: `1.5px solid ${borderColor}`, color: theme.colors.textSecondary }}>
                            Build Another
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// â”€â”€â”€ Full-screen lightbox â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SlidePreviewModal = ({ preview, theme, onClose, onDownload, onShare }) => {
    const isDark = isDarkTheme(theme);
    if (!preview) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
                className="max-w-3xl w-full rounded-3xl overflow-hidden"
                style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
                onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <h2 className="font-bold text-[16px]" style={{ color: theme.colors.textPrimary }}>{preview.pres.title}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5" style={{ color: theme.colors.textSecondary }}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto">
                    {preview.pres.slides.map((s, i) => (
                        <div key={s.id} className="relative rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                            <img src={s.image} alt={s.caption} className="w-full h-28 object-cover" />
                            <div className="px-2 py-1 text-[9px] bg-black/50 text-white absolute inset-x-0 bottom-0 truncate">{s.caption}</div>
                            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/45 text-white text-[10px] font-bold flex items-center justify-center">{i + 1}</div>
                        </div>
                    ))}
                </div>
                <div className="px-5 py-4 flex gap-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                    <button onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-[14px] font-semibold transition-all active:scale-[0.97]"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFF') }}>
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button onClick={onShare}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-[14px] font-semibold transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

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
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-2xl text-[12px] font-semibold transition-all"
                            style={{
                                background: active ? colors.accent : (isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)'),
                                color: active ? (colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF')) : colors.textSecondary,
                                border: `1px solid ${active ? colors.accent : borderColor}`,
                            }}>
                            <Icon className="w-3.5 h-3.5" />
                            {label}
                            {id === 'my-decks' && myDecks.length > 0 && (
                                <span className="ml-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold"
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

