import React, { useState } from 'react';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { CheckCircle, Truck, Ban, Clock, ChevronDown, Package } from 'lucide-react';
import { ORDER_STATUS_CONFIG, getProductById, formatElliottBucks } from '../../data.js';

export const OrderCard = ({ order, theme }) => {
  const [open, setOpen] = useState(false);
  const isDark = isDarkTheme(theme);
  const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.processing;
  const StatusIcon = order.status === 'delivered' ? CheckCircle : order.status === 'shipped' ? Truck : order.status === 'cancelled' ? Ban : Clock;

  return (
    <GlassCard theme={theme} className="overflow-hidden">
      <button className="w-full text-left px-4 py-3.5 flex items-center gap-3" onClick={() => setOpen(o => !o)}>
        <div className="w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
          <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold" style={{ color: theme.colors.textPrimary }}>{order.id}</p>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold" style={{ backgroundColor: cfg.bg, color: cfg.color }}>{cfg.label}</span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
            {new Date(order.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {formatElliottBucks(order.total)}
          </p>
        </div>
        <ChevronDown className="w-4 h-4 transition-transform" style={{ color: theme.colors.textSecondary, transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
          {/* Items */}
          <div className="pt-3">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.colors.textSecondary }}>Items</p>
            {order.items.map((item, i) => {
              const prod = getProductById(item.productId);
              return (
                <div key={i} className="flex items-center gap-3 py-2">
                  <div className="w-9 h-9 rounded-lg flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                    {prod?.image ? <img src={prod.image} alt={item.name} className="w-full h-full object-cover" /> : <Package className="w-4 h-4 m-auto" style={{ color: theme.colors.textSecondary }} />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                    <p className="text-[11px]" style={{ color: theme.colors.textSecondary }}>
                      Qty {item.qty}{item.size ? ` · Size ${item.size}` : ''} · {formatElliottBucks(item.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Shipping info */}
          {(order.tracking || order.estimatedDelivery) && (
            <div className="rounded-xl p-3" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.02)' }}>
              {order.tracking && (
                <div className="flex items-center gap-2 mb-1.5">
                  <Truck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                  <p className="text-xs font-mono" style={{ color: theme.colors.textPrimary }}>{order.tracking}</p>
                </div>
              )}
              {order.status === 'delivered' && order.deliveredDate && (
                <p className="text-xs" style={{ color: theme.colors.success }}>
                  Delivered {new Date(order.deliveredDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
              {order.status === 'shipped' && order.estimatedDelivery && (
                <p className="text-xs" style={{ color: theme.colors.info }}>
                  Estimated delivery {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
              {order.status === 'processing' && order.estimatedDelivery && (
                <p className="text-xs" style={{ color: theme.colors.warning }}>
                  Ships by {new Date(order.estimatedDelivery).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};
