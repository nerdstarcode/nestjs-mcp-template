import { Body, Controller, Logger, Post, Query, Req } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { RedisClient } from 'src/@core/infrastructure/redis/redis.infrastructure';

const logger = new Logger('Module Name');
@Controller('moduleName')
// @UseGuards(JwtGuardGuard)
@ApiBearerAuth()
@ApiTags('ModuleName') export class ModuleNameController {
  constructor(
    private readonly _redisClient: RedisClient
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

  @MessagePattern({ inventory: 'test' })
  async test(@Payload() body) {
    logger.debug('MessagePattern test received');
    return body;
  }

  @MessagePattern({ inventory: 'observation/index' })
  async observationIndex(@Payload() payload: { page: string; limit: string; body: unknown }) {
    logger.debug('MessagePattern observation/index received');
    return { received: payload };
  }
}
