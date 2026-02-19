import { MongoClient, type Db } from 'mongodb';
import { Logger } from '@nestjs/common';
import type { MongoConfig } from '../../dto/mongo';
import { MongoError } from '../../dto/mongo';
import type { MongoQueryInput } from '../../dto/mongo';

const logger = new Logger('MongoConnection');

export class MongoConnection {
  private client: MongoClient;
  private isConnected = false;

  constructor(private readonly config: MongoConfig) {
    this.client = new MongoClient(this.config.uri);
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.isConnected = true;
      logger.debug('MongoDB connection established successfully');
    } catch (error) {
      this.isConnected = false;
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new MongoError(`Failed to connect to MongoDB: ${message}`);
    }
  }

  private getDb(name: string): Db {
    return this.client.db(name);
  }

  async executeQuery(input: MongoQueryInput): Promise<unknown[]> {
    try {
      const db = this.getDb(input.database);
      const collection = db.collection(input.collection);

      if (input.type === 'find') {
        let cursor = collection.find(input.filter);
        if (input.limit) cursor = cursor.limit(input.limit) as typeof cursor;
        if (input.projection) cursor = cursor.project(input.projection) as typeof cursor;
        return await cursor.toArray();
      }

      if (input.type === 'aggregate') {
        return await collection.aggregate(input.pipeline).toArray();
      }

      return [];
    } catch (error) {
      logger.error('Mongo query execution failed', error);
      const message = error instanceof Error ? error.message : 'Query execution failed';
      throw new MongoError(message);
    }
  }

  async getCollections(database: string): Promise<{ name: string; type: string }[]> {
    try {
      const db = this.getDb(database);
      const collections = await db.listCollections().toArray();
      return collections.map((c) => ({ name: c.name, type: c.type ?? 'collection' }));
    } catch (error) {
      logger.error('Failed to retrieve collections', error);
      const message = error instanceof Error ? error.message : 'Failed to retrieve collections';
      throw new MongoError(message);
    }
  }

  async getCollectionDetails(
    database: string,
    collection: string,
  ): Promise<{
    database: string;
    collection: string;
    indexes: { name: string; keys: unknown }[];
    sampleDocuments: Record<string, unknown>[];
    documentCount: number;
  }> {
    try {
      const db = this.getDb(database);
      const coll = db.collection(collection);

      const [indexes, sampleDocuments, documentCount] = await Promise.all([
        coll
          .listIndexes()
          .toArray()
          .then((arr) => arr.map((idx) => ({ name: idx.name, keys: idx.key }))),
        coll.find({}).limit(50).toArray(),
        coll.countDocuments(),
      ]);

      return {
        database,
        collection,
        indexes,
        sampleDocuments: sampleDocuments as Record<string, unknown>[],
        documentCount,
      };
    } catch (error) {
      logger.error(`Failed to get details for ${database}.${collection}`, error);
      const message =
        error instanceof Error ? error.message : `Failed to retrieve collection ${collection}`;
      throw new MongoError(message);
    }
  }

  async getDatabases(): Promise<string[]> {
    try {
      const admin = this.client.db().admin();
      const { databases } = await admin.listDatabases();
      return databases.map((d) => d.name).filter((n) => !['admin', 'local', 'config'].includes(n));
    } catch (error) {
      logger.error('Failed to list databases', error);
      const message = error instanceof Error ? error.message : 'Failed to list databases';
      throw new MongoError(message);
    }
  }

  async close(): Promise<void> {
    try {
      await this.client.close();
      this.isConnected = false;
      logger.debug('MongoDB connection closed');
    } catch (error) {
      logger.error('Error closing MongoDB connection', error);
    }
  }

  getStatus(): { connected: boolean } {
    return { connected: this.isConnected };
  }
}
