/**
 * Vercel AI Gateway helper for RFP analysis.
 * Auth: AI_GATEWAY_API_KEY (preferred for explicit key) or VERCEL_OIDC_TOKEN on Vercel.
 * Never log document contents.
 */

import { generateText, Output } from 'ai';
import { z } from 'zod';
import { librarySummaryForPrompt, matchLibraryEntries, JSI_ANSWER_LIBRARY } from './answerLibrary.js';
import { heuristicExtractRequirements } from './pdfExtract.js';

const REQUIRED_ENV_HINT =
  'AI is not configured. Set AI_GATEWAY_API_KEY on the Vercel project (Production + Preview), or enable Vercel OIDC so VERCEL_OIDC_TOKEN is available. Optionally set AI_GATEWAY_MODEL (e.g. openai/gpt-4o-mini).';

export function getAiConfigStatus() {
  const hasKey = Boolean(process.env.AI_GATEWAY_API_KEY);
  const hasOidc = Boolean(process.env.VERCEL_OIDC_TOKEN);
  const model = process.env.AI_GATEWAY_MODEL || 'openai/gpt-4o-mini';
  return {
    configured: hasKey || hasOidc,
    hasKey,
    hasOidc,
    model,
    missingHint: REQUIRED_ENV_HINT,
  };
}

const AnalyzeSchema = z.object({
  meta: z.object({
    projectName: z.string(),
    solicitation: z.string().optional().default(''),
    dueDate: z.string().optional().default(''),
    summary: z.string().optional().default(''),
  }),
  requirements: z.array(z.object({
    id: z.string(),
    category: z.string(),
    text: z.string(),
    sourcePage: z.number().int().positive(),
    itemCode: z.string().nullable().optional(),
    quantity: z.number().nullable().optional(),
  })),
  itemCodes: z.array(z.object({
    id: z.string(),
    itemCode: z.string(),
    quantity: z.number().nullable().optional(),
    description: z.string().optional().default(''),
    sourcePage: z.number().int().positive(),
    context: z.string().optional().default(''),
  })),
  deadlines: z.array(z.object({
    id: z.string(),
    text: z.string(),
    dateText: z.string().optional().default(''),
    sourcePage: z.number().int().positive(),
  })),
  submissionRules: z.array(z.object({
    id: z.string(),
    text: z.string(),
    sourcePage: z.number().int().positive(),
  })),
  answers: z.array(z.object({
    requirementId: z.string(),
    status: z.enum(['drafted', 'needs_info', 'library_match']),
    libraryIds: z.array(z.string()).optional().default([]),
    draftText: z.string().optional().default(''),
    needsInfoQuestion: z.string().nullable().optional(),
    notes: z.string().optional().default(''),
  })),
  clarifyingQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    why: z.string().optional().default(''),
    relatedRequirementIds: z.array(z.string()).optional().default([]),
  })).optional().default([]),
});

function pagesToPromptBlock(pages, maxChars = 48_000) {
  let used = 0;
  const parts = [];
  for (const page of pages) {
    if (!page.hasExtractableText) {
      parts.push(`--- PAGE ${page.pageNumber} [NO EXTRACTABLE TEXT] ---`);
      continue;
    }
    const chunk = page.text.slice(0, 6000);
    if (used + chunk.length > maxChars) break;
    parts.push(`--- PAGE ${page.pageNumber} ---\n${chunk}`);
    used += chunk.length;
  }
  return parts.join('\n\n');
}

/**
 * Analyze extracted pages: LLM when configured, heuristic + library match otherwise.
 */
export async function analyzeRfpDocument({ pages, emptyPages = [], fileName = '' }) {
  const ai = getAiConfigStatus();
  const heuristic = heuristicExtractRequirements(pages);

  if (!ai.configured) {
    const answers = draftFromLibrary(heuristic.requirements);
    return {
      ok: true,
      aiConfigured: false,
      aiMessage: ai.missingHint,
      model: null,
      extractionMode: 'heuristic',
      meta: heuristic.meta,
      requirements: heuristic.requirements,
      itemCodes: heuristic.itemCodes,
      deadlines: heuristic.deadlines,
      submissionRules: heuristic.submissionRules,
      answers,
      clarifyingQuestions: answers
        .filter((a) => a.status === 'needs_info')
        .slice(0, 6)
        .map((a, i) => ({
          id: `cq-${i}`,
          question: a.needsInfoQuestion,
          why: 'Not covered by the approved JSI answer library.',
          relatedRequirementIds: [a.requirementId],
        })),
      emptyPages,
      fileName,
      library: JSI_ANSWER_LIBRARY.map(({ id, title, category, owner, lastReviewed, needsApproval }) => ({
        id, title, category, owner, lastReviewed, needsApproval,
      })),
    };
  }

  const library = librarySummaryForPrompt();
  const docBlock = pagesToPromptBlock(pages);

  try {
    const { output } = await generateText({
      model: ai.model,
      output: Output.object({ schema: AnalyzeSchema }),
      system: [
        'You extract structured RFP / solicitation requirements for JSI Furniture dealers.',
        'Rules:',
        '1. Every requirement, deadline, item code, and submission rule MUST include sourcePage from the document markers.',
        '2. Capture furniture item codes and quantities whenever present (for later product matching).',
        '3. Draft answers ONLY using the provided JSI answer library entries and facts stated in the RFP itself.',
        '4. Do NOT invent JSI capabilities, certifications, pricing, lead times, or compliance claims.',
        '5. If the library does not support an answer, set status to needs_info and write a concrete needsInfoQuestion.',
        '6. When using library text, set status to library_match or drafted and list libraryIds used.',
        '7. Prefer concise, submission-ready wording. Mark library entries that say [needs approval] in notes.',
        '8. clarifyingQuestions should only ask for information a dealer/JSI SME must provide — not rhetorical.',
      ].join('\n'),
      prompt: [
        `File name: ${fileName || 'rfp.pdf'}`,
        '',
        'JSI ANSWER LIBRARY (JSON):',
        JSON.stringify(library),
        '',
        'DOCUMENT PAGES:',
        docBlock || '(no extractable text)',
      ].join('\n'),
    });

    const parsed = output || {};
    // Merge heuristic item codes if LLM missed some
    const mergedItems = mergeItemCodes(parsed.itemCodes || [], heuristic.itemCodes);
    const requirements = (parsed.requirements?.length ? parsed.requirements : heuristic.requirements)
      .map((r, i) => ({ ...r, id: r.id || `req-${i}` }));

    let answers = Array.isArray(parsed.answers) ? parsed.answers : [];
    if (!answers.length) {
      answers = draftFromLibrary(requirements);
    }

    return {
      ok: true,
      aiConfigured: true,
      aiMessage: null,
      model: ai.model,
      extractionMode: 'llm',
      meta: {
        projectName: parsed.meta?.projectName || heuristic.meta.projectName,
        solicitation: parsed.meta?.solicitation || heuristic.meta.solicitation,
        dueDate: parsed.meta?.dueDate || heuristic.meta.dueDate,
        summary: parsed.meta?.summary || '',
      },
      requirements,
      itemCodes: mergedItems,
      deadlines: parsed.deadlines?.length ? parsed.deadlines : heuristic.deadlines,
      submissionRules: parsed.submissionRules?.length ? parsed.submissionRules : heuristic.submissionRules,
      answers,
      clarifyingQuestions: parsed.clarifyingQuestions || [],
      emptyPages,
      fileName,
      library: JSI_ANSWER_LIBRARY.map(({ id, title, category, owner, lastReviewed, needsApproval }) => ({
        id, title, category, owner, lastReviewed, needsApproval,
      })),
    };
  } catch (error) {
    // Fall back to heuristic — never leak document text in error messages returned upstream
    const answers = draftFromLibrary(heuristic.requirements);
    return {
      ok: true,
      aiConfigured: true,
      aiMessage: `AI analysis failed (${error.name || 'Error'}); used heuristic extraction instead. ${ai.missingHint}`,
      model: ai.model,
      extractionMode: 'heuristic_fallback',
      meta: heuristic.meta,
      requirements: heuristic.requirements,
      itemCodes: heuristic.itemCodes,
      deadlines: heuristic.deadlines,
      submissionRules: heuristic.submissionRules,
      answers,
      clarifyingQuestions: [],
      emptyPages,
      fileName,
      library: JSI_ANSWER_LIBRARY.map(({ id, title, category, owner, lastReviewed, needsApproval }) => ({
        id, title, category, owner, lastReviewed, needsApproval,
      })),
    };
  }
}

function draftFromLibrary(requirements) {
  return requirements.map((req) => {
    const matches = matchLibraryEntries(req.text, 2);
    if (!matches.length) {
      return {
        requirementId: req.id,
        status: 'needs_info',
        libraryIds: [],
        draftText: '',
        needsInfoQuestion: `What approved JSI response should we use for: "${req.text.slice(0, 160)}"?`,
        notes: 'No library match.',
      };
    }
    const primary = matches[0];
    return {
      requirementId: req.id,
      status: primary.needsApproval ? 'drafted' : 'library_match',
      libraryIds: matches.map((m) => m.id),
      draftText: matches.map((m) => m.body).join('\n\n'),
      needsInfoQuestion: primary.needsApproval
        ? `Library entry "${primary.title}" is marked needs approval — confirm before submitting.`
        : null,
      notes: primary.needsApproval ? 'needs approval' : '',
    };
  });
}

function mergeItemCodes(primary, secondary) {
  const map = new Map();
  for (const item of [...primary, ...secondary]) {
    const key = String(item.itemCode || '').toUpperCase();
    if (!key) continue;
    if (!map.has(key)) {
      map.set(key, { ...item, itemCode: key, id: item.id || `item-${key}` });
    } else {
      const existing = map.get(key);
      if (existing.quantity == null && item.quantity != null) existing.quantity = item.quantity;
      if (!existing.context && item.context) existing.context = item.context;
      if (!existing.description && item.description) existing.description = item.description;
    }
  }
  return Array.from(map.values());
}
