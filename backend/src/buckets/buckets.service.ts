import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3ClientService } from '../aws/s3.client';
import { CloudfrontService } from '../cloudfront/cloudfront.service';
import {
  EMPTY_CLOUDFRONT,
  type Bucket,
  type CloudFrontInfo,
} from '../common/types';
import { isNoSuchBucket } from '../common/utils/aws-error';
import {
  isProtectedBucket,
  parseProtectedBuckets,
  resolveBucketRegion,
  validateBucketName,
} from '../common/utils/bucket';

@Injectable()
export class BucketsService {
  private readonly logger = new Logger(BucketsService.name);
  private readonly defaultRegion: string;
  private readonly protectedBuckets: string[];

  constructor(
    private readonly s3Client: S3ClientService,
    private readonly cloudfrontService: CloudfrontService,
    configService: ConfigService,
  ) {
    this.defaultRegion =
      configService.get<string>('DEFAULT_BUCKET_REGION') ??
      configService.get<string>('AWS_REGION') ??
      'ap-south-1';
    this.protectedBuckets = parseProtectedBuckets(
      configService.get<string>('PROTECTED_BUCKETS'),
    );
  }

  async listBuckets(): Promise<{ buckets: Bucket[] }> {
    const listed = await this.s3Client.listBuckets();
    const distributions =
      await this.cloudfrontService.mapDistributionsByBucket();

    const buckets = await Promise.all(
      listed.map(async (item) => {
        const region = item.region
          ? resolveBucketRegion(item.region)
          : await this.s3Client
              .getBucketRegion(item.name)
              .catch(() => this.defaultRegion);

        return {
          name: item.name,
          region,
          cloudFront: distributions.get(item.name) ?? EMPTY_CLOUDFRONT,
        };
      }),
    );

    return { buckets };
  }

  async getBucket(bucketName: string): Promise<{ bucket: Bucket }> {
    const name = validateBucketName(bucketName);
    const region = await this.readRegion(name);
    const cloudFront =
      await this.cloudfrontService.findDistributionForBucket(name);

    return {
      bucket: { name, region, cloudFront },
    };
  }

  async createBucket(name: string): Promise<{
    bucket: { name: string; region: string };
    cloudFront: CloudFrontInfo;
  }> {
    const bucketName = validateBucketName(name);
    const region = this.defaultRegion;

    await this.s3Client.createBucket(bucketName, region);

    try {
      await this.s3Client.blockPublicAccess(bucketName, region);
      const cloudFront =
        await this.cloudfrontService.createDistributionForBucket(
          bucketName,
          region,
        );

      return {
        bucket: { name: bucketName, region },
        cloudFront,
      };
    } catch (error) {
      await this.rollbackCreatedBucket(bucketName);
      throw error;
    }
  }

  async deleteBucket(bucketName: string): Promise<{
    success: boolean;
    cloudFront: CloudFrontInfo | { status: string };
  }> {
    const name = validateBucketName(bucketName);

    if (isProtectedBucket(name, this.protectedBuckets)) {
      throw new ForbiddenException(
        'This bucket is protected and cannot be deleted.',
      );
    }

    await this.readRegion(name);

    const keys = await this.s3Client.listAllKeys(name);
    if (keys.length > 0) {
      throw new ConflictException({
        statusCode: 409,
        message: `This bucket contains ${keys.length} objects. Empty the bucket before deletion.`,
        objectCount: keys.length,
      });
    }

    const cloudFront =
      await this.cloudfrontService.findDistributionForBucket(name);

    let cloudFrontResult: CloudFrontInfo | { status: string } = cloudFront;
    if (cloudFront.distributionId) {
      cloudFrontResult =
        await this.cloudfrontService.disableAndMaybeDeleteDistribution(
          cloudFront.distributionId,
        );
    }

    await this.s3Client.deleteBucket(name);

    return {
      success: true,
      cloudFront: cloudFrontResult,
    };
  }

  private async readRegion(bucketName: string): Promise<string> {
    try {
      return await this.s3Client.getBucketRegion(bucketName);
    } catch (error) {
      if (isNoSuchBucket(error)) {
        throw new NotFoundException('Bucket not found.');
      }
      throw error;
    }
  }

  private async rollbackCreatedBucket(bucketName: string): Promise<void> {
    try {
      await this.s3Client.deleteBucket(bucketName);
    } catch (error) {
      this.logger.error(
        `CloudFront setup failed and the new bucket ${bucketName} could not be deleted.`,
        error instanceof Error ? error.stack : undefined,
      );
      throw new InternalServerErrorException(
        'Bucket was created, but CloudFront setup failed. Delete the empty bucket in AWS if it is still there.',
      );
    }
  }
}
