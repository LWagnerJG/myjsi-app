import React, { useState } from 'react';
import { GlassCard } from '../../../components/common/GlassCard.jsx';
import { Download, Share2, ChevronLeft, ChevronRight, Layers } from 'lucide-react';
import { PRESENTATIONS_DATA, PRESENTATION_CATEGORIES, MOCK_PRESENTATION_PDF_BASE64 } from './data.js';

export const PresentationsScreen = ({ theme }) => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [preview, setPreview] = useState(null); // full screen slide preview

  const presentations = PRESENTATIONS_DATA;
  const categories = ['all', ...PRESENTATION_CATEGORIES];
  const filtered = selectedCategory === 'all' ? presentations : presentations.filter(p=>p.category===selectedCategory);

  const downloadMock = (p) => {
    const a = document.createElement('a');
    a.href = MOCK_PRESENTATION_PDF_BASE64;
    a.download = p.title.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.pdf';
    document.body.appendChild(a); a.click(); a.remove();
  };

  const sharePresentation = async (p) => {
    const text = `${p.title} – ${p.description}`;
    if(navigator.share){
      try { await navigator.share({ title: p.title, text }); } catch(e){ /* ignore */ }
    } else {
      navigator.clipboard.writeText(text);
      alert('Share data copied to clipboard');
    }
  };

  const SlideCarousel = ({ pres }) => {
    const [idx,setIdx]=useState(0);
    const slides = pres.slides||[];
    const next=()=> setIdx(i=> (i+1)%slides.length);
    const prev=()=> setIdx(i=> (i-1+slides.length)%slides.length);
    if(!slides.length) return null;
    const current = slides[idx];
    return (
      <div className="relative group" aria-label={`${pres.title} slide preview`}>
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/5 border" style={{ borderColor: theme.colors.border }}>
          <img src={current.image} alt={current.caption} className="w-full h-full object-cover" loading="lazy" />
        </div>
        {slides.length>1 && (
          <>
            <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 left-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition" aria-label="Previous slide"><ChevronLeft className="w-4 h-4" /></button>
            <button onClick={next} className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition" aria-label="Next slide"><ChevronRight className="w-4 h-4" /></button>
          </>
        )}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
          {slides.map((s,i)=>(<span key={s.id} onClick={()=>setIdx(i)} className={`w-2 h-2 rounded-full cursor-pointer ${i===idx?'scale-110':''}`} style={{ background: i===idx? theme.colors.accent: theme.colors.surface, border: `1px solid ${theme.colors.border}` }} />))}
        </div>
        <button onClick={()=>setPreview({ pres, idx })} className="absolute top-1 right-1 px-2 py-1 rounded-full text-[10px] font-semibold" style={{ background: theme.colors.surface, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary }}>View</button>
      </div>
    );
  };

  const PresentationCard = ({ p }) => (
    <GlassCard theme={theme} className="p-4 space-y-4">
      <div className="flex flex-col gap-3">
        <SlideCarousel pres={p} />
        <div>
          <h3 className="font-semibold text-base" style={{ color: theme.colors.textPrimary }}>{p.title}</h3>
          <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-medium">
            <span className="px-2 py-1 rounded-full" style={{ background: theme.colors.accent+'22', color: theme.colors.accent }}>{p.category}</span>
            <span style={{ color: theme.colors.textSecondary }}>{p.type} • {p.size}</span>
            <span style={{ color: theme.colors.textSecondary }}>Updated {new Date(p.lastUpdated).toLocaleDateString()}</span>
          </div>
          <p className="text-sm mt-2" style={{ color: theme.colors.textSecondary }}>{p.description}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={()=>downloadMock(p)} className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold" style={{ background: theme.colors.accent, color:'#fff' }}>
            <Download className="w-4 h-4" /> Download
          </button>
          <button onClick={()=>sharePresentation(p)} className="h-11 px-5 rounded-full inline-flex items-center gap-2 text-sm font-semibold" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }}>
            <Share2 className="w-4 h-4" /> Share
          </button>
        </div>
      </div>
    </GlassCard>
  );

  return (
    <div className="flex flex-col h-full" style={{ background: theme.colors.background }}>
      <div className="px-4 pt-4 pb-3 space-y-4">
        <GlassCard theme={theme} className="p-4 flex items-start gap-3">
          <Layers className="w-6 h-6 mt-0.5" style={{ color: theme.colors.accent }} />
          <p className="text-sm leading-snug" style={{ color: theme.colors.textSecondary }}>
            Quick access to concise, client?ready decks. Filter, preview key slides, then download or share a lightweight mock presentation PDF.
          </p>
        </GlassCard>
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {categories.map(cat => (
            <button key={cat} onClick={()=>setSelectedCategory(cat)} className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory===cat?'':'opacity-80'}`} style={{ background: selectedCategory===cat? theme.colors.accent: theme.colors.subtle, color: selectedCategory===cat? '#fff': theme.colors.textPrimary, border: `1px solid ${selectedCategory===cat? theme.colors.accent: theme.colors.border}` }}>{cat==='all'? 'All': cat}</button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-32 space-y-4">
        {filtered.map(p => <PresentationCard key={p.id} p={p} />)}
        {!filtered.length && <div className="text-sm" style={{ color: theme.colors.textSecondary }}>No presentations.</div>}
      </div>

      {preview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={()=>setPreview(null)}>
          <div className="max-w-3xl w-full" onClick={e=>e.stopPropagation()}>
            <GlassCard theme={theme} className="p-4 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold text-lg" style={{ color: theme.colors.textPrimary }}>{preview.pres.title}</h2>
                <button onClick={()=>setPreview(null)} className="px-3 py-1.5 rounded-full text-xs font-semibold" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }}>Close</button>
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {preview.pres.slides.map(s => (
                  <div key={s.id} className="relative rounded-lg overflow-hidden border" style={{ borderColor: theme.colors.border }}>
                    <img src={s.image} alt={s.caption} className="w-full h-40 object-cover" />
                    <div className="absolute inset-x-0 bottom-0 text-[10px] px-2 py-1 bg-black/55 text-white truncate">{s.caption}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={()=>downloadMock(preview.pres)} className="flex-1 h-11 inline-flex items-center justify-center gap-2 rounded-full text-sm font-semibold" style={{ background: theme.colors.accent, color:'#fff' }}><Download className="w-4 h-4" /> Download PDF</button>
                <button onClick={()=>sharePresentation(preview.pres)} className="h-11 px-6 rounded-full inline-flex items-center gap-2 text-sm font-semibold" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }}><Share2 className="w-4 h-4" /> Share</button>
              </div>
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};