import React, { useRef } from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';

export const InstallationDetail = ({ project, theme, onAddPhotoFiles }) => {
  const fileRef = useRef(null);
  const isDark = isDarkTheme(theme);
  const bdr = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';
  return (
    <div className="min-h-full" style={{ backgroundColor: theme.colors.background }}>
      <div className="px-4 sm:px-6 lg:px-8 pb-32 scrollbar-hide" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="max-w-5xl mx-auto w-full space-y-4">
          <div className="rounded-[22px] overflow-hidden p-5 space-y-4" style={{ backgroundColor: theme.colors.surface, border: `1px solid ${bdr}` }}>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-bold text-xl truncate" style={{ color: theme.colors.textPrimary }}>{project.name}</p>
                <p className="text-sm truncate" style={{ color: theme.colors.textSecondary }}>{project.location}</p>
              </div>
              <button type="button" onClick={()=>fileRef.current?.click()} className="px-4 py-2 rounded-full text-xs font-semibold" style={{ backgroundColor: theme.colors.accent, color: theme.colors.accentText }}>Add Photos</button>
              <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e=>onAddPhotoFiles(e.target.files)} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(project.photos || [project.image]).map((img,i)=>(
                <div key={i} className="relative aspect-square overflow-hidden rounded-lg"><img src={typeof img==='string'?img:URL.createObjectURL(img)} alt={project.name+'-photo-'+i} className="w-full h-full object-cover" /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
