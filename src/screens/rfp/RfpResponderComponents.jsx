/* ── RFP Responder — Sub-components ──────────────────────────────── */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import {
  FileText, Upload, CheckCircle2, Loader2, X,
  ArrowUp, Download, ChevronLeft, ChevronRight,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

/* ── Elliott avatar (same URL as ChatOverlay / HomeHeader) ──────── */
const ELLIOTT_AVATAR_URL =
  'https://api.dicebear.com/9.x/avataaars/svg?seed=Elliott&top=shortFlat&hairColor=e8e1e1' +
  '&accessories=round&accessoriesProbability=100&accessoriesColor=262e33' +
  '&eyebrows=defaultNatural&eyes=happy&mouth=smile' +
  '&clothing=blazerAndShirt&clothesColor=25557c' +
  '&skinColor=ffdbb4&facialHairProbability=0';

const ElliottAvatar = ({ size = 36 }) => (
  <div
    className="rounded-full flex-shrink-0 overflow-hidden"
    style={{
      width: size,
      height: size,
      background: 'linear-gradient(135deg, #E8D1C2 0%, #D3A891 100%)',
    }}
  >
    <img
      src={ELLIOTT_AVATAR_URL}
      alt="Elliott"
      width={size}
      height={size}
      className="w-full h-full"
      style={{ transform: 'scale(1.15) translateY(1px)' }}
      loading="eager"
    />
  </div>
);

/* ── Shared helpers ─────────────────────────────────────────────── */
const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

/* ═══════════════════════════════════════════════════════════════════
   STAGE 0 — Upload Drop-zone
   ═══════════════════════════════════════════════════════════════════ */
export const UploadStage = ({ file, onFileSelect, onFileRemove, onAnalyze, theme }) => {
  const isDark = isDarkTheme(theme);
  const c = theme?.colors || {};
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) onFileSelect(dropped);
  }, [onFileSelect]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto py-4">
      <ElliottAvatar size={40} />
      <div className="text-center space-y-1.5">
        <h2
          className="text-xl font-bold tracking-tight"
          style={{ color: c.textPrimary }}
        >
          RFP Responder
        </h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: c.textSecondary }}>
          Drop your RFP below and I&rsquo;ll analyze the requirements, match JSI products, and draft a response you can edit before exporting.
        </p>
      </div>

      {/* Drop zone */}
      <GlassCard
        theme={theme}
        variant="outlined"
        className="w-full cursor-pointer"
        style={{
          borderRadius: DESIGN_TOKENS.borderRadius.xl,
          border: dragOver
            ? `2px dashed ${c.accent || '#353535'}`
            : `2px dashed ${c.border || '#E3E0D8'}`,
          backgroundColor: dragOver
            ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)')
            : 'transparent',
          transition: 'border-color 200ms ease, background-color 200ms ease',
        }}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="flex flex-col items-center gap-3 py-12 px-6">
          <Upload className="w-8 h-8" style={{ color: c.textSecondary, opacity: 0.5 }} />
          <p className="text-sm font-medium" style={{ color: c.textSecondary }}>
            {dragOver ? 'Drop your file here' : 'Drag & drop a PDF, or click to browse'}
          </p>
          <p className="text-xs" style={{ color: c.textSecondary, opacity: 0.5 }}>
            PDF up to 20 MB
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onFileSelect(f);
            e.target.value = '';
          }}
        />
      </GlassCard>

      {/* File preview */}
      {file && (
        <GlassCard theme={theme} className="w-full px-4 py-3 flex items-center gap-3">
          <FileText className="w-5 h-5 flex-shrink-0" style={{ color: '#B85C5C' }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: c.textPrimary }}>{file.name}</div>
            <div className="text-xs" style={{ color: c.textSecondary }}>{formatFileSize(file.size)}</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onFileRemove(); }}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
            aria-label="Remove file"
          >
            <X className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
          </button>
        </GlassCard>
      )}

      <PrimaryButton
        theme={theme}
        disabled={!file}
        fullWidth
        onClick={onAnalyze}
        icon={<ArrowUp className="w-4 h-4" />}
      >
        Analyze RFP
      </PrimaryButton>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   STAGE 1 — Processing animation
   ═══════════════════════════════════════════════════════════════════ */
export const ProcessingStage = ({ steps, completedCount, theme }) => {
  const c = theme?.colors || {};

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto py-4">
      <ElliottAvatar size={40} />
      <div className="text-center space-y-1">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: c.textPrimary }}>
          Analyzing your RFP…
        </h2>
        <p className="text-sm" style={{ color: c.textSecondary }}>
          {completedCount < steps.length
            ? steps[completedCount]?.statusText
            : 'Almost done — preparing your response package.'}
        </p>
      </div>

      <GlassCard theme={theme} className="w-full divide-y" style={{ borderRadius: DESIGN_TOKENS.borderRadius.xl }}>
        {steps.map((step, idx) => {
          const done = idx < completedCount;
          const active = idx === completedCount;
          return (
            <div key={step.id} className="flex items-center gap-3 px-5 py-4" style={{ borderColor: c.border }}>
              {done ? (
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#4A7C59' }} />
              ) : active ? (
                <Loader2
                  className="w-5 h-5 flex-shrink-0 animate-spin"
                  style={{ color: c.accent }}
                />
              ) : (
                <div
                  className="w-5 h-5 rounded-full flex-shrink-0"
                  style={{ border: `2px solid ${c.border}` }}
                />
              )}
              <span
                className="text-sm font-medium"
                style={{
                  color: done ? c.textPrimary : active ? c.textPrimary : c.textSecondary,
                  opacity: done || active ? 1 : 0.5,
                }}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </GlassCard>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   STAGE 2 — Swipeable Multiple-Choice Cards with thinking state
   ═══════════════════════════════════════════════════════════════════ */

const ThinkingDots = ({ color }) => (
  <div className="flex items-center justify-center gap-1.5 py-8">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-2 h-2 rounded-full"
        style={{
          backgroundColor: color || '#D3A891',
          animation: `rfp-think-pulse 1.4s ease-in-out ${i * 0.2}s infinite`,
        }}
      />
    ))}
    <style>{`
      @keyframes rfp-think-pulse {
        0%, 80%, 100% { transform: scale(0.6); opacity: 0.3; }
        40% { transform: scale(1); opacity: 1; }
      }
    `}</style>
  </div>
);

export const ClarificationStage = ({
  questions,
  currentIndex,
  onAnswer,
  theme,
}) => {
  const c = theme?.colors || {};
  const isDark = isDarkTheme(theme);
  const total = questions.length;
  const q = questions[currentIndex];
  const [selected, setSelected] = useState(null);
  const [phase, setPhase] = useState('enter'); // 'enter' | 'visible' | 'exit' | 'thinking'
  const thinkTimerRef = useRef(null);

  /* Animate in on question change */
  useEffect(() => {
    setSelected(null);
    setPhase('enter');
    const t = setTimeout(() => setPhase('visible'), 60);
    return () => { clearTimeout(t); clearTimeout(thinkTimerRef.current); };
  }, [currentIndex]);

  const handleSelect = (choiceIdx) => {
    if (selected !== null) return;
    setSelected(choiceIdx);

    // Brief hold on selection → exit → thinking → next
    setTimeout(() => setPhase('exit'), 300);
    setTimeout(() => setPhase('thinking'), 600);

    // Random-ish thinking duration to feel organic (800–1600ms)
    const thinkMs = 800 + Math.random() * 800;
    thinkTimerRef.current = setTimeout(() => {
      onAnswer(choiceIdx);
    }, 600 + thinkMs);
  };

  if (!q) return null;

  const isThinking = phase === 'thinking';
  const isVisible = phase === 'visible';
  const isEnter = phase === 'enter';
  const isExit = phase === 'exit';

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-lg mx-auto flex-1" style={{ minHeight: 0 }}>
      {/* Subtle progress bar — no numbered dots */}
      <div className="w-full max-w-[200px] mb-8">
        <div
          className="w-full h-[3px] rounded-full overflow-hidden"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{
              width: `${((currentIndex + (isThinking ? 1 : 0)) / total) * 100}%`,
              backgroundColor: c.accent || '#353535',
            }}
          />
        </div>
      </div>

      {/* Thinking state */}
      {isThinking && (
        <div className="flex flex-col items-center gap-3" style={{ animation: 'rfp-fade-in 300ms ease' }}>
          <ElliottAvatar size={36} />
          <p className="text-sm font-medium" style={{ color: c.textSecondary }}>
            Thinking…
          </p>
          <ThinkingDots color={c.accent || '#353535'} />
          <style>{`
            @keyframes rfp-fade-in {
              from { opacity: 0; transform: translateY(6px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}</style>
        </div>
      )}

      {/* Question card */}
      {!isThinking && (
        <div
          className="w-full"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible
              ? 'translateY(0)'
              : isExit
                ? 'translateY(-20px)'
                : 'translateY(16px)',
            transition: 'opacity 350ms ease, transform 350ms ease',
          }}
        >
          {/* Question */}
          <h2
            className="text-[28px] font-bold tracking-tight leading-snug mb-4"
            style={{ color: c.textPrimary }}
          >
            {q.question}
          </h2>

          {/* RFP excerpt — small contextual hint */}
          {q.rfpExcerpt && (
            <p
              className="text-xs leading-relaxed mb-6"
              style={{ color: c.textSecondary, opacity: 0.6 }}
            >
              From RFP: &ldquo;{q.rfpExcerpt}&rdquo;
            </p>
          )}

          {/* Choices */}
          <div className="flex flex-col gap-2.5">
            {q.choices.map((choice, idx) => {
              const isSelected = selected === idx;
              const isNotSure = choice.toLowerCase().includes('not sure');
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  className="w-full text-left px-5 py-4 rounded-2xl transition-all duration-200 active:scale-[0.98]"
                  style={{
                    backgroundColor: isSelected
                      ? (c.accent || '#353535')
                      : (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'),
                    border: `1.5px solid ${isSelected ? (c.accent || '#353535') : (c.border || '#E3E0D8')}`,
                    color: isSelected
                      ? (c.accentText || '#fff')
                      : isNotSure ? c.textSecondary : c.textPrimary,
                    cursor: selected !== null ? 'default' : 'pointer',
                    opacity: selected !== null && !isSelected ? 0.35 : 1,
                  }}
                >
                  <span className={`text-sm ${isNotSure ? 'font-normal' : 'font-medium'}`}>{choice}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   STAGE 3 — Document-style Response Builder (paged PDF layout)
   ═══════════════════════════════════════════════════════════════════ */



const DocSectionHeading = ({ number, title, theme }) => {
  const c = theme?.colors || {};
  return (
    <h3 className="text-[11px] font-bold tracking-[0.15em] uppercase mb-1" style={{ color: c.textSecondary }}>
      {number}. {title}
    </h3>
  );
};

const DocLabel = ({ children, theme }) => (
  <div
    className="text-[10px] font-semibold tracking-[0.1em] uppercase mt-4 mb-1"
    style={{ color: theme?.colors?.textSecondary, opacity: 0.45 }}
  >
    {children}
  </div>
);

const DocField = ({ value, onChange, multiline = false, className = '', theme }) => {
  const ref = useRef(null);
  const isDark = isDarkTheme(theme);
  const c = theme?.colors || {};
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (multiline && ref.current) {
      ref.current.style.height = 'auto';
      ref.current.style.height = ref.current.scrollHeight + 'px';
    }
  }, [value, multiline]);

  const Tag = multiline ? 'textarea' : 'input';

  return (
    <Tag
      ref={ref}
      {...(multiline ? {} : { type: 'text' })}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`w-full outline-none resize-none text-[13px] leading-relaxed cursor-text rfp-editable-field ${className}`}
      style={{
        color: c.textPrimary,
        background: focused
          ? (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)')
          : 'transparent',
        padding: '4px 6px',
        margin: '0 -6px',
        borderRadius: '6px',
        borderBottom: focused ? `1.5px solid ${c.accent || '#353535'}` : '1.5px solid transparent',
        transition: 'background-color 150ms ease, border-color 150ms ease',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        overflow: 'hidden',
        whiteSpace: multiline ? 'pre-wrap' : undefined,
      }}
    />
  );
};

/* ── Blockquote for original RFP question ── */
const RfpQuote = ({ text, theme }) => {
  const c = theme?.colors || {};
  return (
    <div
      className="text-[12px] italic leading-relaxed my-2 pl-4 py-2"
      style={{
        color: c.textSecondary,
        borderLeft: `3px solid ${c.border || '#E3E0D8'}`,
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
      }}
    >
      &ldquo;{text}&rdquo;
    </div>
  );
};

/* ── Single "paper page" wrapper — true letter-size (8.5×11" at 96dpi = 816×1056px) ── */
const PDF_PAGE_W = 816;
const PDF_PAGE_H = 1056;

const PdfPage = ({ children, pageNumber, totalPages, footerTitle, theme, className = '' }) => {
  const isDark = isDarkTheme(theme);
  const c = theme?.colors || {};
  return (
    <div
      className={`pdf-page flex-shrink-0 ${className}`}
      style={{
        width: PDF_PAGE_W,
        height: PDF_PAGE_H,
        backgroundColor: isDark ? (c.surface || '#1e1e1e') : '#FFFFFF',
        borderRadius: '3px',
        border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`,
        boxShadow: isDark
          ? '0 4px 20px rgba(0,0,0,0.35)'
          : '0 1px 3px rgba(0,0,0,0.06), 0 6px 24px rgba(0,0,0,0.05)',
        padding: '60px 72px 48px',
        overflow: 'hidden',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        fontSize: '13px',
        lineHeight: '1.6',
      }}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
        {pageNumber && (
          <div
            className="flex items-center justify-between pt-3 mt-auto flex-shrink-0"
            style={{ color: c.textSecondary, opacity: 0.35, borderTop: `1px solid ${c.border || '#E3E0D8'}`, fontSize: '9px', letterSpacing: '0.1em', textTransform: 'uppercase' }}
          >
            <span>{footerTitle || 'RFP Response Package'}</span>
            <span>Page {pageNumber} of {totalPages}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export const ResponseBuilder = ({ data, onChange, onExport, onSave, theme }) => {
  const c = theme?.colors || {};
  const isDark = isDarkTheme(theme);
  const docRef = useRef(null);
  const [exporting, setExporting] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const viewerRef = useRef(null);
  const [scale, setScale] = useState(1);
  const TOTAL_PAGES = 8;

  /* Compute scale so the fixed-size page fits the available viewport */
  useEffect(() => {
    const computeScale = () => {
      if (!viewerRef.current) return;
      const rect = viewerRef.current.getBoundingClientRect();
      // Leave room for arrows (48px each side) and some padding
      const availW = rect.width - 96;
      const availH = rect.height - 16;
      const s = Math.min(availW / PDF_PAGE_W, availH / PDF_PAGE_H, 1);
      setScale(Math.max(0.25, s));
    };
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => window.removeEventListener('resize', computeScale);
  }, []);

  const goTo = useCallback((idx) => {
    setCurrentPage(Math.max(0, Math.min(TOTAL_PAGES - 1, idx)));
  }, []);

  /* Keyboard navigation */
  useEffect(() => {
    const handleKey = (e) => {
      if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); goTo(currentPage + 1); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goTo(currentPage - 1); }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentPage, goTo]);

  const updateField = (section, key, value) => {
    onChange((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        fields: { ...prev[section].fields, [key]: value },
      },
    }));
  };

  const updateFaq = (idx, value) => {
    onChange((prev) => {
      const items = [...prev.businessFaqs.items];
      items[idx] = { ...items[idx], answer: value };
      return { ...prev, businessFaqs: { ...prev.businessFaqs, items } };
    });
  };

  const updateVisual = (key, value) => {
    onChange((prev) => ({
      ...prev,
      visualIntent: { ...prev.visualIntent, [key]: value },
    }));
  };

  const updateProductFit = (key, value) => {
    onChange((prev) => ({
      ...prev,
      productFit: { ...prev.productFit, [key]: value },
    }));
  };

  const updateDealerField = (key, value) => {
    onChange((prev) => ({
      ...prev,
      dealerNotes: { ...prev.dealerNotes, fields: { ...prev.dealerNotes.fields, [key]: value } },
    }));
  };

  /* ── PDF Export — renders from hidden stacked container ── */
  const handlePdfExport = useCallback(async () => {
    if (!docRef.current || exporting) return;
    setExporting(true);

    try {
      const el = docRef.current;
      // Temporarily make visible for rendering
      el.style.position = 'static';
      el.style.left = 'auto';
      el.classList.add('pdf-exporting');

      await html2pdf()
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `RFP_Response_${data.projectRequirements.fields.projectName.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], before: '.pdf-page-break' },
        })
        .from(el)
        .save();

      el.classList.remove('pdf-exporting');
      el.style.position = 'absolute';
      el.style.left = '-9999px';
      onExport?.();
    } catch {
      if (docRef.current) {
        docRef.current.classList.remove('pdf-exporting');
        docRef.current.style.position = 'absolute';
        docRef.current.style.left = '-9999px';
      }
      onExport?.();
    } finally {
      setExporting(false);
    }
  }, [data, exporting, onExport]);

  const pr = data.projectRequirements;
  const bfaq = data.businessFaqs;
  const vi = data.visualIntent;
  const pf = data.productFit;
  const dn = data.dealerNotes;

  /* Short display title from project name */
  const footerTitle = pr.fields.projectName
    .replace(/\s*—.*$/, '')
    .replace(/\s*-\s*Office.*$/i, '')
    .trim() || 'RFP Response Package';

  return (
    <div className="w-full flex flex-col items-center flex-1" style={{ minHeight: 0 }}>
      {/* ── Top bar ── */}
      <div className="w-full flex items-center justify-between mb-2 px-2" style={{ maxWidth: Math.min(PDF_PAGE_W * scale + 96, PDF_PAGE_W + 96) }}>
        <div
          style={{ color: c.textSecondary, opacity: 0.4, fontSize: '10px', fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}
        >
          {footerTitle}
        </div>
        <div style={{ color: c.textSecondary, opacity: 0.35, fontSize: '10px', letterSpacing: '0.03em' }}>
          Click any text to edit
        </div>
      </div>

      {/* ── Page viewer area ── */}
      <div ref={viewerRef} className="flex-1 w-full flex items-center justify-center min-h-0 relative">
        {/* Left arrow */}
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 0}
          className="absolute left-1 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}
          aria-label="Previous page"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Page — zoom keeps text crisp at any size */}
        <div
          style={{
            width: PDF_PAGE_W,
            height: PDF_PAGE_H,
            zoom: scale,
            flexShrink: 0,
          }}
        >
          {/* Visible single page */}
          {renderPage(currentPage, { data, onChange, theme, c, updateField, updateFaq, updateVisual, updateProductFit, updateDealerField, pr, bfaq, vi, pf, dn, footerTitle })}
        </div>

        {/* Hidden doc for PDF export — all pages stacked */}
        <div
          ref={docRef}
          className="pdf-export-container"
          style={{ position: 'absolute', left: '-9999px', top: 0, width: PDF_PAGE_W }}
        >
          {renderAllPages({ data, onChange, theme, c, updateField, updateFaq, updateVisual, updateProductFit, updateDealerField, pr, bfaq, vi, pf, dn, footerTitle })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === TOTAL_PAGES - 1}
          className="absolute right-1 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Bottom bar: page dots + download ── */}
      <div className="w-full flex items-center justify-between mt-3 px-2 pb-3" style={{ maxWidth: Math.min(PDF_PAGE_W * scale + 96, PDF_PAGE_W + 96) }}>
        {/* Page dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-200"
              style={{
                width: i === currentPage ? 20 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: i === currentPage
                  ? (c.accent || '#353535')
                  : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)'),
              }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
          <span
            className="text-[11px] font-medium ml-2 tabular-nums"
            style={{ color: c.textSecondary, opacity: 0.5 }}
          >
            {currentPage + 1} / {TOTAL_PAGES}
          </span>
        </div>

        {/* Download button */}
        <button
          onClick={handlePdfExport}
          disabled={exporting}
          className="h-10 px-6 rounded-full flex items-center gap-2 text-[13px] font-semibold transition-all hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
          style={{
            backgroundColor: c.accent || '#353535',
            color: c.accentText || '#fff',
            boxShadow: '0 2px 10px rgba(0,0,0,0.12)',
          }}
        >
          <Download className="w-4 h-4" />
          {exporting ? 'Exporting…' : 'Download PDF'}
        </button>
      </div>

      {/* ── Print / export styles ── */}
      <style>{`
        .rfp-editable-field:hover {
          background: ${isDark ? 'rgba(255,255,255,0.025)' : 'rgba(53,53,53,0.015)'} !important;
        }
        .pdf-export-container.pdf-exporting {
          position: static !important;
          left: auto !important;
          width: 100% !important;
        }
        .pdf-exporting {
          gap: 0 !important;
        }
        .pdf-exporting .pdf-page {
          border-radius: 0 !important;
          border: none !important;
          box-shadow: none !important;
          margin-bottom: 0 !important;
          padding: 0.75in 0.75in 0.6in !important;
          width: 100% !important;
          height: auto !important;
          overflow: visible !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
        }
        .pdf-exporting .rfp-editable-field {
          background: transparent !important;
          border-bottom-color: transparent !important;
        }
        .pdf-exporting textarea,
        .pdf-exporting input {
          background: transparent !important;
          white-space: pre-wrap !important;
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          overflow: hidden !important;
        }
        .pdf-exporting table {
          table-layout: fixed !important;
          width: 100% !important;
        }
        .pdf-exporting td,
        .pdf-exporting th {
          word-break: break-word !important;
          overflow-wrap: break-word !important;
          white-space: normal !important;
        }
        @media print {
          .pdf-page { break-after: page; box-shadow: none !important; border: none !important; border-radius: 0 !important; height: auto !important; }
        }
      `}</style>
    </div>
  );
};

/* ── Page render helpers ── */
function renderPage(index, ctx) {
  const { theme, c, updateField, updateFaq, updateVisual, updateProductFit, updateDealerField, pr, bfaq, vi, pf, dn, footerTitle } = ctx;
  const isDark = isDarkTheme(theme);
  const T = 8;
  switch (index) {
    case 0: return (
      <PdfPage theme={theme} pageNumber={1} totalPages={T} footerTitle={footerTitle}>
        <div style={{ marginBottom: '24px' }}>
          <DocField value={pr.fields.projectName} onChange={(v) => updateField('projectRequirements', 'projectName', v)} className="font-bold tracking-tight" style={{ fontSize: '20px', lineHeight: '1.3' }} theme={theme} />
          <div className="flex flex-wrap items-center gap-x-5 gap-y-1 mt-2" style={{ color: c.textSecondary, fontSize: '12px' }}>
            <span>Response due <strong style={{ color: c.textPrimary }}>{pr.fields.dueDate}</strong></span>
            <span>Solicitation 47QSMA25Q0082</span>
          </div>
        </div>
        <div style={{ borderTop: `1px solid ${c.border}`, paddingTop: '1.25rem' }}>
          <DocSectionHeading number={1} title="Project Requirements" theme={theme} />
          <DocLabel theme={theme}>Scope & Deliverables</DocLabel>
          <DocField value={pr.fields.deliverables} onChange={(v) => updateField('projectRequirements', 'deliverables', v)} multiline theme={theme} />
          <DocLabel theme={theme}>Alternate Considerations</DocLabel>
          <DocField value={pr.fields.alternates} onChange={(v) => updateField('projectRequirements', 'alternates', v)} multiline theme={theme} />
          <DocLabel theme={theme}>Gaps & Missing Information</DocLabel>
          <DocField value={pr.fields.gaps} onChange={(v) => updateField('projectRequirements', 'gaps', v)} multiline theme={theme} />
        </div>
      </PdfPage>
    );
    case 1: return (
      <PdfPage theme={theme} pageNumber={2} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <DocSectionHeading number={2} title="Qualifications & Compliance" theme={theme} />
        {bfaq.items.slice(0, 3).map((item, idx) => (
          <div key={idx} className={idx > 0 ? 'mt-5' : 'mt-2'}>
            <DocLabel theme={theme}>{item.question}</DocLabel>
            {item.rfpQuestion && <RfpQuote text={item.rfpQuestion} theme={theme} />}
            <DocField value={item.answer} onChange={(v) => updateFaq(idx, v)} multiline theme={theme} />
          </div>
        ))}
      </PdfPage>
    );
    case 2: return (
      <PdfPage theme={theme} pageNumber={3} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <DocSectionHeading number={2} title="Qualifications & Compliance (continued)" theme={theme} />
        {bfaq.items.slice(3).map((item, idx) => (
          <div key={idx + 3} className={idx > 0 ? 'mt-5' : 'mt-2'}>
            <DocLabel theme={theme}>{item.question}</DocLabel>
            {item.rfpQuestion && <RfpQuote text={item.rfpQuestion} theme={theme} />}
            <DocField value={item.answer} onChange={(v) => updateFaq(idx + 3, v)} multiline theme={theme} />
          </div>
        ))}
      </PdfPage>
    );
    case 3: return (
      <PdfPage theme={theme} pageNumber={4} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <DocSectionHeading number={3} title="Finish & Material Direction" theme={theme} />
        <DocLabel theme={theme}>Design Approach</DocLabel>
        <DocField value={vi.summary} onChange={(v) => updateVisual('summary', v)} multiline theme={theme} />
        <DocLabel theme={theme}>Specified Finishes & Materials</DocLabel>
        <DocField value={vi.finishCallouts} onChange={(v) => updateVisual('finishCallouts', v)} multiline theme={theme} />
      </PdfPage>
    );
    case 4: return (
      <PdfPage theme={theme} pageNumber={5} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <DocSectionHeading number={4} title="Product Recommendations" theme={theme} />
        {renderProductCards(pf.typicals.slice(0, 3), { theme, c, isDark })}
      </PdfPage>
    );
    case 5: return (
      <PdfPage theme={theme} pageNumber={6} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.4, marginBottom: '14px' }}>Product Recommendations (continued)</div>
        {renderProductCards(pf.typicals.slice(3, 5), { theme, c, isDark })}
      </PdfPage>
    );
    case 6: return (
      <PdfPage theme={theme} pageNumber={7} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.4, marginBottom: '14px' }}>Product Recommendations (continued)</div>
        {renderProductCards(pf.typicals.slice(5, 7), { theme, c, isDark })}
        <div style={{ marginTop: '16px' }}>
          <DocLabel theme={theme}>Planning Assumptions</DocLabel>
          <DocField value={pf.assumptions} onChange={(v) => updateProductFit('assumptions', v)} multiline theme={theme} />
          <DocLabel theme={theme}>Coverage Gaps</DocLabel>
          <DocField value={pf.gaps} onChange={(v) => updateProductFit('gaps', v)} multiline theme={theme} />
        </div>
      </PdfPage>
    );
    case 7: return (
      <PdfPage theme={theme} pageNumber={8} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <DocSectionHeading number={5} title="Dealer & Commercial Notes" theme={theme} />
        <DocLabel theme={theme}>Project Administration</DocLabel>
        <DocField value={dn.fields.projectNotes} onChange={(v) => updateDealerField('projectNotes', v)} multiline theme={theme} />
        <DocLabel theme={theme}>Items Outside JSI Scope</DocLabel>
        <DocField value={dn.fields.nonJsiScope} onChange={(v) => updateDealerField('nonJsiScope', v)} multiline theme={theme} />
        <DocLabel theme={theme}>Teaming Partners</DocLabel>
        <DocField value={dn.fields.otherManufacturers} onChange={(v) => updateDealerField('otherManufacturers', v)} multiline theme={theme} />
        <DocLabel theme={theme}>Commercial Exceptions</DocLabel>
        <DocField value={dn.fields.commercialExceptions} onChange={(v) => updateDealerField('commercialExceptions', v)} multiline theme={theme} />
      </PdfPage>
    );
    default: return null;
  }
}

/* ── Product card renderer — shared between pages ── */
function renderProductCards(items, { c, isDark }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((t, i) => {
        const isLast = i === items.length - 1;
        return (
          <div
            key={t.itemCode}
            style={{
              padding: '12px 0',
              borderBottom: isLast ? 'none' : `1px solid ${c.border}`,
            }}
          >
            {/* Header row: code + series + image */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {/* Product image */}
              <div
                style={{
                  width: 110,
                  height: 80,
                  borderRadius: 6,
                  border: `1px solid ${c.border}`,
                  flexShrink: 0,
                  overflow: 'hidden',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
                }}
              >
                {t.image ? (
                  <img src={t.image} alt={t.series} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSecondary, opacity: 0.2, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {t.series}
                  </div>
                )}
              </div>
              {/* Title + solution */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: c.textPrimary }}>{t.itemCode}</span>
                  <span style={{ fontSize: '11px', color: c.textSecondary }}>{t.category}</span>
                </div>
                <div style={{ fontSize: '12px', fontWeight: 600, color: c.textPrimary, marginBottom: '5px' }}>
                  JSI {t.series}
                </div>
                {/* RFP requirement callout */}
                {t.rfpRequirement && (
                  <div
                    style={{
                      fontSize: '10px',
                      lineHeight: '1.5',
                      color: c.textSecondary,
                      backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.03)',
                      border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                      borderRadius: 4,
                      padding: '6px 8px',
                      fontStyle: 'italic',
                    }}
                  >
                    <span style={{ fontWeight: 600, fontStyle: 'normal', opacity: 0.6 }}>RFP: </span>
                    {t.rfpRequirement}
                  </div>
                )}
              </div>
            </div>
            {/* Rationale */}
            <div style={{ fontSize: '11px', lineHeight: '1.6', color: c.textSecondary, marginTop: '6px' }}>
              {t.rationale}
            </div>
            {/* Component list (for PO-1 etc.) */}
            {t.components && (
              <div
                style={{
                  fontSize: '10px',
                  lineHeight: '1.65',
                  color: c.textPrimary,
                  marginTop: '6px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(53,53,53,0.02)',
                  borderRadius: 4,
                  padding: '6px 8px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {t.components}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

function renderAllPages(ctx) {
  return (
    <div className="flex flex-col">
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <div key={i}>{renderPage(i, ctx)}</div>
      ))}
    </div>
  );
}
