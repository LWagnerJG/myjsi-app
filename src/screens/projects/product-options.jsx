import React from 'react';
import { PortalNativeSelect } from '../../components/forms/PortalNativeSelect.jsx';
import { JSI_LAMINATES, JSI_VENEERS } from '../products/data.js';
import { FINISH_SAMPLES } from '../samples';

export const MaterialButtonGroup = ({ label, options, theme, selectedMaterials, onMaterialToggle }) => (
  <div>
    <p className="text-sm font-semibold mb-2" style={{ color: theme.colors.textSecondary }}>{label}</p>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = selectedMaterials?.includes(opt);
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onMaterialToggle(opt)}
            className="px-3 py-1.5 text-sm rounded-full font-medium transition-colors border"
            style={{
              backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
              color: isSelected ? theme.colors.surface : theme.colors.textPrimary,
              borderColor: isSelected ? theme.colors.accent : theme.colors.border
            }}
          >{opt}</button>
        );
      })}
    </div>
  </div>
);

export const KnoxOptions = ({ theme, product, productIndex, onUpdate }) => (
  <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium" style={{ color: theme.colors.textSecondary }}>Wood back?</label>
      <input type="checkbox" className="h-5 w-5 rounded-md border-2" style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }} checked={!!product.hasWoodBack} onChange={(e)=>onUpdate(productIndex,'hasWoodBack',e.target.checked)} />
    </div>
  </div>
);

export const VisionOptions = ({ theme, product, productIndex, onUpdate }) => {
  const handleMaterialToggle = (material) => {
    const currentMaterials = product.materials || [];
    const next = currentMaterials.includes(material) ? currentMaterials.filter(m=>m!==material) : [...currentMaterials, material];
    onUpdate(productIndex,'materials',next);
  };
  return (
    <div className="space-y-4 mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
      <div className="flex items-center justify-between p-3 rounded-xl" style={{ backgroundColor: theme.colors.background }}>
        <label className="font-semibold" style={{ color: theme.colors.textPrimary }}>Glass Doors?</label>
        <input type="checkbox" className="h-5 w-5 rounded-md border-2" style={{ accentColor: theme.colors.accent, borderColor: theme.colors.border }} checked={!!product.hasGlassDoors} onChange={(e)=>onUpdate(productIndex,'hasGlassDoors',e.target.checked)} />
      </div>
      <div className="space-y-4">
        <MaterialButtonGroup label="Laminate" options={JSI_LAMINATES} theme={theme} selectedMaterials={product.materials} onMaterialToggle={handleMaterialToggle} />
        <MaterialButtonGroup label="Veneer" options={JSI_VENEERS} theme={theme} selectedMaterials={product.materials} onMaterialToggle={handleMaterialToggle} />
      </div>
    </div>
  );
};

export const WinkHoopzOptions = ({ theme, product, productIndex, onUpdate }) => {
  const POLY_COLORS = React.useMemo(()=>Array.from(new Set((FINISH_SAMPLES||[]).map(s=>s.color).filter(Boolean))),[]);
  return (
    <div className="mt-3 pt-3 border-t" style={{ borderColor: theme.colors.border }}>
      <PortalNativeSelect value={product.polyColor || ''} onChange={(e)=>onUpdate(productIndex,'polyColor',e.target.value)} placeholder="Select poly color" theme={theme} options={POLY_COLORS.map(c=>({ value:c, label:c }))} />
    </div>
  );
};
