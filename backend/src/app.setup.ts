import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AwsExceptionFilter } from './common/filters/aws-exception.filter';

export function configureApp(app: INestApplication): void {
  const config = app.get(ConfigService);
  const origin = config.get<string>('CORS_ORIGIN') ?? 'http://localhost:3000';

  app.setGlobalPrefix('api');
  app.enableCors({
    origin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept'],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  app.useGlobalFilters(new AwsExceptionFilter());
  setupSwagger(app);
}

function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('S3Lens API')
    .setDescription(
      'Manage S3 buckets, objects, folders, and CloudFront distributions. AWS is the source of truth; there is no database.',
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });
}
