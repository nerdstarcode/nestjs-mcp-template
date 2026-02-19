import { modelOptions, prop } from '@typegoose/typegoose';

@modelOptions({ schemaOptions: { collection: 'examples', timestamps: true } })
export class ExampleTypegooseEntity {
  @prop({ required: true })
  name!: string;

  @prop({ default: false })
  active!: boolean;

  @prop()
  description?: string;
}
