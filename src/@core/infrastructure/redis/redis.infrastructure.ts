import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory } from '@nestjs/microservices';
import { getRedisMicroserviceOptions } from './redis.config';

const logger = new Logger('Redis Infrastructure');

@Injectable()
export class RedisClient implements OnModuleInit {
  public client: ClientProxy;

  constructor() {
    logger.debug('Initializing Redis client (producer)');
    const { transport, options } = getRedisMicroserviceOptions();
    this.client = ClientProxyFactory.create({
      transport,
      options,
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect();
      logger.log('Redis client connected - ready to send messages');
    } catch (err) {
      logger.error('Failed to connect Redis client (producer)');
      logger.error(err);
    }
  }
}