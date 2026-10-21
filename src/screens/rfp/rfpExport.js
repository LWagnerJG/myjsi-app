/**
 * Searchable text exports (Markdown / DOCX / clipboard). Replaces screenshot PDF as primary export.
 */

function buildMarkdown(session) {
  const meta = session?.meta || {};
  const lines = [
    `# RFP Response — ${meta.projectName || 'Untitled'}`,
    '',
    meta.solicitation ? `**Solicitation:** ${meta.solicitation}` : null,
    meta.dueDate ? `**Due:** ${meta.dueDate}` : null,
    meta.summary ? `**Summary:** ${meta.summary}` : null,
    '',
    '## Requirements checklist',
    '',
  ].filter((l) => l !== null);

  for (const req of session.requirements || []) {
    const answer = (session.answers || []).find((a) => a.requirementId === req.id);
    const approved = session.approvals?.[req.id];
    lines.push(`### ${req.text}`);
    lines.push(`- Category: ${req.category || 'general'}`);
    lines.push(`- Source page: ${req.sourcePage}`);
    if (req.itemCode) lines.push(`- Item code: ${req.itemCode}${req.quantity != null ? ` (qty ${req.quantity})` : ''}`);
    lines.push(`- Status: ${approved === 'approved' ? 'Approved' : approved === 'edited' ? 'Edited' : (answer?.status || 'pending')}`);
    if (answer?.draftText) {
      lines.push('');
      lines.push(answer.draftText);
    } else if (answer?.needsInfoQuestion) {
      lines.push('');
      lines.push(`> Needs info: ${answer.needsInfoQuestion}`);
    }
    lines.push('');
  }

  if (session.itemCodes?.length) {
    lines.push('## Item codes & quantities');
    lines.push('');
    for (const item of session.itemCodes) {
      lines.push(`- **${item.itemCode}**${item.quantity != null ? ` — qty ${item.quantity}` : ''} (p.${item.sourcePage})${item.description ? ` — ${item.description}` : ''}`);
    }
    lines.push('');
  }

  if (session.deadlines?.length) {
    lines.push('## Deadlines');
    lines.push('');
    for (const d of session.deadlines) {
      lines.push(`- ${d.text} (p.${d.sourcePage})`);
    }
    lines.push('');
  }

  if (session.submissionRules?.length) {
    lines.push('## Submission rules');
    lines.push('');
    for (const r of session.submissionRules) {
      lines.push(`- ${r.text} (p.${r.sourcePage})`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push('_Drafted with MyJSI RFP Responder. Library entries marked needs approval require SME review._');
  return lines.join('\n');
}

export function exportMarkdown(session) {
  const md = buildMarkdown(session);
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const name = safeFileName(session?.meta?.projectName || 'RFP_Response');
  downloadBlob(blob, `${name}.md`);
  return { ok: true, format: 'markdown' };
}

export async function copyMarkdownToClipboard(session) {
  const md = buildMarkdown(session);
  if (!navigator.clipboard?.writeText) {
    throw new Error('Clipboard not available');
  }
  await navigator.clipboard.writeText(md);
  return { ok: true, format: 'clipboard' };
}

export async function exportDocx(session) {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
  const meta = session?.meta || {};
  const children = [
    new Paragraph({
      text: `RFP Response — ${meta.projectName || 'Untitled'}`,
      heading: HeadingLevel.TITLE,
    }),
  ];
  if (meta.solicitation) {
    children.push(new Paragraph({ children: [new TextRun(`Solicitation: ${meta.solicitation}`)] }));
  }
  if (meta.dueDate) {
    children.push(new Paragraph({ children: [new TextRun(`Due: ${meta.dueDate}`)] }));
  }
  children.push(new Paragraph({ text: 'Requirements checklist', heading: HeadingLevel.HEADING_1 }));

  for (const req of session.requirements || []) {
    const answer = (session.answers || []).find((a) => a.requirementId === req.id);
    children.push(new Paragraph({ text: req.text, heading: HeadingLevel.HEADING_2 }));
    children.push(new Paragraph(`Source page: ${req.sourcePage}`));
    if (answer?.draftText) {
      for (const line of answer.draftText.split('\n')) {
        children.push(new Paragraph(line || ' '));
      }
    } else if (answer?.needsInfoQuestion) {
      children.push(new Paragraph({
        children: [new TextRun({ text: `Needs info: ${answer.needsInfoQuestion}`, italics: true })],
      }));
    }
  }

  if (session.itemCodes?.length) {
    children.push(new Paragraph({ text: 'Item codes & quantities', heading: HeadingLevel.HEADING_1 }));
    for (const item of session.itemCodes) {
      children.push(new Paragraph(
        `${item.itemCode}${item.quantity != null ? ` — qty ${item.quantity}` : ''} (p.${item.sourcePage})`
      ));
    }
  }

  const doc = new Document({ sections: [{ children }] });
  const blob = await Packer.toBlob(doc);
  downloadBlob(blob, `${safeFileName(meta.projectName || 'RFP_Response')}.docx`);
  return { ok: true, format: 'docx' };
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

export { buildMarkdown };
