import { Body, Controller, Inject, Logger, Post, Query, Req } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
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
  async index(@Query('page') page, @Query('limit') limit, @Req() req, @Body() body) {
    logger.debug(`${req.url} called by ${req.user.email}`);
    return this._redisClient
      .client
      .send({ inventory: 'observation/index' }, { page, limit, body });
  }

  @MessagePattern({ inventory: 'test' })
  async test(@Payload() body) {
    logger.debug("AAAAAAAAAA")
    console.log(body)
  }
}
