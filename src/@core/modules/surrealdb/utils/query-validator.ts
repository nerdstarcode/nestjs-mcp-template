import { z } from 'zod';

export const SurrealDBQuerySchema = z.object({
  table: z.string(),
  action: z.enum(['select', 'create', 'update', 'delete']),
  data: z.optional(z.record(z.string(), z.any())),
});
export type SurrealDBQuery = z.infer<typeof SurrealDBQuerySchema>;

export class SurrealDBQueryValidator {
  validate(query: unknown) {
    const result = SurrealDBQuerySchema.safeParse(query);
    if (!result.success) {
      throw new Error('Invalid query');
    }
    return result.data;
  }
}