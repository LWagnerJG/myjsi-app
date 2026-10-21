/**
 * Bid summary + Go/No-Go scorecard (demo decision aid — does not decide).
 */

function daysUntil(dateText) {
  if (!dateText) return null;
  const d = new Date(dateText);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.getTime() - Date.now();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}

export function buildGoNoGo(session) {
  const meta = session?.meta || {};
  const requirements = session?.requirements || [];
  const answers = session?.answers || [];
  const itemCodes = session?.itemCodes || [];
  const exceptions = session?.productMatch?.exceptions || [];
  const emptyPages = session?.emptyPages || [];
  const dropped = session?.dropped || [];

  const byReq = new Map(answers.map((a) => [a.requirementId, a]));
  let meets = 0;
  let partial = 0;
  let gap = 0;

  const matrix = requirements.map((req) => {
    const ans = byReq.get(req.id);
    let status = 'Gap';
    let confidence = 'Low';
    let owner = 'Spec';

    const risks = [];
    if (/level|third.?party/i.test(req.text) && /self-certified|LEVEL/i.test(ans?.draftText || '')) {
      risks.push('LEVEL self-certified vs third-party');
    }
    if (/warrant/i.test(req.text) && /beyond|exceed/i.test(ans?.needsInfoQuestion || '')) {
      risks.push('Warranty may exceed published terms');
    }
    if (/TAA|Buy American/i.test(req.text)) {
      risks.push('TAA / Buy American — verify per SKU');
    }

    if (ans?.status === 'library_match' && ans.draftText) {
      status = risks.length ? 'Partial' : 'Meets';
      confidence = req.quoteVerified ? 'High' : 'Med';
      owner = 'Library';
      if (status === 'Meets') meets += 1;
      else partial += 1;
    } else if (ans?.status === 'drafted' && ans.draftText) {
      status = (ans.notes?.includes('needs approval') || risks.length) ? 'Partial' : 'Meets';
      confidence = 'Med';
      owner = 'Draft';
      if (status === 'Partial') partial += 1;
      else meets += 1;
    } else {
      status = 'Gap';
      confidence = 'Low';
      gap += 1;
    }

    if (!req.quoteVerified && status === 'Meets') {
      status = 'Partial';
      confidence = 'Low';
      meets = Math.max(0, meets - 1);
      partial += 1;
    }

    const mandatory = /\b(shall|must|mandatory|required)\b/i.test(req.text);

    return {
      id: req.id,
      requirement: req.text,
      category: req.category || 'general',
      sourcePage: req.sourcePage,
      sourceQuote: req.sourceQuote || '',
      quoteVerified: Boolean(req.quoteVerified),
      mandatory,
      status,
      owner,
      confidence,
      answerStatus: ans?.status || 'open',
      draftPreview: (ans?.draftText || '').slice(0, 160),
      needsInfo: ans?.needsInfoQuestion || null,
      libraryIds: ans?.libraryIds || [],
      risks,
    };
  });

  const partner = exceptions.length;
  for (const ex of exceptions) {
    matrix.push({
      id: `ex-${ex.itemCode}`,
      requirement: `Item ${ex.itemCode}: ${ex.reason}`,
      category: 'product',
      sourcePage: ex.sourcePage || null,
      sourceQuote: '',
      quoteVerified: false,
      mandatory: false,
      status: ex.status || 'Partner',
      owner: 'Dealer',
      confidence: 'Low',
      answerStatus: 'exception',
      draftPreview: '',
      needsInfo: null,
      libraryIds: [],
      risks: [],
    });
  }

  const risks = [];
  if (emptyPages.length) risks.push(`${emptyPages.length} page(s) with no extractable text (OCR not enabled).`);
  if (dropped.length) risks.push(`${dropped.length} item(s) dropped — quote not found in text.`);
  if (gap > 0) risks.push(`${gap} mandatory/coverage gap(s) need Spec input.`);
  if (partner > 0) risks.push(`${partner} out-of-portfolio / partner item(s).`);
  if (!session?.aiConfigured) risks.push('AI not configured — heuristic path only.');
  if (partial > 0) risks.push(`${partial} partial answer(s) need SME approval.`);

  const dueDays = daysUntil(meta.dueDate);
  if (dueDays != null && dueDays < 0) risks.push('Due date appears to be in the past.');
  else if (dueDays != null && dueDays <= 7) risks.push(`Due in ${dueDays} day(s) — tight timeline.`);

  let recommendation = 'Go — with conditions';
  let tone = 'caution';
  let fitScore = Math.round(((meets + partial * 0.5) / Math.max(1, requirements.length)) * 100);
  if (!requirements.length) fitScore = 0;

  if (gap === 0 && partner === 0 && risks.length <= 1 && fitScore >= 70) {
    recommendation = 'Go';
    tone = 'positive';
  } else if (gap > Math.max(3, requirements.length * 0.5) || fitScore < 30) {
    recommendation = 'No-go — too many gaps';
    tone = 'negative';
  }

  const estValue = session?.pricing?.total
    ? `~$${Math.round(session.pricing.total).toLocaleString()} demo net`
    : (itemCodes.length ? `${itemCodes.length} line item(s) — price after matching` : 'Not estimated');

  return {
    agency: meta.projectName || 'Untitled solicitation',
    solicitation: meta.solicitation || '',
    dueDate: meta.dueDate || (session?.deadlines?.[0]?.dateText || 'Not found'),
    dueDays,
    qaDeadline: meta.qaDeadline || '',
    walkThrough: meta.walkThrough || '',
    submissionMethod: meta.submissionMethod || '',
    contractVehicle: meta.contractVehicle || '',
    estimatedValue: estValue,
    recommendation,
    tone,
    fitScore,
    counts: { meets, partial, partner, gap, requirements: requirements.length, items: itemCodes.length },
    risks,
    matrix,
    summary: meta.summary || '',
    disclaimer: 'Go/No-Go is a reasoned demo scorecard from library coverage and quote checks — it does not decide the bid.',
  };
}
