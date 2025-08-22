import React, { useState, useMemo, useCallback } from 'react';
import { PageTitle } from '../../../components/common/PageTitle';
import { GlassCard } from '../../../components/common/GlassCard';
import { PortalNativeSelect } from '../../../components/forms/PortalNativeSelect';
import { ChevronDown, Sparkles } from 'lucide-react';
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
      {/* Header / Year Selector */}
      <div className="px-5 pb-4">
        <PageTitle title="Commissions" theme={theme}>
          <div className="w-40">
            <PortalNativeSelect
              value={year}
              onChange={e=>setYear(e.target.value)}
              options={COMMISSION_YEARS.map(y=>({value:y,label:y}))}
              theme={theme}
            />
          </div>
        </PageTitle>

        {/* Summary Card */}
        <GlassCard theme={theme} className="mt-4 rounded-[30px] p-6 relative overflow-hidden">
          <div className="absolute inset-0 pointer-events-none opacity-60" style={{background:`radial-gradient(circle at 85% 20%, ${theme.colors.accent}25, transparent 70%)`}} />
          <div className="relative flex items-start justify-between gap-6">
            <div className="space-y-2 min-w-0">
              <h3 className="text-2xl font-bold leading-tight" style={{color: theme.colors.textPrimary}}>
                Total Commissions
              </h3>
              <div className="text-sm" style={{color: theme.colors.textSecondary}}>
                {data.length} scheduled payments
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center justify-end gap-1">
                <span className="text-4xl font-extrabold tracking-tight" style={{color: theme.colors.accent}}>{fmtMoney(total)}</span>
                <Sparkles className="w-5 h-5" style={{color: theme.colors.accent}} />
              </div>
              <div className="text-[11px] font-medium uppercase tracking-wide mt-1" style={{color: theme.colors.textSecondary}}>Year To Date</div>
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
              className={`rounded-[28px] transition-all ${isOpen ? 'shadow-lg' : 'shadow-sm'}`}
              style={{backgroundColor: theme.colors.surface, border:`1px solid ${isOpen ? theme.colors.accent : theme.colors.border}`}}
            >
              {/* Row Header */}
              <button onClick={()=>toggle(m.id)} className="w-full px-6 pt-5 pb-4 flex items-center gap-4 text-left">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
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
                    <div className="space-y-3">
                      {/* Table Header */}
                      <div className="text-[11px] font-semibold flex items-center justify-between rounded-full px-4 py-2" style={{backgroundColor: theme.colors.subtle, border:`1px solid ${theme.colors.border}`, color: theme.colors.textSecondary}}>
                        <div className="flex-1">SO / Project</div>
                        <div className="w-24 text-right">Net</div>
                        <div className="w-28 text-right">Commission</div>
                        <div className="w-12 text-right">Rate</div>
                      </div>
                      {/* Rows */}
                      <div className="space-y-2">
                        {m.details[0].invoices.map((inv,ii)=>{
                          const rateDisplay = inv.netAmount ? ((inv.commission / inv.netAmount)*100).toFixed(1) : inv.rate;
                          return (
                            <div key={ii} className="flex items-center gap-3 rounded-2xl px-4 py-3 text-sm" style={{backgroundColor: theme.colors.surface, border:`1px solid ${theme.colors.border}`}}>
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold truncate" style={{color: theme.colors.textPrimary}}>{inv.so}</div>
                                <div className="text-[11px] truncate" style={{color: theme.colors.textSecondary}}>{inv.project}</div>
                              </div>
                              <div className="w-24 text-right font-medium" style={{color: theme.colors.textPrimary}}>{fmtMoney(inv.netAmount)}</div>
                              <div className="w-28 text-right font-bold" style={{color: theme.colors.accent}}>{fmtMoney(inv.commission)}</div>
                              <div className="w-12 text-right text-[11px] font-medium" style={{color: theme.colors.textPrimary}}>{rateDisplay}%</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  {m.details?.[1]?.brandTotal && (
                    <div className="flex flex-wrap gap-3 mt-5">
                      {/*
                        Consistent metric boxes
                        - Removed unused class names
                        - Ensured all boxes have the same sizing and padding
                      */}
                      {/*
                        Invoiced
                        - No functional changes, just ensured consistent styling
                      */}
                      <div className="flex-1 min-w-[140px] px-4 py-3 rounded-2xl text-center" style={{backgroundColor: theme.colors.subtle, border:`1px solid ${theme.colors.border}`}}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{color: theme.colors.textSecondary}}>Invoiced</div>
                        <div className="text-lg font-bold" style={{color: theme.colors.textPrimary}}>{fmtMoney(m.details[1].listTotal)}</div>
                      </div>
                      {/*
                        Commission Base
                        - No functional changes, just ensured consistent styling
                      */}
                      <div className="flex-1 min-w-[140px] px-4 py-3 rounded-2xl text-center" style={{backgroundColor: theme.colors.subtle, border:`1px solid ${theme.colors.border}`}}>
                        <div className="text-[10px] font-semibold uppercase tracking-wide mb-1" style={{color: theme.colors.textSecondary}}>Commission Base</div>
                        <div className="text-lg font-bold" style={{color: theme.colors.textPrimary}}>{fmtMoney(m.details[1].netTotal)}</div>
                      </div>
                      {/*
                        Earned
                        - Accent color changes to indicate "Highlight" importance
                        - Ensured consistent styling with other boxes
                      */}
                      <div className="flex-1 min-w-[140px] px-4 py-3 rounded-2xl text-center" style={{backgroundColor: `${theme.colors.accent}10`, border:`1px solid ${theme.colors.border}`}}>
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
