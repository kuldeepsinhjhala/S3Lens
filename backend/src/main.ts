import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { configureApp } from './app.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  configureApp(app);

  const config = app.get(ConfigService);
  const port = config.get<string>('PORT') ?? '4000';
  const host = config.get<string>('HOST') ?? 'localhost';
  await app.listen(port, host);
}

void bootstrap();
