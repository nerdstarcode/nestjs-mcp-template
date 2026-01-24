import { Resolver, Tool, Resource } from '@nestjs-mcp/server';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { loadConfig, validateConfig } from '../../@core/modules/postgrees/utils/config.js';
import { DatabaseConnection } from '../../@core/infrastructure/postgrees/postgrees.infrastructure';
import { QueryValidator } from '../../@core/modules/postgrees/utils/query-validator.js';
import type { QueryInput } from '../../@core/dto/postgree';
import { QueryInputSchema } from '../../@core/dto/postgree';
import { Logger } from '@nestjs/common';

@Resolver()
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
    annotations:{
      title: 'PostgreSQL Query',
    }
  })
  async queryTool(args: unknown): Promise<CallToolResult> {
    try {
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
  async listTables(): Promise<any> {
    try {
      const tables = await this.db.getTables();
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tables, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Tables resource error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve tables';
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
    name: 'table',
    uri: 'postgres://table/{schema}/{table}',
    metadata: {
      title: 'PostgreSQL Table Details',
      description: 'Get schema information and sample rows for a specific table',
    }
  })
  async getTableDetails(args: { schema: string; table: string }): Promise<any> {
    try {
      const { schema, table } = args;
      if (!schema || !table) {
        throw new Error('Schema and table parameters are required');
      }
      const tableDetails = await this.db.getTableDetails(schema, table);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(tableDetails, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Table detail resource error', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to retrieve table details';
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
}