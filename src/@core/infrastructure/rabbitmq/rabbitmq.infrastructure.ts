import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Channel, ChannelModel, } from 'amqplib';

@Injectable()
export class RabbitMQClient implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel;
  private channel: Channel;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    const url = this.configService.get<string>('rabbitmq.url');

    this.connection = await connect(url as string);
    this.channel = await this.connection.createChannel();

    console.log(`Connected to RabbitMQ at ${url}`);
  }

  async sendToQueue(queue: string, message: string) {
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async checkHealth(queue: string): Promise<{ queue: string, messageCount: number, consumerCount: number } | false> {
    try {
      const result = await this.channel.checkQueue(queue);
      console.log(`Queue: ${queue}, Messages: ${result.messageCount}, Consumers: ${result.consumerCount}`);

      return result;
    } catch (error) {
      console.error('RabbitMQ health check failed:', error);
      return false;
    }
  }

  async onModuleDestroy() {
    await this.channel.close();
    await this.connection.close();
  }
}