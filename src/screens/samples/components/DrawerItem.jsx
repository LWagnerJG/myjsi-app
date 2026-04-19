import React, { useCallback } from 'react';
import { Package, Plus, Trash2, Minus } from 'lucide-react';
import { isDarkTheme } from '../../../design-system/tokens.js';

export const DrawerItem = React.memo(({ item, onUpdateCart, theme }) => {
    const isDark = isDarkTheme(theme);
    const dec = useCallback((e) => { e.stopPropagation(); onUpdateCart(item, -1); }, [item, onUpdateCart]);
    const inc = useCallback((e) => { e.stopPropagation(); onUpdateCart(item, 1); }, [item, onUpdateCart]);
    return (
        <div className="flex items-center gap-3.5 py-3">
            <div className="w-11 h-11 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: item.isSet ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') : (item.color || (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')) }}>
                {item.isSet ? <Package className="w-5 h-5" style={{ color: theme.colors.textSecondary }} /> : item.image ? <img loading="lazy" width="300" height="300" src={item.image} alt={item.name} className="w-full h-full object-cover" /> : null}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold truncate text-[0.9375rem] leading-tight" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                {item.code && <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary, opacity: 0.7 }}>{item.code}</p>}
            </div>
            <div className="flex items-center gap-1">
                <button onClick={dec} aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'} className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform" style={{ backgroundColor: item.quantity === 1 ? (isDark ? 'rgba(255,100,100,0.12)' : 'rgba(184,92,92,0.08)') : (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)') }}>{item.quantity === 1 ? <Trash2 className="w-4 h-4" style={{ color: theme.colors.error }} /> : <Minus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} />}</button>
                <span className="font-bold w-7 text-center text-[0.9375rem] tabular-nums" style={{ color: theme.colors.textPrimary }}>{item.quantity}</span>
                <button onClick={inc} aria-label="Increase quantity" className="w-9 h-9 flex items-center justify-center rounded-full active:scale-90 transition-transform" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)' }}><Plus className="w-4 h-4" style={{ color: theme.colors.textSecondary }} /></button>
            </div>
        </div>
    );
});
DrawerItem.displayName = 'DrawerItem';
