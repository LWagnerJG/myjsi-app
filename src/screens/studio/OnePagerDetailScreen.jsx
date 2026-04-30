import React, { useCallback, useMemo, useState } from 'react';
import { ChevronLeft, Download, Share2, Eye, Calendar, Tag } from 'lucide-react';
import { isDarkTheme, JSI_COLORS as _JSI_COLORS } from '../../design-system/tokens.js';
import { ONE_PAGERS, SCOPES } from './data.js';
import { ScreenTopChrome } from '../../components/common/ScreenTopChrome.jsx';

const formatDate = (ts) => {
  try { return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return ''; }
};

export const OnePagerDetailScreen = ({ theme, screenParams, onNavigate, handleBack }) => {
  const dark = isDarkTheme(theme);
  const slug = screenParams?.slug;
  const resource = useMemo(() => ONE_PAGERS.find((r) => r.id === slug), [slug]);
  const [shareNote, setShareNote] = useState('');

  const goBack = useCallback(() => {
    if (typeof handleBack === 'function') handleBack();
    else if (typeof onNavigate === 'function') onNavigate('community/studio');
  }, [handleBack, onNavigate]);

  const onShare = useCallback(async () => {
    if (!resource) return;
    const url = typeof window !== 'undefined' ? `${window.location.origin}/community/studio/${resource.id}` : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: resource.title, text: resource.summary, url });
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        setShareNote('Link copied');
        setTimeout(() => setShareNote(''), 1800);
      }
    } catch { /* user cancelled */ }
  }, [resource]);

  if (!resource) {
    return (
      <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
        <div className="flex-1 flex items-center justify-center text-sm" style={{ color: theme.colors.textSecondary }}>
          Resource not found.
        </div>
      </div>
    );
  }

  const meta = SCOPES[resource.scope] || SCOPES.public;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background, color: theme.colors.textPrimary }}>
      <div className="flex-shrink-0" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 12px)', backgroundColor: theme.colors.background }}>
        <ScreenTopChrome theme={theme} contentClassName="pb-2" fade={false}>
          <div className="flex items-center gap-2">
            <button onClick={goBack}
              className="inline-flex items-center gap-1 pl-1.5 pr-3 rounded-full text-xs font-semibold transition-colors active:opacity-70"
              style={{ height: 'var(--jsi-ctrl-h)', color: theme.colors.textSecondary, background: theme.colors.subtle, border: `1px solid ${theme.colors.border}` }}>
              <ChevronLeft className="w-4 h-4" /> Studio
            </button>
            <span className="text-xs font-bold uppercase tracking-[0.16em] truncate" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>One-Pager</span>
          </div>
        </ScreenTopChrome>
      </div>

      <div className="flex-1 overflow-y-auto pb-12 scrollbar-hide">
        <div className="mx-auto w-full max-w-content px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.9fr)] lg:gap-8 lg:items-start pt-2">

            {/* Left: cover + embedded PDF */}
            <div className="space-y-4">
              {resource.cover ? (
                <div className="rounded-3xl overflow-hidden aspect-[16/10]" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : '#F0EDE8' }}>
                  <img src={resource.cover} alt={resource.title} className="w-full h-full object-cover" />
                </div>
              ) : null}

              <div className="rounded-3xl overflow-hidden" style={{ border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)'}`, backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF' }}>
                <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}>
                  <span className="text-[0.6875rem] font-bold uppercase tracking-wider" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>PDF Preview</span>
                  <a href={resource.pdfUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-semibold transition-opacity active:opacity-60" style={{ color: theme.colors.accent }}>
                    Open in tab
                  </a>
                </div>
                <object data={resource.pdfUrl} type="application/pdf" width="100%" height="640">
                  <div className="p-6 text-sm text-center" style={{ color: theme.colors.textSecondary }}>
                    Your browser can&rsquo;t embed PDFs.{' '}
                    <a href={resource.pdfUrl} target="_blank" rel="noopener noreferrer" className="font-semibold underline" style={{ color: theme.colors.accent }}>
                      Download the PDF
                    </a>
                    {' '}instead.
                  </div>
                </object>
              </div>
            </div>

            {/* Right: meta + actions */}
            <aside className="space-y-4 lg:sticky lg:top-24">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-wider mb-3"
                  style={{ backgroundColor: `${meta.tint}1A`, color: meta.tint }}>
                  {meta.label}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black leading-tight tracking-tight" style={{ color: theme.colors.textPrimary }}>{resource.title}</h1>
                <p className="text-sm leading-relaxed mt-3" style={{ color: theme.colors.textSecondary }}>{resource.summary}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <a href={resource.pdfUrl} download
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>
                  <Download className="w-3.5 h-3.5" /> Download PDF
                </a>
                <button onClick={onShare}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all active:scale-95"
                  style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}>
                  <Share2 className="w-3.5 h-3.5" /> {shareNote || 'Share'}
                </button>
              </div>

              <div className="rounded-2xl p-4 space-y-3" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.05)' : '#FFFFFF', border: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}` }}>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Author</span>
                  <span className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>{resource.author?.name}</span>
                </div>
                {resource.author?.role ? (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Role</span>
                    <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{resource.author.role}</span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>Series</span>
                  <span className="text-xs font-bold" style={{ color: theme.colors.textPrimary }}>{resource.series}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                    <Calendar className="w-3 h-3" /> Published
                  </span>
                  <span className="text-xs" style={{ color: theme.colors.textSecondary }}>{formatDate(resource.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                    <Eye className="w-3 h-3" /> Views
                  </span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>{resource.views?.toLocaleString?.() || resource.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold inline-flex items-center gap-1" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>
                    <Download className="w-3 h-3" /> Downloads
                  </span>
                  <span className="text-xs font-bold tabular-nums" style={{ color: theme.colors.textPrimary }}>{resource.downloads?.toLocaleString?.() || resource.downloads}</span>
                </div>
              </div>

              {resource.tags?.length ? (
                <div>
                  <div className="text-[0.625rem] font-bold uppercase tracking-wider mb-2 inline-flex items-center gap-1" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                    <Tag className="w-3 h-3" /> Tags
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {resource.tags.map((t) => (
                      <span key={t} className="text-[0.6875rem] font-semibold px-2 py-1 rounded-full"
                        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)', color: theme.colors.textSecondary }}>
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnePagerDetailScreen;
