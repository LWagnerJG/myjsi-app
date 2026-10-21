/* ── RFP Responder — Upload + single progress indicator ─────────── */
import React, { useRef, useState, useCallback } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import { FileText, Upload, X, ArrowUp } from 'lucide-react';

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
    <img src={ELLIOTT_AVATAR_URL} alt="Elliott" width={size} height={size} className="w-full h-full object-cover" loading="eager" />
  </div>
);

const formatFileSize = (bytes) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

export const UploadStage = ({
  files,
  onFileSelect,
  onFileRemove,
  onAnalyze,
  onSample,
  onLoadLegacySample,
  theme,
  aiStatus,
  error,
}) => {
  const isDark = isDarkTheme(theme);
  const c = theme?.colors || {};
  const inputRef = useRef(null);
  const [dragOver, setDragOver] = useState(false);
  const selected = files || [];

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    Array.from(e.dataTransfer?.files || [])
      .filter((f) => /\.pdf$/i.test(f.name) || f.type === 'application/pdf')
      .forEach((f) => onFileSelect(f));
  }, [onFileSelect]);

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto py-4">
      <ElliottAvatar size={40} />
      <div className="text-center space-y-1.5">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: c.textPrimary }}>
          RFP Responder
        </h2>
        <p className="text-sm leading-relaxed max-w-sm mx-auto" style={{ color: c.textSecondary }}>
          Upload a bid PDF. I&rsquo;ll extract requirements with page citations, draft from the JSI answer library, and build a go/no-go workspace you can export.
        </p>
      </div>

      {aiStatus && (
        <p className="text-xs text-center px-3" style={{ color: aiStatus.aiConfigured ? (c.textSecondary) : (theme?.colors?.warning || '#C4956A') }}>
          {aiStatus.aiConfigured
            ? `AI ready · ${aiStatus.authMethod || 'gateway'} · ${aiStatus.model || 'default model'}`
            : `AI not configured yet — extraction still works. ${aiStatus.aiMessage || ''}`}
        </p>
      )}

      {error ? (
        <p className="text-xs text-center px-3" style={{ color: theme?.colors?.error || '#B85C5C' }}>{error}</p>
      ) : null}

      <GlassCard
        theme={theme}
        variant="outlined"
        className="w-full cursor-pointer"
        style={{
          borderRadius: DESIGN_TOKENS.borderRadius.xl,
          border: dragOver ? `2px dashed ${c.accent || '#353535'}` : `2px dashed ${c.border || '#E3E0D8'}`,
          backgroundColor: dragOver ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.03)') : 'transparent',
        }}
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
      >
        <div className="flex flex-col items-center gap-3 py-12 px-6">
          <Upload className="w-8 h-8" style={{ color: c.textSecondary, opacity: 0.5 }} />
          <p className="text-sm font-medium" style={{ color: c.textSecondary }}>
            {dragOver ? 'Drop PDF here' : 'Drag & drop PDFs, or click to browse'}
          </p>
          <p className="text-xs" style={{ color: c.textSecondary, opacity: 0.5 }}>
            Up to 5 PDFs · 4 MB each · text extract per page · OCR for scans not enabled yet
          </p>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            Array.from(e.target.files || []).forEach((f) => onFileSelect(f));
            e.target.value = '';
          }}
        />
      </GlassCard>

      {selected.map((f) => (
        <GlassCard key={`${f.name}-${f.size}`} theme={theme} className="w-full px-4 py-3 flex items-center gap-3">
          <FileText className="w-5 h-5 flex-shrink-0" style={{ color: theme.colors.error }} />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium truncate" style={{ color: c.textPrimary }}>{f.name}</div>
            <div className="text-xs" style={{ color: c.textSecondary }}>{formatFileSize(f.size)} · PDF</div>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onFileRemove(f.name); }}
            className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
            aria-label="Remove file"
          >
            <X className="w-3.5 h-3.5" style={{ color: c.textSecondary }} />
          </button>
        </GlassCard>
      ))}

      <PrimaryButton
        theme={theme}
        disabled={!selected.length}
        fullWidth
        onClick={onAnalyze}
        icon={<ArrowUp className="w-4 h-4" />}
      >
        Analyze RFP
      </PrimaryButton>

      {onSample && (
        <button
          type="button"
          onClick={onSample}
          className="h-11 px-4 rounded-full text-xs font-semibold w-full"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}
        >
          Try sample bid — TAPS IFB 2025-10 (72 pp)
        </button>
      )}

      {onLoadLegacySample && (
        <button
          type="button"
          onClick={onLoadLegacySample}
          className="text-xs font-medium h-11 underline-offset-2 hover:underline"
          style={{ color: c.textSecondary }}
        >
          Load legacy GSA mock editor (demo only)
        </button>
      )}
    </div>
  );
};

/** One calm progress indicator — no fake multi-step checklist. */
export const ProcessingStage = ({ theme, progressPct = 0, statusText }) => {
  const c = theme?.colors || {};
  const isDark = isDarkTheme(theme);
  const pct = Math.max(0, Math.min(100, progressPct));

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-xl mx-auto py-10">
      <ElliottAvatar size={40} />
      <div className="text-center space-y-1 w-full">
        <h2 className="text-xl font-bold tracking-tight" style={{ color: c.textPrimary }}>
          Analyzing…
        </h2>
        <p className="text-sm" style={{ color: c.textSecondary }}>
          {statusText || 'Working on your bid package.'}
        </p>
      </div>
      <div className="w-full max-w-xs">
        <div
          className="h-2 rounded-full overflow-hidden"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${pct}%`, backgroundColor: c.accent || '#353535' }}
          />
        </div>
        <p className="text-xs mt-2 text-center tabular-nums" style={{ color: c.textSecondary }}>{pct}%</p>
      </div>
    </div>
  );
};

// Keep ClarificationStage export as no-op stub so old imports don't break if any remain
export const ClarificationStage = () => null;
