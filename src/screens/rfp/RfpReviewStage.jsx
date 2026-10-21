/* ── RFP workspace: bid summary, matrix, answers, products, pricing, library, export ── */
import React, { useMemo, useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { isDarkTheme, DESIGN_TOKENS } from '../../design-system/tokens.js';
import {
  Check, Copy, Download, FileSpreadsheet, FileText, AlertTriangle,
  RotateCcw, X, BookOpen, Package,
} from 'lucide-react';
import {
  copyMarkdownToClipboard,
  exportComplianceExcel,
  exportDocx,
  exportLineItemsCsv,
  exportMarkdown,
} from './rfpExport.js';
import { isStale } from './rfpLibraryClient.js';
import { buildHonestyNotes } from './rfpReadiness.js';

const SECTIONS = [
  { id: 'summary', label: 'Summary' },
  { id: 'matrix', label: 'Matrix' },
  { id: 'answers', label: 'Answers' },
  { id: 'lines', label: 'Line items' },
  { id: 'products', label: 'Products' },
  { id: 'pricing', label: 'Pricing' },
  { id: 'library', label: 'Library' },
  { id: 'export', label: 'Export' },
];

function TonePill({ tone, children, theme }) {
  const c = theme?.colors || {};
  const bg = tone === 'positive'
    ? 'rgba(74,124,89,0.15)'
    : tone === 'negative'
      ? 'rgba(184,92,92,0.15)'
      : 'rgba(196,149,106,0.18)';
  const fg = tone === 'positive'
    ? (c.success || '#4A7C59')
    : tone === 'negative'
      ? (c.error || '#B85C5C')
      : (c.warning || '#C4956A');
  return (
    <span className="text-xs font-semibold px-2.5 py-1 rounded-lg" style={{ backgroundColor: bg, color: fg }}>
      {children}
    </span>
  );
}

export const RfpReviewStage = ({
  session,
  onUpdateAnswer,
  onSetApproval,
  onReset,
  onUpdateLibraryEntry,
  theme,
  setSuccessMessage,
}) => {
  const c = theme?.colors || {};
  const isDark = isDarkTheme(theme);
  const [section, setSection] = useState('summary');
  const [matrixFilter, setMatrixFilter] = useState('all');
  const [exporting, setExporting] = useState(false);
  const go = session?.goNoGo;
  const honestyNotes = useMemo(() => buildHonestyNotes(session), [session]);

  const approvals = session?.approvals || {};
  const approvedCount = Object.values(approvals).filter((v) => v === 'approved').length;
  const answerTotal = (session?.requirements || []).length;
  const progressPct = answerTotal ? Math.round((approvedCount / answerTotal) * 100) : 0;
  const undraftedCount = (session?.answers || []).filter((a) => !a.draftText || !String(a.draftText).trim()).length;

  const matrixRows = useMemo(() => {
    const rows = go?.matrix || [];
    if (matrixFilter === 'all') return rows;
    return rows.filter((r) => r.status === matrixFilter);
  }, [go?.matrix, matrixFilter]);

  const toast = (msg) => {
    setSuccessMessage?.(msg);
    setTimeout(() => setSuccessMessage?.(''), 3200);
  };

  const handleExport = async (kind) => {
    if (exporting) return;
    setExporting(true);
    try {
      if (kind === 'md') { exportMarkdown(session); toast('Markdown downloaded'); }
      else if (kind === 'docx') { await exportDocx(session); toast('DOCX downloaded'); }
      else if (kind === 'xlsx') { await exportComplianceExcel(session); toast('Compliance matrix downloaded'); }
      else if (kind === 'csv') { exportLineItemsCsv(session); toast('Line items CSV downloaded'); }
      else if (kind === 'copy') { await copyMarkdownToClipboard(session); toast('Copied to clipboard'); }
    } catch (e) {
      toast(e.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-4 pb-10" style={{ minHeight: 0 }}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-xl font-bold tracking-tight truncate" style={{ color: c.textPrimary }}>
            {go?.agency || session?.meta?.projectName || 'RFP workspace'}
          </h2>
          <p className="text-sm mt-1" style={{ color: c.textSecondary }}>
            {[go?.solicitation, go?.contractVehicle, go?.dueDate ? `Due ${go.dueDate}` : null]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="h-11 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
          style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}
        >
          <RotateCcw className="w-3.5 h-3.5" /> New
        </button>
      </div>

      {honestyNotes.length > 0 && (
        <GlassCard theme={theme} className="px-4 py-3 flex flex-col gap-2">
          <div className="text-[0.625rem] font-semibold uppercase tracking-wider" style={{ color: c.textSecondary, opacity: 0.55 }}>
            Provenance — what this run actually did
          </div>
          {honestyNotes.map((n) => (
            <p key={n.id} className="text-xs leading-relaxed flex gap-1.5 items-start" style={{ color: n.tone === 'positive' ? c.textSecondary : (c.warning || '#C4956A') }}>
              <AlertTriangle className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
              <span>{n.text}</span>
            </p>
          ))}
        </GlassCard>
      )}

      {/* Review progress */}
      <div>
        <div className="flex justify-between text-xs mb-1.5" style={{ color: c.textSecondary }}>
          <span>Review progress</span>
          <span>
            {approvedCount}/{answerTotal} approved · {progressPct}%
            {undraftedCount > 0 ? ` · ${undraftedCount} undrafted` : ''}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${progressPct}%`, backgroundColor: c.accent || '#353535' }} />
        </div>
      </div>

      {/* Section nav */}
      <div className="flex gap-1.5 flex-wrap">
        {SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => setSection(s.id)}
            className="h-10 px-3 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: section === s.id ? (c.accent || '#353535') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
              color: section === s.id ? (c.accentText || '#fff') : c.textSecondary,
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {section === 'summary' && go && (
        <GlassCard theme={theme} className="px-5 py-5" style={{ borderRadius: DESIGN_TOKENS.borderRadius.xl }}>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <TonePill tone={go.tone} theme={theme}>{go.recommendation}</TonePill>
            <span className="text-xs" style={{ color: c.textSecondary }}>Fit {go.fitScore}%</span>
            {go.dueDays != null && (
              <span className="text-xs" style={{ color: c.textSecondary }}>
                {go.dueDays >= 0 ? `${go.dueDays}d to due` : 'Past due'}
              </span>
            )}
          </div>
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
            {[
              ['Issuer / project', go.agency],
              ['Solicitation', go.solicitation || '—'],
              ['Due date', go.dueDate],
              ['Q&A cutoff', go.qaDeadline || '—'],
              ['Walk-through', go.walkThrough || '—'],
              ['Submission', go.submissionMethod || '—'],
              ['Contract vehicle', go.contractVehicle || '—'],
              ['Est. value (demo)', go.estimatedValue],
              ['Coverage', `${go.counts.meets} Meets · ${go.counts.partial} Partial · ${go.counts.gap} Gap · ${go.counts.partner} Partner`],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[0.625rem] font-semibold uppercase tracking-wider mb-0.5" style={{ color: c.textSecondary, opacity: 0.55 }}>{k}</dt>
                <dd style={{ color: c.textPrimary }}>{v}</dd>
              </div>
            ))}
          </dl>
          {go.risks?.length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${c.border}` }}>
              <div className="text-[0.625rem] font-semibold uppercase tracking-wider mb-2" style={{ color: c.textSecondary, opacity: 0.55 }}>Key risks</div>
              <ul className="space-y-1.5 text-sm" style={{ color: c.textPrimary }}>
                {go.risks.map((r) => <li key={r}>· {r}</li>)}
              </ul>
            </div>
          )}
          <p className="text-xs mt-4" style={{ color: c.textSecondary }}>{go.disclaimer}</p>
        </GlassCard>
      )}

      {section === 'matrix' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {['all', 'Meets', 'Partial', 'Partner', 'Gap'].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setMatrixFilter(f)}
                className="h-10 px-3 rounded-full text-xs font-semibold"
                style={{
                  backgroundColor: matrixFilter === f ? (c.accent || '#353535') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)'),
                  color: matrixFilter === f ? (c.accentText || '#fff') : c.textSecondary,
                }}
              >
                {f}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleExport('xlsx')}
              className="h-10 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5 ml-auto"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}
            >
              <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
            </button>
          </div>
          <div className="flex flex-col gap-2">
            {matrixRows.map((row) => (
              <GlassCard key={row.id} theme={theme} className="px-4 py-3">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <p className="text-sm font-medium leading-snug" style={{ color: c.textPrimary }}>{row.requirement}</p>
                  <TonePill
                    tone={row.status === 'Meets' ? 'positive' : row.status === 'Gap' ? 'negative' : 'caution'}
                    theme={theme}
                  >
                    {row.status}
                  </TonePill>
                </div>
                <p className="text-xs" style={{ color: c.textSecondary }}>
                  {row.category}
                  {row.sourcePage != null ? ` · p.${row.sourcePage}` : ''}
                  {row.mandatory ? ' · mandatory' : ''}
                  {` · ${row.confidence}`}
                  {row.owner ? ` · ${row.owner}` : ''}
                </p>
                {row.sourceQuote && (
                  <p className="text-xs mt-2 italic leading-relaxed" style={{ color: c.textSecondary }}>
                    “{row.sourceQuote}”
                    {!row.quoteVerified ? ' · unverified quote' : ''}
                  </p>
                )}
                {row.needsInfo && (
                  <p className="text-xs mt-2" style={{ color: c.warning || '#C4956A' }}>Needs info: {row.needsInfo}</p>
                )}
                {(row.risks || []).map((risk) => (
                  <p key={risk} className="text-xs mt-1" style={{ color: c.warning || '#C4956A' }}>Risk: {risk}</p>
                ))}
              </GlassCard>
            ))}
            {!matrixRows.length && (
              <p className="text-sm text-center py-8" style={{ color: c.textSecondary }}>No rows in this filter.</p>
            )}
          </div>
        </>
      )}

      {section === 'answers' && (
        <div className="flex flex-col gap-3">
          {(session?.requirements || []).map((req) => {
            const ans = (session.answers || []).find((a) => a.requirementId === req.id) || {};
            const approval = approvals[req.id];
            return (
              <GlassCard key={req.id} theme={theme} className="px-4 py-4" style={{ borderRadius: DESIGN_TOKENS.borderRadius.xl }}>
                <div className="text-[0.625rem] font-semibold uppercase tracking-wider mb-1" style={{ color: c.textSecondary, opacity: 0.5 }}>
                  {req.category || 'general'} · page {req.sourcePage}
                  {req.quoteVerified ? ' · cited' : ' · quote check failed'}
                </div>
                <p className="text-sm font-medium mb-2" style={{ color: c.textPrimary }}>{req.text}</p>
                {req.sourceQuote && (
                  <p className="text-xs italic mb-2 px-3 py-2 rounded-lg" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.03)', color: c.textSecondary }}>
                    RFP: “{req.sourceQuote}”
                  </p>
                )}
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {(!ans.draftText || !String(ans.draftText).trim()) && (
                    <TonePill tone="negative" theme={theme}>undrafted</TonePill>
                  )}
                  {(ans.status === 'needs_info' || ans.needsInfoQuestion) && (
                    <TonePill tone="caution" theme={theme}>needs Spec</TonePill>
                  )}
                  {ans.status === 'library_match' && (
                    <TonePill tone="positive" theme={theme}>library match</TonePill>
                  )}
                </div>
                {ans.needsInfoQuestion && (
                  <p className="text-xs mb-2" style={{ color: c.warning || '#C4956A' }}>Insufficient evidence → {ans.needsInfoQuestion}</p>
                )}
                {(ans.libraryIds || []).length > 0 && (
                  <p className="text-xs mb-2" style={{ color: c.textSecondary }}>Library: {(ans.libraryIds || []).join(', ')}</p>
                )}
                <textarea
                  value={ans.draftText || ''}
                  onChange={(e) => onUpdateAnswer(req.id, { draftText: e.target.value, status: 'drafted' })}
                  rows={3}
                  placeholder="No grounded draft yet — enter Spec answer or leave as needs info…"
                  className="w-full text-sm leading-relaxed rounded-xl px-3 py-2.5 outline-none resize-y min-h-[88px]"
                  style={{
                    color: c.textPrimary,
                    backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.03)',
                    border: `1px solid ${c.border || '#E3E0D8'}`,
                  }}
                />
                <div className="flex flex-wrap gap-2 mt-3">
                  <button type="button" onClick={() => onSetApproval(req.id, 'approved')} className="h-11 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
                    style={{ backgroundColor: approval === 'approved' ? (c.success || '#4A7C59') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'), color: approval === 'approved' ? '#fff' : c.textPrimary }}>
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button type="button" onClick={() => onSetApproval(req.id, 'rejected')} className="h-11 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
                    style={{ backgroundColor: approval === 'rejected' ? (c.error || '#B85C5C') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'), color: approval === 'rejected' ? '#fff' : c.textSecondary }}>
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {section === 'lines' && (
        <GlassCard theme={theme} className="px-4 py-4 overflow-x-auto">
          <div className="flex justify-end mb-3">
            <button
              type="button"
              onClick={() => handleExport('csv')}
              className="h-10 px-3 rounded-full text-xs font-semibold flex items-center gap-1.5"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: c.textPrimary }}
            >
              <Download className="w-3.5 h-3.5" /> CSV
            </button>
          </div>
          <table className="w-full text-sm" style={{ color: c.textPrimary }}>
            <thead>
              <tr style={{ color: c.textSecondary, fontSize: '0.625rem', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                <th className="text-left py-2 font-semibold">Code</th>
                <th className="text-left py-2 font-semibold">Qty</th>
                <th className="text-left py-2 font-semibold">Page</th>
                <th className="text-left py-2 font-semibold">Context</th>
              </tr>
            </thead>
            <tbody>
              {(session?.itemCodes || []).map((item) => (
                <tr key={item.id || item.itemCode} style={{ borderTop: `1px solid ${c.border}` }}>
                  <td className="py-2.5 font-semibold">{item.itemCode}</td>
                  <td className="py-2.5">{item.quantity ?? '—'}</td>
                  <td className="py-2.5">{item.sourcePage ?? '—'}</td>
                  <td className="py-2.5 text-xs" style={{ color: c.textSecondary }}>{item.context || item.sourceQuote || ''}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!(session?.itemCodes || []).length && (
            <p className="text-sm text-center py-6" style={{ color: c.textSecondary }}>No line items / item codes extracted.</p>
          )}
        </GlassCard>
      )}

      {section === 'products' && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-semibold" style={{ color: c.warning || '#C4956A' }}>
            DEMO-ONLY SKU suggestions — verify every series before any bid language.
          </p>
          <p className="text-xs" style={{ color: c.textSecondary }}>{session?.productMatch?.disclaimer}</p>
          {(session?.productMatch?.matches || []).map((m) => (
            <GlassCard key={m.itemCode} theme={theme} className="px-4 py-3 flex gap-3">
              {m.image ? (
                <img src={m.image} alt="" className="w-16 h-12 object-cover rounded-md flex-shrink-0" style={{ border: `1px solid ${c.border}` }} />
              ) : (
                <div className="w-16 h-12 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)' }}>
                  <Package className="w-4 h-4" style={{ color: c.textSecondary }} />
                </div>
              )}
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: c.textPrimary }}>
                  {m.itemCode} → {m.series}
                </div>
                <div className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
                  {m.categoryName} · qty {m.quantity} · {m.label} · {m.confidence} confidence
                </div>
                <div className="text-xs mt-1" style={{ color: c.textSecondary }}>{m.rationale}</div>
              </div>
            </GlassCard>
          ))}
          {(session?.productMatch?.exceptions || []).map((ex) => (
            <GlassCard key={ex.itemCode} theme={theme} className="px-4 py-3">
              <div className="text-sm font-semibold" style={{ color: c.textPrimary }}>{ex.itemCode} · {ex.status}</div>
              <div className="text-xs mt-1" style={{ color: c.warning || '#C4956A' }}>{ex.reason}</div>
            </GlassCard>
          ))}
          {!(session?.productMatch?.matches || []).length && !(session?.productMatch?.exceptions || []).length && (
            <p className="text-sm text-center py-8" style={{ color: c.textSecondary }}>No product matches yet.</p>
          )}
        </div>
      )}

      {section === 'pricing' && session?.pricing && (
        <GlassCard theme={theme} className="px-4 py-4">
          <p className="text-xs font-semibold mb-2" style={{ color: c.warning || '#C4956A' }}>
            DEMO PRICING ONLY — not a quote; rules-based catalog math.
          </p>
          <p className="text-xs mb-3" style={{ color: c.warning || '#C4956A' }}>{session.pricing.disclaimer}</p>
          <div className="text-xs mb-3" style={{ color: c.textSecondary }}>
            Discount {session.pricing.discountOption}
            {session.pricing.gsaMode ? ' · GSA mode (install ≤30%, IFF 0.75%)' : ''}
          </div>
          <div className="flex flex-col gap-2 text-sm">
            {(session.pricing.lines || []).map((line) => (
              <div key={line.itemCode} className="flex justify-between gap-3" style={{ borderBottom: `1px solid ${c.border}`, paddingBottom: 8 }}>
                <span style={{ color: c.textPrimary }}>{line.itemCode} {line.series} × {line.quantity}</span>
                <span style={{ color: c.textSecondary }}>${Math.round(line.extNet).toLocaleString()} net</span>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm space-y-1" style={{ color: c.textPrimary }}>
            <div className="flex justify-between"><span>Subtotal net</span><span>${Math.round(session.pricing.subtotalNet).toLocaleString()}</span></div>
            <div className="flex justify-between"><span>Install ({Math.round(session.pricing.installFeePct * 100)}%)</span><span>${Math.round(session.pricing.installFee).toLocaleString()}</span></div>
            {session.pricing.iff > 0 && (
              <div className="flex justify-between"><span>IFF (0.75%)</span><span>${Math.round(session.pricing.iff).toLocaleString()}</span></div>
            )}
            <div className="flex justify-between font-bold pt-2" style={{ borderTop: `1px solid ${c.border}` }}>
              <span>Demo total</span><span>${Math.round(session.pricing.total).toLocaleString()}</span>
            </div>
          </div>
        </GlassCard>
      )}

      {section === 'library' && (
        <div className="flex flex-col gap-3">
          {(session?.libraryEntries || []).map((entry) => (
            <GlassCard key={entry.id} theme={theme} className="px-4 py-4">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <div className="text-sm font-semibold" style={{ color: c.textPrimary }}>{entry.title}</div>
                  <div className="text-xs mt-0.5" style={{ color: c.textSecondary }}>
                    {entry.owner} · reviewed {entry.lastReviewed}
                    {isStale(entry) ? ' · stale' : ''}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  {entry.needsApproval && <TonePill tone="caution" theme={theme}>needs approval</TonePill>}
                  {(entry.riskFlags || []).length > 0 && <TonePill tone="negative" theme={theme}>risk</TonePill>}
                </div>
              </div>
              <textarea
                value={entry.body}
                onChange={(e) => onUpdateLibraryEntry?.(entry.id, { body: e.target.value })}
                rows={4}
                className="w-full text-sm leading-relaxed rounded-xl px-3 py-2.5 outline-none resize-y mt-2"
                style={{
                  color: c.textPrimary,
                  backgroundColor: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.03)',
                  border: `1px solid ${c.border || '#E3E0D8'}`,
                }}
              />
              <div className="mt-2 flex flex-wrap gap-2">
                {(entry.sourceUrls || []).map((url) => (
                  <a key={url} href={url} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: c.textSecondary }}>
                    Source
                  </a>
                ))}
              </div>
            </GlassCard>
          ))}
          {!(session?.libraryEntries || []).length && (
            <p className="text-sm text-center py-8 flex flex-col items-center gap-2" style={{ color: c.textSecondary }}>
              <BookOpen className="w-5 h-5" /> Library entries load with the analysis response.
            </p>
          )}
        </div>
      )}

      {section === 'export' && (
        <GlassCard theme={theme} className="px-5 py-5">
          <p className="text-sm mb-4" style={{ color: c.textSecondary }}>
            Assemble a searchable proposal from approved answers, matrix, products, pricing, and exclusions.
          </p>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={exporting} onClick={() => handleExport('docx')} className="h-11 px-4 rounded-full text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: c.accent || '#353535', color: c.accentText || '#fff' }}>
              <FileText className="w-3.5 h-3.5" /> Proposal DOCX
            </button>
            <button type="button" disabled={exporting} onClick={() => handleExport('md')} className="h-11 px-4 rounded-full text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: c.textPrimary }}>
              <Download className="w-3.5 h-3.5" /> Markdown
            </button>
            <button type="button" disabled={exporting} onClick={() => handleExport('xlsx')} className="h-11 px-4 rounded-full text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: c.textPrimary }}>
              <FileSpreadsheet className="w-3.5 h-3.5" /> Matrix Excel
            </button>
            <button type="button" disabled={exporting} onClick={() => handleExport('copy')} className="h-11 px-4 rounded-full text-xs font-semibold flex items-center gap-2 disabled:opacity-50"
              style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)', color: c.textPrimary }}>
              <Copy className="w-3.5 h-3.5" /> Copy
            </button>
          </div>
        </GlassCard>
      )}
    </div>
  );
};
