import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { getRedisMicroserviceOptions } from './@core/infrastructure/redis/redis.config';

const logger = new Logger('Main');

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);

    // Conecta o microserviço Redis para consumir mensagens (subscriber)
    const redisOptions = getRedisMicroserviceOptions();
    app.connectMicroservice<MicroserviceOptions>(redisOptions, {
      inheritAppConfig: true, // Herda pipes, guards, interceptors do app HTTP
    });

    await app.startAllMicroservices();
    await app.listen(process.env.PORT ?? 3000, () => {
      logger.log(`🚀 Server is running on http://localhost:${process.env.PORT ?? 3000}`);
      logger.log(`📨 Redis microservice listening for messages`);
    });
  } catch (err) {
    logger.fatal(err);
  }
}
bootstrap();
