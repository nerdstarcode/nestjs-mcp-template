import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { RabbitMQConfig } from './rabbitmq.config';
import { RabbitMQClient } from './rabbitmq.infrastructure';

@Module({
  imports: [ConfigModule.forFeature(RabbitMQConfig)],
  providers: [RabbitMQClient],
  exports: [RabbitMQClient],
})
export class RabbitMQInfrastructureModule {}