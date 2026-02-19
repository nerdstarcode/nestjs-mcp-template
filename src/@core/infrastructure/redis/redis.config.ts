import { Transport } from '@nestjs/microservices';
import z from 'zod';

/**
 * Opções compartilhadas para conexão Redis como broker.
 * Usado tanto pelo producer (ClientProxy) quanto pelo consumer (connectMicroservice).
 */
export function getRedisMicroserviceOptions(): any {
  const host = process.env.REDIS_HOST;
  const port = parseInt(process.env.REDIS_PORT as string);
  const password = process.env.REDIS_PASSWORD;
  z.object({
    host: z.string(),
    port: z.number(),
    password: z.string().optional(),
  }).parse({
    host,
    port,
    password,
  });
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
