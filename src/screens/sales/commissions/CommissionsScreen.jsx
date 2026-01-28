import React, { useState, useMemo, useCallback } from 'react';
import { GlassCard } from '../../../components/common/GlassCard';
import { ChevronDown, TrendingUp, Calendar, Building2 } from 'lucide-react';
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
      {/* Summary */}
      <div className="px-4 sm:px-6 pt-5 pb-4">
        <GlassCard
          theme={theme}
          className="p-5 sm:p-6 rounded-[24px]"
          style={{ backgroundColor: theme.colors.surface, border: `1px solid ${theme.colors.border}` }}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black tracking-tight" style={{color: theme.colors.accent}}>{fmtMoney(total)}</span>
                <span className="text-[11px] font-bold uppercase tracking-wider" style={{color: theme.colors.textSecondary}}>YTD</span>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <TrendingUp className="w-4 h-4" style={{color: theme.colors.accent}} />
                <h3 className="text-sm font-medium" style={{color: theme.colors.textSecondary}}>Total Commissions</h3>
              </div>
            </div>
            <select
              value={year}
              onChange={e=>setYear(e.target.value)}
              className="text-sm font-bold px-4 py-2.5 rounded-full focus:outline-none focus:ring-2 transition-all"
              style={{ backgroundColor: theme.colors.surface, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}`, ringColor: theme.colors.accent }}
            >
              {COMMISSION_YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </GlassCard>
      </div>

      {/* Monthly Detail */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 sm:px-6 pb-8 space-y-3">
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
              className={`rounded-[22px] transition-all duration-300 ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}
              style={{backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}`}}
            >
              {/* Row Header */}
              <button onClick={()=>toggle(m.id)} className="w-full px-4 sm:px-5 py-4 flex items-center gap-3 text-left group">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <div className="text-base font-bold" style={{color: theme.colors.textPrimary}}>{m.month}</div>
                    <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full" style={{backgroundColor: `${theme.colors.accent}12`, color: theme.colors.accent}}>
                      Paid {paidDate.toLocaleDateString(undefined,{month:'short', day:'numeric'})}
                    </span>
                  </div>
                  <div className="text-[11px] mt-1" style={{color: theme.colors.textSecondary}}>
                    {dateRange}
                  </div>
                </div>
                <div className="text-xl font-black tabular-nums" style={{color: theme.colors.accent}}>{fmtMoney(m.amount)}</div>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{backgroundColor: `${theme.colors.border}40`}}>
                  <ChevronDown className={`w-5 h-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} style={{color: theme.colors.textSecondary}} />
                </div>
              </button>

              {/* Detail */}
              <div className={`transition-all duration-300 ease-out overflow-hidden ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                <div className="px-4 sm:px-5 pb-5 pt-1">
                  {/* AR Invoice date range note */}
                  <div className="mb-4 text-[10px] font-medium px-3 py-2 rounded-xl inline-block" style={{backgroundColor: `${theme.colors.accent}08`, color: theme.colors.textSecondary, border: `1px solid ${theme.colors.border}`}}>
                    AR Invoices: {dateRange}
                  </div>
                  
                  {m.details?.[0]?.invoices && (
                    <div className="space-y-3">
                      {m.details[0].invoices.map((inv,ii)=>{
                        const rateDisplay = inv.netAmount ? ((inv.commission / inv.netAmount)*100).toFixed(1) : inv.rate;
                        const invDate = new Date(inv.invoiceDate);
                        return (
                          <div 
                            key={ii} 
                            className="p-4 rounded-2xl"
                            style={{backgroundColor: `${theme.colors.subtle}60`, border:`1px solid ${theme.colors.border}`}}
                          >
                            {/* Header row: SO, Rate badge */}
                            <div className="flex items-start justify-between gap-2 mb-3">
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-base mb-1" style={{color: theme.colors.textPrimary}}>{inv.so}</div>
                                {/* Dealer name */}
                                <div className="flex items-center gap-1.5 mb-1">
                                  <Building2 className="w-3 h-3 flex-shrink-0" style={{color: theme.colors.textSecondary}} />
                                  <span className="text-[11px] font-medium truncate" style={{color: theme.colors.textSecondary}}>{inv.dealer}</span>
                                </div>
                                {/* Project name */}
                                <div className="text-[11px] font-medium truncate" style={{color: theme.colors.textSecondary}}>
                                  {inv.project}
                                </div>
                              </div>
                              <div className="flex flex-col items-end gap-1.5">
                                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap" style={{backgroundColor: theme.colors.surface, color: theme.colors.accent, border:`1px solid ${theme.colors.accent}30`}}>
                                  {rateDisplay}%
                                </span>
                                {/* Invoice date */}
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3" style={{color: theme.colors.textSecondary}} />
                                  <span className="text-[10px] font-medium" style={{color: theme.colors.textSecondary}}>
                                    {invDate.toLocaleDateString(undefined, {month:'short', day:'numeric'})}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            {/* Divider */}
                            <div className="h-px mb-3" style={{backgroundColor: theme.colors.border}} />
                            
                            {/* Numbers row: Invoiced, Commissioned, Earned */}
                            <div className="flex items-end justify-between gap-3">
                              <div className="flex-1">
                                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Invoiced</div>
                                <div className="text-sm font-semibold tabular-nums" style={{color: theme.colors.textSecondary}}>{fmtMoney(inv.invoicedAmount)}</div>
                              </div>
                              <div className="flex-1 text-center">
                                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Commissioned</div>
                                <div className="text-base font-bold tabular-nums" style={{color: theme.colors.textPrimary}}>{fmtMoney(inv.netAmount)}</div>
                              </div>
                              <div className="flex-1 text-right">
                                <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.accent}}>Earned</div>
                                <div className="text-lg font-black tabular-nums" style={{color: theme.colors.accent}}>{fmtMoney(inv.commission)}</div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* Summary totals - cleaner design */}
                  {m.details?.[1]?.brandTotal && (
                    <div className="mt-5 p-4 rounded-2xl" style={{backgroundColor: `${theme.colors.accent}08`, border:`1px solid ${theme.colors.accent}20`}}>
                      <div className="text-[9px] font-bold uppercase tracking-wider mb-3 text-center" style={{color: theme.colors.textSecondary}}>Monthly Summary</div>
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Invoiced</div>
                          <div className="text-base font-bold tabular-nums" style={{color: theme.colors.textSecondary}}>{fmtMoney(m.details[1].listTotal)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.textSecondary}}>Commissioned</div>
                          <div className="text-base font-bold tabular-nums" style={{color: theme.colors.textPrimary}}>{fmtMoney(m.details[1].netTotal)}</div>
                        </div>
                        <div>
                          <div className="text-[9px] font-semibold uppercase tracking-wider mb-1" style={{color: theme.colors.accent}}>Earned</div>
                          <div className="text-lg font-black tabular-nums" style={{color: theme.colors.accent}}>{fmtMoney(m.details[1].commissionTotal)}</div>
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
