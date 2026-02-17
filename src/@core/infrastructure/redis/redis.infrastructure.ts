import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import z from "zod"
const logger = new Logger("Redis Infrastructure")

@Injectable()
export class RedisClient {
  public client: ClientProxy;
  envSchema = z.object({
    REDIS_HOST: z.string(),
    REDIS_PORT: z.coerce.number(),
    REDIS_PASSWORD: z.string(),
  })
  constructor() {
    logger.debug("Initializing Redis")
    this.constructionClient();
    this.testConnection();
  }

  processOptions() {
    try {
      const processEnv = this.envSchema.parse(process.env)
      return {
        username: "default",
        host: processEnv.REDIS_HOST,
        password: processEnv.REDIS_PASSWORD,
        port: processEnv.REDIS_PORT,
      }
    } catch (err) {
      logger.error("Error envirement");
      logger.error(err);
    }
  }

  async constructionClient() {
    try {
      this.client = ClientProxyFactory.create({
        transport: Transport.REDIS,
        options: {
          name: "Redis Connection",
          retryAttempts: 10,
          retryDelay: 3000,
          ...this.processOptions(),
        }
      });
    } catch (err) {
      logger.error("Error to connect with Redis");
      logger.error(err);
    }
  }

  async testConnection() {
    try {
      await this.client.connect();
      logger.log("Successfully connected to Redis.");
    } catch (err) {
      logger.error("Failed to connect to Redis during test.");
      logger.error(err);
    }
  }
}