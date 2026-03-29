import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Share2, X, Play, Download } from 'lucide-react';
import { getUnifiedBackdropStyle, UNIFIED_MODAL_Z } from '../../components/common/modalUtils.js';

/* ── helpers ────────────────────────────────────────────────── */
const ABBR = /\b(llc|inc|msd|lecc)\b/gi;
// eslint-disable-next-line react-refresh/only-export-components
export const tc = s => s?.toLowerCase().replace(/\b\w/g, c => c.toUpperCase()).replace(ABBR, m => m.toUpperCase()) ?? '';
// eslint-disable-next-line react-refresh/only-export-components
export const fmt$ = (n, cents) => cents
  ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  : `$${Number(n).toLocaleString()}`;
// eslint-disable-next-line react-refresh/only-export-components
export const fd = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
// eslint-disable-next-line react-refresh/only-export-components
export const fs = d => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';

/* shared label style used across all expanded/detail areas */
const fieldLabel = (c) => ({
  fontSize: 10,
  fontWeight: 700,
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  color: c.textSecondary,
  opacity: 0.55,
  marginBottom: 2,
});

const PROD_CLIPS = [
  { id: 1, title: 'Panel Cutting & Shaping', duration: '0:32', thumb: 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=320&h=180&fit=crop' },
  { id: 2, title: 'Edge Banding Line',       duration: '0:18', thumb: 'https://images.unsplash.com/photo-1565793298595-6a879b1d9492?w=320&h=180&fit=crop' },
  { id: 3, title: 'Upholstery Station',      duration: '0:45', thumb: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=320&h=180&fit=crop' },
  { id: 4, title: 'Final Assembly & QC',     duration: '0:27', thumb: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=320&h=180&fit=crop' },
];

/* ── entrance animation ─────────────────────────────────────── */
// eslint-disable-next-line react-refresh/only-export-components
export const useFadeUp = (delay = 0) => {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(8px)';
    void el.offsetHeight;
    el.style.transition = `opacity .35s ease ${delay}ms, transform .35s ease ${delay}ms`;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
  }, [delay]);
  return ref;
};

/* ── portal ─────────────────────────────────────────────────── */
export const Portal = ({ children }) => createPortal(children, document.body);

/* ── card (legacy wrapper, kept for any external usage) ─────── */
export const Card = ({ children, dark, c, className = '', style }) => (
  <div className={className} style={{
    padding: 20,
    backgroundColor: c?.surface || (dark ? 'rgba(255,255,255,0.04)' : '#fff'),
    borderRadius: 22,
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
    ...style,
  }}>{children}</div>
);

/* ── pill action button ──────────────────────────────────────── */
export const Pill = ({ icon: Ic, label, onClick, dark }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[12px] font-semibold border transition active:scale-[0.97] flex-shrink-0"
    style={{
      backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.04)',
      borderColor: dark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.09)',
      color: dark ? 'rgba(255,255,255,0.8)' : '#353535',
    }}
  >
    <Ic className="w-3 h-3" /> {label}
  </button>
);

/* ── checkmark svg ───────────────────────────────────────────── */
export const Chk = ({ clr }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={clr} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

/* ── timeline stage ──────────────────────────────────────────── */
export const Stage = React.memo(({ stage, state, isLast, subtitle, statusColor, progress, dark, c, idx }) => {
  const done = state === 'completed', now = state === 'current', later = state === 'future';
  const { Icon } = stage;
  const ref = useFadeUp(idx * 45);

  const sc        = statusColor || c.accent;
  const cirBg     = done ? `${c.accent}10` : now ? `${sc}18` : dark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.04)';
  const cirBorder = done ? `${c.accent}30` : now ? `${sc}55`  : 'transparent';
  const icClr     = done ? c.accent        : now ? sc          : dark ? 'rgba(255,255,255,0.18)' : 'rgba(53,53,53,0.18)';
  const lineClr   = done ? `${c.accent}25` : dark ? 'rgba(255,255,255,0.05)' : 'rgba(53,53,53,0.05)';
  const txtClr    = later ? (dark ? 'rgba(255,255,255,0.2)' : 'rgba(53,53,53,0.2)') : c.textPrimary;

  return (
    <div ref={ref} className="flex" style={{ gap: 12 }}>
      {/* icon column */}
      <div className="flex flex-col items-center flex-shrink-0" style={{ width: 32 }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: cirBg, border: `1.5px solid ${cirBorder}` }}>
          {done ? <Chk clr={icClr} /> : <Icon className="w-[15px] h-[15px]" style={{ color: icClr }} />}
        </div>
        {!isLast && <div className="flex-1 w-px mt-1" style={{ minHeight: 8, backgroundColor: lineClr }} />}
      </div>

      {/* content */}
      <div className={`flex-1 min-w-0 ${isLast ? 'pb-1' : 'pb-3'}`} style={{ paddingTop: 4 }}>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-bold text-[14px] leading-snug ${later ? '' : ''}`} style={{ color: txtClr }}>
            {stage.label}
          </span>
          {now && (
            <span className="text-[10px] font-bold uppercase tracking-[0.07em] px-2 py-0.5 rounded-full"
              style={{ backgroundColor: `${sc}18`, color: sc }}>
              Current
            </span>
          )}
        </div>
        {subtitle && !later && (
          <p className="text-[12px] mt-0.5 leading-snug" style={{ color: c.textSecondary, opacity: 0.7 }}>
            {subtitle}
          </p>
        )}
        {now && progress != null && (
          <div className="mt-2 h-[4px] rounded-full overflow-hidden" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.08)' : 'rgba(53,53,53,0.07)' }}>
            <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: sc, transition: 'width .8s cubic-bezier(.4,0,.2,1)' }} />
          </div>
        )}
      </div>
    </div>
  );
});

/* ── line item row ───────────────────────────────────────────── */
export const LineItem = React.memo(({ item, open, onToggle, c, dark, panelBorder, isFirst }) => (
  <div className="transition-colors" style={{
    backgroundColor: open ? (dark ? 'rgba(255,255,255,0.03)' : `${c.accent}05`) : 'transparent',
    borderTop: !isFirst ? `1px solid ${panelBorder}` : undefined,
  }}>
    <button
      onClick={onToggle}
      className="w-full text-left px-5 py-3.5 flex items-center gap-3 select-none focus:outline-none active:opacity-70 transition-opacity"
    >
      {/* line number badge */}
      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-[11px] font-bold tabular-nums"
        style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : `${c.accent}10`, color: c.accent }}>
        {item.line}
      </div>

      {/* name + model */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-[14px] leading-snug truncate" style={{ color: c.textPrimary }}>{tc(item.name)}</p>
        <p className="text-[12px] mt-0.5" style={{ color: c.textSecondary, opacity: 0.7 }}>{item.model}</p>
      </div>

      {/* price + qty */}
      <div className="text-right flex-shrink-0">
        <p className="font-bold text-[14px]" style={{ color: c.textPrimary }}>{fmt$(item.extNet, true)}</p>
        <p className="text-[12px] mt-0.5" style={{ color: c.textSecondary, opacity: 0.7 }}>Qty {item.quantity}</p>
      </div>

      <ChevronDown className="w-4 h-4 flex-shrink-0 transition-transform ml-1" style={{
        color: c.textSecondary, opacity: 0.4, transform: open ? 'rotate(180deg)' : 'none',
      }} />
    </button>

    {/* expanded detail */}
    <div style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', opacity: open ? 1 : 0, transition: 'grid-template-rows .25s ease, opacity .2s ease' }}>
      <div style={{ overflow: 'hidden' }}>
        <div className="px-5 pb-4">
          <div className="ml-10 pt-1 space-y-3">
            {/* pricing grid */}
            <div className="grid grid-cols-3 gap-3">
              {[['Unit Price', fmt$(item.net, true)], ['Extended', fmt$(item.extNet, true)], ['Qty', item.quantity]].map(([l, v]) => (
                <div key={l}>
                  <p style={fieldLabel(c)}>{l}</p>
                  <p className="text-[13px] font-semibold" style={{ color: c.textPrimary }}>{v}</p>
                </div>
              ))}
            </div>

            {/* specs */}
            {item.specs?.length > 0 && (
              <div className="rounded-xl py-2 px-3 space-y-1.5" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.03)' : 'rgba(53,53,53,0.025)' }}>
                {item.specs.map((s, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <p style={fieldLabel(c)}>{s.label}</p>
                    <p className="text-[12px] font-semibold text-right" style={{ color: c.textPrimary }}>{s.value}</p>
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

/* ── ACK modal ───────────────────────────────────────────────── */
export const AckModal = ({ order, onClose, onShare, dark, c }) => (
  <Portal>
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: UNIFIED_MODAL_Z }} role="dialog" aria-label="Acknowledgment">
      <div className="absolute inset-0" style={getUnifiedBackdropStyle(true)} onClick={onClose} />
      <div className="relative w-full max-w-md rounded-[22px] overflow-hidden flex flex-col"
        style={{ maxHeight: '85vh', backgroundColor: c?.surface || '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>

        {/* header */}
        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
          <div>
            <p style={fieldLabel(c)}>Acknowledgment</p>
            <p className="text-[14px] font-bold" style={{ color: c.textPrimary }}>SO {order.orderNumber}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={onShare} className="w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }} aria-label="Share">
              <Share2 className="w-4 h-4" style={{ color: c.textSecondary }} />
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }} aria-label="Close">
              <X className="w-4 h-4" style={{ color: c.textSecondary }} />
            </button>
          </div>
        </div>

        {/* body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            {[['PO Number', order.po], ['Order Date', fd(order.date)], ['Ship Date', fd(order.shipDate)], ['Discount', order.discount]].map(([l, v]) => (
              <div key={l}>
                <p style={fieldLabel(c)}>{l}</p>
                <p className="text-[14px] font-semibold" style={{ color: c.textPrimary }}>{v}</p>
              </div>
            ))}
          </div>

          {order.shipTo && (
            <div>
              <p style={fieldLabel(c)}>Ship To</p>
              <p className="text-[13px] leading-relaxed whitespace-pre-line mt-0.5" style={{ color: c.textPrimary }}>{tc(order.shipTo)}</p>
            </div>
          )}

          <div>
            <p style={fieldLabel(c)}>Items</p>
            <div className="mt-1.5">
              {order.lineItems.map((li, i) => (
                <div key={li.line} className="flex items-start justify-between gap-3 py-2.5"
                  style={{ borderBottom: i < order.lineItems.length - 1 ? `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` : 'none' }}>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold" style={{ color: c.textPrimary }}>{tc(li.name)}</p>
                    <p className="text-[12px] mt-0.5" style={{ color: c.textSecondary, opacity: 0.7 }}>{li.model} · Qty {li.quantity}</p>
                  </div>
                  <p className="text-[13px] font-bold whitespace-nowrap" style={{ color: c.textPrimary }}>{fmt$(li.extNet, true)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5" style={{ borderTop: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
            <p className="text-[13px] font-bold" style={{ color: c.textSecondary }}>Total</p>
            <p className="text-[17px] font-black" style={{ color: c.textPrimary }}>{fmt$(order.net, true)}</p>
          </div>

          {order.ackUrl && (
            <a href={order.ackUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-full text-[13px] font-semibold transition active:scale-[0.97]"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.06)' : 'rgba(53,53,53,0.05)', border: `1px solid ${dark ? 'rgba(255,255,255,0.10)' : 'rgba(53,53,53,0.09)'}`, color: c.textPrimary }}>
              <Download className="w-4 h-4" /> Download PDF
            </a>
          )}
        </div>
      </div>
    </div>
  </Portal>
);

/* ── Clips modal ─────────────────────────────────────────────── */
export const ClipsModal = ({ onClose, dark, c }) => (
  <Portal>
    <div className="fixed inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: UNIFIED_MODAL_Z }} role="dialog" aria-label="Production clips">
      <div className="absolute inset-0" style={getUnifiedBackdropStyle(true)} onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-t-[22px] sm:rounded-[22px] overflow-hidden flex flex-col"
        style={{ maxHeight: '80vh', backgroundColor: c?.surface || '#fff', border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>

        <div className="flex items-center justify-between px-5 py-3" style={{ borderBottom: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}` }}>
          <div>
            <p style={fieldLabel(c)}>JSI Factory</p>
            <p className="text-[14px] font-bold" style={{ color: c.textPrimary }}>Production Clips</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center transition active:scale-95" style={{ backgroundColor: dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)' }} aria-label="Close">
            <X className="w-4 h-4" style={{ color: c.textSecondary }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {PROD_CLIPS.map(clip => (
            <div key={clip.id} className="flex gap-3 items-center rounded-[14px] p-2 transition active:opacity-70 cursor-pointer"
              style={{ backgroundColor: dark ? 'rgba(255,255,255,0.04)' : 'rgba(53,53,53,0.03)' }}>
              <div className="relative flex-shrink-0 w-24 h-14 rounded-xl overflow-hidden" style={{ backgroundColor: dark ? '#333' : '#eee' }}>
                <img src={clip.thumb} alt="" className="w-full h-full object-cover" loading="lazy" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/25">
                  <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="w-3 h-3 fill-current" style={{ color: '#353535', marginLeft: 1 }} />
                  </div>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-semibold leading-snug truncate" style={{ color: c.textPrimary }}>{clip.title}</p>
                <p className="text-[11px] mt-0.5" style={{ color: c.textSecondary, opacity: 0.65 }}>{clip.duration}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </Portal>
);
