import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { RedisClient } from './@core/infrastructure/redis/redis.infrastructure';
import { RabbitMQClient } from './@core/infrastructure/rabbitmq/rabbitmq.infrastructure';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Initialize Redis connection
  const redisClient = app.get(RedisClient);
  try {
    await redisClient.onModuleInit();
    logger.log('Redis connection established successfully.');
  } catch (error) {
    logger.error('Failed to connect to Redis:', error.message);
    process.exit(1); // Exit the application if Redis connection fails
  }

  // Initialize RabbitMQ connection
  const rabbitMQClient = app.get(RabbitMQClient);
  try {
    await rabbitMQClient.onModuleInit();
    logger.log('RabbitMQ connection established successfully.');
  } catch (error) {
    logger.error('Failed to connect to RabbitMQ:', error.message);
    process.exit(1); // Exit the application if RabbitMQ connection fails
  }

  await app.listen(3000);
  logger.log('Application is running on http://localhost:3000');
}
bootstrap();
