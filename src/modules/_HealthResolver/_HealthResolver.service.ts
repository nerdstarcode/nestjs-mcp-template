import { Resolver, Resource, Tool } from '@nestjs-mcp/server';
import type { RequestHandlerExtra } from '@nestjs-mcp/server';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';

@Resolver('data')
export class _HealthResolverService {
  // @Tool({ name: 'server_health_check', })
  // healthCheck(): CallToolResult {
  //   return {
  //     content: [
  //       {
  //         type: 'text',
  //         text: 'Server is operational. All systems running normally.',
  //       },
  //     ],
  //   };
  // }

  @Resource({
    name: 'user_profile',
    uri: 'user://profiles',
    // metadata: { description: '...' } // Optional
  })
  getUserProfile(
    uri: URL, // First argument is the parsed URI
    // metadata: Record<string, any> // Second argument if is defined
    extra: RequestHandlerExtra, // Contains sessionId and other metadata
  ) {
    const userId = uri.pathname.split('/').pop(); // Example: Extract ID from URI
    console.log(`Fetching profile for ${userId}, session: ${extra.sessionId}`);
    /* ... return CallResourceResult ... */
    return { content: [{ type: 'text', text: `Profile data for ${userId}` }] };
  }
}