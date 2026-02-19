import { Module } from '@nestjs/common';
import { _MongoService } from './_Mongo.service';

@Module({
  imports: [],
  providers: [_MongoService],
})
export class _MongoModule {}
