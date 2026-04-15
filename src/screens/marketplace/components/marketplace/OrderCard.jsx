import React, { useState } from 'react';
import { Ban, CheckCircle, ChevronDown, Clock, Package, Truck } from 'lucide-react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { isDarkTheme } from '../../../../design-system/tokens.js';
import { ORDER_STATUS_CONFIG, formatElliottBucks, getProductById } from '../../data.js';
import { formatLongDate, formatShortDate } from '../../../../utils/format.js';

export const OrderCard = ({ order, theme }) => {
  const [open, setOpen] = useState(false);
  const isDark = isDarkTheme(theme);
  const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.processing;
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const StatusIcon = order.status === 'delivered'
    ? CheckCircle
    : order.status === 'shipped'
      ? Truck
      : order.status === 'cancelled'
        ? Ban
        : Clock;

  return (
    <GlassCard theme={theme} className="overflow-hidden">
      <button className="w-full text-left px-4 py-4 flex items-center gap-3" onClick={() => setOpen((value) => !value)}>
        <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
          <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[0.8125rem] font-bold" style={{ color: theme.colors.textPrimary }}>{order.id}</p>
            <span className="px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.12em]" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-xs mt-0.5" style={{ color: theme.colors.textSecondary }}>
            {formatLongDate(order.date)} - {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-semibold" style={{ color: theme.colors.textPrimary }}>{formatElliottBucks(order.total)}</p>
          <ChevronDown className="w-4 h-4 ml-auto mt-1 transition-transform" style={{ color: theme.colors.textSecondary, transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4" style={{ borderTop: `1px solid ${theme.colors.border}` }}>
          <div className="pt-4">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: theme.colors.textSecondary }}>Items in this order</p>

            {order.items.map((item, index) => {
              const product = getProductById(item.productId);

              return (
                <div
                  key={`${item.productId}-${index}`}
                  className={`flex items-center gap-3 py-2.5 ${index !== order.items.length - 1 ? 'border-b' : ''}`}
                  style={{ borderColor: theme.colors.border }}
                >
                  <div className="w-11 h-11 rounded-xl flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${theme.colors.border}` }}>
                    {product?.image
                      ? <img src={product.image} alt={item.name} className="w-full h-full object-cover" />
                      : <Package className="w-4 h-4 m-auto" style={{ color: theme.colors.textSecondary }} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                    <p className="text-[0.6875rem]" style={{ color: theme.colors.textSecondary }}>
                      Qty {item.qty}{item.size ? ` - Size ${item.size}` : ''} - {formatElliottBucks(item.price)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {(order.tracking || order.estimatedDelivery) && (
            <div className="rounded-2xl p-4" style={{ backgroundColor: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.02)' }}>
              <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: theme.colors.textSecondary }}>Fulfillment</p>

              {order.tracking && (
                <div className="flex items-center gap-2 mb-2">
                  <Truck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                  <p className="text-xs font-mono" style={{ color: theme.colors.textPrimary }}>{order.tracking}</p>
                </div>
              )}

              {order.status === 'delivered' && order.deliveredDate && (
                <p className="text-xs" style={{ color: theme.colors.success }}>
                  Delivered {formatShortDate(order.deliveredDate)}
                </p>
              )}

              {order.status === 'shipped' && order.estimatedDelivery && (
                <p className="text-xs" style={{ color: theme.colors.info }}>
                  Estimated delivery {formatShortDate(order.estimatedDelivery)}
                </p>
              )}

              {order.status === 'processing' && order.estimatedDelivery && (
                <p className="text-xs" style={{ color: theme.colors.warning }}>
                  Ships by {formatShortDate(order.estimatedDelivery)}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </GlassCard>
  );
};
