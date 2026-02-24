import { Resolver, Tool } from '@nestjs-mcp/server';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import { Logger } from '@nestjs/common';
import { RedisClient } from 'src/@core/infrastructure/redis/redis.infrastructure';
const logger = new Logger("REDIS CLIENT MCP")
@Resolver('data')
export class _RedisClientService {
  constructor(
    private readonly _redisClient: RedisClient
  ) { }

  @Tool({ name: 'redis_status', description: 'Check the health status of the Redis connection.' })
  async healthCheck(): Promise<CallToolResult> {
    return {
      content: [
        {
          type: 'text',
          text: (this._redisClient.client.status as any).source.source._buffer[0],
        },
      ],
    };
  }
}