import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { typegooseForFeature } from '../../@core/infrastructure/mongo/typegoose.util';
import { MongoInfrastructureModule } from '../../@core/infrastructure/mongo/mongo.infrastructure.module';
import { ExampleTypegooseEntity } from '../../@core/entity/example-typegoose.entity';
import { ExampleTypegooseService } from './example-typegoose.service';

@Module({
  imports: [
    MongoInfrastructureModule,
    MongooseModule.forFeature([typegooseForFeature(ExampleTypegooseEntity)]),
  ],
  providers: [ExampleTypegooseService],
  exports: [ExampleTypegooseService],
})
export class TypegooseExampleModule {}
