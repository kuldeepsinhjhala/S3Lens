import { Module } from '@nestjs/common';
import { AwsModule } from '../aws/aws.module';
import { CloudfrontModule } from '../cloudfront/cloudfront.module';
import { BucketsController } from './buckets.controller';
import { BucketsService } from './buckets.service';

@Module({
  imports: [AwsModule, CloudfrontModule],
  controllers: [BucketsController],
  providers: [BucketsService],
  exports: [BucketsService],
})
export class BucketsModule {}
