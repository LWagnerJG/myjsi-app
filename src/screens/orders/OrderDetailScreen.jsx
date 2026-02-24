import React, { useState, useMemo, useCallback } from 'react';
import {
  ChevronDown, Share2, X, Eye, FileText, BarChart3,
  Truck, PackageCheck, ClipboardCheck, Film, Play, Download,
} from 'lucide-react';
import { isDarkTheme, JSI_COLORS } from '../../design-system/tokens.js';
import { ORDER_DATA } from './data.js';

/* ── helpers ────────────────────────────────────────────────── */
const ABBR = /\b(llc|inc|msd|lecc)\b/gi;
const tc = s => s?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(ABBR, m => m.toUpperCase()) ?? '';
const $ = (n, cents) => cents
  ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : `$${Number(n).toLocaleString()}`;
const fd = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
const fs = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

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

const PROD_CLIPS = [
  { id: 1, title: 'Panel Cutting & Shaping', duration: '0:32', thumb: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=320&h=180&fit=crop' },
  { id: 2, title: 'Edge Banding Line',       duration: '0:18', thumb: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=320&h=180&fit=crop' },
  { id: 3, title: 'Upholstery Station',      duration: '0:45', thumb: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=320&h=180&fit=crop' },
  { id: 4, title: 'Final Assembly & QC',      duration: '0:27', thumb: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=320&h=180&fit=crop' },
];

import { useFadeUp, Portal, Card, Pill, Chk, Stage, LineItem, AckModal, ClipsModal } from './OrderDetailScreenComponents.jsx';

export const OrderDetailScreen = ({ theme, onNavigate, currentScreen }) => {
  const [xLine, setXLine] = useState(null);
  const [modal, setModal] = useState(null); // 'ack' | 'clips' | null

  const orderId = currentScreen.split('/')[1];
  const order = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderId), [orderId]);
  const toggle = useCallback(id => setXLine(p => (p === id ? null : id)), []);

  const dark = isDarkTheme(theme);
  const c = theme.colors;
  const panelBg = dark ? 'rgba(255,255,255,0.03)' : '#FFFFFF';
  const panelBorder = dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)';
  const panelSubtle = dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';

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

  const cur = IDX[order.status] ?? 0;
  const pct = PCT[cur];
  const qty = order.lineItems.reduce((s, li) => s + li.quantity, 0);
  const state = i => i < cur ? 'completed' : i === cur ? 'current' : 'future';

  const share = () => {
    const payload = { title: `Order ${order.orderNumber}`, text: `${tc(order.details)} — ${$(order.net, true)}` };
    if (order.ackUrl) payload.url = order.ackUrl;
    navigator.share?.(payload).catch(() => {});
  };

  const subs = {
    0: `${order.po}  ·  ${fs(order.date)}`,
    1: `${$(order.net, true)}  ·  ${qty} items`,
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

          {/* ── header with grouped order snapshot ── */}
          <div ref={hdrRef} className="mb-8 mt-2">
            <div className="rounded-3xl border p-4 sm:p-5 space-y-4" style={{ backgroundColor: panelBg, borderColor: panelBorder }}>
              <div className="flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md" style={{ backgroundColor: panelSubtle }}>
                  <span className="text-xs font-bold tracking-wide" style={{ color: c.textSecondary }}>ORDER #{order.orderNumber}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: dark ? 'rgba(74, 124, 89, 0.2)' : 'rgba(74, 124, 89, 0.1)' }}>
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: '#4A7C59' }} />
                  <span className="text-xs font-bold" style={{ color: dark ? '#81C784' : '#4A7C59' }}>{order.status}</span>
                </div>
              </div>

              <div>
                <h1 className="text-[28px] font-extrabold leading-tight tracking-tight" style={{ color: c.textPrimary }}>{tc(order.details)}</h1>
                <p className="text-[15px] font-medium mt-1" style={{ color: c.textSecondary }}>{tc(order.company)}</p>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-3 border-t" style={{ borderColor: panelBorder }}>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Net Total</p>
                  <p className="text-xl font-bold" style={{ color: c.textPrimary }}>{$(order.net, true)}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Est. Ship</p>
                  <p className="text-[15px] font-semibold" style={{ color: c.textPrimary }}>{fs(order.shipDate) || '—'}</p>
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider mb-0.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Items</p>
                  <p className="text-[15px] font-semibold" style={{ color: c.textPrimary }}>{qty}</p>
                </div>
              </div>

            </div>
          </div>

          {/* ── timeline ── */}
          <div ref={tlRef} className="mb-6 rounded-3xl border p-4 sm:p-5" style={{ backgroundColor: panelBg, borderColor: panelBorder }}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-[15px]" style={{ color: c.textPrimary }}>Order Progress</h3>
              <span className="text-[11px] font-semibold uppercase tracking-wide" style={{ color: c.textSecondary }}>Timeline</span>
            </div>
            {STAGES.map((s, i) => (
              <Stage key={s.key} stage={s} state={state(i)} isLast={i === 5} subtitle={subs[i] ?? null}
                actions={acts[i] ?? null} progress={i === cur ? pct : null} dark={dark} c={c} idx={i} />
            ))}
          </div>

          {/* ── order details card ── */}
          <div ref={detRef}>
            <Card dark={dark} className="mb-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[15px]" style={{ color: c.textPrimary }}>Order Details</h3>
                <Pill icon={Share2} label="Share" onClick={share} dark={dark} />
              </div>
              <div className="grid grid-cols-2 gap-y-3.5 gap-x-5">
                {[
                  ['PO Number', order.po],
                  ['Est. Ship', fd(order.shipDate)],
                  ['Dealer', tc(order.company)],
                  ['Discount', order.discount],
                ].map(([l, v]) => (
                  <div key={l}>
                    <p className="text-xs uppercase tracking-wide font-medium" style={{ color: c.textSecondary }}>{l}</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: c.textPrimary }}>{v}</p>
                  </div>
                ))}
              </div>
              {order.shipTo && (
                <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
                  <p className="text-xs uppercase tracking-wide font-medium mb-1" style={{ color: c.textSecondary }}>Ship To</p>
                  <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: c.textPrimary }}>{tc(order.shipTo)}</p>
                </div>
              )}
            </Card>
          </div>

          {/* ── line items ── */}
          <div ref={liRef}>
            <div className="flex items-center justify-between mb-3 px-1">
              <h3 className="font-bold text-[15px]" style={{ color: c.textPrimary }}>
                Line Items
                <span className="text-xs font-medium ml-2" style={{ color: c.textSecondary }}>
                  {order.lineItems.length} {order.lineItems.length === 1 ? 'product' : 'products'}
                </span>
              </h3>
            </div>
            {order.lineItems.map((li) => (
              <LineItem key={li.line} item={li} open={xLine === li.line} onToggle={() => toggle(li.line)} c={c} dark={dark} />
            ))}
          </div>

        </div>
      </div>

      {/* ── modals (portaled above app header) ── */}
      {modal === 'ack' && <AckModal order={order} onClose={() => setModal(null)} onShare={share} dark={dark} c={c} />}
      {modal === 'clips' && <ClipsModal onClose={() => setModal(null)} dark={dark} c={c} />}
    </div>
  );
};
