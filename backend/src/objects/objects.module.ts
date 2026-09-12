import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { AwsModule } from '../aws/aws.module';
import { CloudfrontModule } from '../cloudfront/cloudfront.module';
import { parseMaxUploadBytes } from '../common/config/env';
import { ObjectsController } from './objects.controller';
import { ObjectsService } from './objects.service';

@Module({
  imports: [
    AwsModule,
    CloudfrontModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        limits: {
          fileSize: parseMaxUploadBytes(
            configService.get<string>('MAX_UPLOAD_BYTES'),
          ),
          files: 1,
        },
      }),
    }),
  ],
  controllers: [ObjectsController],
  providers: [ObjectsService],
})
export class ObjectsModule {}
