import { z } from 'zod';

export const MongoFindInputSchema = z.object({
  type: z.literal('find'),
  database: z.string().min(1, 'database is required'),
  collection: z.string().min(1, 'collection is required'),
  filter: z.record(z.string(), z.unknown()).optional().default({}),
  limit: z.number().int().min(1).max(1000).optional().default(100),
  projection: z.record(z.string(), z.unknown()).optional(),
});

export const MongoAggregateInputSchema = z.object({
  type: z.literal('aggregate'),
  database: z.string().min(1, 'database is required'),
  collection: z.string().min(1, 'collection is required'),
  pipeline: z.array(z.record(z.string(), z.unknown())),
});

export const MongoQueryInputSchema = z.discriminatedUnion('type', [
  MongoFindInputSchema,
  MongoAggregateInputSchema,
]);

/** Shape for MCP tool paramsSchema (must be ZodRawShapeCompat, not a union). */
export const MongoQueryParamsSchema = z.object({
  type: z.enum(['find', 'aggregate']),
  database: z.string(),
  collection: z.string(),
  filter: z.record(z.string(), z.unknown()).optional(),
  limit: z.number().optional(),
  projection: z.record(z.string(), z.unknown()).optional(),
  pipeline: z.array(z.record(z.string(), z.unknown())).optional(),
});

export type MongoFindInput = z.infer<typeof MongoFindInputSchema>;
export type MongoAggregateInput = z.infer<typeof MongoAggregateInputSchema>;
export type MongoQueryInput = z.infer<typeof MongoQueryInputSchema>;

export interface MongoConfig {
  uri: string;
  allowWriteOps: boolean;
}

export interface CollectionInfo {
  name: string;
  type: string;
}

export interface CollectionResource {
  database: string;
  collection: string;
  indexes: { name: string; keys: unknown }[];
  sampleDocuments: Record<string, unknown>[];
  documentCount: number;
}

export class MongoError extends Error {
  constructor(
    message: string,
    public code?: string,
    public detail?: string,
  ) {
    super(message);
    this.name = 'MongoError';
  }
}

export class MongoConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MongoConfigurationError';
  }
}

export class MongoQueryValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'MongoQueryValidationError';
  }
}
