import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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

/* ── entrance animation ─────────────────────────────────────── */
const useFadeUp = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Start with CSS transition ready, then trigger on next frame
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    // Force reflow then apply transition
    void el.offsetHeight;
    el.style.transition = `opacity .35s ease ${delay}ms, transform .35s ease ${delay}ms`;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, [delay]);
  return ref;
};

/* ── portal (escapes stacking context so modals sit above header) */
const Portal = ({ children }) => createPortal(children, document.body);

/* ── card ────────────────────────────────────────────────────── */
const Card = ({ children, dark, className = '', style }) => (
  <div className={className} style={{
    padding: 20, backgroundColor: dark ? '#2A2A2A' : '#fff',
    borderRadius: 24, border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)', ...style,
  }}>{children}</div>
);

/* ── pill button ─────────────────────────────────────────────── */
const Pill = ({ icon: Ic, label, onClick, dark }) => (
  <button onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition active:scale-[0.97] flex-shrink-0"
    style={{
      backgroundColor: dark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)',
      borderColor: dark ? 'rgba(255,255,255,0.1)' : 'rgba(53,53,53,0.1)',
      color: dark ? '#fff' : JSI_COLORS.charcoal,
    }}>
    <Ic className="w-3.5 h-3.5" /> {label}
  </button>
);

/* ── checkmark ───────────────────────────────────────────────── */
const Chk = ({ clr }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={clr} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── timeline stage (supports multiple action pills) ─────────── */
const Stage = React.memo(({ stage, state, isLast, subtitle, actions, progress, dark, c, idx }) => {
  const done = state === 'completed', now = state === 'current', later = state === 'future';
  const { Icon } = stage;
  const ref = useFadeUp(idx * 50);

  const cirBg = done ? (dark ? 'rgba(255,255,255,0.12)' : 'rgba(53,53,53,0.08)')
    : now ? JSI_COLORS.charcoal
    : dark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.04)';
  const cirBorder = done ? (dark ? 'rgba(255,255,255,0.2)' : 'rgba(53,53,53,0.15)') : 'transparent';
  const icClr = done ? (dark ? '#fff' : JSI_COLORS.charcoal)
    : now ? '#fff'
    : dark ? 'rgba(255,255,255,0.2)' : 'rgba(53,53,53,0.2)';
  const lineClr = done ? (dark ? 'rgba(255,255,255,0.15)' : 'rgba(53,53,53,0.12)')
    : dark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.06)';
  const txtClr = later ? (dark ? 'rgba(255,255,255,0.25)' : 'rgba(53,53,53,0.25)') : c.textPrimary;

  return (
    <div ref={ref} className="flex" style={{ gap: 14 }}>
      <div className="flex flex-col items-center" style={{ width: 40, flexShrink: 0 }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cirBg, border: `1.5px solid ${cirBorder}` }}>
          {done ? <Chk clr={icClr} /> : <Icon className="w-[18px] h-[18px]" style={{ color: icClr }} />}
        </div>
        {!isLast && <div className="flex-1 w-px" style={{ minHeight: 14, backgroundColor: lineClr }} />}
      </div>
      <div className={`flex-1 min-w-0 ${isLast ? '' : 'pb-4'}`} style={{ paddingTop: 7 }}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[15px] leading-tight" style={{ color: txtClr }}>{stage.label}</span>
              {now && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ backgroundColor: JSI_COLORS.charcoal, color: '#fff' }}>Current</span>}
            </div>
            {subtitle && !later && <p className="text-[13px] mt-0.5" style={{ color: c.textSecondary }}>{subtitle}</p>}
          </div>
          {actions?.length > 0 && !later && (
            <div className="flex items-center gap-1.5">
              {actions.map((a, i) => <Pill key={i} icon={a.Icon} label={a.label} onClick={a.onClick} dark={dark} />)}
            </div>
          )}
        </div>
        {now && progress != null && (
          <div className="mt-2.5">
            <div className="h-[7px] rounded-full overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(53,53,53,0.07)' }}>
              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: JSI_COLORS.charcoal, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
            </div>
            <p className="text-[11px] font-medium mt-1 text-right" style={{ color: c.textSecondary }}>{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
});

/* ── line item row (redesigned) ──────────────────────────────── */
const LineItem = React.memo(({ item, open, onToggle, c, dark }) => (
  <div className="rounded-2xl mb-2 transition-colors" style={{
    backgroundColor: open ? (dark ? 'rgba(255,255,255,0.03)' : '#fff') : 'transparent',
    border: open ? (dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)') : '1px solid transparent',
  }}>
    <button onClick={onToggle}
      className="w-full text-left px-4 py-3 flex items-center gap-3 select-none focus:outline-none">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 text-[11px] font-bold"
        style={{
          backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)',
          color: c.textSecondary,
        }}>
        {item.line}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-[14px] leading-tight truncate" style={{ color: c.textPrimary }}>{tc(item.name)}</p>
        <p className="text-[11px] mt-0.5" style={{ color: c.textSecondary }}>{item.model}</p>
      </div>
      <div className="text-right flex-shrink-0 mr-1">
        <p className="font-semibold text-[14px]" style={{ color: c.textPrimary }}>{$(item.extNet, true)}</p>
        <p className="text-[11px]" style={{ color: c.textSecondary }}>Qty {item.quantity}</p>
      </div>
      <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform" style={{
        color: c.textSecondary, transform: open ? 'rotate(180deg)' : 'none',
      }} />
    </button>
    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0, transition: 'grid-template-rows .25s ease, opacity .2s ease' }}>
      <div style={{ overflow: 'hidden' }}>
        <div className="px-4 pb-4">
          <div className="ml-10 pt-1 space-y-3">
            {/* pricing grid */}
            <div className="grid grid-cols-3 gap-3">
              {[['Unit Price', $(item.net, true)], ['Extended', $(item.extNet, true)], ['Quantity', item.quantity]].map(([l, v]) => (
                <div key={l}>
                  <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: c.textSecondary }}>{l}</p>
                  <p className="text-[13px] font-semibold mt-0.5" style={{ color: c.textPrimary }}>{v}</p>
                </div>
              ))}
            </div>
            {/* specs */}
            {item.specs?.length > 0 && (
              <div className="rounded-xl py-2.5 px-3" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.025)' }}>
                {item.specs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between py-1">
                    <span className="text-[11px] font-medium uppercase tracking-wide" style={{ color: c.textSecondary }}>{s.label}</span>
                    <span className="text-[12px] font-semibold" style={{ color: c.textPrimary }}>{s.value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
));

/* ── ACK modal (portal, centered, rich HTML — no iframe) ─────── */
const AckModal = ({ order, onClose, onShare, dark, c }) => (
  <Portal>
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-label="Acknowledgment">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl overflow-hidden flex flex-col" style={{
        maxHeight: '85vh', backgroundColor: dark ? '#2A2A2A' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${c.border}` }}>
          <h3 className="text-sm font-bold" style={{ color: c.textPrimary }}>Acknowledgment — {order.orderNumber}</h3>
          <div className="flex items-center gap-1.5">
            <button onClick={onShare} className="p-2 rounded-full transition active:scale-95" style={{ backgroundColor: c.subtle }} aria-label="Share">
              <Share2 className="w-4 h-4" style={{ color: c.textPrimary }} />
            </button>
            <button onClick={onClose} className="p-2 rounded-full transition active:scale-95" style={{ backgroundColor: c.subtle }} aria-label="Close">
              <X className="w-4 h-4" style={{ color: c.textPrimary }} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* summary grid */}
          <div className="grid grid-cols-2 gap-3">
            {[['PO Number', order.po], ['Order Date', fd(order.date)], ['Ship Date', fd(order.shipDate)], ['Discount', order.discount]].map(([l, v]) => (
              <div key={l}>
                <p className="text-[10px] uppercase tracking-wider font-medium" style={{ color: c.textSecondary }}>{l}</p>
                <p className="text-sm font-semibold mt-0.5" style={{ color: c.textPrimary }}>{v}</p>
              </div>
            ))}
          </div>
          {/* ship to */}
          {order.shipTo && (
            <div>
              <p className="text-[10px] uppercase tracking-wider font-medium mb-1" style={{ color: c.textSecondary }}>Ship To</p>
              <p className="text-[13px] leading-relaxed whitespace-pre-line" style={{ color: c.textPrimary }}>{tc(order.shipTo)}</p>
            </div>
          )}
          {/* items */}
          <div>
            <p className="text-[10px] uppercase tracking-wider font-medium mb-2" style={{ color: c.textSecondary }}>Items</p>
            {order.lineItems.map((li, i) => (
              <div key={li.line} className="flex items-start justify-between gap-3 py-2.5"
                style={{ borderBottom: i < order.lineItems.length - 1 ? `1px solid ${c.border}` : 'none' }}>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-medium" style={{ color: c.textPrimary }}>{tc(li.name)}</p>
                  <p className="text-[11px] mt-0.5" style={{ color: c.textSecondary }}>{li.model} · Qty {li.quantity}</p>
                </div>
                <p className="text-[13px] font-semibold whitespace-nowrap" style={{ color: c.textPrimary }}>{$(li.extNet, true)}</p>
              </div>
            ))}
          </div>
          {/* total */}
          <div className="flex items-center justify-between pt-1" style={{ borderTop: `1px solid ${c.border}` }}>
            <p className="text-sm font-bold" style={{ color: c.textPrimary }}>Total</p>
            <p className="text-lg font-bold" style={{ color: c.textPrimary }}>{$(order.net, true)}</p>
          </div>
          {/* download pdf link */}
          {order.ackUrl && (
            <a href={order.ackUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-sm font-medium transition active:scale-[0.97]"
              style={{
                backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)',
                border: `1px solid ${dark ? 'rgba(255,255,255,0.1)' : 'rgba(53,53,53,0.1)'}`,
                color: c.textPrimary,
              }}>
              <Download className="w-4 h-4" /> Download PDF
            </a>
          )}
        </div>
      </div>
    </div>
  </Portal>
);

/* ── clips modal (portal) ───────────────────────────────────── */
const ClipsModal = ({ onClose, dark, c }) => (
  <Portal>
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center" role="dialog" aria-label="Production clips">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col" style={{
        maxHeight: '80vh', backgroundColor: dark ? '#2A2A2A' : '#fff',
        border: dark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.06)',
      }}>
        <div className="flex items-center justify-between px-5 py-3.5" style={{ borderBottom: `1px solid ${c.border}` }}>
          <div>
            <h3 className="text-sm font-bold" style={{ color: c.textPrimary }}>Production Clips</h3>
            <p className="text-[11px] mt-0.5" style={{ color: c.textSecondary }}>Live from the JSI factory floor</p>
          </div>
          <button onClick={onClose} className="p-2 -mr-2 rounded-full transition active:scale-95" style={{ backgroundColor: c.subtle }} aria-label="Close">
            <X className="w-4 h-4" style={{ color: c.textPrimary }} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {PROD_CLIPS.map(clip => (
            <div key={clip.id} className="flex gap-3 items-center rounded-xl p-2 transition cursor-pointer"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.02)' }}>
              <div className="relative flex-shrink-0 w-28 h-16 rounded-lg overflow-hidden" style={{ backgroundColor: dark ? '#333' : '#eee' }}>
                <img src={clip.thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                  <Play className="w-5 h-5 text-white fill-white" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate" style={{ color: c.textPrimary }}>{clip.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: c.textSecondary }}>{clip.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Portal>
);

/* ═══════════════════════════════════════════════════════════════
   ORDER DETAIL SCREEN
   ═══════════════════════════════════════════════════════════════ */
export const OrderDetailScreen = ({ theme, onNavigate, currentScreen }) => {
  const [xLine, setXLine] = useState(null);
  const [modal, setModal] = useState(null); // 'ack' | 'clips' | null

  const orderId = currentScreen.split('/')[1];
  const order = useMemo(() => ORDER_DATA.find(o => o.orderNumber === orderId), [orderId]);
  const toggle = useCallback(id => setXLine(p => (p === id ? null : id)), []);

  const dark = isDarkTheme(theme);
  const c = theme.colors;

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

          {/* ── header with inline key stats ── */}
          <div ref={hdrRef} className="mb-5 mt-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold leading-tight" style={{ color: c.textPrimary }}>{tc(order.details)}</h1>
                <p className="text-sm font-medium mt-0.5" style={{ color: c.textSecondary }}>#{order.orderNumber}</p>
              </div>
              <div className="text-right flex-shrink-0 pt-0.5">
                <p className="text-lg font-bold" style={{ color: c.textPrimary }}>{$(order.net, true)}</p>
                <p className="text-[11px] font-medium" style={{ color: c.textSecondary }}>Ship {fs(order.shipDate) || '—'}</p>
              </div>
            </div>
          </div>

          {/* ── timeline ── */}
          <div ref={tlRef} className="mb-6">
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
                    <p className="text-[11px] uppercase tracking-wide font-medium" style={{ color: c.textSecondary }}>{l}</p>
                    <p className="text-sm font-semibold mt-0.5" style={{ color: c.textPrimary }}>{v}</p>
                  </div>
                ))}
              </div>
              {order.shipTo && (
                <div className="mt-4 pt-3" style={{ borderTop: `1px solid ${c.border}` }}>
                  <p className="text-[11px] uppercase tracking-wide font-medium mb-1" style={{ color: c.textSecondary }}>Ship To</p>
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
            {order.lineItems.map((li, i) => (
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