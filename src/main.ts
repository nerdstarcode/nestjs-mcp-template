import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
const logger = new Logger('Main');
async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.PORT ?? 3000, () => {
      logger.log(`🚀 Server is running on http://localhost:${process.env.PORT ?? 3000}`);
    });
  } catch (err) {
    logger.fatal(err)
  }
}
bootstrap();
