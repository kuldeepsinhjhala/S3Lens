import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsModule } from './aws/aws.module';
import { BucketsModule } from './buckets/buckets.module';
import { CloudfrontModule } from './cloudfront/cloudfront.module';
import { validateEnv } from './common/config/env';
import { FoldersModule } from './folders/folders.module';
import { HealthController } from './health.controller';
import { ObjectsModule } from './objects/objects.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validate: validateEnv,
    }),
    AwsModule,
    CloudfrontModule,
    BucketsModule,
    ObjectsModule,
    FoldersModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
