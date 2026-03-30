/* ── RFP Responder — Sub-components ──────────────────────────────── */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import {
  FileText, Upload, CheckCircle2, Loader2, X,
  ArrowUp, Download, ChevronLeft, ChevronRight, Pencil,
} from 'lucide-react';
import html2pdf from 'html2pdf.js';

/* ── Elliott avatar ──────────────────────────────────────────────── */
const ELLIOTT_AVATAR_URL = '/elliott-avatar.png';

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
      className="w-full h-full object-cover"
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
          <FileText className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.error }} />
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
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.success }} />
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
    <div className="flex flex-col items-center w-full max-w-lg mx-auto flex-1" style={{ minHeight: 0 }}>
      {/* Subtle progress bar — pinned at top */}
      <div className="w-full max-w-[200px] mt-6 mb-6 flex-shrink-0">
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

      {/* Content — anchored below progress bar, not vertically centered */}
      <div className="flex-1 w-full flex items-start justify-center" style={{ minHeight: 0 }}>
        {/* Thinking state */}
        {isThinking && (
          <div className="flex flex-col items-center gap-3 pt-12" style={{ animation: 'rfp-fade-in 300ms ease' }}>
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
            {/* RFP excerpt — the primary visual element */}
            {q.rfpExcerpt && (
              <div
                className="rounded-xl mb-5 px-5 py-4"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <div
                  className="text-[10px] font-semibold tracking-[0.1em] uppercase mb-2"
                  style={{ color: c.textSecondary, opacity: 0.45 }}
                >
                  From the RFP
                </div>
                <p
                  className="text-[15px] leading-relaxed"
                  style={{ color: c.textPrimary, opacity: 0.85 }}
                >
                  &ldquo;{q.rfpExcerpt}&rdquo;
                </p>
              </div>
            )}

            {/* Question */}
            <h2
              className="text-xl font-bold tracking-tight leading-snug mb-5"
              style={{ color: c.textPrimary }}
            >
              {q.question}
            </h2>

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

const DocField = ({ value, onChange, multiline = false, className = '', style: styleProp, theme }) => {
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
  const readOnly = !onChange;

  return (
    <Tag
      ref={ref}
      {...(multiline ? {} : { type: 'text' })}
      value={value}
      readOnly={readOnly}
      onChange={readOnly ? undefined : (e) => onChange(e.target.value)}
      onFocus={() => !readOnly && setFocused(true)}
      onBlur={() => setFocused(false)}
      className={`w-full outline-none resize-none text-[13px] leading-relaxed cursor-text rfp-editable-field ${className}`}
      style={{
        color: c.textPrimary,
        background: focused
          ? (isDark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.035)')
          : 'transparent',
        padding: '4px 6px',
        margin: '0 -6px',
        borderRadius: '6px',
        borderBottom: readOnly
          ? 'none'
          : focused
            ? `1.5px solid ${c.accent || '#353535'}`
            : `1px dashed ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}`,
        transition: 'background-color 150ms ease, border-color 150ms ease, border-bottom-style 150ms ease',
        wordBreak: 'break-word',
        overflowWrap: 'break-word',
        overflow: 'hidden',
        whiteSpace: multiline ? 'pre-wrap' : undefined,
        ...styleProp,
      }}
    />
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

export const ResponseBuilder = ({ data, onChange, partnerItems, onPartnerItemChange, onExport, onSave, theme }) => {
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

  const updateFaqItem = (idx, key, value) => {
    onChange((prev) => {
      const items = [...prev.businessFaqs.items];
      items[idx] = { ...items[idx], [key]: value };
      return { ...prev, businessFaqs: { ...prev.businessFaqs, items } };
    });
  };

  const updateTypical = (idx, key, value) => {
    onChange((prev) => {
      const typicals = [...prev.productFit.typicals];
      typicals[idx] = { ...typicals[idx], [key]: value };
      return { ...prev, productFit: { ...prev.productFit, typicals } };
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

  /* ── PDF Export — clones the hidden container so the live UI never moves ── */
  const handlePdfExport = useCallback(async () => {
    if (!docRef.current || exporting) return;
    setExporting(true);

    // Clone the off-screen container so we never touch the live element's position.
    const clone = docRef.current.cloneNode(true);
    clone.classList.add('pdf-exporting');
    clone.style.cssText = `position:fixed;top:0;left:-9999px;width:${PDF_PAGE_W}px;z-index:-1;`;

    // html2canvas doesn't render React-controlled textarea/input values reliably
    // because React sets the DOM *property*, not the HTML *attribute*.
    // Fix: copy live values from the original, then swap every form element for a
    // plain <div> whose textContent is the real value.
    const liveFields = Array.from(docRef.current.querySelectorAll('textarea, input'));
    const cloneFields = Array.from(clone.querySelectorAll('textarea, input'));
    cloneFields.forEach((field, i) => {
      const liveValue = liveFields[i]?.value ?? field.value ?? '';
      const div = document.createElement('div');
      div.textContent = liveValue;
      // Preserve inline styles (font-size, font-weight, etc.) set by DocField's style prop
      if (field.getAttribute('style')) div.setAttribute('style', field.getAttribute('style'));
      // Preserve class-based colour / font rules
      div.className = field.className;
      div.style.whiteSpace = 'pre-wrap';
      div.style.wordBreak = 'break-word';
      div.style.overflowWrap = 'break-word';
      div.style.padding = '4px 6px';
      div.style.background = 'transparent';
      div.style.borderBottom = 'none';
      field.parentNode.replaceChild(div, field);
    });

    document.body.appendChild(clone);

    try {
      await html2pdf()
        .set({
          margin: [0.5, 0.5, 0.5, 0.5],
          filename: `RFP_Response_${data.projectRequirements.fields.projectName.slice(0, 40).replace(/[^a-zA-Z0-9]/g, '_')}.pdf`,
          image: { type: 'jpeg', quality: 0.95 },
          html2canvas: { scale: 2, useCORS: true, letterRendering: true },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' },
          pagebreak: { mode: ['css', 'legacy'], before: '.pdf-page-break' },
        })
        .from(clone)
        .save();
      onExport?.();
    } catch {
      onExport?.();
    } finally {
      document.body.removeChild(clone);
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
      <div className="w-full flex items-center justify-between mb-3 px-2" style={{ maxWidth: Math.min(PDF_PAGE_W * scale + 96, PDF_PAGE_W + 96) }}>
        <div
          style={{ color: c.textSecondary, opacity: 0.5, fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em' }}
        >
          {footerTitle}
        </div>
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{
            backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)',
            color: c.textSecondary,
            fontSize: '11px',
            fontWeight: 500,
          }}
        >
          <Pencil className="w-3 h-3" style={{ opacity: 0.55 }} />
          Click any text to edit
        </div>
      </div>

      {/* ── Page viewer area ── */}
      <div ref={viewerRef} className="flex-1 w-full flex items-center justify-center min-h-0 relative">
        {/* Left arrow */}
        <button
          onClick={() => goTo(currentPage - 1)}
          disabled={currentPage === 0}
          className="absolute left-2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: c.textPrimary, backdropFilter: 'blur(8px)' }}
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
          {renderPage(currentPage, { data, onChange, theme, c, updateField, updateFaq, updateFaqItem, updateTypical, updateVisual, updateProductFit, updateDealerField, pr, bfaq, vi, pf, dn, footerTitle, partnerItems, onPartnerItemChange })}
        </div>

        {/* Hidden doc for PDF export — all pages stacked */}
        <div
          ref={docRef}
          className="pdf-export-container"
          style={{ position: 'absolute', left: '-9999px', top: 0, width: PDF_PAGE_W }}
        >
          {renderAllPages({ data, onChange, theme, c, updateField, updateFaq, updateFaqItem, updateTypical, updateVisual, updateProductFit, updateDealerField, pr, bfaq, vi, pf, dn, footerTitle, partnerItems, onPartnerItemChange })}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => goTo(currentPage + 1)}
          disabled={currentPage === TOTAL_PAGES - 1}
          className="absolute right-2 z-10 w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105 active:scale-95 disabled:opacity-0 disabled:pointer-events-none"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: c.textPrimary, backdropFilter: 'blur(8px)' }}
          aria-label="Next page"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* ── Bottom bar: page dots + download ── */}
      <div className="w-full flex items-center justify-between mt-3 px-2 pb-3" style={{ maxWidth: Math.min(PDF_PAGE_W * scale + 96, PDF_PAGE_W + 96) }}>
        {/* Page navigation */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className="transition-all duration-200"
              style={{
                width: i === currentPage ? 22 : 7,
                height: 7,
                borderRadius: 4,
                backgroundColor: i === currentPage
                  ? (c.accent || '#353535')
                  : (isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'),
              }}
              aria-label={`Go to page ${i + 1}`}
            />
          ))}
          <span
            className="text-[11px] font-medium ml-1.5 tabular-nums"
            style={{ color: c.textSecondary, opacity: 0.5 }}
          >
            {currentPage + 1} / {TOTAL_PAGES}
          </span>
        </div>

        {/* Download button */}
        <button
          onClick={handlePdfExport}
          disabled={exporting}
          className="h-9 px-5 rounded-full flex items-center gap-2 text-[12px] font-semibold transition-all hover:scale-[1.02] active:scale-[0.97] disabled:opacity-50"
          style={{
            backgroundColor: c.accent || '#353535',
            color: c.accentText || '#fff',
            boxShadow: '0 1px 8px rgba(0,0,0,0.10)',
          }}
        >
          <Download className="w-3.5 h-3.5" />
          {exporting ? 'Exporting…' : 'Download PDF'}
        </button>
      </div>

      {/* ── Print / export styles ── */}
      <style>{`
        .rfp-editable-field:hover {
          background: ${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.025)'} !important;
          border-bottom-color: ${isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.15)'} !important;
          border-bottom-style: dashed !important;
        }
        .rfp-editable-field:focus {
          border-bottom-style: solid !important;
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
          border-bottom-style: none !important;
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
  const { theme, c, updateField, updateFaq, updateFaqItem, updateTypical, updateVisual, updateProductFit, updateDealerField, pr, bfaq, vi, pf, dn, footerTitle, partnerItems, onPartnerItemChange } = ctx;
  const isDark = isDarkTheme(theme);
  const T = 8;
  switch (index) {
    case 0: return (
      <PdfPage theme={theme} pageNumber={1} totalPages={T} footerTitle={footerTitle}>
        <div style={{ marginBottom: '24px' }}>
          <DocField value={pr.fields.projectName} onChange={(v) => updateField('projectRequirements', 'projectName', v)} className="font-bold tracking-tight" style={{ fontSize: '20px', lineHeight: '1.3' }} theme={theme} />
          <div style={{ display: 'flex', gap: '40px', marginTop: '10px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.4, marginBottom: '2px' }}>Response due</div>
              <DocField value={pr.fields.dueDate} onChange={(v) => updateField('projectRequirements', 'dueDate', v)} theme={theme} style={{ fontSize: '13px', fontWeight: 600 }} />
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.4, marginBottom: '2px' }}>Solicitation</div>
              <DocField value={pr.fields.solicitation || ''} onChange={(v) => updateField('projectRequirements', 'solicitation', v)} theme={theme} style={{ fontSize: '13px' }} />
            </div>
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
            <DocField value={item.question} onChange={(v) => updateFaqItem(idx, 'question', v)} theme={theme} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2px' }} />
            {item.rfpQuestion != null && (
              <DocField value={item.rfpQuestion} onChange={(v) => updateFaqItem(idx, 'rfpQuestion', v)} multiline theme={theme} style={{ fontSize: '11px', fontStyle: 'italic', lineHeight: '1.6', borderLeft: `3px solid ${c.border}`, borderBottom: 'none', paddingLeft: '12px', marginBottom: '4px' }} />
            )}
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
            <DocField value={item.question} onChange={(v) => updateFaqItem(idx + 3, 'question', v)} theme={theme} style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', opacity: 0.45, marginBottom: '2px' }} />
            {item.rfpQuestion != null && (
              <DocField value={item.rfpQuestion} onChange={(v) => updateFaqItem(idx + 3, 'rfpQuestion', v)} multiline theme={theme} style={{ fontSize: '11px', fontStyle: 'italic', lineHeight: '1.6', borderLeft: `3px solid ${c.border}`, borderBottom: 'none', paddingLeft: '12px', marginBottom: '4px' }} />
            )}
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
        {renderProductCards(pf.typicals.slice(0, 3), { theme, c, isDark, updateTypical, startIdx: 0 })}
      </PdfPage>
    );
    case 5: return (
      <PdfPage theme={theme} pageNumber={6} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.4, marginBottom: '14px' }}>Product Recommendations (continued)</div>
        {renderProductCards(pf.typicals.slice(3, 7), { theme, c, isDark, compact: true, updateTypical, startIdx: 3 })}
      </PdfPage>
    );
    case 6: return (
      <PdfPage theme={theme} pageNumber={7} totalPages={T} footerTitle={footerTitle} className="pdf-page-break">
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.4, marginBottom: '14px' }}>Product Recommendations (continued)</div>
        <div style={{ marginBottom: '14px' }}>
          <DocLabel theme={theme}>Planning Assumptions</DocLabel>
          <DocField value={pf.assumptions} onChange={(v) => updateProductFit('assumptions', v)} multiline theme={theme} />
        </div>
        <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.45, marginBottom: '6px' }}>
          Partner Items — Enter Manufacturer &amp; Product below
        </div>
        {(partnerItems || []).map((item) => renderPartnerItemCard(item, { c, isDark, onPartnerItemChange, theme }))}
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
        <div style={{ fontSize: '10px', fontStyle: 'italic', color: c.textSecondary, opacity: 0.45, marginBottom: '6px' }}>
          Derived from Product Matrix — page 7
        </div>
        {(partnerItems || []).map((item) => (
          <div key={item.itemCode} style={{ display: 'flex', gap: '8px', fontSize: '12px', lineHeight: '1.8', color: c.textPrimary }}>
            <span style={{ fontWeight: 700, flexShrink: 0, minWidth: '52px' }}>{item.itemCode}</span>
            <span style={{ color: c.textSecondary, flexShrink: 0 }}>{item.category}:</span>
            <span>
              {item.manufacturer && item.productModel
                ? `${item.manufacturer} — ${item.productModel}`
                : item.manufacturer || item.productModel || (
                    <span style={{ color: c.textSecondary, opacity: 0.4, fontStyle: 'italic' }}>TBD</span>
                  )}
            </span>
          </div>
        ))}
        <DocLabel theme={theme}>Commercial Exceptions</DocLabel>
        <DocField value={dn.fields.commercialExceptions} onChange={(v) => updateDealerField('commercialExceptions', v)} multiline theme={theme} />
      </PdfPage>
    );
    default: return null;
  }
}

/* ── Product card renderer — shared between pages ── */
function renderProductCards(items, { c, isDark, compact = false, theme, updateTypical, startIdx = 0 }) {
  const imgW = compact ? 84 : 110;
  const imgH = compact ? 60 : 80;
  const cardPad = compact ? '8px 0' : '12px 0';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
      {items.map((t, i) => {
        const absoluteIdx = startIdx + i;
        const isLast = i === items.length - 1;
        const update = updateTypical ? (key, v) => updateTypical(absoluteIdx, key, v) : null;
        return (
          <div
            key={t.itemCode}
            style={{ padding: cardPad, borderBottom: isLast ? 'none' : `1px solid ${c.border}` }}
          >
            {/* Header row: image + meta */}
            <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
              {/* Product image */}
              <div style={{
                width: imgW, height: imgH, borderRadius: 6,
                border: `1px solid ${c.border}`, flexShrink: 0,
                overflow: 'hidden',
                backgroundColor: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)',
              }}>
                {t.image
                  ? <img src={t.image} alt={t.series} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.textSecondary, opacity: 0.2, fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.series}</div>
                }
              </div>

              {/* Title block */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {/* Item code + category — structural identifiers, kept as labels */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 700, color: c.textPrimary }}>{t.itemCode}</span>
                  <span style={{ fontSize: '11px', color: c.textSecondary }}>{t.category}</span>
                </div>

                {/* Series — editable */}
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: c.textSecondary, flexShrink: 0 }}>JSI</span>
                  <DocField
                    value={t.series}
                    onChange={update ? (v) => update('series', v) : undefined}
                    theme={theme}
                    style={{ fontSize: '12px', fontWeight: 600 }}
                  />
                </div>

                {/* RFP requirement — editable */}
                <div style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
                  borderRadius: 4, padding: '5px 8px',
                }}>
                  <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.5 }}>RFP</span>
                  <DocField
                    value={t.rfpRequirement || ''}
                    onChange={update ? (v) => update('rfpRequirement', v) : undefined}
                    multiline
                    theme={theme}
                    style={{ fontSize: '10px', fontStyle: 'italic', lineHeight: '1.5' }}
                  />
                </div>
              </div>
            </div>

            {/* Rationale — editable */}
            <DocField
              value={t.rationale || ''}
              onChange={update ? (v) => update('rationale', v) : undefined}
              multiline
              theme={theme}
              style={{ fontSize: '11px', lineHeight: '1.6', marginTop: '6px' }}
            />

            {/* Component list — editable (monospace) */}
            {t.components != null && (
              <DocField
                value={t.components}
                onChange={update ? (v) => update('components', v) : undefined}
                multiline
                theme={theme}
                style={{
                  fontSize: '10px', lineHeight: '1.65', fontFamily: 'monospace',
                  marginTop: '6px',
                  backgroundColor: isDark ? 'rgba(255,255,255,0.025)' : 'rgba(53,53,53,0.02)',
                  borderRadius: 4, padding: '6px 8px',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Partner item card — non-JSI items with editable manufacturer fields ── */
function renderPartnerItemCard(item, { c, isDark, onPartnerItemChange, theme }) {
  const PARTNER_AMBER = '#B45309';
  const PARTNER_AMBER_BG = isDark ? 'rgba(251,191,36,0.10)' : 'rgba(180,83,9,0.07)';

  return (
    <div
      key={item.itemCode}
      style={{
        padding: '8px 0',
        borderBottom: `1px solid ${c.border}`,
        display: 'flex',
        gap: '14px',
        alignItems: 'flex-start',
      }}
    >
      {/* Amber placeholder box */}
      <div
        style={{
          width: 84,
          height: 60,
          borderRadius: 6,
          border: `1px solid ${PARTNER_AMBER}30`,
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: PARTNER_AMBER_BG,
          gap: '3px',
        }}
      >
        <span style={{ fontSize: '8px', fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: PARTNER_AMBER }}>
          PARTNER
        </span>
        <span style={{ fontSize: '9px', color: c.textSecondary, opacity: 0.5 }}>
          {item.itemCode}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '3px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: c.textPrimary }}>{item.itemCode}</span>
          <DocField
            value={item.category}
            onChange={(v) => onPartnerItemChange(item.itemCode, 'category', v)}
            theme={theme}
            style={{ fontSize: '11px', color: c.textSecondary }}
          />
          <span style={{
            fontSize: '9px', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase',
            color: PARTNER_AMBER, backgroundColor: PARTNER_AMBER_BG,
            border: `1px solid ${PARTNER_AMBER}40`, borderRadius: '4px', padding: '1px 5px',
            flexShrink: 0,
          }}>
            Partner Item
          </span>
        </div>
        <div style={{
          backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.03)',
          border: `1px solid ${isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
          borderRadius: 4, padding: '5px 7px', marginBottom: '6px',
        }}>
          <span style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.5 }}>RFP</span>
          <DocField
            value={item.rfpRequirement || ''}
            onChange={(v) => onPartnerItemChange(item.itemCode, 'rfpRequirement', v)}
            multiline
            theme={theme}
            style={{ fontSize: '10px', fontStyle: 'italic', lineHeight: '1.5' }}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.45, marginBottom: '2px' }}>
              Manufacturer
            </div>
            <DocField
              value={item.manufacturer}
              onChange={(v) => onPartnerItemChange(item.itemCode, 'manufacturer', v)}
              theme={theme}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '9px', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: c.textSecondary, opacity: 0.45, marginBottom: '2px' }}>
              Product / Model
            </div>
            <DocField
              value={item.productModel}
              onChange={(v) => onPartnerItemChange(item.itemCode, 'productModel', v)}
              theme={theme}
            />
          </div>
        </div>
      </div>
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
