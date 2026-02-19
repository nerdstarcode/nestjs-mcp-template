import { MongoQueryValidationError } from '../../../dto/mongo';
import { Logger } from '@nestjs/common';
import type { MongoQueryInput } from '../../../dto/mongo';

const logger = new Logger('Mongo Query Validator');

const WRITE_STAGES = new Set(['$out', '$merge', '$replaceRoot']);

export class MongoQueryValidator {
  constructor(private readonly allowWriteOps: boolean) {}

  validate(input: MongoQueryInput): void {
    if (!input) {
      throw new MongoQueryValidationError('Query input cannot be empty');
    }

    if (!this.allowWriteOps) {
      this.checkReadOnly(input);
    }

    logger.debug('Mongo query validated successfully', {
      type: input.type,
      allowWriteOps: this.allowWriteOps,
    });
  }

  private checkReadOnly(input: MongoQueryInput): void {
    if (input.type === 'aggregate') {
      for (const stage of input.pipeline) {
        const stageName = Object.keys(stage)[0];
        if (stageName && WRITE_STAGES.has(stageName)) {
          throw new MongoQueryValidationError(
            'Write operations are disabled. Consult a human to enable this.',
          );
        }
      }
    }
  }
}
