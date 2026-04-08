import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ExternalLink, Share2, CheckCircle2, Link2, Megaphone } from 'lucide-react';
import { ANNOUNCEMENT_COLORS, ANNOUNCEMENT_ICONS } from './utils.js';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../../../components/common/modalUtils.js';
import { DESIGN_TOKENS } from '../../../../design-system/tokens.js';

export const AnnouncementDetailModal = ({ announcement, theme, dark, onClose, onNavigate }) => {
  const [copied, setCopied] = useState(false);
  if (!announcement) return null;

  const color = ANNOUNCEMENT_COLORS[announcement.category] || ANNOUNCEMENT_COLORS['operations'];
  const Icon = ANNOUNCEMENT_ICONS[announcement.category] || Megaphone;

  const formattedDate = announcement.date
    ? new Date(announcement.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  const handleShare = async () => {
    const shareData = {
      title: announcement.title,
      text: `${announcement.title} — ${announcement.subtitle}\n\n${announcement.text || ''}`,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (e) {
      /* user cancelled share */
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/#${announcement.actionRoute || ''}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) { /* */ }
  };

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 flex items-end sm:items-center justify-center"
        style={{ zIndex: UNIFIED_MODAL_Z }}
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0" style={getUnifiedBackdropStyle(true)} />

        {/* Modal */}
        <motion.div
          initial={{ y: 40, opacity: 0, scale: 0.97 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          onClick={e => e.stopPropagation()}
          className="relative w-full max-w-md mx-4 sm:mx-auto rounded-2xl overflow-hidden"
          style={{ backgroundColor: theme?.colors?.surface || (dark ? '#282828' : '#FFFFFF'), boxShadow: DESIGN_TOKENS.shadows.modal }}
        >
          {/* Header band */}
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: `${color}18`, color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[0.6875rem] font-semibold uppercase tracking-widest" style={{ color }}>{announcement.category?.replace('-', ' ')}</p>
                  {formattedDate && (
                    <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>{formattedDate}</p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 active:scale-90 transition-transform"
                style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)' }}
              >
                <X className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-5 pb-4 space-y-3">
            <h3 className="text-lg font-bold leading-snug" style={{ color: theme.colors.textPrimary }}>{announcement.title}</h3>
            <p className="text-[0.8125rem] font-medium" style={{ color: theme.colors.textSecondary }}>{announcement.subtitle}</p>
            {announcement.text && (
              <p className="text-[0.8125rem] leading-relaxed" style={{ color: dark ? '#C0C0C0' : '#555555' }}>{announcement.text}</p>
            )}
            {announcement.image && (
              <div className="rounded-xl overflow-hidden mt-2">
                <img src={announcement.image} alt={announcement.title} className="w-full h-auto object-cover" />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-5 pb-5 flex flex-wrap gap-2">
            {announcement.actionLabel && announcement.actionRoute && (
              <button
                onClick={() => { onClose(); onNavigate?.(announcement.actionRoute); }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.8125rem] font-semibold transition-all active:scale-95"
                style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                {announcement.actionLabel}
              </button>
            )}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.8125rem] font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: theme.colors.textPrimary,
              }}
            >
              <Share2 className="w-3.5 h-3.5" />
              Share
            </button>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-[0.8125rem] font-semibold transition-all active:scale-95"
              style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)',
                color: copied ? '#4A7C59' : theme.colors.textPrimary,
              }}
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};
