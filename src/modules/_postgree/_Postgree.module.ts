import { Module } from '@nestjs/common';

import { _PostgreeService } from './_Postgree.service';

@Module({
  imports: [],
  providers: [_PostgreeService],
})
export class _PostgreeModule { }