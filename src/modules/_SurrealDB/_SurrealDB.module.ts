import { Module } from '@nestjs/common';
import { SurrealDBService } from './_SurrealDB.service';
import { SurrealDBInfrastructureModule } from '../../@core/infrastructure/surrealdb/surrealdb.infrastructure.module';

@Module({
  imports: [SurrealDBInfrastructureModule],
  providers: [SurrealDBService],
})
export class _SurrealDBModule {}