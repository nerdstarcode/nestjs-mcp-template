import { registerAs } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';
import z from 'zod';

/**
 * Opções compartilhadas para conexão RabbitMQ como broker.
 * Usado tanto pelo producer (ClientProxy) quanto pelo consumer (connectMicroservice).
 */
export function getRabbitMQMicroserviceOptions(): any {
  const url = process.env.RABBITMQ_URL;

  z.object({
    url: z.string(),
  }).parse({
    url,
  });

  return {
    transport: Transport.RMQ,
    options: {
      urls: [url],
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
}));