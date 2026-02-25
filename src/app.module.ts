import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { _HealthResolverModule } from './modules/_HealthResolver/_HealthResolver.module';
import { McpModule } from '@nestjs-mcp/server';
import { _MongoModule } from './modules/_Mongo/_Mongo.module';
import { ConfigModule } from '@nestjs/config';
import { ModuleNameController } from './modules/ModuleName/modulename.controller';
import { RedisModule } from './@core/infrastructure/redis/redis.infrastrucutre.module';
import { _RedisClientModule } from './modules/_RedisClient/_RedisClient.module';
import { MetricsGrafanaModule } from './@core/infrastructure/metrics-grafana/metrics-grafana.module';
import { MongoInfrastructureModule } from './@core/infrastructure/mongo/mongo.infrastructure.module';
import { TypegooseExampleModule } from './modules/TypegooseExample/typegoose-example.module';
import { RabbitMQInfrastructureModule } from './@core/infrastructure/rabbitmq/rabbitmq.infrastructure.module';
import { _RabbitMQClientModule } from './modules/_RabbitMQClient/_RabbitMQClient.module';

@Module({
  imports: [
    MetricsGrafanaModule,
    // MongoInfrastructureModule,
    RabbitMQInfrastructureModule,
    RedisModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // _MongoModule,
    _RedisClientModule,
    _RabbitMQClientModule,
    _HealthResolverModule,
    // _PostgreeModule, // not configured - insecure querys
    // TypegooseExampleModule,
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
