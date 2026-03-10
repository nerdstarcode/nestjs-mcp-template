import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SurrealDBConnection } from './surrealdb.connection';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [
    {
      provide: 'SurrealDBConnection',
      useFactory: () => {
        const uri = process.env.SURREALDB_URI as string;
        const namespace = process.env.SURREALDB_NAMESPACE as string;
        const database = process.env.SURREALDB_DATABASE as string;
        const connection = new SurrealDBConnection(uri, namespace, database);
        connection.connect();
        return connection;
      },
    },
  ],
  exports: ['SurrealDBConnection'],
})
export class SurrealDBInfrastructureModule {}