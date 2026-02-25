import { Body, Controller, Logger, Post, Query, Req, Res } from '@nestjs/common';
import { EventPattern, MessagePattern, Payload } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RedisClient } from 'src/@core/infrastructure/redis/redis.infrastructure';
import { RabbitMQClient } from 'src/@core/infrastructure/rabbitmq/rabbitmq.infrastructure';

const logger = new Logger('Module Name');
@Controller('moduleName')
// @UseGuards(JwtGuardGuard)
@ApiBearerAuth()
@ApiTags('ModuleName') export class ModuleNameController {
  constructor(
    private readonly _redisClient: RedisClient,
    private readonly _rabbitMQClient: RabbitMQClient
  ) { }

  @Post('index')
  async index(
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Req() req: { url: string; user?: { email: string } },
    @Body() body: unknown,
  ) {
    logger.debug(`${req.url} called`);
    return firstValueFrom(
      this._redisClient.client.send(
        { inventory: 'observation/index' },
        { page, limit, body },
      ),
    );
  }

  @MessagePattern({ inventory: 'observation/index' })
  async observationIndex(@Payload() payload: { page: string; limit: string; body: unknown }) {
    logger.debug('MessagePattern observation/index received');
    return { received: payload };
  }

  @Post('test')
  async test(@Body() body: unknown) {
    logger.debug('MessagePattern sending to test_queue');

    return firstValueFrom(this._rabbitMQClient.client.send({ cmd: 'test_queue' }, body || {}));
  }

  @EventPattern({ cmd: 'test_queue' })
  async testQueue(@Payload() payload: { page: string; limit: string; body: unknown }, @Res() res) {
    logger.debug('MessagePattern test_queue received');
    return { received: payload };
  }


}
