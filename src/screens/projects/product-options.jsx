import React from 'react';
import { Check } from 'lucide-react';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { JSI_LAMINATES, JSI_VENEERS } from '../products/data.js';
import { FINISH_SAMPLES } from '../samples';

/* ── tiny chip ──────────────────────────────────────────────── */
const Chip = ({ label, selected, onClick, theme }) => (
  <button type="button" onClick={onClick}
    className="px-2.5 py-1 text-xs rounded-full font-medium transition-all border leading-tight"
    style={{
      backgroundColor: selected ? theme.colors.accent : 'transparent',
      color: selected ? (theme.colors.accentText || '#fff') : theme.colors.textPrimary,
      borderColor: selected ? theme.colors.accent : theme.colors.border,
    }}>{label}</button>
);

/* ── surface type selector (TFL / HPL / Veneer) ─────────────── */
const SURFACE_TYPES = ['TFL', 'HPL', 'Veneer'];

const SurfaceTypeSelector = ({ selected = [], onChange, theme }) => (
  <div className="flex gap-1.5 flex-wrap">
    {SURFACE_TYPES.map(t => {
      const on = selected.includes(t);
      return (
        <button key={t} type="button"
          onClick={() => onChange(on ? selected.filter(s => s !== t) : [...selected, t])}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-full border transition-all"
          style={{
            backgroundColor: on ? theme.colors.accent : 'transparent',
            color: on ? (theme.colors.accentText || '#fff') : theme.colors.textPrimary,
            borderColor: on ? theme.colors.accent : theme.colors.border,
          }}>
          {on && <Check className="w-3 h-3" />} {t}
        </button>
      );
    })}
  </div>
);

/* ── finish picker (laminate/veneer chips + TBD) ─────────────── */
const FinishPicker = ({ label, options, selected = [], onToggle, theme }) => (
  <div>
    <p className="text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: theme.colors.textSecondary }}>{label}</p>
    <div className="flex flex-wrap gap-1.5">
      <Chip label="TBD" selected={selected.includes('TBD')} onClick={() => onToggle('TBD')} theme={theme} />
      {options.map(o => (
        <Chip key={o} label={o} selected={selected.includes(o)} onClick={() => onToggle(o)} theme={theme} />
      ))}
    </div>
  </div>
);

/* ── Vision options (condensed) ──────────────────────────────── */
export const VisionOptions = ({ theme, product, productIndex, onUpdate }) => {
  const surfaces = product.surfaceTypes || [];
  const materials = product.materials || [];

  const toggleMat = (m) => {
    // if selecting TBD, clear all others; if selecting other, remove TBD
    if (m === 'TBD') {
      onUpdate(productIndex, 'materials', materials.includes('TBD') ? [] : ['TBD']);
    } else {
      const without = materials.filter(x => x !== 'TBD');
      onUpdate(productIndex, 'materials', without.includes(m) ? without.filter(x => x !== m) : [...without, m]);
    }
  };

  const showLam = surfaces.includes('TFL') || surfaces.includes('HPL');
  const showVen = surfaces.includes('Veneer');

  return (
    <div className="space-y-3 mt-3 pt-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
      {/* glass doors */}
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium" style={{ color: theme.colors.textPrimary }}>Glass Doors</span>
        <button type="button" onClick={() => onUpdate(productIndex, 'hasGlassDoors', !product.hasGlassDoors)}
          className="w-5 h-5 rounded flex items-center justify-center border transition-all"
          style={{
            backgroundColor: product.hasGlassDoors ? theme.colors.accent : 'transparent',
            borderColor: product.hasGlassDoors ? theme.colors.accent : theme.colors.border,
          }}>
          {product.hasGlassDoors && <Check className="w-3 h-3 text-white" />}
        </button>
      </div>

      {/* surface type */}
      <div>
        <p className="text-xs uppercase tracking-wider font-medium mb-1.5" style={{ color: theme.colors.textSecondary }}>Surface Type</p>
        <SurfaceTypeSelector selected={surfaces} onChange={v => onUpdate(productIndex, 'surfaceTypes', v)} theme={theme} />
      </div>

      {/* finishes — conditional on surface selection */}
      {showLam && <FinishPicker label="Laminate" options={JSI_LAMINATES} selected={materials} onToggle={toggleMat} theme={theme} />}
      {showVen && <FinishPicker label="Veneer" options={JSI_VENEERS} selected={materials} onToggle={toggleMat} theme={theme} />}
      {!showLam && !showVen && surfaces.length === 0 && (
        <p className="text-xs italic" style={{ color: theme.colors.textSecondary }}>Select a surface type to choose finishes</p>
      )}
    </div>
  );
};

/* ── Knox options ────────────────────────────────────────────── */
export const KnoxOptions = ({ theme, product, productIndex, onUpdate }) => (
  <div className="mt-3 pt-3 flex items-center justify-between" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
    <span className="text-[13px] font-medium" style={{ color: theme.colors.textPrimary }}>Wood Back</span>
    <button type="button" onClick={() => onUpdate(productIndex, 'hasWoodBack', !product.hasWoodBack)}
      className="w-5 h-5 rounded flex items-center justify-center border transition-all"
      style={{
        backgroundColor: product.hasWoodBack ? theme.colors.accent : 'transparent',
        borderColor: product.hasWoodBack ? theme.colors.accent : theme.colors.border,
      }}>
      {product.hasWoodBack && <Check className="w-3 h-3 text-white" />}
    </button>
  </div>
);

/* ── Wink / Hoopz options ────────────────────────────────────── */
export const WinkHoopzOptions = ({ theme, product, productIndex, onUpdate }) => {
  const POLY_COLORS = React.useMemo(() => Array.from(new Set((FINISH_SAMPLES || []).map(s => s.color).filter(Boolean))), []);
  return (
    <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
      <PortalNativeSelect value={product.polyColor || ''} onChange={e => onUpdate(productIndex, 'polyColor', e.target.value)}
        placeholder="Select poly color" theme={theme} options={POLY_COLORS.map(c => ({ value: c, label: c }))} />
    </div>
  );
};

/* ── re-export material group for backward compat ────────────── */
export const MaterialButtonGroup = FinishPicker;
