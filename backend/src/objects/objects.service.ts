import { BadRequestException, Injectable } from '@nestjs/common';
import { S3ClientService } from '../aws/s3.client';
import { CloudfrontService } from '../cloudfront/cloudfront.service';
import type { FolderEntry, ObjectEntry } from '../common/types';
import { validateBucketName } from '../common/utils/bucket';
import { buildCloudFrontUrl } from '../common/utils/cloudfront';
import {
  buildUploadKey,
  inferContentType,
  objectDisplayName,
  folderDisplayName,
  normalizePrefix,
  validateObjectKey,
} from '../common/utils/filename';

@Injectable()
export class ObjectsService {
  constructor(
    private readonly s3Client: S3ClientService,
    private readonly cloudfrontService: CloudfrontService,
  ) {}

  async listObjects(
    bucketName: string,
    prefixInput?: string,
    continuationToken?: string,
  ): Promise<{
    prefix: string;
    folders: FolderEntry[];
    files: ObjectEntry[];
    nextContinuationToken: string | null;
    isTruncated: boolean;
  }> {
    const name = validateBucketName(bucketName);
    const prefix = normalizePrefix(prefixInput);
    const cloudFront =
      await this.cloudfrontService.findDistributionForBucket(name);

    const result = await this.s3Client.listObjectsV2({
      bucketName: name,
      prefix,
      delimiter: '/',
      continuationToken,
    });

    const folders = (result.CommonPrefixes ?? [])
      .map((item) => item.Prefix)
      .filter((value): value is string => Boolean(value))
      .map((key) => ({
        key,
        name: folderDisplayName(key),
      }));

    const files = (result.Contents ?? []).flatMap((item) => {
      const key = item.Key;
      if (!key || key === prefix || key.endsWith('/')) {
        return [];
      }

      const displayName = objectDisplayName(key);
      return [
        {
          key,
          name: displayName,
          size: item.Size ?? 0,
          lastModified: item.LastModified
            ? item.LastModified.toISOString()
            : null,
          contentType: inferContentType(displayName),
          url: cloudFront.domain
            ? buildCloudFrontUrl(cloudFront.domain, key)
            : null,
        },
      ];
    });

    return {
      prefix,
      folders,
      files,
      nextContinuationToken: result.NextContinuationToken ?? null,
      isTruncated: Boolean(result.IsTruncated),
    };
  }

  async uploadObject(params: {
    bucketName: string;
    file: Express.Multer.File;
    prefix?: string;
    filename: string;
  }): Promise<{ object: ObjectEntry }> {
    if (!params.file?.buffer) {
      throw new BadRequestException('A file is required.');
    }

    const bucketName = validateBucketName(params.bucketName);
    const timestamp = Date.now();
    const key = buildUploadKey(params.prefix, params.filename, timestamp);
    const contentType =
      params.file.mimetype &&
      params.file.mimetype !== 'application/octet-stream'
        ? params.file.mimetype
        : inferContentType(params.filename);

    await this.s3Client.putObject({
      bucketName,
      key,
      body: params.file.buffer,
      contentType: contentType ?? undefined,
    });

    const cloudFront =
      await this.cloudfrontService.findDistributionForBucket(bucketName);

    return {
      object: {
        key,
        name: objectDisplayName(key),
        size: params.file.size,
        lastModified: new Date().toISOString(),
        contentType,
        url: cloudFront.domain
          ? buildCloudFrontUrl(cloudFront.domain, key)
          : null,
      },
    };
  }

  async deleteObject(
    bucketName: string,
    keyInput: string,
  ): Promise<{ success: true }> {
    const name = validateBucketName(bucketName);
    const key = validateObjectKey(keyInput);
    await this.s3Client.deleteObject(name, key);
    return { success: true };
  }
}
