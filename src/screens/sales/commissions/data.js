// Commission feature specific data (2024-2025 only)
// Deterministic pseudo-random generator so values stay stable across reloads
const seeded = (seed) => {
  let x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

const YEARS = [2025, 2024];
const MIN = 25000;
const MAX = 55000;

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];

// Build synthetic invoice breakdown so UX has expandable rich detail
function buildInvoiceBreakdown(year, monthIndex, commissionTotal){
  // 2-4 invoices
  const invoiceCount = 2 + Math.floor(seeded(year * (monthIndex + 3)) * 3); // 2-4
  const invoices = [];
  let remaining = commissionTotal;
  for(let i=0;i<invoiceCount;i++){
    const isLast = i === invoiceCount - 1;
    // rate between 3% and 6%
    const rate = 0.03 + seeded((year+1)*(monthIndex+1)*(i+7)) * 0.03; // 3-6%
    // allocate commission slice
    let commissionSlice;
    if(isLast){
      commissionSlice = remaining;
    } else {
      const maxSlice = remaining - (invoiceCount - i - 1) * (remaining * 0.15);
      commissionSlice = Math.max(1000, Math.min(maxSlice, remaining * (0.25 + seeded(year + monthIndex + i) * 0.5)));
      commissionSlice = Math.round(commissionSlice);
    }
    remaining -= commissionSlice;
    const netAmount = Math.round(commissionSlice / rate);
    invoices.push({
      so: `SO-${year}${String(monthIndex+1).padStart(2,'0')}${String(i+1).padStart(2,'0')}`,
      project: `Project ${String.fromCharCode(65 + ((monthIndex + i) % 26))}`,
      netAmount,
      commission: commissionSlice,
      rate: (rate * 100).toFixed(2)
    });
  }
  const netTotal = invoices.reduce((s,i)=>s+i.netAmount,0);
  return {
    invoices,
    summary: {
      brandTotal: true,
      listTotal: Math.round(netTotal * (1.05 + seeded(year * (monthIndex+11)) * 0.15)),
      netTotal,
      commissionTotal: commissionTotal
    }
  };
}

export const COMMISSIONS_DATA = YEARS.reduce((acc, year) => {
  const months = MONTH_NAMES.map((m, idx) => {
    // Stable random commission in range
    const amt = Math.round(MIN + seeded(year * (idx + 1) * 17) * (MAX - MIN));
    const breakdown = buildInvoiceBreakdown(year, idx, amt);
    return {
      id: `${year}-${String(idx+1).padStart(2,'0')}`,
      month: m,
      amount: amt,
      issuedDate: new Date(year, idx, 15).toISOString(),
      details: [ { invoices: breakdown.invoices }, breakdown.summary ]
    };
  });
  acc[year] = months;
  return acc;
}, {});

export const COMMISSION_YEARS = YEARS.map(y => String(y));
