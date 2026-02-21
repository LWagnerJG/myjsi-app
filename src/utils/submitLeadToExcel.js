/**
 * Submit a new lead to a shared Microsoft Excel spreadsheet
 * via a Power Automate HTTP-trigger flow.
 *
 * Power Automate setup (one-time):
 *   1. Create a new Instant cloud flow → trigger = "When an HTTP request is received"
 *   2. Add action: "Add a row into a table" (Excel Online / OneDrive / SharePoint)
 *   3. Map each JSON field below to a column in your Excel table
 *   4. Save → copy the generated HTTP POST URL
 *   5. Paste that URL as VITE_LEADS_POWER_AUTOMATE_URL in your .env / Vercel env vars
 *
 * The Excel table should have these columns (order doesn't matter):
 *   Submitted At | Project Name | Stage | Vertical | Install Date | Location |
 *   Estimated List | Win Probability | Discount | Sales Reward | Designer Reward |
 *   PO Timeframe | Contract | Dealers | A&D Firms | End User |
 *   Bid | Competition | Competitors | JSI Quote # | Quote Needed |
 *   Products | Notes
 */

const LEADS_URL = import.meta.env.VITE_LEADS_POWER_AUTOMATE_URL;

/**
 * Flatten the lead object into a simple key→string map
 * suitable for a single Excel row.
 */
const flattenLead = (lead) => ({
  submittedAt:      new Date().toISOString(),
  projectName:      lead.project || '',
  stage:            lead.projectStatus || '',
  vertical:         lead.vertical === 'Other (Please specify)'
                      ? (lead.otherVertical || 'Other')
                      : (lead.vertical || ''),
  installDate:      lead.expectedInstallDate || '',
  location:         lead.installationLocation || '',
  estimatedList:    lead.estimatedList || '',
  winProbability:   `${lead.winProbability ?? 50}%`,
  discount:         lead.discount || '',
  salesReward:      lead.salesReward !== false ? 'Yes' : 'No',
  designerReward:   lead.designerReward !== false ? 'Yes' : 'No',
  poTimeframe:      lead.poTimeframe || '',
  contract:         lead.contractType || '',
  dealers:          (lead.dealers || []).join(', '),
  adFirms:          (lead.designFirms || []).join(', '),
  endUser:          lead.endUser || '',
  bid:              lead.isBid ? 'Yes' : 'No',
  competition:      lead.competitionPresent ? 'Yes' : 'No',
  competitors:      (lead.competitors || []).join(', '),
  jsiQuoteNumber:   lead.jsiQuoteNumber || '',
  quoteNeeded:      lead.quoteNeeded ? 'Yes' : 'No',
  products:         (lead.products || []).map(p => p.series).join(', '),
  notes:            lead.notes || '',
});

/**
 * Fire-and-forget POST to Power Automate.
 * Returns true on success, false on failure (never throws).
 */
export async function submitLeadToExcel(lead) {
  if (!LEADS_URL) {
    console.warn('[submitLeadToExcel] VITE_LEADS_POWER_AUTOMATE_URL is not configured — skipping.');
    return false;
  }

  try {
    const res = await fetch(LEADS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flattenLead(lead)),
    });
    if ([200, 201, 202].includes(res.status)) {
      if (import.meta.env.DEV) console.log('[submitLeadToExcel] Lead sent to Excel successfully.');
      return true;
    }
    console.error('[submitLeadToExcel] Unexpected status:', res.status);
    return false;
  } catch (err) {
    console.error('[submitLeadToExcel] Network error:', err);
    return false;
  }
}
