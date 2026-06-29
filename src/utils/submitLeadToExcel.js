import { postJsonToWebhook } from './secureWebhook.js';

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
  adFirms:          [
    ...(lead.designFirmUnknown ? ['Unknown'] : []),
    ...(lead.designFirms || []).filter((firm) => String(firm).trim().toLowerCase() !== 'unknown'),
  ].join(', '),
  endUser:          lead.endUserUnknown ? 'Unknown' : (lead.endUser || ''),
  drivingSpecs:     lead.drivingSpecs
                      ? `${lead.drivingSpecs.type}:${lead.drivingSpecs.name}`
                      : '',
  bid:              lead.isBid ? 'Yes' : 'No',
  competition:      lead.competitionPresent ? 'Yes' : 'No',
  competitors:      [
    ...(lead.competitionUnknown ? ['Unknown'] : []),
    ...(lead.competitors || []).filter((name) => String(name).trim().toLowerCase() !== 'unknown'),
  ].join(', '),
  jsiQuoteNumber:   lead.jsiQuoteNumber || '',
  quoteNeeded:      lead.quoteNeeded ? 'Yes' : 'No',
  products:         (lead.products || []).map(p => p.series).join(', '),
  notes:            lead.notes || '',
});

export async function submitLeadToExcel(lead) {
  return postJsonToWebhook(
    import.meta.env.VITE_LEADS_POWER_AUTOMATE_URL,
    flattenLead(lead),
    {
      envKey: 'VITE_LEADS_POWER_AUTOMATE_URL',
      context: 'submitLeadToExcel',
    }
  );
}
