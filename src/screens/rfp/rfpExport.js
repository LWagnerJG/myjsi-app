/**
 * Searchable exports: Markdown, DOCX, Excel (compliance matrix), proposal assembly.
 */

function money(n) {
  return `$${Math.round(Number(n) || 0).toLocaleString()}`;
}

export function buildMarkdown(session) {
  const meta = session?.meta || {};
  const go = session?.goNoGo;
  const lines = [
    `# RFP Response — ${meta.projectName || 'Untitled'}`,
    '',
    meta.solicitation ? `**Solicitation:** ${meta.solicitation}` : null,
    meta.dueDate ? `**Due:** ${meta.dueDate}` : null,
    meta.summary ? `**Summary:** ${meta.summary}` : null,
    '',
  ].filter((l) => l !== null);

  if (go) {
    lines.push('## Go / No-Go');
    lines.push('');
    lines.push(`**Recommendation:** ${go.recommendation}`);
    lines.push(`**Agency / project:** ${go.agency}`);
    lines.push(`**Due:** ${go.dueDate}`);
    lines.push(`**Est. value (demo):** ${go.estimatedValue}`);
    if (go.risks?.length) {
      lines.push('');
      lines.push('Key risks:');
      go.risks.forEach((r) => lines.push(`- ${r}`));
    }
    lines.push('');
    lines.push(`_${go.disclaimer}_`);
    lines.push('');
  }

  lines.push('## Compliance matrix');
  lines.push('');
  for (const row of go?.matrix || []) {
    lines.push(`### ${row.requirement}`);
    lines.push(`- Status: ${row.status} · Confidence: ${row.confidence}`);
    if (row.sourcePage) lines.push(`- Source page: ${row.sourcePage}`);
    if (row.sourceQuote) lines.push(`- Quote: “${row.sourceQuote}”`);
    if (row.needsInfo) lines.push(`- Needs info: ${row.needsInfo}`);
    lines.push('');
  }

  lines.push('## Drafted answers');
  lines.push('');
  for (const req of session.requirements || []) {
    const answer = (session.answers || []).find((a) => a.requirementId === req.id);
    const approved = session.approvals?.[req.id];
    lines.push(`### ${req.text}`);
    lines.push(`- Category: ${req.category || 'general'}`);
    lines.push(`- Source page: ${req.sourcePage}`);
    if (req.sourceQuote) lines.push(`- Citation: “${req.sourceQuote}”`);
    lines.push(`- Status: ${approved === 'approved' ? 'Approved' : (answer?.status || 'pending')}`);
    if (answer?.draftText) {
      lines.push('');
      lines.push(answer.draftText);
    } else if (answer?.needsInfoQuestion) {
      lines.push('');
      lines.push(`> Needs info: ${answer.needsInfoQuestion}`);
    }
    lines.push('');
  }

  if (session.productMatch?.matches?.length) {
    lines.push('## Suggested products (verify SKU)');
    lines.push('');
    lines.push(`_${session.productMatch.disclaimer}_`);
    lines.push('');
    for (const m of session.productMatch.matches) {
      lines.push(`- **${m.itemCode}** → ${m.series} (${m.categoryName}) × ${m.quantity} — ${m.label} · ${m.status}`);
    }
    lines.push('');
  }

  if (session.productMatch?.exceptions?.length) {
    lines.push('## Exceptions / partner scope');
    lines.push('');
    for (const ex of session.productMatch.exceptions) {
      lines.push(`- **${ex.itemCode}**: ${ex.reason}`);
    }
    lines.push('');
  }

  if (session.pricing) {
    const p = session.pricing;
    lines.push('## Pricing worksheet (demo)');
    lines.push('');
    lines.push(`_${p.disclaimer}_`);
    lines.push('');
    lines.push(`Discount: ${p.discountOption}`);
    for (const line of p.lines || []) {
      lines.push(`- ${line.itemCode} ${line.series} × ${line.quantity}: list ${money(line.extList)} → net ${money(line.extNet)}`);
    }
    lines.push(`- Subtotal net: ${money(p.subtotalNet)}`);
    lines.push(`- Install fee (${Math.round(p.installFeePct * 100)}%): ${money(p.installFee)}`);
    lines.push(`- **Demo total: ${money(p.total)}**`);
    lines.push('');
  }

  lines.push('## Exclusions');
  lines.push('');
  if (session?.extractionMode === 'heuristic_fallback' || session?.extractionMode === 'heuristic') {
    lines.push(`- Extraction mode: ${session.extractionMode} (not a verified LLM source-backed draft).`);
  }
  if (session?.aiOperational === false) {
    lines.push('- AI inference was not operational for this run; drafts may be undrafted or library-only.');
  }
  lines.push('- Scanned pages without extractable text were not OCR’d.');
  lines.push('- Library entries marked needs approval require SME sign-off.');
  lines.push('- Product SKUs and demo pricing are DEMO-ONLY — not a formal quote.');
  lines.push('');
  lines.push('---');
  lines.push('_Assembled with MyJSI RFP Responder. Demo / proof — verify before external submission._');
  return lines.join('\n');
}

export function exportMarkdown(session) {
  const md = buildMarkdown(session);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  downloadBlob(blob, `${safeFileName(session?.meta?.projectName || 'RFP_Response')}.md`);
  return { ok: true, format: 'markdown' };
}

export async function copyMarkdownToClipboard(session) {
  const md = buildMarkdown(session);
  if (!navigator.clipboard?.writeText) throw new Error('Clipboard not available');
  await navigator.clipboard.writeText(md);
  return { ok: true, format: 'clipboard' };
}

export async function exportDocx(session) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const md = buildMarkdown(session);
  const children = [];
  for (const line of md.split('\n')) {
    if (line.startsWith('# ')) {
      children.push(new Paragraph({ text: line.slice(2), heading: HeadingLevel.TITLE }));
    } else if (line.startsWith('## ')) {
      children.push(new Paragraph({ text: line.slice(3), heading: HeadingLevel.HEADING_1 }));
    } else if (line.startsWith('### ')) {
      children.push(new Paragraph({ text: line.slice(4), heading: HeadingLevel.HEADING_2 }));
    } else if (line.startsWith('- ')) {
      children.push(new Paragraph({ text: line.slice(2), bullet: { level: 0 } }));
    } else if (line.startsWith('> ')) {
      children.push(new Paragraph({ children: [new TextRun({ text: line.slice(2), italics: true })] }));
    } else if (line.trim()) {
      children.push(new Paragraph(line.replace(/\*\*/g, '')));
    } else {
      children.push(new Paragraph(''));
    }
  }
  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${safeFileName(session?.meta?.projectName || 'RFP_Response')}.docx`);
  return { ok: true, format: 'docx' };
}

/** Compliance matrix → Excel (.xlsx) */
export async function exportComplianceExcel(session) {
  const XLSX = await import('xlsx');
  const rows = (session?.goNoGo?.matrix || []).map((r) => ({
    Requirement: r.requirement,
    Category: r.category,
    Page: r.sourcePage ?? '',
    Quote: r.sourceQuote || '',
    'Quote verified': r.quoteVerified ? 'yes' : 'no',
    Mandatory: r.mandatory ? 'yes' : 'no',
    Status: r.status,
    Owner: r.owner || '',
    Confidence: r.confidence,
    Risks: (r.risks || []).join('; '),
    'Needs info': r.needsInfo || '',
    'Library IDs': (r.libraryIds || []).join(', '),
  }));
  const sheet = XLSX.utils.json_to_sheet(rows.length ? rows : [{ Requirement: '(none)' }]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, 'Compliance');
  const out = XLSX.write(book, { bookType: 'xlsx', type: 'array' });
  downloadBlob(
    new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
    `${safeFileName(session?.meta?.projectName || 'RFP_Compliance')}_matrix.xlsx`,
  );
  return { ok: true, format: 'xlsx' };
}

/** Line items → CSV */
export function exportLineItemsCsv(session) {
  const items = session?.itemCodes || [];
  const header = ['Item code', 'Quantity', 'Page', 'Context', 'Spec / finish'];
  const escape = (v) => {
    const s = String(v ?? '');
    return /["\n,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [header.join(',')];
  for (const item of items) {
    lines.push([
      item.itemCode,
      item.quantity ?? '',
      item.sourcePage ?? '',
      item.context || item.sourceQuote || '',
      item.specStandard || item.finish || '',
    ].map(escape).join(','));
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8' });
  downloadBlob(blob, `${safeFileName(session?.meta?.projectName || 'RFP_LineItems')}_lines.csv`);
  return { ok: true, format: 'csv' };
}

function safeFileName(name) {
  return String(name).slice(0, 60).replace(/[^a-zA-Z0-9._-]+/g, '_') || 'RFP_Response';
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
