import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import z from 'zod';

/**
 * Opções compartilhadas para conexão RabbitMQ como broker.
 * Usado tanto pelo producer (ClientProxy) quanto pelo consumer (connectMicroservice).
 */
export function getRabbitMQMicroserviceOptions(): any {
  const url = process.env.RABBITMQ_URL;
  const queue = process.env.RABBITMQ_QUEUE || 'test_queue';

  z.object({
    url: z.string(),
    queue: z.string(),
  }).parse({
    url,
    queue,
  });

  return {
    transport: Transport.RMQ,
    options: {
      urls: [url],
      queue,
      queueOptions: {
        durable: true,
      },
      retryAttempts: 10,
      retryDelay: 3000,
    },
  };
}

export const RabbitMQConfig = registerAs('rabbitmq', () => ({
  url: process.env.RABBITMQ_URL || 'amqp://localhost',
  queue: process.env.RABBITMQ_QUEUE || 'test_queue',
}));