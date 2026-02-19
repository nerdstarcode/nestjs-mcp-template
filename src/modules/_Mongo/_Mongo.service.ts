import { Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Resolver, Tool, Resource } from '@nestjs-mcp/server';
import type { RequestHandlerExtra } from '@nestjs-mcp/server';
import type { CallToolResult, ReadResourceResult } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, validateConfig } from '../../@core/modules/mongo/utils/config.js';
import { MongoConnection } from '../../@core/infrastructure/mongo/mongo.connection';
import { MongoQueryValidator } from '../../@core/modules/mongo/utils/query-validator.js';
import { MongoQueryInputSchema, MongoQueryParamsSchema } from '../../@core/dto/mongo';
import type { MongoQueryInput } from '../../@core/dto/mongo';
import { URL } from 'url';

@Resolver('data')
export class _MongoService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger('_MongoService');
  private readonly db: MongoConnection;
  private readonly queryValidator: MongoQueryValidator;

  constructor() {
    const config = loadConfig();
    validateConfig(config);
    this.db = new MongoConnection(config);
    this.queryValidator = new MongoQueryValidator(config.allowWriteOps);
  }

  async onModuleInit() {
    await this.db.connect();
  }

  async onModuleDestroy() {
    await this.db.close();
  }

  @Tool({
    name: 'mongo_query',
    description:
      'Execute a find or aggregate query against the configured MongoDB. Read-only by default; enable writes via DANGEROUSLY_ALLOW_WRITE_OPS environment variable.',
    paramsSchema: MongoQueryParamsSchema.shape,
    annotations: {
      title: 'MongoDB Query',
    },
  })
  async queryTool(args: unknown, _extra: RequestHandlerExtra): Promise<CallToolResult> {
    try {
      this.logger.debug(`${_extra.sessionId} Executing mongo query tool with args: ${JSON.stringify(args)}`);
      const input = MongoQueryInputSchema.parse(args) as MongoQueryInput;
      this.queryValidator.validate(input);
      const result = await this.db.executeQuery(input);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Mongo query tool error', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
      };
    }
  }

  @Resource({
    name: 'mongo_databases',
    uri: 'mongo://databases',
    metadata: {
      title: 'MongoDB Databases',
      description: 'List all databases in the connected MongoDB instance.',
    },
  })
  async listDatabases(_uri: URL, _extra: RequestHandlerExtra): Promise<ReadResourceResult> {
    try {
      this.logger.debug(`${_extra.sessionId} Fetching database list`);
      const databases = await this.db.getDatabases();
      return {
        contents: [
          {
            uri: 'mongo://databases',
            mimeType: 'application/json',
            text: JSON.stringify(databases, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Databases resource error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve databases';
      return {
        contents: [
          {
            uri: 'mongo://databases',
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
      };
    }
  }

  @Resource({
    name: 'mongo_collections',
    template: 'mongo://collections/{database}',
    metadata: {
      title: 'MongoDB Collections',
      description: 'List all collections in a MongoDB database.',
    },
  })
  async listCollections(
    uri: URL,
    variables: { database: unknown },
    _extra: RequestHandlerExtra,
  ): Promise<ReadResourceResult> {
    try {
      this.logger.debug(`${_extra.sessionId} Fetching collections for ${uri.href}`);
      const { database } = variables;
      if (!database || typeof database !== 'string') {
        throw new Error('database parameter is required');
      }
      const collections = await this.db.getCollections(database);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(collections, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Collections resource error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve collections';
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
      };
    }
  }

  @Resource({
    name: 'mongo_collection',
    template: 'mongo://collection/{database}/{collection}',
    metadata: {
      title: 'MongoDB Collection Details',
      description: 'Get indexes, sample documents and document count for a specific collection',
    },
  })
  async getCollectionDetails(
    uri: URL,
    variables: { database: unknown; collection: unknown },
    _extra: RequestHandlerExtra,
  ): Promise<ReadResourceResult> {
    try {
      this.logger.debug(`${_extra.sessionId} Fetching collection details for ${uri.href}`);
      const { database, collection } = variables;
      if (!database || typeof database !== 'string' || !collection || typeof collection !== 'string') {
        throw new Error('database and collection parameters are required');
      }
      const details = await this.db.getCollectionDetails(database, collection);
      return {
        contents: [
          {
            uri: uri.href,
            mimeType: 'application/json',
            text: JSON.stringify(details, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Collection detail resource error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve collection details';
      return {
        contents: [
          {
            uri: uri.href,
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
      };
    }
  }
}
