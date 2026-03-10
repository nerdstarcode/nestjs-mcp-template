import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { SurrealDBConnection } from '../../@core/infrastructure/surrealdb/surrealdb.connection';
import { loadSurrealDBConfig } from '../../@core/modules/surrealdb/utils/config';
import { SurrealDBQuery, SurrealDBQuerySchema, SurrealDBQueryValidator } from '../../@core/modules/surrealdb/utils/query-validator';
import { Resolver, Tool } from '@nestjs-mcp/server';

@Resolver('data')
export class SurrealDBService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SurrealDBService.name);
  private readonly db: SurrealDBConnection;
  private readonly queryValidator: SurrealDBQueryValidator;

  constructor() {
    const config = loadSurrealDBConfig();
    this.db = new SurrealDBConnection(config.uri, config.namespace, config.database);
    this.queryValidator = new SurrealDBQueryValidator();
  }

  async onModuleInit() {
    await this.db.connect();
  }

  async onModuleDestroy() {
    await this.db.close();
  }

  async executeQuery(query: SurrealDBQuery): Promise<any> {
    try {
      this.queryValidator.validate(query);
      const client = this.db.getClient();
      const { table, action, data } = query as any;
      switch (action) {
        case 'select':
          return await client.select(table);
        case 'create':
          return await client.create(table).content(data);
        case 'update':
          return await client.update(table).merge(data);
        case 'delete':
          return await client.delete(table);
        default:
          throw new Error('Unsupported action');
      }
    } catch (error) {
      this.logger.error('Error executing query', error);
      throw error;
    }
  }

  @Tool({
    name: 'surrealdb_query',
    description: 'Execute a query against the configured SurrealDB.',
    paramsSchema: SurrealDBQuerySchema.shape,
  })
  async surrealDBQueryTool(args: unknown): Promise<any> {
    try {

      this.queryValidator.validate(args);
      const { table, action, data } = args as SurrealDBQuery;
      const result = await this.executeQuery({ table, action, data });
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error executing SurrealDB query tool', error);
      throw error;
    }
  }
  @Tool({
    name: 'surrealdb_info',
    description: 'Execute a query against the configured SurrealDB.',
  })
  async surrealDBQueryToolH(args: unknown): Promise<any> {
    try {
      const result = await this.db.getClient().query(`INFO FOR DB`)
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      this.logger.error('Error executing SurrealDB query tool', error);
      throw error;
    }
  }
}