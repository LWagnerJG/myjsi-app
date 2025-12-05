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

// Sample dealer names for realistic data
const DEALER_NAMES = [
  'Business Furniture LLC',
  'Commercial Office Environments',
  'Corporate Design Inc',
  'Furn Solutions for the Workplace',
  'Metro Office Interiors',
  'Premier Workspace Solutions',
  'Executive Office Group',
  'Professional Environments',
  'Workplace Innovations',
  'Office Design Partners'
];

// Sample project names
const PROJECT_NAMES = [
  'St Francis in the Fields',
  'Farm Bureau',
  'MSD of Lawrence Township',
  'Eli Lilly',
  'Community Hospital South',
  'One Main Financial',
  'Vectren Plaza',
  'Old National Bank',
  'Aurora Material Solution',
  'Owensboro Health',
  'Stryker',
  'Methodist Hospital'
];

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
    // invoicedAmount is the gross amount before shipping deduction (net is commission base)
    const shippingMultiplier = 1.08 + seeded(year * monthIndex * (i + 2)) * 0.07; // 8-15% shipping markup
    const invoicedAmount = Math.round(netAmount * shippingMultiplier);
    
    // Generate invoice date within the month
    const invoiceDay = 1 + Math.floor(seeded(year * (monthIndex + 1) * (i + 5)) * 27); // day 1-28
    const invoiceDate = new Date(year, monthIndex, invoiceDay);
    
    // Pick dealer and project names deterministically
    const dealerIndex = Math.floor(seeded(year * (monthIndex + 2) * (i + 3)) * DEALER_NAMES.length);
    const projectIndex = Math.floor(seeded(year * (monthIndex + 4) * (i + 1)) * PROJECT_NAMES.length);
    
    invoices.push({
      so: `SO-${year}${String(monthIndex+1).padStart(2,'0')}${String(i+1).padStart(2,'0')}`,
      dealer: DEALER_NAMES[dealerIndex],
      project: PROJECT_NAMES[projectIndex],
      invoiceDate: invoiceDate.toISOString(),
      invoicedAmount,
      netAmount,
      commission: commissionSlice,
      rate: (rate * 100).toFixed(2)
    });
  }
  const netTotal = invoices.reduce((s,i)=>s+i.netAmount,0);
  const invoicedTotal = invoices.reduce((s,i)=>s+i.invoicedAmount,0);
  return {
    invoices,
    summary: {
      brandTotal: true,
      listTotal: invoicedTotal,
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
