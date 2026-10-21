/**
 * Robust RFP analysis: chunked LLM extraction, schema validate + retry + fallback model,
 * quote verification, timeouts. Never logs document contents.
 */

import { generateText, Output } from 'ai';
import { librarySummaryForPrompt, matchLibraryEntries, JSI_ANSWER_LIBRARY } from './answerLibrary.js';
import { heuristicExtractRequirements } from './pdfExtract.js';
import { chunkPages, pagesToPromptBlock, mergeExtractions } from './chunking.js';
import { verifySourcedItems, attachAnswerSources } from './quoteVerify.js';
import { ChunkExtractSchema, DraftAnswersSchema } from './schemas.js';
import { getAiConfigStatus } from './aiAuth.js';
import { LLM_TIMEOUT_MS, LLM_MAX_RETRIES, resolveModels } from './models.js';

export { getAiConfigStatus } from './aiAuth.js';

function withTimeout(promise, ms, label) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => {
      const err = new Error(`${label} timed out after ${Math.round(ms / 1000)}s`);
      err.code = 'TIMEOUT';
      reject(err);
    }, ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

/**
 * Call LLM for structured output with schema validation, retry, and fallback model.
 */
export async function generateValidatedObject({
  schema,
  system,
  prompt,
  primaryModel,
  fallbackModel,
  label = 'LLM',
  timeoutMs = LLM_TIMEOUT_MS,
  maxRetries = LLM_MAX_RETRIES,
}) {
  const models = [primaryModel, fallbackModel].filter(Boolean)
    .filter((m, i, arr) => arr.indexOf(m) === i);
  const errors = [];

  for (const model of models) {
    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const result = await withTimeout(
          generateText({
            model,
            output: Output.object({ schema }),
            system,
            prompt,
          }),
          timeoutMs,
          `${label} (${model})`,
        );
        const parsed = schema.safeParse(result.output);
        if (!parsed.success) {
          errors.push({ model, attempt, error: 'schema_invalid', detail: parsed.error.issues?.[0]?.message });
          continue;
        }
        return { ok: true, object: parsed.data, model, attempts: attempt + 1 };
      } catch (error) {
        errors.push({
          model,
          attempt,
          error: error.code || error.name || 'Error',
          detail: error.message?.slice(0, 180),
        });
      }
    }
  }

  return { ok: false, errors };
}

function enrichHeuristicWithQuotes(heuristic) {
  const mapItem = (item) => ({
    ...item,
    sourceQuote: item.sourceQuote || item.context || item.text || item.dateText || '',
  });
  return {
    ...heuristic,
    requirements: (heuristic.requirements || []).map(mapItem),
    itemCodes: (heuristic.itemCodes || []).map(mapItem),
    deadlines: (heuristic.deadlines || []).map(mapItem),
    submissionRules: (heuristic.submissionRules || []).map(mapItem),
  };
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
        sourcePage: req.sourcePage,
        sourceQuote: req.sourceQuote || req.text?.slice(0, 240) || '',
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
      sourcePage: req.sourcePage,
      sourceQuote: req.sourceQuote || req.text?.slice(0, 240) || '',
    };
  });
}

function librarySummary() {
  return JSI_ANSWER_LIBRARY.map(({
    id, title, category, owner, lastReviewed, needsApproval, body, sourceUrls, riskFlags, staleAfterMonths,
  }) => ({
    id, title, category, owner, lastReviewed, needsApproval, body, sourceUrls, riskFlags: riskFlags || [], staleAfterMonths,
  }));
}

/**
 * Analyze extracted pages with chunking + verification.
 */
export async function analyzeRfpDocument({ pages, emptyPages = [], fileName = '', req } = {}) {
  const ai = await getAiConfigStatus(req);
  const models = resolveModels();
  const heuristic = enrichHeuristicWithQuotes(heuristicExtractRequirements(pages));
  const steps = [];
  const dropped = [];

  const verifyAll = (merged) => {
    const reqV = verifySourcedItems(merged.requirements, pages, { soft: false, kind: 'requirement' });
    const itemV = verifySourcedItems(merged.itemCodes, pages, { soft: true, kind: 'itemCode' });
    const deadV = verifySourcedItems(merged.deadlines, pages, { soft: true, kind: 'deadline' });
    const ruleV = verifySourcedItems(merged.submissionRules, pages, { soft: true, kind: 'submissionRule' });
    dropped.push(...reqV.dropped, ...itemV.dropped, ...deadV.dropped, ...ruleV.dropped);
    return {
      meta: merged.meta,
      requirements: reqV.kept,
      itemCodes: itemV.kept,
      deadlines: deadV.kept,
      submissionRules: ruleV.kept,
      flagged: [...reqV.flagged, ...itemV.flagged, ...deadV.flagged, ...ruleV.flagged],
    };
  };

  if (!pages?.length || !pages.some((p) => p.hasExtractableText)) {
    return {
      ok: true,
      aiConfigured: ai.configured,
      aiMessage: pages?.length
        ? 'No extractable text in this PDF (possible scan or image-only). OCR is not enabled.'
        : 'No pages to analyze.',
      model: ai.configured ? ai.model : null,
      fallbackModel: ai.fallbackModel,
      authMethod: ai.authMethod,
      extractionMode: 'empty',
      meta: heuristic.meta,
      requirements: [],
      itemCodes: [],
      deadlines: [],
      submissionRules: [],
      answers: [],
      clarifyingQuestions: [],
      emptyPages,
      dropped,
      steps: [{ step: 'extract', status: 'empty', detail: 'No extractable text' }],
      fileName,
      library: librarySummary(),
    };
  }

  if (!ai.configured) {
    steps.push({ step: 'ai', status: 'skipped', detail: 'AI not configured — heuristic path' });
    const verified = verifyAll(heuristic);
    const answers = attachAnswerSources(draftFromLibrary(verified.requirements), verified.requirements);
    return {
      ok: true,
      aiConfigured: false,
      aiMessage: ai.missingHint,
      model: null,
      fallbackModel: ai.fallbackModel,
      authMethod: null,
      extractionMode: 'heuristic',
      ...verified,
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
      dropped,
      steps,
      fileName,
      library: librarySummary(),
    };
  }

  const chunks = chunkPages(pages);
  steps.push({ step: 'chunk', status: 'ok', detail: `${chunks.length} chunk(s) from ${pages.length} page(s)` });

  const extractSystem = [
    'You extract structured RFP / solicitation requirements for JSI Furniture dealers.',
    'Rules:',
    '1. Every requirement, deadline, item code, and submission rule MUST include sourcePage AND a verbatim sourceQuote copied from that page.',
    '2. sourceQuote must be a contiguous substring of the page text (at least ~12 characters).',
    '3. Capture furniture item codes and quantities whenever present.',
    '4. Do not invent content that is not on the provided pages.',
    '5. Prefer concise requirement wording; keep the quote faithful to the source.',
  ].join('\n');

  const chunkResults = [];
  for (const chunk of chunks) {
    const docBlock = pagesToPromptBlock(chunk.pages);
    const gen = await generateValidatedObject({
      schema: ChunkExtractSchema,
      system: extractSystem,
      prompt: [
        `File: ${fileName || 'rfp.pdf'}`,
        `Pages ${chunk.startPage}–${chunk.endPage} of document`,
        '',
        'DOCUMENT PAGES:',
        docBlock || '(no extractable text in this chunk)',
      ].join('\n'),
      primaryModel: models.primary,
      fallbackModel: models.fallback,
      label: `Extract chunk ${chunk.index + 1}/${chunks.length}`,
    });

    if (gen.ok) {
      chunkResults.push(gen.object);
      steps.push({
        step: `extract_chunk_${chunk.index + 1}`,
        status: 'ok',
        model: gen.model,
        detail: `${gen.object.requirements?.length || 0} requirements`,
      });
    } else {
      steps.push({
        step: `extract_chunk_${chunk.index + 1}`,
        status: 'failed',
        detail: gen.errors?.[gen.errors.length - 1]?.detail || 'extract failed',
      });
    }
  }

  const merged = mergeExtractions(chunkResults, heuristic);
  const verified = verifyAll(merged);
  steps.push({
    step: 'verify_quotes',
    status: 'ok',
    detail: `kept ${verified.requirements.length} requirements; dropped ${dropped.filter((d) => d.kind === 'requirement').length}`,
  });

  // Draft answers (library-bound). Prefer LLM when we have requirements; else library matcher.
  let answers = [];
  let clarifyingQuestions = [];
  if (verified.requirements.length) {
    const library = librarySummaryForPrompt();
    const draftGen = await generateValidatedObject({
      schema: DraftAnswersSchema,
      system: [
        'Draft RFP answers for JSI Furniture using ONLY the provided answer library and RFP requirement text.',
        'Rules:',
        '1. Do NOT invent JSI capabilities, certifications, pricing, or compliance claims.',
        '2. If unsupported, status=needs_info with a concrete needsInfoQuestion.',
        '3. Every answer MUST include sourcePage + sourceQuote copied from its requirement.',
        '4. List libraryIds used when drafting from the library.',
      ].join('\n'),
      prompt: [
        'JSI ANSWER LIBRARY:',
        JSON.stringify(library),
        '',
        'REQUIREMENTS:',
        JSON.stringify(verified.requirements.slice(0, 40).map((r) => ({
          id: r.id,
          text: r.text,
          category: r.category,
          sourcePage: r.sourcePage,
          sourceQuote: r.sourceQuote,
        }))),
      ].join('\n'),
      primaryModel: models.primary,
      fallbackModel: models.fallback,
      label: 'Draft answers',
      timeoutMs: LLM_TIMEOUT_MS,
    });

    if (draftGen.ok) {
      answers = attachAnswerSources(draftGen.object.answers, verified.requirements);
      clarifyingQuestions = draftGen.object.clarifyingQuestions || [];
      steps.push({ step: 'draft', status: 'ok', model: draftGen.model });
    } else {
      answers = attachAnswerSources(draftFromLibrary(verified.requirements), verified.requirements);
      steps.push({ step: 'draft', status: 'fallback_library', detail: 'LLM draft failed — library matcher used' });
    }
  }

  // Ensure every requirement has an answer row
  const answered = new Set(answers.map((a) => a.requirementId));
  for (const req of verified.requirements) {
    if (!answered.has(req.id)) {
      answers.push(...attachAnswerSources(draftFromLibrary([req]), [req]));
    }
  }

  const usedLlm = chunkResults.length > 0;
  return {
    ok: true,
    aiConfigured: true,
    aiMessage: usedLlm
      ? null
      : 'AI extraction failed for all chunks; used heuristic extraction with quote verification.',
    model: usedLlm ? (steps.find((s) => s.model)?.model || models.primary) : models.primary,
    fallbackModel: models.fallback,
    authMethod: ai.authMethod,
    extractionMode: usedLlm ? 'llm_chunked' : 'heuristic_fallback',
    ...verified,
    answers,
    clarifyingQuestions,
    emptyPages,
    dropped,
    steps,
    chunks: chunks.length,
    fileName,
    library: librarySummary(),
  };
}
