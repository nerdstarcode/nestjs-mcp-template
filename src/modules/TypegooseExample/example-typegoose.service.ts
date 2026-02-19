import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import type { ReturnModelType } from '@typegoose/typegoose';
import { ExampleTypegooseEntity } from '../../@core/entity/example-typegoose.entity';

@Injectable()
export class ExampleTypegooseService {
  constructor(
    @InjectModel(ExampleTypegooseEntity.name)
    private readonly model: ReturnModelType<typeof ExampleTypegooseEntity>,
  ) {}

  async create(dto: { name: string; description?: string }) {
    const doc = await this.model.create({ name: dto.name, description: dto.description });
    return doc;
  }

  async findAll() {
    return this.model.find().lean().exec();
  }
}
