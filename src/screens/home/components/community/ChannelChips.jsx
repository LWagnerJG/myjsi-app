import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { SUBREDDITS } from './data.js';

const COMPACT_CHANNEL_LABELS = {
  'dealer-designers': 'Designers',
  'dealer-principals': 'Principals',
  'dealer-sales': 'Sales',
  'rep-principals': 'Rep Principals',
  reps: 'Reps',
  'new-reps': 'New Reps',
  jsiers: 'JSI',
  'cet-designers': 'CET',
  'install-tips': 'Install',
};

export const ChannelChips = ({ theme, dark, onSelect, activeId }) => {
  const viewportRef = useRef(null);
  const fullMeasureRef = useRef(null);
  const compactMeasureRef = useRef(null);
  const [chipMode, setChipMode] = useState('default');
  const [scrolled, setScrolled] = useState(false);

  const fullChips = useMemo(
    () => [
      { id: 'all', label: 'All' },
      ...SUBREDDITS.map((subreddit) => ({ id: subreddit.id, label: subreddit.name })),
    ],
    [],
  );

  const compactChips = useMemo(
    () => fullChips.map((chip) => ({ ...chip, label: COMPACT_CHANNEL_LABELS[chip.id] || chip.label })),
    [fullChips],
  );

  const renderedChips = chipMode === 'compact' ? compactChips : fullChips;
  const selectedChipId = activeId || 'all';

  const updateChipMode = useCallback(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;

    const availableWidth = viewport.clientWidth;
    const fullWidth = fullMeasureRef.current?.scrollWidth || 0;
    const compactWidth = compactMeasureRef.current?.scrollWidth || 0;
    if (!availableWidth || !fullWidth) return;

    const nextMode = fullWidth > availableWidth - 4 && compactWidth > 0 ? 'compact' : 'default';
    setChipMode((prev) => prev === nextMode ? prev : nextMode);
  }, []);

  useLayoutEffect(() => {
    updateChipMode();
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const resizeObserver = typeof ResizeObserver !== 'undefined'
      ? new ResizeObserver(() => updateChipMode())
      : null;

    resizeObserver?.observe(viewport);
    if (fullMeasureRef.current) resizeObserver?.observe(fullMeasureRef.current);
    if (compactMeasureRef.current) resizeObserver?.observe(compactMeasureRef.current);

    window.addEventListener('resize', updateChipMode);
    return () => {
      resizeObserver?.disconnect();
      window.removeEventListener('resize', updateChipMode);
    };
  }, [updateChipMode]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    const selectedIndex = renderedChips.findIndex((chip) => chip.id === selectedChipId);
    const selectedButton = viewport.querySelectorAll('[data-chip-btn]')[selectedIndex];
    if (!selectedButton) return undefined;

    const frame = window.requestAnimationFrame(() => {
      const gutter = chipMode === 'compact' ? 12 : 14;
      const nextLeft = Math.max(0, selectedButton.offsetLeft - gutter);
      const nextRight = selectedButton.offsetLeft + selectedButton.offsetWidth + gutter;
      const viewportLeft = viewport.scrollLeft;
      const viewportRight = viewportLeft + viewport.clientWidth;

      if (nextLeft < viewportLeft) {
        viewport.scrollLeft = nextLeft;
        return;
      }

      if (nextRight > viewportRight) {
        viewport.scrollLeft = Math.max(0, nextRight - viewport.clientWidth);
      }
    });

    return () => window.cancelAnimationFrame(frame);
  }, [chipMode, renderedChips, selectedChipId]);

  // Reveal the left-edge fade only once the user has scrolled away from "All"
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;
    const onScroll = () => setScrolled(viewport.scrollLeft > 1);
    viewport.addEventListener('scroll', onScroll, { passive: true });
    return () => viewport.removeEventListener('scroll', onScroll);
  }, []);

  const chip = (id, label, onClick, active) => (
    <button
      key={id}
      type="button"
      data-chip-btn
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full font-semibold whitespace-nowrap flex-shrink-0 transition-all duration-200 active:scale-[0.97] ${chipMode === 'compact' ? 'px-3 py-2 text-[0.6875rem]' : 'px-3.5 py-2 text-[0.75rem]'}`}
      style={{
        color: active ? theme.colors.textPrimary : theme.colors.textSecondary,
        backgroundColor: active
          ? (dark ? 'rgba(255,255,255,0.16)' : 'rgba(255,255,255,0.92)')
          : (dark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.68)'),
        border: `1px solid ${active ? (dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : (dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)')}`,
        opacity: active ? 1 : 0.9,
        boxShadow: active
          ? (dark ? '0 8px 18px rgba(0,0,0,0.16)' : '0 6px 14px rgba(53,53,53,0.05)')
          : (dark ? 'none' : '0 1px 2px rgba(53,53,53,0.03)'),
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="relative">
      <div
        ref={viewportRef}
        className="overflow-x-auto scrollbar-hide scroll-smooth pb-0.5"
        style={{ scrollPaddingLeft: 14, scrollPaddingRight: 16 }}
      >
        <div className="inline-flex gap-1.5 whitespace-nowrap pl-1 pr-4">
          {renderedChips.map((chipOption) => {
            const sub = SUBREDDITS.find((subreddit) => subreddit.id === chipOption.id) || null;
            const handleClick = chipOption.id === 'all' ? () => onSelect(null) : () => onSelect(sub);
            return chip(chipOption.id, chipOption.label, handleClick, selectedChipId === chipOption.id);
          })}
        </div>
      </div>

      {/* Left fade — only visible once scrolled away from All */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 left-0 w-10"
        style={{
          background: `linear-gradient(to right, ${theme.colors.background} 0%, transparent 100%)`,
          opacity: scrolled ? 1 : 0,
          transition: 'opacity 220ms ease',
        }}
      />
      {/* Right fade — always present */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 w-10"
        style={{ background: `linear-gradient(to left, ${theme.colors.background} 0%, transparent 100%)` }}
      />

      <div aria-hidden="true" className="absolute invisible pointer-events-none h-0 overflow-hidden whitespace-nowrap">
        <div ref={fullMeasureRef} className="inline-flex gap-1.5 pr-4">
          {fullChips.map((chipOption) => chip(chipOption.id, chipOption.label, undefined, false))}
        </div>
        <div ref={compactMeasureRef} className="inline-flex gap-1.5 pr-4 ml-4">
          {compactChips.map((chipOption) => chip(chipOption.id, chipOption.label, undefined, false))}
        </div>
      </div>
    </div>
  );
};
