import { Resolver, Tool } from '@nestjs-mcp/server';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

@Resolver()
export class _HealthResolverService {
  @Tool({ name: 'server_health_check' })
  healthCheck(): CallToolResult {
    return {
      content: [
        {
          type: 'text',
          text: 'Server is operational. All systems running normally.',
        },
      ],
    };
  }
}