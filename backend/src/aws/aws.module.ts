import { Module } from '@nestjs/common';
import { S3ClientService } from './s3.client';
import { CloudFrontClientService } from './cloudfront.client';
import { StsClientService } from './sts.client';

@Module({
  providers: [S3ClientService, CloudFrontClientService, StsClientService],
  exports: [S3ClientService, CloudFrontClientService, StsClientService],
})
export class AwsModule {}
