import { z } from 'zod';
import type { MongoConfig } from '../../../dto/mongo';
import { MongoConfigurationError } from '../../../dto/mongo';
import { Logger } from '@nestjs/common';

const logger = new Logger('Mongo Config');

const booleanFromEnv = (defaultValue: boolean) =>
  z.preprocess((val) => {
    if (typeof val === 'boolean') return val;
    if (typeof val === 'string') {
      const s = val.trim().toLowerCase();
      if (['true', '1', 'yes', 'on', 'y', 't'].includes(s)) return true;
      if (['false', '0', 'no', 'off', '', 'n', 'f'].includes(s)) return false;
      return undefined;
    }
    return undefined;
  }, z.boolean().default(defaultValue));

const EnvSchema = z.object({
  MONGODB_URI: z.string().min(1, 'MONGODB_URI is required'),
  DANGEROUSLY_ALLOW_WRITE_OPS: booleanFromEnv(false),
});

const ConfigSchema = z.object({
  uri: z.string(),
  allowWriteOps: z.boolean(),
});

export function loadConfig(): MongoConfig {
  try {
    logger.debug('Loading MongoDB configuration from environment variables');
    const env = EnvSchema.parse(process.env);
    const config = {
      uri: env.MONGODB_URI,
      allowWriteOps: env.DANGEROUSLY_ALLOW_WRITE_OPS,
    };
    const validatedConfig = ConfigSchema.parse(config);
    return validatedConfig;
  } catch (error) {
    logger.error('Error loading MongoDB configuration', error);
    if (error instanceof z.ZodError) {
      const errorMessage = error?.issues
        ?.map((err) => `${err.path.join('.')}: ${err.message}`)
        ?.join(', ');
      throw new MongoConfigurationError(`Configuration validation failed: ${errorMessage ?? ''}`);
    }
    throw error;
  }
}

export function validateConfig(config: MongoConfig): void {
  try {
    ConfigSchema.parse(config);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessage = error.issues
        .map((err) => `${err.path.join('.')}: ${err.message}`)
        .join(', ');
      throw new MongoConfigurationError(`Configuration validation failed: ${errorMessage}`);
    }
    throw error;
  }
}
