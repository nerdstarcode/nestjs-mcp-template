import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { getRedisMicroserviceOptions } from './@core/infrastructure/redis/redis.config';
import { MicroserviceOptions } from '@nestjs/microservices';
import { getRabbitMQMicroserviceOptions } from './@core/infrastructure/rabbitmq/rabbitmq.config';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  try {
    const app = await NestFactory.create(AppModule);

    const rabbitMQOptions = getRabbitMQMicroserviceOptions();
    app.connectMicroservice<MicroserviceOptions>(rabbitMQOptions, {
      inheritAppConfig: true,
    });
    const redisOptions = getRedisMicroserviceOptions();
    app.connectMicroservice<MicroserviceOptions>(redisOptions, {
      inheritAppConfig: true, // Herda pipes, guards, interceptors do app HTTP
    });

    await app.startAllMicroservices();
    await app.listen(process.env.PORT ?? 3000, () => {
      logger.log(`🚀 Server is running on http://localhost:${process.env.PORT ?? 3000}`);
      logger.log(`📨 Redis microservice listening for messages`);
      logger.log(`📨 Rabbitmq microservice listening for messages`);
    });
  } catch (err) {
    logger.fatal(err);
  }
}
bootstrap();
