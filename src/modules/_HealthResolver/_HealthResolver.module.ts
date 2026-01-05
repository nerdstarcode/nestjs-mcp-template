import { Module } from '@nestjs/common';

import { _HealthResolverService } from './_HealthResolver.service';

@Module({
  imports: [],
  providers: [_HealthResolverService],
})
export class _HealthResolverModule { }