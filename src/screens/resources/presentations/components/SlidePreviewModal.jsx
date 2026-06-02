import React from 'react';
import { createPortal } from 'react-dom';
import { motion } from 'framer-motion';
import { X, Download, Share2 } from 'lucide-react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';
import { JSIActionButton, JSIActionButtonGroup } from '../../../../components/common/JSIButtons.jsx';

export const SlidePreviewModal = ({ preview, theme, onClose, onDownload, onShare }) => {
    const isDark = isDarkTheme(theme);
    if (!preview) return null;
    const slides = preview.pres.slides || [];
    const tileBg = isDark
        ? 'linear-gradient(135deg, rgba(255,255,255,0.07), rgba(255,255,255,0.02))'
        : 'linear-gradient(135deg, #F0EDE8, #FFFFFF)';
    return createPortal(
        <div className="fixed inset-0 flex items-center justify-center p-4" style={{ ...getUnifiedBackdropStyle(true), zIndex: UNIFIED_MODAL_Z }} onClick={onClose}>
            <motion.div initial={{ opacity: 0, scale: 0.94 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.94 }} transition={{ duration: 0.2 }}
                className="max-w-3xl w-full rounded-3xl overflow-hidden"
                style={{ background: isDark ? theme.colors.surface : '#FFFFFF', border: `1px solid ${theme.colors.border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.35)' }}
                onClick={e => e.stopPropagation()}>
                <div className="px-5 py-4 flex justify-between items-center" style={{ borderBottom: `1px solid ${theme.colors.border}` }}>
                    <div className="min-w-0">
                        <h2 className="font-bold text-base leading-tight truncate" style={{ color: theme.colors.textPrimary }}>{preview.pres.title}</h2>
                        <span className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary }}>{slides.length} slides · {preview.pres.type}</span>
                    </div>
                    <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-black/5 flex-shrink-0" style={{ color: theme.colors.textSecondary }}>
                        <X className="w-4 h-4" />
                    </button>
                </div>
                <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[55vh] overflow-y-auto">
                    {slides.map((s, i) => (
                        <div key={s.id} className="relative rounded-2xl overflow-hidden flex flex-col justify-end p-3 h-32"
                            style={{ border: `1px solid ${theme.colors.border}`, background: tileBg }}>
                            <span className="absolute top-2 left-2.5 font-mono text-[0.625rem] font-bold" style={{ color: theme.colors.textSecondary, opacity: 0.6 }}>
                                {String(i + 1).padStart(2, '0')}
                            </span>
                            <p className="text-[0.6875rem] leading-snug font-medium" style={{ color: theme.colors.textPrimary }}>{s.caption}</p>
                        </div>
                    ))}
                </div>
                <div className="px-5 py-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
                    <JSIActionButtonGroup>
                        <JSIActionButton
                            onClick={onDownload}
                            theme={theme}
                            icon={<Download className="w-4 h-4" />}
                        >
                            Download PDF
                        </JSIActionButton>
                        <JSIActionButton
                            onClick={onShare}
                            theme={theme}
                            icon={<Share2 className="w-4 h-4" />}
                        >
                            Share
                        </JSIActionButton>
                    </JSIActionButtonGroup>
                </div>
            </motion.div>
        </div>,
        document.body
    );
};
