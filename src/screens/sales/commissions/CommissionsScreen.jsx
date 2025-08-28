import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard';
import { ChevronDown } from 'lucide-react';
import { COMMISSIONS_DATA, COMMISSION_YEARS } from './data.js';

// Money formatter
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined,{maximumFractionDigits:0})}`;

export const CommissionsScreen = ({ theme }) => {
  const [year, setYear] = useState(COMMISSION_YEARS[0]);
  const [openId, setOpenId] = useState(null);

  const data = COMMISSIONS_DATA[year] || [];
  const total = useMemo(()=>data.reduce((s,m)=>s+m.amount,0),[data]);
  const toggle = useCallback((id)=> setOpenId(p => p === id ? null : id),[]);

  return (
    <div className="h-full flex flex-col">
      {/* Top Summary */}
      <div className="px-5 pt-5 pb-4 space-y-4">
        <GlassCard theme={theme} className="rounded-[30px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{background:`radial-gradient(circle at 85% 15%, ${theme.colors.accent}18, transparent 70%)`}} />
          <div className="relative space-y-4">
            {/* Amount + YTD compact */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-extrabold tracking-tight" style={{color: theme.colors.accent}}>{fmtMoney(total)}</span>
              <span className="text-xs font-semibold tracking-wide" style={{color: theme.colors.textSecondary}}>YTD</span>
            </div>
            {/* Label + Year selector */}
            <div className="flex items-center flex-wrap gap-3">
              <h3 className="text-base font-semibold" style={{color: theme.colors.textPrimary}}>Total Commissions</h3>
              <select
                value={year}
                onChange={e=>setYear(e.target.value)}
                className="text-sm font-medium px-4 py-2 rounded-full focus:outline-none focus:ring-2 transition shadow-sm"
                style={{ backgroundColor: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}`, ringColor: theme.colors.accent }}
              >
                {COMMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Detail */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-5 pb-8 space-y-5">
        {data.map((m)=>{
          const isOpen = openId === m.id;
            const paidDate = new Date(m.issuedDate);
          return (
            <GlassCard
              key={m.id}
              theme={theme}
              className={`rounded-[26px] transition-all ${isOpen ? 'shadow-md' : 'shadow-sm'}`}
              style={{backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}`}}
            >
              {/* Row Header */}
              <button onClick={()=>toggle(m.id)} className="w-full px-6 pt-5 pb-4 flex items-center gap-4 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="text-lg font-semibold" style={{color: theme.colors.textPrimary}}>{m.month}</div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full" style={{backgroundColor: theme.colors.subtle, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary}}>
                      Paid {paidDate.toLocaleDateString(undefined,{month:'short', day:'numeric'})}
                    </span>
                  </div>
                </div>
                <div className="text-2xl font-extrabold tabular-nums" style={{color: theme.colors.accent}}>{fmtMoney(m.amount)}</div>
                <ChevronDown className={`w-6 h-6 transition-transform ${isOpen ? 'rotate-180' : ''}`} style={{color: theme.colors.textSecondary}} />
              </button>

              {/* Detail */}
              <div className={`transition-[max-height,opacity] duration-400 ease-out overflow-hidden ${isOpen ? 'max-h-[900px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-6 pb-6">
                  {m.details?.[0]?.invoices && (
                    <div className="mt-1">
                      {/* Table using grid for consistent alignment */}
                      <div className="grid text-[11px] font-semibold uppercase tracking-wide pb-2" style={{gridTemplateColumns:'minmax(150px,1fr) 110px 130px 60px', color: theme.colors.textSecondary, borderBottom:`1px solid ${theme.colors.border}`}}>
                        <div className="pr-4">SO</div>
                        <div className="text-right pr-2">Net</div>
                        <div className="text-right pr-2">Commission</div>
                        <div className="text-right">Rate</div>
                      </div>
                      <div className="divide-y" style={{borderBottom:`1px solid ${theme.colors.border}`}}>
                        {m.details[0].invoices.map((inv,ii)=>{
                          const rateDisplay = inv.netAmount ? ((inv.commission / inv.netAmount)*100).toFixed(1) : inv.rate;
                          return (
                            <div key={ii} className="grid items-center py-2.5 text-sm" style={{gridTemplateColumns:'minmax(150px,1fr) 110px 130px 60px'}}>
                              <div className="pr-4 font-medium" style={{color: theme.colors.textPrimary}}>{inv.so}</div>
                              <div className="text-right pr-2" style={{color: theme.colors.textPrimary}}>{fmtMoney(inv.netAmount)}</div>
                              <div className="text-right font-semibold pr-2" style={{color: theme.colors.accent}}>{fmtMoney(inv.commission)}</div>
                              <div className="text-right text-[11px]" style={{color: theme.colors.textPrimary}}>{rateDisplay}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {m.details?.[1]?.brandTotal && (
                    <div className="flex flex-wrap gap-3 mt-5">
                      <div className="flex-1 min-w-[140px] px-4 py-3 rounded-xl text-center" style={{backgroundColor: theme.colors.subtle}}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{color: theme.colors.textSecondary}}>Invoiced</div>
                        <div className="text-lg font-semibold" style={{color: theme.colors.textPrimary}}>{fmtMoney(m.details[1].listTotal)}</div>
                      </div>
                      <div className="flex-1 min-w-[140px] px-4 py-3 rounded-xl text-center" style={{backgroundColor: theme.colors.subtle}}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{color: theme.colors.textSecondary}}>Commission Base</div>
                        <div className="text-lg font-semibold" style={{color: theme.colors.textPrimary}}>{fmtMoney(m.details[1].netTotal)}</div>
                      </div>
                      <div className="flex-1 min-w-[140px] px-4 py-3 rounded-xl text-center" style={{backgroundColor: `${theme.colors.accent}10`}}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{color: theme.colors.textSecondary}}>Earned</div>
                        <div className="text-lg font-extrabold" style={{color: theme.colors.accent}}>{fmtMoney(m.details[1].commissionTotal)}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};

export default CommissionsScreen;
