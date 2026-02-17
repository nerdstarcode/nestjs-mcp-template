import { Module } from '@nestjs/common';
import { _RedisClientService } from './_RedisClient.service';
import { RedisModule } from 'src/@core/infrastructure/redis/redis.infrastrucutre.module';


@Module({
  imports: [RedisModule],
  providers: [_RedisClientService],
})
export class _RedisClientModule { }