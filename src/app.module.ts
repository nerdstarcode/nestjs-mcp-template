import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { _HealthResolverModule } from './modules/_HealthResolver/_HealthResolver.module';
import { McpModule } from '@nestjs-mcp/server';
import { _PostgreeModule } from './modules/_Postgree/_Postgree.module';
import { ConfigModule } from '@nestjs/config';
import { ModuleNameController } from './modules/ModuleName/modulename.controller';
import { RedisModule } from './@core/infrastructure/redis/redis.infrastrucutre.module';
import { _RedisClientModule } from './modules/_RedisClient/_RedisClient.module';
import { MetricsGrafanaModule } from './@core/infrastructure/metrics-grafana/metrics-grafana.module';

@Module({
  imports: [
    MetricsGrafanaModule,
    RedisModule,
    ConfigModule.forRoot({
      isGlobal: true, // Makes the ConfigService available everywhere
      envFilePath: '.env', // Optional: default is .env in the root
    }),
    _HealthResolverModule,
    _PostgreeModule,
    _RedisClientModule,
    McpModule.forRoot({
      name: 'My MCP Server',
      version: '1.0.0',
      logging: { level: 'verbose', enabled: true },
      transports: {
        streamable: { enabled: true }
      },
    }),
  ],
  controllers: [AppController, ModuleNameController],
  providers: [AppService],
})
export class AppModule { }
