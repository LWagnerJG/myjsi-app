import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard';
import { ChevronDown, TrendingUp } from 'lucide-react';
import { COMMISSIONS_DATA, COMMISSION_YEARS } from './data.js';

// Money formatter - compact version for tight spaces
const fmtMoney = (n) => `$${Number(n || 0).toLocaleString(undefined,{maximumFractionDigits:0})}`;

// Get month date range for AR Invoice explanation
const getMonthDateRange = (year, monthIndex) => {
  const startDate = new Date(year, monthIndex, 1);
  const endDate = new Date(year, monthIndex + 1, 0);
  const startStr = startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const endStr = endDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  return `${startStr} - ${endStr}`;
};

export const CommissionsScreen = ({ theme }) => {
  const [year, setYear] = useState(COMMISSION_YEARS[0]);
  const [openId, setOpenId] = useState(null);

  const data = COMMISSIONS_DATA[year] || [];
  const total = useMemo(()=>data.reduce((s,m)=>s+m.amount,0),[data]);
  const toggle = useCallback((id)=> setOpenId(p => p === id ? null : id),[]);

  return (
    <div className="h-full flex flex-col" style={{backgroundColor: theme.colors.background}}>
      {/* Top Summary - Clean modern header */}
      <div className="px-4 pt-5 pb-3">
        <div className="flex items-start justify-between gap-4">
          {/* Left side: Amount and label */}
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black tracking-tight" style={{color: theme.colors.accent}}>{fmtMoney(total)}</span>
              <span className="text-xs font-bold uppercase tracking-wider" style={{color: theme.colors.textSecondary}}>YTD</span>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5" style={{color: theme.colors.accent}} />
              <h3 className="text-sm font-medium" style={{color: theme.colors.textSecondary}}>Total Commissions</h3>
            </div>
          </div>
          {/* Right side: Year selector */}
          <select
            value={year}
            onChange={e=>setYear(e.target.value)}
            className="text-sm font-bold px-4 py-2.5 rounded-2xl focus:outline-none focus:ring-2 transition-all shadow-sm"
            style={{ backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}`, ringColor: theme.colors.accent }}
          >
            {COMMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {/* Monthly Detail */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-8 space-y-3">
        {data.map((m)=>{
          const isOpen = openId === m.id;
          const paidDate = new Date(m.issuedDate);
          const monthIndex = paidDate.getMonth();
          const yearNum = parseInt(year);
          const dateRange = getMonthDateRange(yearNum, monthIndex);
          
          return (
            <GlassCard
              key={m.id}
              theme={theme}
              className={`rounded-2xl transition-all duration-300 ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}
              style={{backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}`}}
            >
              {/* Row Header */}
              <button onClick={()=>toggle(m.id)} className="w-full px-4 py-4 flex items-center gap-3 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-bold" style={{color: theme.colors.textPrimary}}>{m.month}</div>
                    <span className="text-[9px] font-medium px-2 py-0.5 rounded-full" style={{backgroundColor: `${theme.colors.accent}15`, color: theme.colors.accent}}>
                      Paid {paidDate.toLocaleDateString(undefined,{month:'short', day:'numeric'})}
                    </span>
                  </div>
                </div>
                <div className="text-xl font-black tabular-nums" style={{color: theme.colors.accent}}>{fmtMoney(m.amount)}</div>
                <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{color: theme.colors.textSecondary}} />
              </button>

              {/* Detail */}
              <div className={`transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'max-h-[1500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 pb-5 pt-1">
                  {/* AR Invoice date range note */}
                  <div className="mb-4 text-[10px] font-medium px-3 py-2 rounded-xl inline-block" style={{backgroundColor: theme.colors.subtle, color: theme.colors.textSecondary}}>
                    AR Invoices: {dateRange}
                  </div>
                  
                  {m.details?.[0]?.invoices && (
                    <div className="space-y-2.5">
                      {m.details[0].invoices.map((inv,ii)=>{
                        const rateDisplay = inv.netAmount ? ((inv.commission / inv.netAmount)*100).toFixed(1) : inv.rate;
                        return (
                          <div 
                            key={ii} 
                            className="p-3.5 rounded-xl"
                            style={{backgroundColor: theme.colors.subtle, border:`1px solid ${theme.colors.border}`}}
                          >
                            {/* Top row: SO and Rate */}
                            <div className="flex items-center justify-between mb-3">
                              <span className="font-bold text-sm" style={{color: theme.colors.textPrimary}}>{inv.so}</span>
                              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full" style={{backgroundColor: theme.colors.surface, color: theme.colors.textSecondary, border:`1px solid ${theme.colors.border}`}}>
                                {rateDisplay}% rate
                              </span>
                            </div>
                            {/* Bottom row: Invoiced, Commissioned, Commission Earned - 3 columns */}
                            <div className="flex items-end justify-between gap-2">
                              <div className="flex-1">
                                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Invoiced</div>
                                <div className="text-[13px] font-semibold tabular-nums" style={{color: theme.colors.textSecondary}}>{fmtMoney(inv.invoicedAmount)}</div>
                              </div>
                              <div className="flex-1 text-center">
                                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Commissioned</div>
                                <div className="text-[13px] font-bold tabular-nums" style={{color: theme.colors.textPrimary}}>{fmtMoney(inv.netAmount)}</div>
                              </div>
                              <div className="flex-1 text-right">
                                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.accent}}>Earned</div>
                                <div className="text-[14px] font-black tabular-nums" style={{color: theme.colors.accent}}>{fmtMoney(inv.commission)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Summary totals - cleaner design */}
                  {m.details?.[1]?.brandTotal && (
                    <div className="mt-5 p-4 rounded-xl" style={{backgroundColor: theme.colors.subtle, border:`1px solid ${theme.colors.border}`}}>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Invoiced</div>
                          <div className="text-sm font-bold tabular-nums" style={{color: theme.colors.textSecondary}}>{fmtMoney(m.details[1].listTotal)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Commissioned</div>
                          <div className="text-sm font-bold tabular-nums" style={{color: theme.colors.textPrimary}}>{fmtMoney(m.details[1].netTotal)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.accent}}>Earned</div>
                          <div className="text-sm font-black tabular-nums" style={{color: theme.colors.accent}}>{fmtMoney(m.details[1].commissionTotal)}</div>
                        </div>
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
