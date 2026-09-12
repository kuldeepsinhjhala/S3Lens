import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  CreateBucketCommand,
  type BucketLocationConstraint,
  DeleteBucketCommand,
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetBucketLocationCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  PutBucketPolicyCommand,
  PutPublicAccessBlockCommand,
  PutObjectCommand,
  S3Client,
  type ListObjectsV2CommandOutput,
} from '@aws-sdk/client-s3';
import { resolveBucketRegion } from '../common/utils/bucket';

export type ListedBucket = {
  name: string;
  region?: string;
};

@Injectable()
export class S3ClientService {
  private readonly clients = new Map<string, S3Client>();
  private readonly defaultRegion: string;

  constructor(private readonly configService: ConfigService) {
    this.defaultRegion =
      this.configService.get<string>('AWS_REGION') ?? 'ap-south-1';
  }

  getClient(region = this.defaultRegion): S3Client {
    const existing = this.clients.get(region);
    if (existing) {
      return existing;
    }

    const client = new S3Client({ region });
    this.clients.set(region, client);
    return client;
  }

  async getBucketRegion(bucketName: string): Promise<string> {
    const result = await this.getClient().send(
      new GetBucketLocationCommand({ Bucket: bucketName }),
    );

    return resolveBucketRegion(result.LocationConstraint);
  }

  async getClientForBucket(bucketName: string): Promise<S3Client> {
    const region = await this.getBucketRegion(bucketName);
    return this.getClient(region);
  }

  async listBuckets(): Promise<ListedBucket[]> {
    const result = await this.getClient().send(new ListBucketsCommand({}));

    return (result.Buckets ?? []).flatMap((item) => {
      if (!item.Name) {
        return [];
      }

      const region =
        'BucketRegion' in item && typeof item.BucketRegion === 'string'
          ? item.BucketRegion
          : undefined;

      return [{ name: item.Name, region }];
    });
  }

  async createBucket(bucketName: string, region: string): Promise<void> {
    const client = this.getClient(region);
    const isUsEast1 = region === 'us-east-1';

    await client.send(
      new CreateBucketCommand({
        Bucket: bucketName,
        ...(isUsEast1
          ? {}
          : {
              CreateBucketConfiguration: {
                LocationConstraint: region as BucketLocationConstraint,
              },
            }),
      }),
    );
  }

  async blockPublicAccess(bucketName: string, region: string): Promise<void> {
    await this.getClient(region).send(
      new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          IgnorePublicAcls: true,
          BlockPublicPolicy: true,
          RestrictPublicBuckets: true,
        },
      }),
    );
  }

  async putBucketPolicy(
    bucketName: string,
    region: string,
    policy: string,
  ): Promise<void> {
    await this.getClient(region).send(
      new PutBucketPolicyCommand({
        Bucket: bucketName,
        Policy: policy,
      }),
    );
  }

  async deleteBucket(bucketName: string): Promise<void> {
    const client = await this.getClientForBucket(bucketName);
    await client.send(new DeleteBucketCommand({ Bucket: bucketName }));
  }

  async listObjectsV2(params: {
    bucketName: string;
    prefix?: string;
    delimiter?: string;
    continuationToken?: string;
    maxKeys?: number;
  }): Promise<ListObjectsV2CommandOutput> {
    const client = await this.getClientForBucket(params.bucketName);
    return client.send(
      new ListObjectsV2Command({
        Bucket: params.bucketName,
        Prefix: params.prefix || undefined,
        Delimiter: params.delimiter,
        ContinuationToken: params.continuationToken,
        MaxKeys: params.maxKeys,
      }),
    );
  }

  async putObject(params: {
    bucketName: string;
    key: string;
    body: Buffer | string;
    contentType?: string;
  }): Promise<void> {
    const client = await this.getClientForBucket(params.bucketName);
    await client.send(
      new PutObjectCommand({
        Bucket: params.bucketName,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
      }),
    );
  }

  async deleteObject(bucketName: string, key: string): Promise<void> {
    const client = await this.getClientForBucket(bucketName);
    await client.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      }),
    );
  }

  async deleteObjects(bucketName: string, keys: string[]): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    const client = await this.getClientForBucket(bucketName);

    for (let index = 0; index < keys.length; index += 1000) {
      const chunk = keys.slice(index, index + 1000);
      const result = await client.send(
        new DeleteObjectsCommand({
          Bucket: bucketName,
          Delete: {
            Objects: chunk.map((Key) => ({ Key })),
            Quiet: false,
          },
        }),
      );

      if (result.Errors?.length) {
        const failed = result.Errors.map((item) => item.Key)
          .filter((key): key is string => Boolean(key))
          .join(', ');
        throw new Error(
          `Could not delete ${result.Errors.length} object(s)${failed ? `: ${failed}` : '.'}`,
        );
      }
    }
  }

  async listAllKeys(bucketName: string, prefix?: string): Promise<string[]> {
    const keys: string[] = [];
    let continuationToken: string | undefined;

    do {
      const result = await this.listObjectsV2({
        bucketName,
        prefix,
        continuationToken,
      });

      for (const object of result.Contents ?? []) {
        if (object.Key) {
          keys.push(object.Key);
        }
      }

      continuationToken = result.IsTruncated
        ? result.NextContinuationToken
        : undefined;
    } while (continuationToken);

    return keys;
  }
}
