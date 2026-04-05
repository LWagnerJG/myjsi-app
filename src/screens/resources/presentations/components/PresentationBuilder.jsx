import React, { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, LayoutGrid, File, Loader2, Check, Download, FolderOpen } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { BUILDER_PROMPT_SUGGESTIONS, BUILDER_EXPORT_FORMATS, MOCK_PRESENTATION_PDF_BASE64 } from '../data.js';

const CARD_SHADOW = '0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)';

export const PresentationBuilder = ({ theme, onDeckGenerated }) => {
    const isDark = isDarkTheme(theme);
    const [prompt, setPrompt] = useState('');
    const [exportFormat, setExportFormat] = useState('pptx');
    const [phase, setPhase] = useState('idle'); // idle | generating | done
    const [generatedDeck, setGeneratedDeck] = useState(null);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const textRef = useRef(null);

    const accentBg = isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)';
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
                style={{ background: isDark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.04)', border: `1px solid ${borderColor}` }}>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-[11px] flex items-center justify-center" style={{ background: theme.colors.accent }}>
                        <Sparkles className="w-4.5 h-4.5" style={{ color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFF') }} />
                    </div>
                    <div>
                        <p className="font-bold text-[15px]" style={{ color: theme.colors.textPrimary }}>Presentation Builder</p>
                        <p className="text-xs" style={{ color: theme.colors.textSecondary }}>AI-powered · exports to PPTX or PDF</p>
                    </div>
                </div>
                <p className="text-[13px] leading-relaxed pt-1" style={{ color: theme.colors.textSecondary }}>
                    Describe what you need — target audience, products, message — and JSI's AI engine will generate a branded deck ready to download or save to My Decks.
                </p>
            </div>

            {/* Prompt area */}
            <AnimatePresence mode="wait">
                {phase === 'idle' && (
                    <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }} className="space-y-3">
                        {/* Textarea */}
                        <div className="relative rounded-2xl overflow-hidden" style={{ border: `1.5px solid ${prompt.length > 0 ? theme.colors.accent : borderColor}`, transition: 'border-color 0.2s', background: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF', boxShadow: CARD_SHADOW }}>
                            <textarea
                                ref={textRef}
                                value={prompt}
                                onChange={e => setPrompt(e.target.value)}
                                onFocus={() => setShowSuggestions(true)}
                                rows={4}
                                placeholder="e.g. Create a pitch for Riverside Medical covering lounge seating and training room solutions…"
                                className="w-full px-4 pt-4 pb-2 text-sm resize-none outline-none bg-transparent leading-relaxed"
                                style={{ color: theme.colors.textPrimary }}
                            />
                            <div className="flex items-center justify-between px-4 pb-3 pt-1">
                                <span className="text-xs" style={{ color: prompt.length > 300 ? '#ef4444' : theme.colors.textSecondary }}>{prompt.length}/500</span>
                                {prompt.length > 0 && (
                                    <button onClick={() => setPrompt('')} className="rounded-full p-1 transition-colors hover:bg-black/5 dark:hover:bg-white/5">
                                        <X className="w-3.5 h-3.5" style={{ color: theme.colors.textSecondary }} />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Suggestions */}
                        <AnimatePresence>
                            {showSuggestions && (
                                <motion.div key="suggestions" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
                                    <p className="text-xs font-semibold uppercase tracking-widest mb-2 px-1" style={{ color: theme.colors.textSecondary }}>Quick Starts</p>
                                    <div className="flex flex-wrap gap-2">
                                        {BUILDER_PROMPT_SUGGESTIONS.map(s => (
                                            <button key={s.label} onClick={() => { setPrompt(s.prompt); setShowSuggestions(false); }}
                                                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all active:scale-95"
                                                style={{ border: `1px solid ${borderColor}`, color: theme.colors.textSecondary, background: accentBg }}>
                                                {s.label}
                                            </button>
                                        ))}
                                        <button onClick={() => setShowSuggestions(false)} className="px-3 py-1.5 rounded-full text-xs font-medium transition-all" style={{ color: theme.colors.textSecondary }}>
                                            <X className="w-3 h-3 inline mr-1" />Hide
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Export format selector */}
                        <div className="flex items-center gap-3">
                            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: theme.colors.textSecondary }}>Export as</p>
                            <div className="flex gap-2">
                                {BUILDER_EXPORT_FORMATS.map(f => (
                                    <button key={f.id} onClick={() => setExportFormat(f.id)}
                                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
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
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full font-semibold text-[15px] transition-all active:scale-[0.98] disabled:opacity-40"
                            style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFFFFF') }}>
                            <Sparkles className="w-4.5 h-4.5" />
                            Generate Presentation
                        </button>
                    </motion.div>
                )}

                {phase === 'generating' && (
                    <motion.div key="generating" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.25 }}
                        className="rounded-3xl p-10 flex flex-col items-center gap-5 text-center"
                        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: CARD_SHADOW }}>
                        <div className="relative w-16 h-16">
                            <div className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: theme.colors.accent }} />
                            <div className="relative w-16 h-16 rounded-full flex items-center justify-center" style={{ background: `${theme.colors.accent}22` }}>
                                <Loader2 className="w-7 h-7 animate-spin" style={{ color: theme.colors.accent }} />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <p className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>Building your deck…</p>
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
                                <p className="text-xs truncate" style={{ color: theme.colors.textSecondary }}>{generatedDeck.slideCount} slides · {generatedDeck.format.toUpperCase()}</p>
                            </div>
                        </div>

                        {/* Generated deck preview */}
                        <div className="rounded-3xl overflow-hidden" style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${borderColor}`, boxShadow: CARD_SHADOW }}>
                            <div className="aspect-video w-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.09)' : '#f0ede8' }}>
                                <img src={generatedDeck.thumbnailUrl} alt={generatedDeck.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="px-4 py-4 space-y-3">
                                <div>
                                    <div className="flex items-start gap-2">
                                        <Sparkles className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: theme.colors.accent }} />
                                        <h3 className="font-semibold text-sm leading-snug" style={{ color: theme.colors.textPrimary }}>{generatedDeck.title}</h3>
                                    </div>
                                    <p className="text-xs mt-1.5 line-clamp-2 leading-relaxed" style={{ color: theme.colors.textSecondary }}>{generatedDeck.prompt}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={handleDownload}
                                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97]"
                                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFF') }}>
                                        <Download className="w-3.5 h-3.5" /> Download {generatedDeck.format.toUpperCase()}
                                    </button>
                                    <button onClick={handleSaveToMyDecks}
                                        className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97]"
                                        style={{ border: `1.5px solid ${borderColor}`, color: theme.colors.textPrimary }}>
                                        <FolderOpen className="w-3.5 h-3.5" /> Save
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button onClick={handleReset}
                            className="w-full py-3 rounded-full text-[13px] font-semibold transition-all active:scale-[0.97]"
                            style={{ border: `1.5px solid ${borderColor}`, color: theme.colors.textSecondary }}>
                            Build Another
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
