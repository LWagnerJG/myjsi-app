/** Legacy combined schema kept only so older imports/tests do not break. */
import { z } from 'zod';
import { ChunkExtractSchema, DraftAnswersSchema } from './schemas.js';

export const AnalyzeSchema = z.object({
  meta: ChunkExtractSchema.shape.meta,
  requirements: ChunkExtractSchema.shape.requirements,
  itemCodes: ChunkExtractSchema.shape.itemCodes,
  deadlines: ChunkExtractSchema.shape.deadlines,
  submissionRules: ChunkExtractSchema.shape.submissionRules,
  answers: DraftAnswersSchema.shape.answers,
  clarifyingQuestions: DraftAnswersSchema.shape.clarifyingQuestions,
});
