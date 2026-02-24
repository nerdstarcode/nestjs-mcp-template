import { registerAs } from '@nestjs/config';

export const RabbitMQConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  queue: process.env.RABBITMQ_QUEUE || 'default_queue',
}));