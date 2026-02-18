import { Transport } from '@nestjs/microservices';

/**
 * Opções compartilhadas para conexão Redis como broker.
 * Usado tanto pelo producer (ClientProxy) quanto pelo consumer (connectMicroservice).
 */
export function getRedisMicroserviceOptions():any {
  const host = process.env.REDIS_HOST ?? 'localhost';
  const port = parseInt(process.env.REDIS_PORT ?? '6379', 10);
  const password = process.env.REDIS_PASSWORD || undefined;

  return {
    transport: Transport.REDIS,
    options: {
      host,
      port,
      ...(password && { password }),
      retryAttempts: 10,
      retryDelay: 3000,
    },
  };
}
