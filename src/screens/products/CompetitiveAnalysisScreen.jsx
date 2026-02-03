import React, { useState } from 'react';
import { GlassCard } from '../../components/common/GlassCard.jsx';
import { Package, Plus, Info } from 'lucide-react';
import { PRODUCT_DATA } from './data.js';
import { COMPETITION_METRICS } from './comparison-data.js';
import { Modal } from '../../components/common/Modal.jsx';

const AdvantageChip = ({ value, onClick }) => (
    <button onClick={onClick} className={`min-w-[42px] inline-flex items-center justify-center px-2 py-1 text-[11px] font-semibold rounded-full focus:outline-none focus:ring-2 focus:ring-white/40 transition ${value > 0 ? COMPETITION_METRICS.displayFormat.advantage.positive : COMPETITION_METRICS.displayFormat.advantage.negative}`}>
        {value > 0 ? `+${value}%` : `${value}%`}
    </button>
);

const VersusList = ({ jsiProduct, competitors = [], theme, title }) => {
    const [openAdv, setOpenAdv] = useState(null); // competitor id for which explanation is open
    const jsiPrice = jsiProduct.price || 0;

    const getMessage = (val) => {
        if (isNaN(val)) return '';
        const abs = Math.abs(val);
        if (val === 0) return 'Price parity with JSI.';
        if (val < 0) return `Competitor is ${abs}% higher than JSI (JSI advantage).`;
        return `Competitor is ${abs}% lower than JSI (Competitor advantage).`;
    };

    return (
        <GlassCard theme={theme} className="p-0 overflow-hidden">
            <div className="px-6 pt-5 pb-3">
                <h2 className="text-sm font-semibold tracking-wide" style={{ color: theme.colors.textPrimary }}>{title}</h2>
            </div>
            <div className="space-y-0.5 pb-4">
                {/* JSI row */}
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="inline-block w-2 h-2 rounded-full" style={{ background: theme.colors.accent }} />
                        <p className="font-semibold" style={{ color: theme.colors.textPrimary }}>{jsiProduct.name}</p>
                    </div>
                    <p className="font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>${jsiPrice.toLocaleString()}</p>
                </div>
                <div className="h-px mx-6" style={{ background: theme.colors.border }} />
                {/* Competitor rows */}
                {competitors.map(c => {
                    const val = parseInt(c.adv?.replace(/[^-\d]/g,'') || 0);
                    const open = openAdv === c.id;
                    return (
                        <div key={c.id} className="px-6 py-2.5">
                            <div className="flex items-center justify-between gap-4">
                                <p className="text-[13px] font-medium leading-snug" style={{ color: theme.colors.textSecondary }}>{c.name}</p>
                                <div className="flex items-center gap-3">
                                    <p className="text-[13px] font-semibold tabular-nums" style={{ color: theme.colors.textPrimary }}>{c.laminate}</p>
                                    <AdvantageChip value={val} onClick={() => setOpenAdv(o => o === c.id ? null : c.id)} />
                                </div>
                            </div>
                            {open && (
                                <div className="mt-2 ml-1 mr-1 rounded-lg px-3 py-2 text-[11px] leading-relaxed flex items-start gap-2" style={{ background: theme.colors.subtle, color: theme.colors.textSecondary }}>
                                    <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" />
                                    <span>{getMessage(val)}</span>
                                </div>
                            )}
                        </div>
                    );
                })}
                {!competitors.length && <p className="px-6 py-3 text-xs" style={{ color: theme.colors.textSecondary }}>No competitive data added yet.</p>}
            </div>
        </GlassCard>
    );
};

export const CompetitiveAnalysisScreen = ({ categoryId, productId, theme }) => {
    const [showRequest, setShowRequest] = useState(false);
    const [formState, setFormState] = useState({ manufacturer: '', series: '', notes: '' });
    const [submitted, setSubmitted] = useState(false);

    const categoryData = PRODUCT_DATA?.[categoryId];
    if (!categoryData) return (
        <div className="p-4"><GlassCard theme={theme} className="p-8 text-center"><Package className="w-12 h-12 mx-auto mb-4" style={{ color: theme.colors.textSecondary }} /><p style={{ color: theme.colors.textPrimary }}>Category Not Found</p></GlassCard></div>
    );

    const product = categoryData.products?.find(p => p.id === productId) || categoryData.products?.[0];
    const perProductList = categoryData.competitionByProduct?.[product?.id] || [];
    const categoryCompetitors = categoryData.competition || [];

    const handleChange = (e) => setFormState(s => ({ ...s, [e.target.name]: e.target.value }));
    const canSubmit = formState.manufacturer.trim() && formState.series.trim();
    const handleSubmit = (e) => { e.preventDefault(); if (!canSubmit) return; setSubmitted(true); setTimeout(()=>{ setShowRequest(false); setSubmitted(false); setFormState({ manufacturer:'', series:'', notes:''}); }, 1200); };

    return (
        <div className="flex flex-col h-full app-header-offset">
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <div className="px-4 sm:px-6 lg:px-8 py-4 space-y-6 pb-32 max-w-5xl mx-auto">
                    <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm" style={{ background: theme.colors.surface }}>
                        <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                            <h1 className="text-xl sm:text-2xl font-semibold text-white drop-shadow-sm tracking-tight">{product.name} Competitive Analysis</h1>
                        </div>
                    </div>
                    <VersusList jsiProduct={product} competitors={perProductList.length ? perProductList : categoryCompetitors} theme={theme} title={perProductList.length ? 'Versus Competitors' : 'Versus Competitors (Category)'} />
                </div>
            </div>
            <div className="fixed bottom-0 left-0 right-0 px-4 pb-5 pt-2" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.12), rgba(0,0,0,0))' }}>
                <button onClick={()=>setShowRequest(true)} className="w-full flex items-center justify-center gap-2 h-14 rounded-full font-semibold active:scale-95 transition-all shadow-lg" style={{ background: theme.colors.accent, color: '#fff', boxShadow: `0 6px 20px ${theme.colors.shadow}` }}>
                    <Plus className="w-5 h-5" /> Request Competitor
                </button>
            </div>
            <Modal show={showRequest} onClose={()=>setShowRequest(false)} title="Request Competitor" theme={theme}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Manufacturer</label>
                        <input name="manufacturer" value={formState.manufacturer} onChange={handleChange} placeholder="e.g. Kimball" className="w-full px-3 py-2 rounded-lg text-sm font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Series / Product</label>
                        <input name="series" value={formState.series} onChange={handleChange} placeholder="e.g. Joya" className="w-full px-3 py-2 rounded-lg text-sm font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }} />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs font-medium" style={{ color: theme.colors.textSecondary }}>Notes (optional)</label>
                        <textarea name="notes" value={formState.notes} onChange={handleChange} rows={3} placeholder="Any context or price info..." className="w-full px-3 py-2 rounded-lg text-sm font-medium resize-none" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }} />
                    </div>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={()=>setShowRequest(false)} className="px-5 h-10 rounded-full font-semibold" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border: `1px solid ${theme.colors.border}` }}>Cancel</button>
                        <button type="submit" disabled={!canSubmit || submitted} className="px-6 h-10 rounded-full font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed" style={{ background: theme.colors.accent }}>
                            {submitted ? 'Sent!' : 'Submit'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};