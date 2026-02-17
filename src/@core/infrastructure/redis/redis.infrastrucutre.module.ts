import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RedisClient } from './redis.infrastructure';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  controllers: [],
  providers: [RedisClient],
  exports: [RedisClient],
})
export class RedisModule { }
