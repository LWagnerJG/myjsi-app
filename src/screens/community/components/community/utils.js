import { Package, DollarSign, Calendar, Zap } from 'lucide-react';

export const cardBg = (dark) => dark ? 'rgba(255,255,255,0.08)' : '#FFFFFF';
export const subtleBorder = (dark) => dark ? 'rgba(255,255,255,0.10)' : 'rgba(0,0,0,0.05)';

export const formatTimestamp = (ts) => {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : Date.parse(ts));
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const thisYear = new Date().getFullYear();
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', ...(d.getFullYear() !== thisYear ? { year: 'numeric' } : {}) });
};

export const formatExactTimestamp = (ts) => {
  if (!ts) return '';
  const d = new Date(typeof ts === 'number' ? ts : Date.parse(ts));
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
};

export const ANNOUNCEMENT_ICONS = {
  'product-launch': Package,
  'pricing': DollarSign,
  'event': Calendar,
  'operations': Zap,
};

export const ANNOUNCEMENT_COLORS = {
  'product-launch': '#4A7C59',
  'pricing': '#5B7B8C',
  'event': '#C4956A',
  'operations': '#6A6762',
};
