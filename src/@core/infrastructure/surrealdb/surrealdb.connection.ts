import { Logger } from '@nestjs/common';
import { Surreal, createRemoteEngines } from 'surrealdb';

export class SurrealDBConnection {
  private db: Surreal;
  private isConnected = false;
  private readonly logger = new Logger('SurrealDBConnection');

  constructor(private readonly uri: string, private readonly namespace: string, private readonly database: string) {
    this.db = new Surreal({
      engines: {
        ...createRemoteEngines(),
      },
    });
  }

  async connect(): Promise<void> {
    try {
      await this.db.connect(this.uri);
      await this.db.signin({ username: process.env.SURREALDB_USER as string, password: process.env.SURREALDB_PASSWORD as string });
      await this.db.use({ namespace: this.namespace, database: this.database });
      this.db.subscribe("using", ({ database, namespace }) => {
        this.logger.log(`SurrealDB using database: ${database}, namespace: ${namespace}`);
      });
      this.isConnected = true;
      this.logger.log('Connected to SurrealDB');
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Failed to connect to SurrealDB', error);
      throw error;
    }
  }

  async close(): Promise<void> {
    try {
      await this.db.close();
      this.isConnected = false;
      this.logger.log('SurrealDB connection closed');
    } catch (error) {
      this.logger.error('Error closing SurrealDB connection', error);
    }
  }

  getStatus(): { connected: boolean } {
    return { connected: this.isConnected };
  }

  getClient(): Surreal {
    if (!this.isConnected) {
      throw new Error('SurrealDB is not connected');
    }
    return this.db;
  }
}