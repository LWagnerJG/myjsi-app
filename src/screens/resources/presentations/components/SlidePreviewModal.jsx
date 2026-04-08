import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';

export const SlidePreviewModal = ({ preview, theme, onClose, onDownload, onShare }) => {
    const isDark = isDarkTheme(theme);
    if (!preview) return null;
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ ...getUnifiedBackdropStyle(true), zIndex: UNIFIED_MODAL_Z }} onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
                className="max-w-3xl w-full rounded-2xl overflow-hidden"
                style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
                onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <h2 className="font-bold text-base" style={{ color: theme.colors.textPrimary }}>{preview.pres.title}</h2>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 dark:hover:bg-white/5" style={{ color: theme.colors.textSecondary }}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto">
                    {preview.pres.slides.map((s, i) => (
                        <div key={s.id} className="relative rounded-xl overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                            <img src={s.image} alt={s.caption} className="w-full h-28 object-cover" />
                            <div className="px-2 py-1 text-[0.625rem] bg-black/50 text-white absolute inset-x-0 bottom-0 truncate">{s.caption}</div>
                            <div className="absolute top-1 left-1 w-5 h-5 rounded-full bg-black/45 text-white text-[0.6875rem] font-bold flex items-center justify-center">{i + 1}</div>
                        </div>
                    ))}
                </div>
                <div className="px-5 py-4 flex gap-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                    <button onClick={onDownload}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ background: theme.colors.accent, color: theme.colors.accentText || (isDark ? '#1A1A1A' : '#FFF') }}>
                        <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button onClick={onShare}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.97]"
                        style={{ border: `1.5px solid ${theme.colors.border}`, color: theme.colors.textPrimary }}>
                        <Share2 className="w-4 h-4" /> Share
                    </button>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};
