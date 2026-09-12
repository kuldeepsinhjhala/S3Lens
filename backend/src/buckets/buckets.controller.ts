import { Body, Controller, Delete, Get, Post } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { BucketName } from '../common/pipes/bucket-name.pipe';
import { BucketsService } from './buckets.service';
import { CreateBucketDto } from './dto/create-bucket.dto';

@ApiTags('buckets')
@Controller('buckets')
export class BucketsController {
  constructor(private readonly bucketsService: BucketsService) {}

  @Get()
  @ApiOperation({
    summary: 'List S3 buckets and matching CloudFront distributions',
  })
  list() {
    return this.bucketsService.listBuckets();
  }

  @Post()
  @ApiOperation({
    summary: 'Create an S3 bucket with a dedicated CloudFront distribution',
  })
  create(@Body() body: CreateBucketDto) {
    return this.bucketsService.createBucket(body.name);
  }

  @Get(':bucketName')
  @ApiOperation({ summary: 'Get one bucket and its CloudFront details' })
  @ApiParam({ name: 'bucketName' })
  get(@BucketName() bucketName: string) {
    return this.bucketsService.getBucket(bucketName);
  }

  @Delete(':bucketName')
  @ApiOperation({
    summary: 'Delete an empty bucket and disable its CloudFront distribution',
  })
  @ApiParam({ name: 'bucketName' })
  remove(@BucketName() bucketName: string) {
    return this.bucketsService.deleteBucket(bucketName);
  }
}
