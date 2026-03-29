import React, { useState, useMemo, useCallback } from 'react';
import {
  Share2, Eye, FileText, BarChart3,
  Truck, PackageCheck, ClipboardCheck, Film,
} from 'lucide-react';
import { isDarkTheme } from '../../design-system/tokens.js';
import { ORDER_DATA, STATUS_COLORS } from './data.js';
import { useFadeUp, tc, fmt$, fd, fs, Card, Pill, Stage, LineItem, AckModal, ClipsModal } from './OrderDetailScreenComponents.jsx';

/* ── timeline config ────────────────────────────────────────── */
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
  const [xLine, setXLine] = useState(null);
  const [modal, setModal] = useState(null); // 'ack' | 'clips' | null

  const orderId = currentScreen.split('/')[1];
  const order = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderId), [orderId]);
  const toggle = useCallback(id => setXLine(p => (p === id ? null : id)), []);

  const dark = isDarkTheme(theme);
  const c = theme.colors;
  const panelBg  = c.surface;
  const panelBorder = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)';

  const hdrRef = useFadeUp(0);
  const tlRef  = useFadeUp(80);
  const detRef = useFadeUp(160);
  const liRef  = useFadeUp(220);

  if (!order) return (
    <div className="flex flex-col h-full items-center justify-center gap-3 app-header-offset" style={{ backgroundColor: c.background }}>
      <p className="text-sm" style={{ color: c.textSecondary }}>Order not found</p>
      <button onClick={() => onNavigate('orders')} className="text-sm font-medium underline" style={{ color: c.accent }}>Back to Orders</button>
    </div>
  );

  const sc = STATUS_COLORS[order.status] || '#8B8680';
  const cur = IDX[order.status] ?? 0;
  const pct = PCT[cur];
  const qty = order.lineItems.reduce((s, li) => s + li.quantity, 0);
  const state = i => i < cur ? 'completed' : i === cur ? 'current' : 'future';

  const share = () => {
    const payload = { title: `Order ${order.orderNumber}`, text: `${tc(order.details)} — ${fmt$(order.net, true)}` };
    if (order.ackUrl) payload.url = order.ackUrl;
    navigator.share?.(payload).catch(() => {});
  };

  const subs = {
    0: `${order.po}  ·  ${fs(order.date)}`,
    1: `${fmt$(order.net, true)}  ·  ${qty} items`,
    2: order.ackDate ? fd(order.ackDate) : null,
    4: order.shipDate ? fd(order.shipDate) : null,
  };

  const acts = {
    0: [{ label: 'View', Icon: Eye, onClick: () => setModal('ack') }],
    2: order.ackUrl
      ? [{ label: 'View', Icon: FileText, onClick: () => setModal('ack') }, { label: 'Share', Icon: Share2, onClick: share }]
      : null,
    3: [{ label: 'Clips', Icon: Film, onClick: () => setModal('clips') }],
  };

  return (
    <div className="flex flex-col h-full app-header-offset" style={{ backgroundColor: c.background }}>
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-8 scrollbar-hide">
        <div className="max-w-xl mx-auto w-full">

          {/* ── header snapshot card ── */}
          <div ref={hdrRef} className="mb-4 mt-2">
            <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: panelBg, border: `1px solid ${panelBorder}` }}>
              {/* order number + status */}
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${panelBorder}` }}>
                <span className="text-[11px] font-bold tracking-[0.06em] uppercase" style={{ color: c.textSecondary, opacity: 0.5 }}>SO {order.orderNumber}</span>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: `${sc}15` }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sc }} />
                  <span className="text-[11px] font-bold" style={{ color: sc }}>{order.status}</span>
                </div>
              </div>
              {/* title + company */}
              <div className="px-5 pt-4 pb-3">
                <h1 className="text-[21px] font-black leading-tight tracking-tight" style={{ color: c.textPrimary }}>{tc(order.details)}</h1>
                <p className="text-[13px] font-medium mt-0.5" style={{ color: c.textSecondary }}>{tc(order.company)}</p>
              </div>
              {/* stat row — explicit borders, no divide-x */}
              <div className="grid grid-cols-3" style={{ borderTop: `1px solid ${panelBorder}` }}>
                {[
                  { label: 'Net Total', value: fmt$(order.net, true), large: true },
                  { label: 'Est. Ship', value: fs(order.shipDate) || '—', large: false },
                  { label: 'Items',     value: String(qty),            large: false },
                ].map(({ label, value, large }, i) => (
                  <div key={label} className="px-4 py-3" style={{ borderLeft: i > 0 ? `1px solid ${panelBorder}` : 'none' }}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.07em] mb-0.5" style={{ color: c.textSecondary, opacity: 0.55 }}>{label}</p>
                    <p className={`${large ? 'text-[16px] font-black' : 'text-[14px] font-semibold'} tabular-nums leading-tight`} style={{ color: c.textPrimary }}>{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── timeline ── */}
          <div ref={tlRef} className="mb-4 rounded-[22px] overflow-hidden" style={{ backgroundColor: panelBg, border: `1px solid ${panelBorder}` }}>
            <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${panelBorder}` }}>
              <span className="text-[12px] font-bold uppercase tracking-[0.07em]" style={{ color: c.textSecondary, opacity: 0.55 }}>Order Progress</span>
              {pct != null && <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: `${sc}15`, color: sc }}>{pct}% complete</span>}
            </div>
            <div className="px-4 pt-3 pb-2">
              {STAGES.map((s, i) => (
                <Stage key={s.key} stage={s} state={state(i)} isLast={i === 5} subtitle={subs[i] ?? null}
                  actions={acts[i] ?? null} progress={i === cur ? pct : null} dark={dark} c={c} idx={i} />
              ))}
            </div>
          </div>

          {/* ── order details card ── */}
          <div ref={detRef} className="mb-4">
            <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: panelBg, border: `1px solid ${panelBorder}` }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${panelBorder}` }}>
                <span className="text-[12px] font-bold uppercase tracking-[0.07em]" style={{ color: c.textSecondary, opacity: 0.55 }}>Order Details</span>
                <Pill icon={Share2} label="Share" onClick={share} dark={dark} />
              </div>
              <div className="grid grid-cols-2 gap-y-4 gap-x-4 px-5 py-4">
                {[
                  ['PO Number', order.po],
                  ['Est. Ship', fd(order.shipDate)],
                  ['Dealer', tc(order.company)],
                  ['Discount', order.discount],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-[10px] font-bold uppercase tracking-[0.07em] mb-0.5" style={{ color: c.textSecondary, opacity: 0.55 }}>{l}</p>
                    <p className="text-[14px] font-semibold leading-snug" style={{ color: c.textPrimary }}>{v}</p>
                  </div>
                ))}
              </div>
              {order.shipTo && (
                <div className="px-5 py-4" style={{ borderTop: `1px solid ${panelBorder}` }}>
                  <p className="text-[10px] font-bold uppercase tracking-[0.07em] mb-1.5" style={{ color: c.textSecondary, opacity: 0.55 }}>Ship To</p>
                  <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: c.textPrimary }}>{tc(order.shipTo)}</p>
                </div>
              )}
            </div>
          </div>

          {/* ── line items ── */}
          <div ref={liRef} className="mb-2">
            <div className="rounded-[22px] overflow-hidden" style={{ backgroundColor: panelBg, border: `1px solid ${panelBorder}` }}>
              <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${panelBorder}` }}>
                <span className="text-[12px] font-bold uppercase tracking-[0.07em]" style={{ color: c.textSecondary, opacity: 0.55 }}>Line Items</span>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)', color: c.textSecondary }}>
                  {order.lineItems.length} {order.lineItems.length === 1 ? 'product' : 'products'}
                </span>
              </div>
              {order.lineItems.map((li, idx) => (
                <LineItem key={li.line} item={li} open={xLine === li.line} onToggle={() => toggle(li.line)} c={c} dark={dark} panelBorder={panelBorder} isFirst={idx === 0} />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── modals (portaled above app header) ── */}
      {modal === 'ack' && <AckModal order={order} onClose={() => setModal(null)} onShare={share} dark={dark} c={c} />}
      {modal === 'clips' && <ClipsModal onClose={() => setModal(null)} dark={dark} c={c} />}
    </div>
  );
};
