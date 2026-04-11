import React, { useState, useMemo, useCallback } from 'react';
import {
  Share2, Eye, Film, FileText, BarChart3,
  Truck, PackageCheck, ClipboardCheck,
} from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';
import { JSIWebButton } from '../../components/common/JSIButtons.jsx';
import { ORDER_DATA, STATUS_COLORS } from './data.js';
import { useFadeUp, tc, fmt$, fd, fs, Stage, LineItem, AckModal, ClipsModal } from './OrderDetailScreenComponents.jsx';

/* ── timeline stages ─────────────────────────────────────────── */
const STAGES = [
  { key: 'po',   label: 'PO Received',   Icon: ClipboardCheck },
  { key: 'oe',   label: 'Order Entry',   Icon: FileText },
  { key: 'ack',  label: 'Acknowledged',  Icon: ClipboardCheck },
  { key: 'prod', label: 'In Production', Icon: BarChart3 },
  { key: 'ship', label: 'Shipping',      Icon: Truck },
  { key: 'dlvd', label: 'Delivered',     Icon: PackageCheck },
];
const IDX = { 'Order Entry': 1, 'Acknowledged': 2, 'In Production': 3, 'Shipping': 4, 'Delivered': 5 };
const PCT = { 1: 20, 2: 35, 3: 60, 4: 85, 5: 100 };

export const OrderDetailScreen = ({ theme, onNavigate, currentScreen }) => {
  const [xLine, setXLine]   = useState(null);
  const [modal, setModal]   = useState(null); // 'ack' | 'clips' | null

  const orderId = currentScreen.split('/')[1];
  const order   = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderId), [orderId]);
  const toggle  = useCallback(id => setXLine(p => p === id ? null : id), []);

  const dark        = isDarkTheme(theme);
  const c           = theme.colors;
  const border      = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.03)';

  const hdrRef = useFadeUp(0);
  const tlRef  = useFadeUp(55);
  const detRef = useFadeUp(100);

  if (!order) return (
    <div className="min-h-full flex flex-col items-center justify-center gap-3" style={{ backgroundColor: c.background }}>
      <p className="text-sm" style={{ color: c.textSecondary }}>Order not found</p>
      <button onClick={() => onNavigate('orders')} className="text-sm font-medium underline" style={{ color: c.accent }}>Back to Orders</button>
    </div>
  );

  const sc  = STATUS_COLORS[order.status] || c.textSecondary;
  const cur = IDX[order.status] ?? 0;
  const pct = PCT[cur];
  const qty = order.lineItems.reduce((s, li) => s + li.quantity, 0);
  const stageState = i => i < cur ? 'completed' : i === cur ? 'current' : 'future';

  const share = () => {
    const payload = { title: `Order ${order.orderNumber}`, text: `${tc(order.details)} — ${fmt$(order.net, true)}` };
    if (order.ackUrl) payload.url = order.ackUrl;
    navigator.share?.(payload).catch(() => {});
  };

  /* stage subtitles (contextual metadata per row) */
  const subs = {
    0: `${order.po}  ·  ${fs(order.date)}`,
    1: `${fmt$(order.net, true)}  ·  ${qty} items`,
    2: order.ackDate ? fd(order.ackDate) : null,
    4: order.shipDate ? fd(order.shipDate) : null,
  };

  /* ship-to for shipping stage */
  const shipToAddr = order.shipTo ? tc(order.shipTo).split('\n') : null;

  /* top-level action buttons */
  const actions = [
    order.ackUrl && { label: 'View ACK',  Icon: Eye,    onClick: () => setModal('ack') },
    { label: 'Share',     Icon: Share2, onClick: share },
    { label: 'Clips',     Icon: Film,   onClick: () => setModal('clips') },
  ].filter(Boolean);

  return (
    <div className="min-h-full" style={{ backgroundColor: c.background }}>
      <div className="flex-1 overflow-y-auto px-5 pb-10 scrollbar-hide" style={{ paddingTop: 'calc(var(--app-header-offset, 72px) + env(safe-area-inset-top, 0px) + 16px)' }}>
        <div className="max-w-xl mx-auto w-full">

          {/* ── header card ── */}
          <div ref={hdrRef} className="mt-3 mb-3">
            <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${border}` }}>

              {/* title + status + subtitle */}
              <div className="px-5 pt-5 pb-2">
                <div className="flex items-start justify-between gap-3">
                  <h1 className="text-[1.125rem] font-semibold leading-tight flex-1 min-w-0" style={{ color: c.textPrimary }}>
                    {tc(order.details)}
                  </h1>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full flex-shrink-0 mt-0.5" style={{ backgroundColor: `${sc}12` }}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc }} />
                    <span className="text-[0.6875rem] font-semibold" style={{ color: sc }}>{order.status}</span>
                  </div>
                </div>
                <p className="text-[0.8125rem] mt-1" style={{ color: c.textSecondary }}>
                  {tc(order.company)} <span style={{ opacity: 0.4 }}>·</span> SO {order.orderNumber}
                </p>
              </div>

              {/* stats row */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-3 px-5 pb-5 pt-2">
                <div>
                  <p className="text-[0.6875rem] font-medium uppercase tracking-wide" style={{ color: c.textSecondary, opacity: 0.5 }}>Net Total</p>
                  <p className="text-lg font-semibold tabular-nums mt-px" style={{ color: c.textPrimary }}>{fmt$(order.net, true)}</p>
                </div>
                <div>
                  <p className="text-[0.6875rem] font-medium uppercase tracking-wide" style={{ color: c.textSecondary, opacity: 0.5 }}>Est. Ship</p>
                  <p className="text-[0.9375rem] font-semibold mt-px" style={{ color: c.textPrimary }}>{fs(order.shipDate) || '—'}</p>
                </div>
                <div>
                  <p className="text-[0.6875rem] font-medium uppercase tracking-wide" style={{ color: c.textSecondary, opacity: 0.5 }}>Dealer</p>
                  <p className="text-sm font-semibold mt-px" style={{ color: c.textPrimary }}>{tc(order.company)}</p>
                </div>
                <div>
                  <p className="text-[0.6875rem] font-medium uppercase tracking-wide" style={{ color: c.textSecondary, opacity: 0.5 }}>Discount</p>
                  <p className="text-sm font-semibold mt-px" style={{ color: c.textPrimary }}>{order.discount}</p>
                </div>
              </div>

            </div>

            {/* actions — JSI web buttons below the card */}
            <div className="flex items-center gap-2.5 mt-3">
              {actions.map(({ label, Icon, onClick }) => (
                <JSIWebButton
                  key={label}
                  onClick={onClick}
                  theme={theme}
                  variant="soft"
                  size="medium"
                  className="jsi-web-btn--auto"
                  icon={<Icon size={16} strokeWidth={2} />}
                >
                  {label}
                </JSIWebButton>
              ))}
            </div>
          </div>

          {/* ── order progress ── */}
          <div ref={tlRef} className="mb-3 rounded-[24px] overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${border}` }}>
            <div className="flex items-center justify-between px-5 pt-4 pb-3">
              <span className="text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: c.textSecondary, opacity: 0.5 }}>Order Progress</span>
              {pct != null && (
                <span className="text-[0.6875rem] font-semibold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${sc}12`, color: sc }}>
                  {pct}%
                </span>
              )}
            </div>
            <div className="px-4 pt-2.5 pb-2">
              {STAGES.map((s, i) => (
                <Stage key={s.key} stage={s} state={stageState(i)} isLast={i === 5}
                  subtitle={subs[i] ?? null} statusColor={sc}
                  progress={i === cur ? pct : null} dark={dark} c={c} idx={i}
                  shipTo={i === 4 ? shipToAddr : null} />
              ))}
            </div>
          </div>

          {/* ── line items ── */}
          <div ref={detRef} className="mb-2">
            <div className="rounded-[24px] overflow-hidden" style={{ backgroundColor: c.surface, border: `1px solid ${border}` }}>
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <span className="text-[0.6875rem] font-semibold uppercase tracking-wide" style={{ color: c.textSecondary, opacity: 0.5 }}>Line Items</span>
                <span className="text-[0.6875rem] font-medium" style={{ color: c.textSecondary, opacity: 0.5 }}>
                  {order.lineItems.length}
                </span>
              </div>
              {order.lineItems.map((li, idx) => (
                <LineItem key={li.line} item={li} open={xLine === li.line}
                  onToggle={() => toggle(li.line)} c={c} dark={dark} panelBorder={border} isFirst={idx === 0} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {modal === 'ack'   && <AckModal   order={order} onClose={() => setModal(null)} onShare={share} dark={dark} c={c} />}
      {modal === 'clips' && <ClipsModal onClose={() => setModal(null)} dark={dark} c={c} />}
    </div>
  );
};
