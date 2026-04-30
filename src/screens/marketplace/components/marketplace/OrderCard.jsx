import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, CheckCircle, ChevronDown, Clock, Package, Truck } from 'lucide-react';
import { GlassCard } from '../../../../components/common/GlassCard.jsx';
import { ORDER_STATUS_CONFIG, formatElliottBucks, getProductById } from '../../data.js';
import { formatLongDate, formatShortDate } from '../../../../utils/format.js';
import { getMarketplacePalette } from '../../theme.js';

export const OrderCard = ({ order, theme }) => {
  const [open, setOpen] = useState(false);
  const palette = getMarketplacePalette(theme);
  const cfg = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.processing;
  const itemCount = order.items.reduce((sum, item) => sum + item.qty, 0);
  const headline = itemCount === 1
    ? order.items[0]?.name
    : `${order.items[0]?.name || 'LWYD order'} + ${itemCount - 1} more`;
  const StatusIcon = order.status === 'delivered'
    ? CheckCircle
    : order.status === 'shipped'
      ? Truck
      : order.status === 'cancelled'
        ? Ban
        : Clock;

  return (
    <GlassCard theme={theme} className="overflow-hidden" style={{ boxShadow: palette.shadow }}>
      <button className="w-full text-left px-4 sm:px-5 py-4 flex items-start gap-3" onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <div className="w-11 h-11 rounded-2xl flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: cfg.bg }}>
          <StatusIcon className="w-5 h-5" style={{ color: cfg.color }} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-[0.625rem] font-bold uppercase tracking-[0.16em]" style={{ color: theme.colors.textSecondary }}>{order.id}</p>
            <span className="px-2.5 py-1 rounded-full text-[0.625rem] font-bold uppercase tracking-[0.12em]" style={{ backgroundColor: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </span>
          </div>
          <p className="text-[0.9375rem] font-semibold mt-1.5 leading-tight" style={{ color: theme.colors.textPrimary }}>
            {headline}
          </p>
          <p className="text-xs mt-1" style={{ color: theme.colors.textSecondary }}>
            {formatLongDate(order.date)} · {itemCount} item{itemCount !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="text-right flex-shrink-0">
          <p className="text-sm font-bold" style={{ color: theme.colors.textPrimary }}>{formatElliottBucks(order.total)}</p>
          <ChevronDown className="w-4 h-4 ml-auto mt-1 transition-transform" style={{ color: theme.colors.textSecondary, transform: open ? 'rotate(180deg)' : 'rotate(0)' }} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="px-4 sm:px-5 pb-4 space-y-4" style={{ borderTop: `1px solid ${palette.hairline}` }}>
              <div className="pt-4">
                <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: theme.colors.textSecondary }}>Items</p>

                {order.items.map((item, index) => {
                  const product = getProductById(item.productId);

                  return (
                    <div
                      key={`${item.productId}-${index}`}
                      className={`flex items-center gap-3 py-3 ${index !== order.items.length - 1 ? 'border-b' : ''}`}
                      style={{ borderColor: palette.hairline }}
                    >
                      <div className="w-12 h-12 rounded-xl flex-shrink-0 overflow-hidden" style={{ border: `1px solid ${palette.border}`, backgroundColor: palette.panelSubtle }}>
                        {product?.image
                          ? <img src={product.image} alt={item.name} className="w-full h-full object-cover" />
                          : <Package className="w-4 h-4 m-auto mt-4" style={{ color: theme.colors.textSecondary }} />}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[0.8125rem] font-semibold truncate" style={{ color: theme.colors.textPrimary }}>{item.name}</p>
                        <p className="text-[0.6875rem] mt-0.5" style={{ color: theme.colors.textSecondary }}>
                          Qty {item.qty}{item.size ? ` · Size ${item.size}` : ''}
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-[0.8125rem] font-semibold" style={{ color: theme.colors.textPrimary }}>
                          {formatElliottBucks(item.price)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {(order.tracking || order.estimatedDelivery || order.deliveredDate) && (
                <div className="rounded-[22px] p-4" style={{ backgroundColor: palette.panelSubtle, border: `1px solid ${palette.border}` }}>
                  <p className="text-[0.625rem] font-bold uppercase tracking-[0.18em] mb-3" style={{ color: theme.colors.textSecondary }}>Fulfillment</p>

                  {order.tracking && (
                    <div className="flex items-center gap-2 mb-2.5">
                      <Truck className="w-3.5 h-3.5 flex-shrink-0" style={{ color: theme.colors.textSecondary }} />
                      <p className="text-xs font-mono" style={{ color: theme.colors.textPrimary }}>{order.tracking}</p>
                    </div>
                  )}

                  {order.status === 'delivered' && order.deliveredDate && (
                    <p className="text-xs font-medium" style={{ color: palette.success }}>
                      Delivered {formatShortDate(order.deliveredDate)}
                    </p>
                  )}

                  {order.status === 'shipped' && order.estimatedDelivery && (
                    <p className="text-xs font-medium" style={{ color: palette.info }}>
                      Estimated delivery {formatShortDate(order.estimatedDelivery)}
                    </p>
                  )}

                  {order.status === 'processing' && order.estimatedDelivery && (
                    <p className="text-xs font-medium" style={{ color: palette.warning }}>
                      Ships by {formatShortDate(order.estimatedDelivery)}
                    </p>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
};
