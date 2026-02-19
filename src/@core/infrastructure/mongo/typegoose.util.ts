import { getModelForClass } from '@typegoose/typegoose';

/**
 * Registra um modelo Typegoose no MongooseModule do NestJS.
 * Uso: MongooseModule.forFeature([...typegooseForFeature(MyEntity)]).
 */
export function typegooseForFeature<T>(cl: any) {
  const model = getModelForClass(cl);
  return { name: model.modelName, schema: model.schema };
}
