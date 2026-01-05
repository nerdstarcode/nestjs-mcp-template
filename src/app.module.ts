import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { _HealthResolverModule } from './modules/_HealthResolver/_HealthResolver.module';
import { McpModule } from '@nestjs-mcp/server';

@Module({
  imports: [
    _HealthResolverModule,
    McpModule.forRoot({
      name: 'My MCP Server',
      version: '1.0.0',
      logging: { level: 'error', enabled: true },
      transports: {
        streamable: { enabled: true }
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
