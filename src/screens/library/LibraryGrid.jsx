import React, { useEffect, useMemo, useState, useCallback } from 'react';
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

  // Masonry-ish responsive columns (2-3) letting images keep natural aspect ratio for better preview
  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: theme.colors.background }}>
      <div className="flex-1 overflow-y-auto px-4 pb-10">
        <div className="columns-2 md:columns-3 gap-3 space-y-3">
          {filtered.map(a => (
            <button key={a.id} onClick={()=>openDetail(a)} className="group relative w-full rounded-2xl overflow-hidden border focus:outline-none focus-visible:ring-2" style={{ borderColor: theme.colors.border, backgroundColor: theme.colors.surface }}>
              <img src={a.src} alt={a.alt || a.title || a.series} className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.03]" loading="lazy" />
              <div className="absolute inset-x-0 bottom-0 p-2 pt-10 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <p className="text-[11px] leading-tight text-white line-clamp-2">{a.title || `${a.series||''} ${a.finish||''}`}</p>
              </div>
            </button>
          ))}
          {!filtered.length && (
            <div className="text-center text-sm pt-20" style={{ color: theme.colors.textSecondary }}>No images match your filters. Try clearing search or filters.</div>
          )}
        </div>
      </div>
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" style={{ background:'rgba(0,0,0,0.55)' }} onMouseDown={(e)=>{ if(e.target===e.currentTarget) closeDetail(); }}>
          <div className="relative w-full max-w-5xl max-h-full overflow-auto rounded-3xl shadow-xl" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}` }}>
            <button onClick={closeDetail} className="absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center" style={{ background: theme.colors.subtle }} aria-label="Close detail"><X className="w-5 h-5" /></button>
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-4 md:p-6 flex items-center justify-center bg-black/5">
                <img src={selected.src} alt={selected.alt || selected.title} className="max-h-[70vh] w-auto rounded-xl object-contain" />
              </div>
              <div className="p-6 space-y-5">
                <div>
                  <h2 className="text-lg font-semibold" style={{ color: theme.colors.textPrimary }}>{selected.title || selected.series}</h2>
                  <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>{selected.location || selected.finish}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {selected.series && <span className="px-3 py-1 rounded-full text-[11px] font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>{selected.series}</span>}
                  {selected.finish && <span className="px-3 py-1 rounded-full text-[11px] font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>{selected.finish}</span>}
                  {(selected.tags||[]).map(t => <span key={t} className="px-3 py-1 rounded-full text-[11px]" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>{t}</span>)}
                </div>
                <div className="flex flex-wrap gap-3 pt-1">
                  <button onClick={()=>{ const link = window.location.origin + '/library#'+selected.id; navigator.clipboard.writeText(link); }} className="flex items-center gap-2 px-5 h-11 rounded-full text-sm font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }}><Share2 className="w-4 h-4" /> Share</button>
                  <button onClick={()=>{ navigator.clipboard.writeText(selected.src); }} className="flex items-center gap-2 px-5 h-11 rounded-full text-sm font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }}><Copy className="w-4 h-4" /> Copy Image URL</button>
                  <a href={selected.src} download target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 h-11 rounded-full text-sm font-medium" style={{ background: theme.colors.accent, color:'#fff' }}><Download className="w-4 h-4" /> Download</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LibraryGrid;
