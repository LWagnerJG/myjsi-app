import React, { useCallback } from 'react';
import { Package, Plus, Trash2, Minus } from 'lucide-react';

export const DrawerItem = React.memo(({ item, onUpdateCart, theme, isLast = false }) => {
    const dec = useCallback((e) => { e.stopPropagation(); onUpdateCart(item, -1); }, [item, onUpdateCart]);
    const inc = useCallback((e) => { e.stopPropagation(); onUpdateCart(item, 1); }, [item, onUpdateCart]);
    return (
        <>
            {!isLast && <div className="border-t mx-2" style={{ borderColor: theme.colors.border }} />}
            <div className="flex items-center gap-3 py-2 px-1">
                <div className="w-10 h-10 rounded-lg flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: item.isSet ? theme.colors.subtle : item.color, border: `1px solid ${theme.colors.border}` }}>
                    {item.isSet ? <Package className="w-5 h-5" style={{ color: theme.colors.secondary }} /> : item.image ? <img loading="lazy" width="300" height="300" src={item.image} alt={item.name} className="w-full h-full object-cover rounded-md" /> : null}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-xs" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                    {item.code && <p className="text-xs opacity-70" style={{ color: theme.colors.textSecondary }}>{item.code}</p>}
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={dec} aria-label={item.quantity === 1 ? 'Remove item' : 'Decrease quantity'} className="w-6 h-6 flex items-center justify-center rounded-full active:scale-90">{item.quantity === 1 ? <Trash2 className="w-3 h-3" style={{ color: '#B85C5C' }} /> : <Minus className="w-3 h-3" style={{ color: theme.colors.textSecondary }} />}</button>
                    <span className="font-bold w-4 text-center text-xs">{item.quantity}</span>
                    <button onClick={inc} aria-label="Increase quantity" className="w-6 h-6 flex items-center justify-center rounded-full active:scale-90"><Plus className="w-3 h-3" style={{ color: theme.colors.secondary }} /></button>
                </div>
            </div>
        </>
    );
});
DrawerItem.displayName = 'DrawerItem';
