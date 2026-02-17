import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { INITIAL_ASSETS } from './data.js';
import { X, Download, Share2, Copy } from 'lucide-react';

// Simple in-memory library grid with mock data
export const LibraryGrid = ({ theme, query, parentHeaderRef }) => {
  const [selected, setSelected] = useState(null); // asset
  const [assets] = useState(INITIAL_ASSETS);

  const filtered = useMemo(() => {
    const q = (query||'').trim().toLowerCase();
    if(!q) return assets;
    return assets.filter(a => [a.title, a.series, a.finish, a.location, (a.tags||[]).join(' ')].filter(Boolean).join(' ').toLowerCase().includes(q));
  }, [assets, query]);

  const openDetail = useCallback((asset)=> setSelected(asset), []);
  const closeDetail = useCallback(()=> setSelected(null), []);

  useEffect(()=> {
    const handler = (e) => { if(e.key==='Escape') closeDetail(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [closeDetail]);

  useEffect(()=> {
    if(!parentHeaderRef?.current) return;
    parentHeaderRef.current.style.transition = 'filter 180ms ease, opacity 180ms ease';
    if(selected){ parentHeaderRef.current.style.filter = 'grayscale(1) brightness(.85)'; parentHeaderRef.current.style.opacity = '.55'; }
    else { parentHeaderRef.current.style.filter = ''; parentHeaderRef.current.style.opacity = '1'; }
  }, [selected, parentHeaderRef]);

  // Proper 2-column grid (masonry-style with auto rows)
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 px-4 pt-2">
          {filtered.map(a => (
            <button key={a.id} onClick={()=>openDetail(a)} className="group relative w-full rounded-2xl overflow-hidden border focus:outline-none focus-visible:ring-2" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
              <div className="aspect-square overflow-hidden">
                <img src={a.src} alt={a.alt || a.title || a.series} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
              </div>
              <div className="absolute inset-x-0 bottom-0 p-2 pt-8 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[11px] leading-tight text-white line-clamp-2">{a.title || `${a.series||''} ${a.finish||''}`}</p>
              </div>
            </button>
          ))}
          {!filtered.length && (
            <div className="col-span-2 sm:col-span-3 text-center text-sm pt-20" style={{ color: theme.colors.textSecondary }}>No images match your filters.</div>
          )}
        </div>
      </div>

      {/* Detail modal via portal so it's never clipped by overflow containers */}
      {selected && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(6px)' }}
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeDetail(); }}
        >
          <div
            className="relative w-full max-w-2xl sm:mx-4 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden"
            style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, maxHeight: '92dvh' }}
          >
            {/* Close */}
            <button
              onClick={closeDetail}
              aria-label="Close"
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(0,0,0,0.35)' }}
            >
              <X className="w-4 h-4 text-white" />
            </button>

            {/* Scrollable content */}
            <div className="overflow-y-auto" style={{ maxHeight: '92dvh' }}>
              {/* Hero image */}
              <div className="w-full bg-black/10 flex items-center justify-center" style={{ maxHeight: '55vw' }}>
                <img
                  src={selected.src}
                  alt={selected.alt || selected.title}
                  className="w-full object-contain"
                  style={{ maxHeight: '55vw' }}
                />
              </div>

              {/* Info */}
              <div className="p-5 space-y-4">
                <div>
                  <h2 className="text-[17px] font-bold leading-snug" style={{ color: theme.colors.textPrimary }}>{selected.title || selected.series}</h2>
                  {(selected.location || selected.finish) && (
                    <p className="text-[12px] mt-0.5" style={{ color: theme.colors.textSecondary }}>{selected.location || selected.finish}</p>
                  )}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5">
                  {selected.series && <span className="px-3 py-1 rounded-full text-[11px] font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>{selected.series}</span>}
                  {selected.finish && <span className="px-3 py-1 rounded-full text-[11px] font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>{selected.finish}</span>}
                  {(selected.tags||[]).map(t => <span key={t} className="px-3 py-1 rounded-full text-[11px]" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>{t}</span>)}
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-2 pb-2">
                  <button
                    onClick={() => { navigator.clipboard.writeText(window.location.origin + '/library#' + selected.id); }}
                    className="flex items-center gap-2 px-4 h-10 rounded-full text-[13px] font-medium"
                    style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                  <button
                    onClick={() => { navigator.clipboard.writeText(selected.src); }}
                    className="flex items-center gap-2 px-4 h-10 rounded-full text-[13px] font-medium"
                    style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}
                  >
                    <Copy className="w-3.5 h-3.5" /> Copy URL
                  </button>
                  <a
                    href={selected.src}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-2 px-4 h-10 rounded-full text-[13px] font-semibold"
                    style={{ background: theme.colors.accent, color: theme.colors.accentText }}
                  >
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default LibraryGrid;
