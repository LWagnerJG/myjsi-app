/* ── RFP Responder — Stage 0/1/2 Components ───────────────────── */
import React, { useRef, useState, useCallback, useEffect } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import {
  FileText, Upload, CheckCircle2, Loader2, X,
  ArrowUp,
} from 'lucide-react';

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
            ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.03)')
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
            : 'Almost done - preparing your response package.'}
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

/* ═══════════════════════════════════════════════════════════════════
   STAGE 2 — Swipeable Multiple-Choice Cards with thinking state
   ═══════════════════════════════════════════════════════════════════ */
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

  useEffect(() => {
    setSelected(null);
    setPhase('enter');
    const t = setTimeout(() => setPhase('visible'), 60);
    return () => { clearTimeout(t); clearTimeout(thinkTimerRef.current); };
  }, [currentIndex]);

  const handleSelect = (choiceIdx) => {
    if (selected !== null) return;
    setSelected(choiceIdx);

    setTimeout(() => setPhase('exit'), 300);
    setTimeout(() => setPhase('thinking'), 600);

    const thinkMs = 800 + Math.random() * 800;
    thinkTimerRef.current = setTimeout(() => {
      onAnswer(choiceIdx);
    }, 600 + thinkMs);
  };

  if (!q) return null;

  const isThinking = phase === 'thinking';
  const isVisible = phase === 'visible';
  const isExit = phase === 'exit';

  return (
    <div className="flex flex-col items-center w-full max-w-lg mx-auto flex-1" style={{ minHeight: 0 }}>
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

      <div className="flex-1 w-full flex items-start justify-center" style={{ minHeight: 0 }}>
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
            {q.rfpExcerpt && (
              <div
                className="rounded-xl mb-5 px-5 py-4"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.03)',
                  border: `1px solid ${isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'}`,
                }}
              >
                <div
                  className="text-[0.625rem] font-semibold tracking-[0.1em] uppercase mb-2"
                  style={{ color: c.textSecondary, opacity: 0.45 }}
                >
                  From the RFP
                </div>
                <p
                  className="text-[0.9375rem] leading-relaxed"
                  style={{ color: c.textPrimary, opacity: 0.85 }}
                >
                  &ldquo;{q.rfpExcerpt}&rdquo;
                </p>
              </div>
            )}

            <h2
              className="text-xl font-bold tracking-tight leading-snug mb-5"
              style={{ color: c.textPrimary }}
            >
              {q.question}
            </h2>

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
                        : (isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.03)'),
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
