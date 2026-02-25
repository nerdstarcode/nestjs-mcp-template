import { Resolver, Tool } from '@nestjs-mcp/server';
import type { RequestHandlerExtra } from '@nestjs-mcp/server';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '@nestjs/common';
import { RabbitMQClient } from 'src/@core/infrastructure/rabbitmq/rabbitmq.infrastructure';
import z from 'zod';

const logger = new Logger('RABBITMQ CLIENT MCP');

@Resolver('data')
export class _RabbitMQClientService {
  constructor(private readonly rabbitMQClient: RabbitMQClient) { }

  @Tool({
    name: 'rabbitmq_status',
    description: 'Check the health status of the RabbitMQ connection.',
    paramsSchema: z.object({
      queue: z.string().describe('The message to send to RabbitMQ'),
    }).shape
  })
  async healthCheck(args: unknown): Promise<CallToolResult> {
    const { queue } = args as any;
    const check = await this.rabbitMQClient.checkHealth(queue);
    return {
      content: [
        {
          type: 'text',
          text: check ? `RabbitMQ connection is healthy. Queue: ${check.queue}, Messages: ${check.messageCount}, Consumers: ${check.consumerCount}` : 'RabbitMQ connection is not healthy.',
        },
      ],
    };
  }

  @Tool({
    name: 'rabbitmq_send',
    description:
      'Send a message to the configured RabbitMQ queue.',
    paramsSchema: z.object({
      message: z.string().describe('The message to send to RabbitMQ'),
      queue: z.string().describe('The name of the RabbitMQ queue to send the message to'),
    }).shape,
    annotations: {
      title: 'Send Message to RabbitMQ',
    },
  })
  async sendMessage(args: unknown, _extra: RequestHandlerExtra): Promise<CallToolResult> {
    const { message, queue } = args as any;
    await this.rabbitMQClient.sendToQueue(queue, message);
    return {
      content: [
        {
          type: 'text',
          text: `Message sent to RabbitMQ queue ${queue}: ${message}`,
        },
      ],
    };
  }
}