import React, { useState, useRef, useEffect, useMemo, useLayoutEffect } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import StandardSearchBar from '../../../components/common/StandardSearchBar.jsx';
import { Download, Share2, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { PRESENTATIONS_DATA, PRESENTATION_CATEGORIES, MOCK_PRESENTATION_PDF_BASE64 } from './data.js';

// Revised shadow tokens (remove heavy base shadow to avoid dark banding under pills)
const BTN_INACTIVE_SHADOW = '0 0 0 1px rgba(0,0,0,0.06)'; // ring only
const BTN_ACTIVE_SHADOW = '0 2px 6px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08)';
const CARD_SHADOW = '0 4px 12px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.06)';

const WhiteCard = ({ children, className='', style={} }) => (
  <div className={`rounded-3xl border transition-shadow duration-300 bg-white ${className}`} style={{ borderColor:'rgba(0,0,0,0.07)', boxShadow: CARD_SHADOW, ...style }}>{children}</div>
);

export const PresentationsScreen = ({ theme }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [preview, setPreview] = useState(null);
  const [search, setSearch] = useState('');
  const [showInfo, setShowInfo] = useState(true);
  const infoRef = useRef(null);
  const listRef = useRef(null);
  const [infoHeight, setInfoHeight] = useState(0);
  const [infoHidden, setInfoHidden] = useState(false);

  const presentations = PRESENTATIONS_DATA;
  const categories = useMemo(()=>['all', ...PRESENTATION_CATEGORIES], []);

  useLayoutEffect(()=>{ if(infoRef.current) setInfoHeight(infoRef.current.scrollHeight); }, [infoRef.current]);

  useEffect(()=>{ const el = listRef.current; if(!el) return; const onScroll=()=> setShowInfo(el.scrollTop < 40); el.addEventListener('scroll', onScroll); return ()=> el.removeEventListener('scroll', onScroll); },[]);

  // After collapse finish, mark hidden to prevent stray background causing shadow band
  useEffect(()=>{ if(!showInfo){ const t=setTimeout(()=> setInfoHidden(true), 450); return ()=> clearTimeout(t);} else { setInfoHidden(false);} }, [showInfo]);

  const filtered = useMemo(()=> presentations.filter(p => { const catOk = selectedCategory==='all'|| p.category===selectedCategory; if(!catOk) return false; if(!search.trim()) return true; const t=search.toLowerCase(); return p.title.toLowerCase().includes(t)|| p.description.toLowerCase().includes(t)|| p.category.toLowerCase().includes(t); }), [presentations, selectedCategory, search]);

  const downloadMock = (p) => { const a=document.createElement('a'); a.href=MOCK_PRESENTATION_PDF_BASE64; a.download=p.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.pdf'; document.body.appendChild(a); a.click(); a.remove(); };
  const sharePresentation = async (p) => { const text=`${p.title} – ${p.description}`; if(navigator.share){ try { await navigator.share({ title:p.title, text }); } catch(_){} } else { navigator.clipboard.writeText(text); alert('Link copied'); } };

  const SlideCarousel = ({ pres }) => { const [idx,setIdx] = useState(0); const slides = pres.slides || []; if(!slides.length) return null; const next = () => setIdx(i=>(i+1)%slides.length); const prev = () => setIdx(i=>(i-1+slides.length)%slides.length); const current = slides[idx]; return (
    <div className="relative group" aria-label={`${pres.title} slide preview`}>
      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/5 border" style={{ borderColor: theme.colors.border }}>
        <img src={current.image} alt={current.caption} className="w-full h-full object-cover" loading="lazy" />
      </div>
      {slides.length > 1 && (
        <>
          <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 left-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition" aria-label="Previous slide"><ChevronLeft className="w-4 h-4" /></button>
          <button onClick={next} className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition" aria-label="Next slide"><ChevronRight className="w-4 h-4" /></button>
        </>
      )}
      <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
        {slides.map((s,i)=>(<span key={s.id} onClick={()=>setIdx(i)} className={`w-2 h-2 rounded-full cursor-pointer ${i===idx?'scale-110':''}`} style={{ background: i===idx? theme.colors.accent: theme.colors.surface, border:`1px solid ${theme.colors.border}` }} />))}
      </div>
      <button onClick={()=>setPreview({ pres, idx })} className="absolute top-1 right-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>View</button>
    </div>
  ); };

  const PresentationCard = ({ p }) => (
    <WhiteCard className="p-5 space-y-5">
      <SlideCarousel pres={p} />
      <div className="flex flex-col gap-2">
        <h3 className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{p.title}</h3>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-medium">
          <span className="px-2 py-1 rounded-full" style={{ background: theme.colors.accent+'22', color: theme.colors.accent }}>{p.category}</span>
          <span style={{ color: theme.colors.textSecondary }}>{p.type} • {p.size}</span>
          <span style={{ color: theme.colors.textSecondary }}>Updated {new Date(p.lastUpdated).toLocaleDateString()}</span>
        </div>
        <p className="text-sm leading-snug" style={{ color: theme.colors.textSecondary }}>{p.description}</p>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>downloadMock(p)} className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white transition-all" style={{ background: theme.colors.accent, boxShadow: BTN_INACTIVE_SHADOW }}>
          Download
        </button>
        <button onClick={()=>sharePresentation(p)} className="h-10 px-5 rounded-full inline-flex items-center gap-2 text-sm font-semibold transition-all" style={{ background:'#ffffff', color: theme.colors.textPrimary, border:'1px solid rgba(0,0,0,0.08)', boxShadow: BTN_INACTIVE_SHADOW }}>
          <Share2 className="w-4 h-4" /> Share
        </button>
      </div>
    </WhiteCard>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: theme.colors.background }}>
      <div className="px-4 pt-3 pb-1 space-y-3">
        <StandardSearchBar value={search} onChange={setSearch} placeholder="Search product series..." theme={theme} />
        <div ref={infoRef} className={`overflow-hidden transition-all duration-500 ease-out ${infoHidden?'pointer-events-none':''}`} style={{ maxHeight: showInfo? infoHeight:0, opacity: showInfo?1:0, transform: showInfo? 'translateY(0)': 'translateY(-6px)' }}>
          {!infoHidden && (
            <WhiteCard className="p-4 flex items-start gap-3 shadow-none" style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.04)', borderColor: 'rgba(0,0,0,0.05)' }}>
              <Layers className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
              <p className="text-sm leading-snug" style={{ color: theme.colors.textSecondary }}>Browse, filter, preview slides, then download or share a concise deck.</p>
            </WhiteCard>
          )}
        </div>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 -mt-2">
          {categories.map(cat => { const active=selectedCategory===cat; return (
            <button key={cat} onClick={()=>setSelectedCategory(cat)} className="px-4 h-9 rounded-full text-sm font-medium whitespace-nowrap focus:outline-none focus:ring transition-colors flex-shrink-0" style={{ background: active? theme.colors.accent:'#ffffff', color: active? '#ffffff': theme.colors.textSecondary, border:`1px solid ${active? theme.colors.accent:'rgba(0,0,0,0.07)'}`, boxShadow: active? BTN_ACTIVE_SHADOW: BTN_INACTIVE_SHADOW }}>{cat==='all'?'All':cat}</button>
          ); })}
        </div>
      </div>
      <div ref={listRef} className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-32 space-y-4">
        {filtered.length? filtered.map(p => <PresentationCard key={p.id} p={p} />): (
          <GlassCard theme={theme} className="p-8 text-center">
            <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>No presentations found</p>
            <p className="text-sm mt-1" style={{ color: theme.colors.textSecondary }}>Try a different search or filter.</p>
          </GlassCard>
        )}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={()=>setPreview(null)}>
          <div className="max-w-3xl w-full" onClick={e=>e.stopPropagation()}>
            <WhiteCard className="p-5 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>{preview.pres.title}</h2>
                <button onClick={()=>setPreview(null)} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background:'#ffffff', border:'1px solid rgba(0,0,0,0.08)', color: theme.colors.textSecondary, boxShadow: BTN_INACTIVE_SHADOW }}>Close</button>
              </div>
              <div className="grid md:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto pr-1">
                {preview.pres.slides.map(s => (
                  <div key={s.id} className="relative rounded-lg overflow-hidden border" style={{ borderColor: theme.colors.border }}>
                    <img src={s.image} alt={s.caption} className="w-full h-40 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 text-[10px] px-2 py-1 bg-black/55 text-white truncate">{s.caption}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={()=>downloadMock(preview.pres)} className="flex-1 h-10 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold text-white" style={{ background: theme.colors.accent, boxShadow: BTN_INACTIVE_SHADOW }}>Download PDF</button>
                <button onClick={()=>sharePresentation(preview.pres)} className="h-10 px-6 rounded-full inline-flex items-center gap-2 text-sm font-semibold" style={{ background:'#ffffff', color: theme.colors.textPrimary, border:'1px solid rgba(0,0,0,0.08)', boxShadow: BTN_INACTIVE_SHADOW }}><Share2 className="w-4 h-4" /> Share</button>
              </div>
            </WhiteCard>
          </div>
        </div>
      )}
    </div>
  );
};