import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { connect, Channel, ChannelModel, } from 'amqplib';

@Injectable()
export class RabbitMQClient implements OnModuleInit, OnModuleDestroy {
  private connection: ChannelModel;
  private channel: Channel;
  public client: ClientProxy;

  constructor(private readonly configService: ConfigService) { }

  async onModuleInit() {
    const url = this.configService.get<string>('rabbitmq.url');

    this.connection = await connect(url as string);
    this.channel = await this.connection.createChannel();
    await this.channel.assertQueue("test_queue", { durable: true });

    console.log(`Connected to RabbitMQ at ${url}`);
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [url as string],
        queueOptions: {
          durable: true,
        },
      },
    });
  }

  async sendToQueue(queue: string, message: any) {
    try {
      if (!queue || typeof queue !== 'string') {
        throw new TypeError('Queue name must be a non-empty string');
      }

      if (!message) {
        throw new TypeError('Message cannot be undefined or null');
      }

      this.channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    } catch (error) {
      console.error('Failed to send message to RabbitMQ:', error);
    }
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