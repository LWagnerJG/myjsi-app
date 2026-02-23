import React, { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Megaphone } from 'lucide-react';
import { ANNOUNCEMENT_COLORS, ANNOUNCEMENT_ICONS } from './utils.js';
import { AnnouncementDetailModal } from './AnnouncementDetailModal.jsx';

export const AnnouncementsRow = ({ announcements, theme, dark, onNavigate, onDismiss }) => {
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const rowRef = useRef(null);
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false });

  const checkScroll = useCallback(() => {
    const el = rowRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = rowRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    const ro = new ResizeObserver(checkScroll);
    ro.observe(el);
    return () => { el.removeEventListener('scroll', checkScroll); ro.disconnect(); };
  }, [checkScroll, announcements.length]);

  const onPointerDown = useCallback((e) => {
    const el = rowRef.current;
    if (!el) return;
    // Do NOT call setPointerCapture — it intercepts child button clicks
    drag.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft, moved: false };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!drag.current.active) return;
    const dx = e.clientX - drag.current.startX;
    if (Math.abs(dx) > 4) drag.current.moved = true;
    rowRef.current.scrollLeft = drag.current.scrollLeft - dx;
  }, []);

  const onPointerUp = useCallback(() => {
    drag.current.active = false;
  }, []);

  const handlePillClick = useCallback((a) => {
    if (!drag.current.moved) setSelectedAnnouncement(a);
  }, []);

  if (!announcements.length) return null;

  const fadeBase = dark ? '42,42,42' : '255,255,255';

  return (
    <div className="px-4">
      <div className="relative">
        {/* Left fade */}
        <div
          className="absolute left-0 top-0 bottom-0 w-14 z-10 pointer-events-none transition-opacity duration-200"
          style={{
            opacity: canScrollLeft ? 1 : 0,
            background: `linear-gradient(to right, rgba(${fadeBase},1) 0%, rgba(${fadeBase},0.85) 35%, rgba(${fadeBase},0) 100%)`,
          }}
        />
        {/* Right fade */}
        <div
          className="absolute right-0 top-0 bottom-0 w-16 z-10 pointer-events-none transition-opacity duration-200"
          style={{
            opacity: canScrollRight ? 1 : 0,
            background: `linear-gradient(to left, rgba(${fadeBase},1) 0%, rgba(${fadeBase},0.85) 35%, rgba(${fadeBase},0) 100%)`,
          }}
        />
      <div
        ref={rowRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        className="flex gap-2 overflow-x-auto no-scrollbar py-0.5 select-none"
        style={{ cursor: 'grab', WebkitOverflowScrolling: 'touch' }}
      >
        <AnimatePresence>
          {announcements.map((a) => {
            const color = ANNOUNCEMENT_COLORS[a.category] || ANNOUNCEMENT_COLORS['operations'];
            const Icon = ANNOUNCEMENT_ICONS[a.category] || Megaphone;
            return (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                transition={{ duration: 0.2 }}
                className="relative flex-shrink-0 rounded-xl"
                style={{
                  backgroundColor: dark ? 'rgba(255,255,255,0.05)' : theme.colors.surface,
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : theme.colors.border}`,
                  minWidth: 172,
                  maxWidth: 232,
                  boxShadow: dark ? 'none' : '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* Tappable body */}
                <button
                  onClick={() => handlePillClick(a)}
                  className="w-full flex items-center gap-2 pl-2.5 pr-6 py-2 rounded-xl text-left transition-all active:scale-[0.97]"
                >
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${color}18`, color }}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-left min-w-0 flex-1">
                    <p className="text-xs font-semibold leading-tight truncate" style={{ color: theme.colors.textPrimary }}>{a.title}</p>
                    <p className="text-[11px] leading-tight truncate mt-0.5" style={{ color: theme.colors.textSecondary }}>{a.subtitle}</p>
                  </div>
                </button>

                {/* Discrete dismiss X */}
                {onDismiss && (
                  <button
                    onPointerDown={e => e.stopPropagation()}
                    onClick={e => { e.stopPropagation(); onDismiss(a.id); }}
                    className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center transition-opacity opacity-30 hover:opacity-70 active:scale-90"
                    style={{ backgroundColor: dark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)' }}
                    aria-label="Dismiss"
                  >
                    <X className="w-2.5 h-2.5" style={{ color: theme.colors.textSecondary }} />
                  </button>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      </div>

      {/* Detail modal */}
      {selectedAnnouncement && (
        <AnnouncementDetailModal
          announcement={selectedAnnouncement}
          theme={theme}
          dark={dark}
          onClose={() => setSelectedAnnouncement(null)}
          onNavigate={onNavigate}
        />
      )}
    </div>
  );
};
