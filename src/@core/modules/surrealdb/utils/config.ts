import { z } from 'zod';

export const SurrealDBConfigSchema = z.object({
  uri: z.string().url(),
  namespace: z.string(),
  database: z.string(),
});

export function loadSurrealDBConfig() {
  const config = {
    uri: process.env.SURREALDB_URI,
    namespace: process.env.SURREALDB_NAMESPACE,
    database: process.env.SURREALDB_DATABASE,
  };

  const parsedConfig = SurrealDBConfigSchema.safeParse(config);
  if (!parsedConfig.success) {
    throw new Error('Invalid SurrealDB configuration');
  }

  return parsedConfig.data;
}