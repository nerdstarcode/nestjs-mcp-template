import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { connect, Connection, Channel } from 'amqplib';

@Injectable()
export class RabbitMQClient implements OnModuleInit, OnModuleDestroy {
  private connection: Connection;
  private channel: Channel;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    const url = this.configService.get<string>('rabbitmq.url');
    const queue = this.configService.get<string>('rabbitmq.queue');

    this.connection = await connect(url);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue(queue);

    console.log(`Connected to RabbitMQ at ${url}, queue: ${queue}`);
  }

  async sendToQueue(message: string) {
    const queue = this.configService.get<string>('rabbitmq.queue');
    this.channel.sendToQueue(queue, Buffer.from(message));
  }

  async checkHealth(): Promise<{ queue: string, messageCount: number, consumerCount: number } | false> {
    try {
      const result = await this.channel.checkQueue(this.configService.get<string>('rabbitmq.queue'));
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