import React from 'react';

import { ProbabilitySlider } from '../../../../../components/forms/ProbabilitySlider.jsx';
import { SuggestInputPill } from './SuggestInputPill.jsx';
import { ContactSearchSelector } from './ContactSearchSelector.jsx';
import { JSI_SERIES } from '../../../../products/data.js';
import { STAGES, VERTICALS, COMPETITORS, PO_TIMEFRAMES, INITIAL_DESIGN_FIRMS, INITIAL_DEALERS } from '../../../data.js';

export const SectionCard = ({ children, isDark, className = '' }) => {
  const cardBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.72)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(0,0,0,0.06)';
  return (
    <div className={className} style={{ backgroundColor: cardBg, border: cardBorder, borderRadius: 24, padding: '20px' }}>
      {children}
    </div>
  );
};

export const SectionHeader = ({ title, theme }) => (
  <span className="text-[11px] font-semibold uppercase tracking-widest block mb-3" style={{ color: theme.colors.textSecondary, opacity: 0.5 }}>
    {title}
  </span>
);

export const PillList = ({ items, activeItem, onSelect, theme, isDark, fieldBorder }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(item => {
      const active = item === activeItem;
      return (
        <button
          key={item}
          onClick={() => onSelect(item)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            backgroundColor: active ? theme.colors.textPrimary : 'transparent',
            color: active ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary,
            border: active ? 'none' : fieldBorder
          }}
        >
          {item}
        </button>
      );
    })}
  </div>
);

export const MultiPillList = ({ items, activeItems = [], onToggle, theme, isDark, fieldBorder }) => (
  <div className="flex flex-wrap gap-1.5">
    {items.map(item => {
      const active = activeItems.includes(item);
      return (
        <button
          key={item}
          onClick={() => onToggle(item)}
          className="px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
          style={{
            backgroundColor: active ? theme.colors.textPrimary : 'transparent',
            color: active ? (isDark ? '#1a1a1a' : '#fff') : theme.colors.textSecondary,
            border: active ? 'none' : fieldBorder
          }}
        >
          {item}
        </button>
      );
    })}
  </div>
);

export const RemovablePillList = ({ items = [], onRemove, onAdd, suggestions, placeholder, theme, isDark }) => (
  <div className="flex flex-wrap gap-2">
    {items.map(item => (
      <button
        key={item}
        onClick={() => onRemove(item)}
        className="px-3 h-7 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all"
        style={{ background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)', color: theme.colors.textPrimary }}
      >
        {item}<span className="opacity-40 text-[11px]">×</span>
      </button>
    ))}
    <SuggestInputPill placeholder={placeholder} suggestions={suggestions} onAdd={onAdd} theme={theme} />
  </div>
);
