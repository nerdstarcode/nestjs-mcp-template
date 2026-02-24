import { Resolver, Tool } from '@nestjs-mcp/server';
import type { CallToolResult } from '@modelcontextprotocol/sdk/types.js';
import * as os from 'os';

@Resolver('data')
export class _HealthResolverService {
  @Tool({ name: 'server_health_check',  description: 'Check the overall health status of the server.' })
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

  @Tool({ name: 'server_memory_usage', description: 'Get the current memory usage of the server.' })
  memoryUsage(): CallToolResult {
    const memoryUsage = process.memoryUsage();
    return {
      content: [
        {
          type: 'text',
          text: `Memory Usage: RSS: ${Math.round(memoryUsage.rss / 1024 / 1024)} MB, Heap Used: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)} MB, Heap Total: ${Math.round(memoryUsage.heapTotal / 1024 / 1024)} MB`,
        },
      ],
    };
  }

  @Tool({ name: 'server_cpu_usage', description: 'Get the current CPU usage of the server.' })
  cpuUsage(): CallToolResult {
    const cpus = os.cpus();
    const cpuLoad = cpus.map((cpu, index) => {
      const total = Object.values(cpu.times).reduce((acc, tv) => acc + tv, 0);
      const usage = ((total - cpu.times.idle) / total) * 100;
      return `CPU ${index}: ${usage.toFixed(2)}%`;
    }).join('\n');

    return {
      content: [
        {
          type: 'text',
          text: `CPU Usage:\n${cpuLoad}`,
        },
      ],
    };
  }
}