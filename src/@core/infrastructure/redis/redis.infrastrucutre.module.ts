import { Module } from '@nestjs/common';
import { RedisClient } from './redis.infrastructure';

@Module({
  providers: [RedisClient],
  exports: [RedisClient],
})
export class RedisModule {}
