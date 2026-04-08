import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const SlideCarousel = ({ pres, theme, onViewFull }) => {
    const [idx, setIdx] = useState(0);
    const slides = pres.slides || [];
    if (!slides.length) return null;
    const next = () => setIdx(i => (i + 1) % slides.length);
    const prev = () => setIdx(i => (i - 1 + slides.length) % slides.length);
    return (
        <div className="relative group" aria-label={`${pres.title} slide preview`}>
            <div className="aspect-video w-full rounded-xl overflow-hidden" style={{ background: theme.colors.surfaceAlt || '#f5f5f5', border: `1px solid ${theme.colors.border}` }}>
                <img src={slides[idx].image} alt={slides[idx].caption} className="w-full h-full object-cover" loading="lazy" />
            </div>
            {slides.length > 1 && (
                <>
                    <button onClick={prev} className="absolute top-1/2 -translate-y-1/2 left-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous">
                        <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={next} className="absolute top-1/2 -translate-y-1/2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next">
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </>
            )}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, i) => (
                    <button key={i} onClick={() => setIdx(i)} className="rounded-full transition-all"
                        style={{ width: i === idx ? 18 : 6, height: 6, background: i === idx ? theme.colors.accent : 'rgba(255,255,255,0.55)' }} />
                ))}
            </div>
            <button onClick={onViewFull} className="absolute top-2 right-2 px-2.5 py-1 rounded-full text-[0.6875rem] font-semibold transition-opacity"
                style={{ background: theme.colors.surface, border: `1px solid ${theme.colors.border}`, color: theme.colors.textSecondary, boxShadow: '0 1px 4px rgba(0,0,0,0.12)' }}>
                View
            </button>
        </div>
    );
};
