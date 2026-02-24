import { Module } from '@nestjs/common';
import { _RabbitMQClientService } from './_RabbitMQClient.service';
import { RabbitMQInfrastructureModule } from 'src/@core/infrastructure/rabbitmq/rabbitmq.infrastructure.module';


@Module({
  imports: [RabbitMQInfrastructureModule],
  providers: [_RabbitMQClientService],
})
export class _RabbitMQClientModule { }