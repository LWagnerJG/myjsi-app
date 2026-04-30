import React, { useState, useCallback, useMemo } from 'react';
import { Upload, Globe, Building2, Lock, FileText } from 'lucide-react';
import { Modal } from '../../components/common/Modal.jsx';
import { isDarkTheme } from '../../design-system/tokens.js';
import { TEMPLATES, SCOPES } from './data.js';

const SCOPE_OPTIONS = [
  { value: 'private', label: 'Private', desc: 'Only you can see this.', icon: Lock },
  { value: 'company', label: 'Company', desc: 'Anyone at your dealer or rep group.', icon: Building2 },
  { value: 'public', label: 'Public', desc: 'Visible to the entire studio network.', icon: Globe },
];

export const CreateOnePagerModal = ({ show, onClose, theme, initialTemplate = 'product-one-pager', onPublished }) => {
  const dark = isDarkTheme(theme);
  const [template, setTemplate] = useState(initialTemplate);
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [scope, setScope] = useState('private');
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const subtle = (s = 1) => dark ? `rgba(255,255,255,${0.05 * s})` : `rgba(0,0,0,${0.03 * s})`;

  const reset = useCallback(() => {
    setTemplate(initialTemplate);
    setTitle('');
    setSummary('');
    setScope('private');
    setFile(null);
    setSubmitting(false);
  }, [initialTemplate]);

  const handleClose = useCallback(() => {
    reset();
    onClose?.();
  }, [reset, onClose]);

  const canPublish = useMemo(() => title.trim().length > 2 && summary.trim().length > 5 && !!file, [title, summary, file]);

  const handlePublish = useCallback(async (e) => {
    e?.preventDefault?.();
    if (!canPublish || submitting) return;
    setSubmitting(true);
    // Stub: would POST to API. For now we just hand back a draft record.
    const record = {
      id: title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').slice(0, 60) || `draft-${Date.now()}`,
      title: title.trim(),
      summary: summary.trim(),
      scope,
      template,
      fileName: file?.name,
      createdAt: Date.now(),
    };
    setTimeout(() => {
      onPublished?.(record);
      handleClose();
    }, 350);
  }, [canPublish, submitting, title, summary, scope, template, file, onPublished, handleClose]);

  return (
    <Modal show={show} onClose={handleClose} title="Publish a One-Pager" theme={theme} maxWidth="max-w-xl">
      <form onSubmit={handlePublish} className="space-y-5">

        {/* Template */}
        <div>
          <div className="text-[0.6875rem] font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Template</div>
          <div className="grid grid-cols-2 gap-2">
            {TEMPLATES.map((t) => {
              const Icon = t.icon;
              const active = template === t.id;
              return (
                <button type="button" key={t.id} onClick={() => setTemplate(t.id)}
                  className="text-left rounded-xl p-2.5 transition-all"
                  style={{
                    backgroundColor: active ? `${t.accent}1A` : subtle(1.5),
                    border: `1px solid ${active ? t.accent : 'transparent'}`,
                  }}>
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5" style={{ color: t.accent }} />
                    <span className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>{t.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="text-[0.6875rem] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Forge vs. Traditional Millwork" maxLength={80}
            className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none"
            style={{ backgroundColor: subtle(1.5), color: theme.colors.textPrimary, border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }} />
        </div>

        {/* Summary */}
        <div>
          <label className="text-[0.6875rem] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Summary</label>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={3} maxLength={240}
            placeholder="One or two sentences. What\u2019s in this and who\u2019s it for?"
            className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none"
            style={{ backgroundColor: subtle(1.5), color: theme.colors.textPrimary, border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }} />
          <div className="text-[0.625rem] mt-1 text-right" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>{summary.length}/240</div>
        </div>

        {/* File */}
        <div>
          <label className="text-[0.6875rem] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>PDF</label>
          <label className="mt-1.5 flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer transition-colors"
            style={{ backgroundColor: subtle(1.5), border: `1px dashed ${dark ? 'rgba(255,255,255,0.18)' : 'rgba(0,0,0,0.12)'}` }}>
            <input type="file" accept="application/pdf,.pdf" hidden onChange={(e) => setFile(e.target.files?.[0] || null)} />
            {file ? (
              <>
                <FileText className="w-4 h-4" style={{ color: theme.colors.accent }} />
                <span className="text-sm font-semibold truncate flex-1" style={{ color: theme.colors.textPrimary }}>{file.name}</span>
                <span className="text-xs" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>{(file.size / 1024).toFixed(0)} KB</span>
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
                <span className="text-sm" style={{ color: theme.colors.textSecondary }}>Click to upload a PDF (10 MB max)</span>
              </>
            )}
          </label>
        </div>

        {/* Visibility */}
        <div>
          <div className="text-[0.6875rem] font-bold uppercase tracking-wider mb-2" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Visibility</div>
          <div className="space-y-1.5">
            {SCOPE_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              const active = scope === opt.value;
              const tint = SCOPES[opt.value]?.tint || theme.colors.accent;
              return (
                <button type="button" key={opt.value} onClick={() => setScope(opt.value)}
                  className="w-full flex items-center gap-3 text-left rounded-xl p-3 transition-all"
                  style={{
                    backgroundColor: active ? `${tint}14` : subtle(1.5),
                    border: `1px solid ${active ? tint : 'transparent'}`,
                  }}>
                  <Icon className="w-4 h-4 flex-shrink-0" style={{ color: tint }} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{opt.label}</div>
                    <div className="text-xs" style={{ color: theme.colors.textSecondary }}>{opt.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button type="button" onClick={handleClose}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-semibold transition-colors active:opacity-70"
            style={{ backgroundColor: subtle(1.5), color: theme.colors.textPrimary }}>
            Cancel
          </button>
          <button type="submit" disabled={!canPublish || submitting}
            className="flex-1 px-4 py-2.5 rounded-full text-sm font-bold transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
            {submitting ? 'Publishing\u2026' : 'Publish'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateOnePagerModal;
