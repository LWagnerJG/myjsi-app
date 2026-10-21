import { z } from 'zod';

const SourceFields = {
  sourcePage: z.number().int().positive(),
  sourceQuote: z.string().min(8).max(600),
};

export const ChunkExtractSchema = z.object({
  meta: z.object({
    projectName: z.string().optional().default(''),
    solicitation: z.string().optional().default(''),
    dueDate: z.string().optional().default(''),
    summary: z.string().optional().default(''),
  }).optional().default({}),
  requirements: z.array(z.object({
    id: z.string(),
    category: z.string(),
    text: z.string().min(8),
    itemCode: z.string().nullable().optional(),
    quantity: z.number().nullable().optional(),
    ...SourceFields,
  })).default([]),
  itemCodes: z.array(z.object({
    id: z.string(),
    itemCode: z.string().min(1),
    quantity: z.number().nullable().optional(),
    description: z.string().optional().default(''),
    ...SourceFields,
  })).default([]),
  deadlines: z.array(z.object({
    id: z.string(),
    text: z.string().min(4),
    dateText: z.string().optional().default(''),
    ...SourceFields,
  })).default([]),
  submissionRules: z.array(z.object({
    id: z.string(),
    text: z.string().min(8),
    ...SourceFields,
  })).default([]),
});

export const DraftAnswersSchema = z.object({
  answers: z.array(z.object({
    requirementId: z.string(),
    status: z.enum(['drafted', 'needs_info', 'library_match']),
    libraryIds: z.array(z.string()).optional().default([]),
    draftText: z.string().optional().default(''),
    needsInfoQuestion: z.string().nullable().optional(),
    notes: z.string().optional().default(''),
    sourcePage: z.number().int().positive(),
    sourceQuote: z.string().min(8).max(600),
  })).default([]),
  clarifyingQuestions: z.array(z.object({
    id: z.string(),
    question: z.string(),
    why: z.string().optional().default(''),
    relatedRequirementIds: z.array(z.string()).optional().default([]),
  })).optional().default([]),
});
