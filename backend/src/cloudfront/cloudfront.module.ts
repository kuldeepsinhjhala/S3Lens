import { Module } from '@nestjs/common';
import { AwsModule } from '../aws/aws.module';
import { CloudfrontService } from './cloudfront.service';

@Module({
  imports: [AwsModule],
  providers: [CloudfrontService],
  exports: [CloudfrontService],
})
export class CloudfrontModule {}
