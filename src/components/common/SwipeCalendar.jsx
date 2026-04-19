/**
 * SwipeCalendar – shared month-grid calendar with swipe-to-navigate.
 *
 * Features:
 *  • Horizontal swipe (touch) navigates prev / next month.
 *  • Vertical scrolling is locked while a horizontal swipe is in progress.
 *  • Chevron buttons for non-touch navigation.
 *  • Optional "Today" / "Clear" footer, disabled-date callback,
 *    custom day-render slot, and more.
 *
 * Usage:
 *   <SwipeCalendar
 *     theme={theme}
 *     selected={selectedDate}          // Date | null
 *     onSelect={(date) => …}           // called with Date object
 *     isDisabled={(date) => boolean}    // optional
 *     renderDayExtra={(date) => node}   // optional (e.g. green dot, $ total)
 *     showFooter                        // show Clear / Today row
 *     onClear={() => …}                // called when Clear pressed
 *   />
 */
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { isDarkTheme } from '../../design-system/tokens.js';

const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
];
const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

const SWIPE_THRESHOLD = 40;   // px – minimum dx to count as a month-swipe
const LOCK_RATIO     = 1.4;   // |dx/dy| must exceed this to lock horizontal

const SwipeCalendar = ({
  theme,
  selected = null,
  onSelect,
  isDisabled,
  renderDayExtra,
  showFooter = false,
  onClear,
  className = '',
}) => {
  const dark  = isDarkTheme(theme);
  const c     = theme.colors;
  const today = useMemo(() => new Date(), []);

  // ─── View state ──────────────────────────────────────────────
  const [viewYear, setViewYear]   = useState(
    () => (selected ? selected.getFullYear() : today.getFullYear()),
  );
  const [viewMonth, setViewMonth] = useState(
    () => (selected ? selected.getMonth() : today.getMonth()),
  );
  const [direction, setDirection] = useState(0); // -1 left, +1 right

  const prevMonth = useCallback(() => {
    setDirection(-1);
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  }, [viewMonth]);

  const nextMonth = useCallback(() => {
    setDirection(1);
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  }, [viewMonth]);

  const goToday = useCallback(() => {
    onSelect?.(new Date(today.getFullYear(), today.getMonth(), today.getDate()));
  }, [today, onSelect]);

  // ─── Grid cells ──────────────────────────────────────────────
  const firstDow    = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const cells       = useMemo(
    () => [...Array(firstDow).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)],
    [firstDow, daysInMonth],
  );

  const isSel   = (day) => selected && selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === day;
  const isToday = (day) => today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === day;

  // ─── Touch / swipe handling ──────────────────────────────────
  const touchRef  = useRef({ startX: 0, startY: 0, locked: false, swiping: false });
  const calRef    = useRef(null);

  const onTouchStart = useCallback((e) => {
    const t = e.touches[0];
    touchRef.current = { startX: t.clientX, startY: t.clientY, locked: false, swiping: false };
  }, []);

  const onTouchMove = useCallback((e) => {
    const ref = touchRef.current;
    const t   = e.touches[0];
    const dx  = t.clientX - ref.startX;
    const dy  = t.clientY - ref.startY;

    // Decide axis lock once movement is significant
    if (!ref.locked && (Math.abs(dx) > 8 || Math.abs(dy) > 8)) {
      if (Math.abs(dx) > Math.abs(dy) * LOCK_RATIO) {
        ref.swiping = true;   // horizontal wins → lock
      }
      ref.locked = true;
    }

    // If horizontal swipe, prevent ancestor vertical scroll
    if (ref.swiping) {
      e.preventDefault();
    }
  }, []);

  const onTouchEnd = useCallback((e) => {
    const ref = touchRef.current;
    if (!ref.swiping) return;
    const t  = e.changedTouches[0];
    const dx = t.clientX - ref.startX;
    if (Math.abs(dx) >= SWIPE_THRESHOLD) {
      if (dx < 0) nextMonth();
      else        prevMonth();
    }
  }, [nextMonth, prevMonth]);

  // Attach touchmove as non-passive so we can preventDefault
  useEffect(() => {
    const el = calRef.current;
    if (!el) return;
    const handler = (e) => onTouchMove(e);
    el.addEventListener('touchmove', handler, { passive: false });
    return () => el.removeEventListener('touchmove', handler);
  }, [onTouchMove]);

  // ─── Slide animation variants ─────────────────────────────
  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 120 : -120, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (dir) => ({ x: dir > 0 ? -120 : 120, opacity: 0 }),
  };

  // ─── Border helpers ──────────────────────────────────────────
  const bdr = dark ? 'rgba(255,255,255,0.11)' : 'rgba(0,0,0,0.07)';

  return (
    <div
      ref={calRef}
      className={`select-none ${className}`}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Month header ── */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b" style={{ borderColor: bdr }}>
        <button
          type="button"
          onClick={prevMonth}
          className="p-1.5 rounded-full transition-colors"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronLeft className="w-4 h-4" style={{ color: c.textSecondary }} />
        </button>
        <span className="text-[0.8125rem] font-semibold" style={{ color: c.textPrimary }}>
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <button
          type="button"
          onClick={nextMonth}
          className="p-1.5 rounded-full transition-colors"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
        >
          <ChevronRight className="w-4 h-4" style={{ color: c.textSecondary }} />
        </button>
      </div>

      {/* ── Weekday header ── */}
      <div className="px-3 pt-2">
        <div className="grid grid-cols-7 mb-0.5">
          {WEEKDAYS.map((d) => (
            <div key={d} className="text-center text-[0.625rem] font-semibold py-1" style={{ color: c.textSecondary, opacity: 0.6 }}>{d}</div>
          ))}
        </div>
      </div>

      {/* ── Day grid (animated) ── */}
      <div className="px-3 pb-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false} custom={direction}>
          <motion.div
            key={`${viewYear}-${viewMonth}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="grid grid-cols-7 gap-y-0.5"
          >
            {cells.map((day, idx) => {
              if (day === null) return <div key={idx} className="w-8 h-8" />;
              const date     = new Date(viewYear, viewMonth, day);
              const sel      = isSel(day);
              const tod      = isToday(day);
              const disabled = isDisabled?.(date);

              return (
                <div key={idx} className="flex flex-col items-center justify-center">
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => onSelect?.(date)}
                    className="w-8 h-8 rounded-full flex items-center justify-center text-[0.8125rem] transition-all"
                    style={{
                      backgroundColor: sel ? c.accent : 'transparent',
                      color: sel ? c.accentText : disabled ? c.textSecondary : tod ? c.accent : c.textPrimary,
                      fontWeight: sel || tod ? 700 : 400,
                      opacity: disabled ? 0.35 : 1,
                      outline: tod && !sel ? `1.5px solid ${c.accent}55` : 'none',
                      outlineOffset: '-1.5px',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {day}
                  </button>
                  {renderDayExtra?.(date)}
                </div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ── Footer ── */}
      {showFooter && (
        <div className="border-t px-4 py-2.5 flex justify-between items-center" style={{ borderColor: bdr }}>
          <button
            type="button"
            onClick={() => onClear?.()}
            className="text-xs font-medium"
            style={{ color: c.textSecondary }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={goToday}
            className="text-xs font-semibold"
            style={{ color: c.accent }}
          >
            Today
          </button>
        </div>
      )}
    </div>
  );
};

export default SwipeCalendar;
