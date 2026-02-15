import { Resolver, Tool, Resource } from '@nestjs-mcp/server';
import type { RequestHandlerExtra } from '@nestjs-mcp/server';
import type { CallToolResult, ReadResourceResult, ServerRequest } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, validateConfig } from '../../@core/modules/postgrees/utils/config.js';
import { DatabaseConnection } from '../../@core/infrastructure/postgrees/postgrees.infrastructure';
import { QueryValidator } from '../../@core/modules/postgrees/utils/query-validator.js';
import type { QueryInput } from '../../@core/dto/postgree';
import { QueryInputSchema } from '../../@core/dto/postgree';
import { Logger } from '@nestjs/common';
import { URL } from 'url';

@Resolver('data')
export class _PostgreeService {
  private readonly logger = new Logger('_PostgreeService');
  private readonly db: DatabaseConnection;
  private readonly queryValidator: QueryValidator;

  constructor() {
    const config = loadConfig();
    validateConfig(config);
    this.db = new DatabaseConnection(config);
    this.queryValidator = new QueryValidator(config.allowWriteOps);
  }

  @Tool({
    name: 'query',
    description:
      'Execute a SQL query against the configured PostgreSQL database. Read-only by default; enable writes via DANGEROUSLY_ALLOW_WRITE_OPS environment variable.',
    paramsSchema: { sql: QueryInputSchema.shape.sql },
    annotations: {
      title: 'PostgreSQL Query',
    }
  })
  async queryTool(args: unknown, _extra: RequestHandlerExtra): Promise<CallToolResult> {
    try {
      this.logger.debug(`${_extra.sessionId} Executing query tool with args: ${JSON.stringify(args)}`);
      const input = QueryInputSchema.parse(args) as QueryInput;
      this.queryValidator.validate(input.sql);
      const rows = await this.db.executeQuery(input.sql);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(rows, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Query tool error', error);
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
    name: 'tables',
    uri: 'postgres://tables',
    metadata: {
      title: 'PostgreSQL Tables',
      description: 'List all tables available in the connected PostgreSQL database.',
    }
  })
  async listTables(uri: URL, _extra: RequestHandlerExtra): Promise<ReadResourceResult> {
    try {
      this.logger.debug(`${_extra.sessionId} Fetching table details for ${uri.href}`);

      const tables = await this.db.getTables();
      return {
        contents: [{
          uri: uri.href,
          mimeType: 'application/json',
          text: tables ? JSON.stringify(tables) : 'Tables not found',
        }]
      }
    } catch (error) {
      this.logger.error('Tables resource error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve tables';
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
    name: 'table',
    template: 'postgres://table/{schema}/{table}',
    metadata: {
      title: 'PostgreSQL Table Details',
      description: 'Get schema information and sample rows for a specific table',
    }
  })
  async getTableDetails(
    uri: URL,
    variables: {
      schema: unknown, table: unknown;
    },
    _extra: RequestHandlerExtra,): Promise<ReadResourceResult> {
    try {
      this.logger.debug(`${_extra.sessionId} Fetching table details for ${uri.href}`);
      const { schema, table } = variables;
      if (!schema || !table) {
        throw new Error('Schema and table parameters are required');
      }
      const tableDetails = await this.db.getTableDetails(schema as string, table as string);
      return {
        contents: [
          {
            uri: uri as any as string,
            mimeType: 'application/json',
            text: JSON.stringify(tableDetails, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Table detail resource error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve table details';
      return {
        contents: [
          {
            uri: uri as any,
            mimeType: 'application/json',
            text: JSON.stringify({ error: errorMessage }, null, 2),
          },
        ],
      };
    }
  }
}