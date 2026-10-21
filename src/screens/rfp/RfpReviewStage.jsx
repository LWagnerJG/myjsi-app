/* ── Stage 3 — Requirements checklist + draft answers (review / export) ── */
import React, { useMemo, useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { PrimaryButton } from '../../components/common/JSIButtons.jsx';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import {
  Check, Copy, Download, FileText, AlertTriangle, Pencil, RotateCcw,
} from 'lucide-react';
import { copyMarkdownToClipboard, exportDocx, exportMarkdown } from './rfpExport.js';

export const RfpReviewStage = ({
  session,
  onUpdateAnswer,
  onSetApproval,
  onReset,
  onLoadSample,
  theme,
  setSuccessMessage,
}) => {
  const c = theme?.colors || {};
  const isDark = isDarkTheme(theme);
  const [filter, setFilter] = useState('all');
  const [exporting, setExporting] = useState(false);

  const requirements = session?.requirements || [];
  const answersById = useMemo(() => {
    const map = {};
    (session?.answers || []).forEach((a) => { map[a.requirementId] = a; });
    return map;
  }, [session?.answers]);

  const filtered = requirements.filter((req) => {
    const ans = answersById[req.id];
    if (filter === 'needs_info') return ans?.status === 'needs_info' || ans?.needsInfoQuestion;
    if (filter === 'drafted') return ans?.status === 'drafted' || ans?.status === 'library_match';
    if (filter === 'approved') return session?.approvals?.[req.id] === 'approved';
    return true;
  });

  const approvedCount = Object.values(session?.approvals || {}).filter((v) => v === 'approved').length;

  const toast = (msg, ok = true) => {
    setSuccessMessage?.(ok ? msg : msg);
    setTimeout(() => setSuccessMessage?.(''), 3200);
  };

  const handleExport = async (kind) => {
    if (exporting) return;
    setExporting(true);
    try {
      if (kind === 'md') {
        exportMarkdown(session);
        toast('Markdown downloaded');
      } else if (kind === 'docx') {
        await exportDocx(session);
        toast('DOCX downloaded');
      } else if (kind === 'copy') {
        await copyMarkdownToClipboard(session);
        toast('Copied response to clipboard');
      }
    } catch (e) {
      toast(e.message || 'Export failed', false);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 pb-8" style={{ minHeight: 0 }}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight" style={{ color: c.textPrimary }}>
            {session?.meta?.projectName || 'RFP Response'}
          </h2>
          <p className="text-sm mt-1" style={{ color: c.textSecondary }}>
            {[session?.meta?.solicitation, session?.meta?.dueDate ? `Due ${session.meta.dueDate}` : null]
              .filter(Boolean)
              .join(' · ') || 'Review drafted answers, approve, then export searchable text.'}
          </p>
          {session?.aiMessage && (
            <p className="text-xs mt-2 flex items-start gap-1.5" style={{ color: theme?.colors?.warning || '#C4956A' }}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{session.aiMessage}</span>
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onReset}
            className="h-11 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
            style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}
          >
            <RotateCcw className="w-3.5 h-3.5" /> New RFP
          </button>
          {onLoadSample && (
            <button
              type="button"
              onClick={onLoadSample}
              className="h-11 px-3 rounded-full text-xs font-semibold"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}
            >
              Load GSA sample
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Requirements', value: requirements.length },
          { label: 'Item codes', value: session?.itemCodes?.length || 0 },
          { label: 'Approved', value: approvedCount },
          { label: 'Mode', value: session?.extractionMode || '—' },
        ].map((stat) => (
          <GlassCard key={stat.label} theme={theme} className="px-3 py-2.5">
            <div className="text-[0.625rem] font-semibold uppercase tracking-wider" style={{ color: c.textSecondary, opacity: 0.6 }}>
              {stat.label}
            </div>
            <div className="text-sm font-bold mt-0.5 truncate" style={{ color: c.textPrimary }}>{stat.value}</div>
          </GlassCard>
        ))}
      </div>

      {(session?.emptyPages || []).length > 0 && (
        <GlassCard theme={theme} className="px-4 py-3" style={{ borderColor: theme?.colors?.warning }}>
          <div className="text-xs font-semibold mb-1" style={{ color: theme?.colors?.warning }}>
            Pages with no extractable text
          </div>
          <ul className="text-xs space-y-1" style={{ color: c.textSecondary }}>
            {session.emptyPages.map((p) => (
              <li key={`${p.fileName || ''}-${p.pageNumber}`}>
                {p.fileName ? `${p.fileName} ` : ''}p.{p.pageNumber}: {p.reason}
              </li>
            ))}
          </ul>
        </GlassCard>
      )}

      {/* Item codes strip */}
      {(session?.itemCodes || []).length > 0 && (
        <GlassCard theme={theme} className="px-4 py-3">
          <div className="text-[0.625rem] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textSecondary, opacity: 0.55 }}>
            Item codes & quantities
          </div>
          <div className="flex flex-wrap gap-2">
            {session.itemCodes.map((item) => (
              <span
                key={item.id || item.itemCode}
                className="text-xs px-2.5 py-1.5 rounded-lg"
                style={{
                  backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.05)',
                  color: c.textPrimary,
                }}
              >
                <strong>{item.itemCode}</strong>
                {item.quantity != null ? ` × ${item.quantity}` : ''}
                <span style={{ color: c.textSecondary, opacity: 0.7 }}> · p.{item.sourcePage}</span>
              </span>
            ))}
          </div>
        </GlassCard>
      )}

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { id: 'all', label: 'All' },
          { id: 'drafted', label: 'Drafted' },
          { id: 'needs_info', label: 'Needs info' },
          { id: 'approved', label: 'Approved' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className="h-10 px-3 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: filter === f.id ? (c.accent || '#353535') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
              color: filter === f.id ? (c.accentText || '#fff') : c.textSecondary,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Requirement cards */}
      <div className="flex flex-col gap-3">
        {filtered.map((req) => {
          const ans = answersById[req.id] || {};
          const approval = session?.approvals?.[req.id];
          return (
            <GlassCard
              key={req.id}
              theme={theme}
              className="px-4 py-4"
              style={{ borderRadius: DESIGN_TOKENS.borderRadius.xl }}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="text-[0.625rem] font-semibold uppercase tracking-wider mb-1" style={{ color: c.textSecondary, opacity: 0.5 }}>
                    {req.category || 'general'} · page {req.sourcePage}
                    {req.itemCode ? ` · ${req.itemCode}` : ''}
                  </div>
                  <p className="text-sm font-medium leading-snug" style={{ color: c.textPrimary }}>
                    {req.text}
                  </p>
                </div>
                <span
                  className="text-[0.625rem] font-bold uppercase tracking-wide px-2 py-1 rounded-md flex-shrink-0"
                  style={{
                    backgroundColor: approval === 'approved'
                      ? 'rgba(74,124,89,0.15)'
                      : ans.status === 'needs_info'
                        ? 'rgba(196,149,106,0.18)'
                        : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                    color: approval === 'approved'
                      ? (theme?.colors?.success || '#4A7C59')
                      : ans.status === 'needs_info'
                        ? (theme?.colors?.warning || '#C4956A')
                        : c.textSecondary,
                  }}
                >
                  {approval === 'approved' ? 'Approved' : (ans.status || 'open').replace('_', ' ')}
                </span>
              </div>

              {ans.needsInfoQuestion && (
                <div
                  className="text-xs mb-2 px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: isDark ? 'rgba(196,149,106,0.12)' : 'rgba(196,149,106,0.1)',
                    color: c.textPrimary,
                  }}
                >
                  Needs info: {ans.needsInfoQuestion}
                </div>
              )}

              <textarea
                value={ans.draftText || ''}
                onChange={(e) => onUpdateAnswer(req.id, { draftText: e.target.value, status: 'drafted' })}
                rows={3}
                placeholder="Draft answer (from library + RFP only)…"
                className="w-full text-sm leading-relaxed rounded-xl px-3 py-2.5 outline-none resize-y min-h-[88px]"
                style={{
                  color: c.textPrimary,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.03)',
                  border: `1px solid ${c.border || '#E3E0D8'}`,
                }}
              />

              <div className="flex flex-wrap gap-2 mt-3">
                <button
                  type="button"
                  onClick={() => onSetApproval(req.id, 'approved')}
                  className="h-11 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{
                    backgroundColor: approval === 'approved' ? (theme?.colors?.success || '#4A7C59') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'),
                    color: approval === 'approved' ? '#fff' : c.textPrimary,
                  }}
                >
                  <Check className="w-3.5 h-3.5" /> Approve
                </button>
                <button
                  type="button"
                  onClick={() => onSetApproval(req.id, approval === 'edited' ? null : 'edited')}
                  className="h-11 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
                  style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}
                >
                  <Pencil className="w-3.5 h-3.5" /> Mark edited
                </button>
              </div>
            </GlassCard>
          );
        })}
        {!filtered.length && (
          <p className="text-sm text-center py-8" style={{ color: c.textSecondary }}>
            No requirements in this filter.
          </p>
        )}
      </div>

      {/* Export bar */}
      <div
        className="sticky bottom-0 -mx-1 px-1 pt-3 pb-1 flex flex-wrap gap-2"
        style={{
          background: `linear-gradient(to top, ${theme?.colors?.background || '#fff'} 70%, transparent)`,
        }}
      >
        <PrimaryButton
          theme={theme}
          disabled={exporting}
          onClick={() => handleExport('md')}
          icon={<FileText className="w-4 h-4" />}
        >
          Export Markdown
        </PrimaryButton>
        <button
          type="button"
          disabled={exporting}
          onClick={() => handleExport('docx')}
          className="h-11 px-4 rounded-full text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: c.accent || '#353535', color: c.accentText || '#fff' }}
        >
          <Download className="w-3.5 h-3.5" /> DOCX
        </button>
        <button
          type="button"
          disabled={exporting}
          onClick={() => handleExport('copy')}
          className="h-11 px-4 rounded-full text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: c.textPrimary }}
        >
          <Copy className="w-3.5 h-3.5" /> Copy
        </button>
      </div>
    </div>
  );
};
