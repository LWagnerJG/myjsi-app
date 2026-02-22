import React, { useMemo } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Text } from 'recharts';

// Money formatter (compact)
function fmtMoney(n){
  const abs=Math.abs(n); if(abs>=1e9)return `$${(n/1e9).toFixed(1)}B`; if(abs>=1e6)return `$${(n/1e6).toFixed(1)}M`; if(abs>=1e3)return `$${(n/1e3).toFixed(1)}K`; return `$${n.toFixed(0)}`;
}

// Prepare / aggregate data
function usePrepared(raw){
  return useMemo(()=>{
    if(!Array.isArray(raw)) return [];
    const total=raw.reduce((s,d)=>s+(d.value||0),0); if(!total) return [];
    const sorted=[...raw].sort((a,b)=>(b.value||0)-(a.value||0));
    const MAX=10; if(sorted.length<=MAX) return sorted;
    const kept=sorted.slice(0,MAX); const otherVal=sorted.slice(MAX).reduce((s,d)=>s+d.value,0); if(otherVal>0) kept.push({ name:'Other', value:otherVal, color:'#b0b0b0' });
    return kept;
  },[raw]);
}

export const SalesByVerticalDonut = ({ data, theme, showHeader=true }) => {
  const prepared = usePrepared(data);
  const total = prepared.reduce((s,d)=>s+d.value,0);
  const FALLBACK=['#c5e1a5','#ef9a9a','#b39ddb','#C7AD8E','#ffe082','#a5d6a7','#ffccbc','#d1c4e9','#b0bec5','#cfd8dc'];
  const sliceColor = (i,c)=> c || FALLBACK[i%FALLBACK.length];

  // legend data with percents
  const legend = prepared.map((d,i)=>({
    name: d.name,
    value: d.value,
    pct: total? (d.value/total*100):0,
    color: sliceColor(i,d.color),
    i
  }));

  return (
    <div className="w-full" aria-label={`Sales by Vertical total ${fmtMoney(total)}`}>      
      {showHeader && (
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-xl tracking-tight" style={{ color: theme.colors.textPrimary }}>Sales by Vertical</h3>
        </div>
      )}
      <div className="w-full flex flex-col md:flex-row md:items-stretch gap-4">
        <div className="relative md:flex-1 h-72 select-none" aria-hidden={legend.length===0}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={prepared}
                dataKey="value"
                nameKey="name"
                innerRadius="62%"
                outerRadius="78%"
                startAngle={450}
                endAngle={90}
                paddingAngle={2}
                isAnimationActive={false}
              >
                {prepared.map((d,i)=>(
                  <Cell key={d.name} fill={sliceColor(i,d.color)} stroke={theme.colors.background} strokeWidth={2} />
                ))}
              </Pie>
              {/* Center total */}
              <Text x="50%" y="48%" textAnchor="middle" verticalAnchor="end" style={{fontSize:12,fontWeight:600, fill: theme.colors.textSecondary}}>Total</Text>
              <Text x="50%" y="56%" textAnchor="middle" verticalAnchor="start" style={{fontSize:24,fontWeight:800, fill: theme.colors.textPrimary}}>{fmtMoney(total)}</Text>
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend (static, non-clickable) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2 md:w-56 content-start" aria-label="Vertical legend">
          {legend.map(item => (
            <div key={item.name} className="flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-medium" style={{ background: theme.colors.subtle, color: theme.colors.textPrimary, border:`1px solid ${theme.colors.border}` }}>
              <span className="w-3.5 h-3.5 rounded-full shrink-0" style={{ background:item.color }} aria-hidden="true" />
              <span className="truncate flex-1" title={item.name}>{item.name}</span>
              <span className="opacity-70 tabular-nums" aria-label={`${item.pct.toFixed(1)} percent`}>{item.pct.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
      {/* Accessible slice descriptions (visually hidden) */}
      <div className="sr-only" aria-live="polite">
        {legend.map(l=> `${l.name} ${l.pct.toFixed(1)}% ${fmtMoney(l.value)}`).join('. ')}
      </div>
    </div>
  );
};

export default SalesByVerticalDonut;
