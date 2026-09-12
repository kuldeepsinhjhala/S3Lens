import { ConflictException, Injectable } from '@nestjs/common';
import { S3ClientService } from '../aws/s3.client';
import { validateBucketName } from '../common/utils/bucket';
import {
  buildFolderKey,
  folderDisplayName,
  requireFolderPrefix,
} from '../common/utils/filename';

@Injectable()
export class FoldersService {
  constructor(private readonly s3Client: S3ClientService) {}

  async createFolder(
    bucketName: string,
    prefix: string | undefined,
    name: string,
  ): Promise<{ folder: { key: string; name: string } }> {
    const bucket = validateBucketName(bucketName);
    const key = buildFolderKey(prefix, name);

    await this.s3Client.putObject({
      bucketName: bucket,
      key,
      body: '',
      contentType: 'application/x-directory',
    });

    return {
      folder: {
        key,
        name: folderDisplayName(key),
      },
    };
  }

  async deleteFolder(
    bucketName: string,
    prefixInput: string,
    recursive = false,
  ): Promise<{ success: true }> {
    const bucket = validateBucketName(bucketName);
    const prefix = requireFolderPrefix(prefixInput);
    const keys = await this.s3Client.listAllKeys(bucket, prefix);
    const children = keys.filter((key) => key !== prefix);

    if (!recursive && children.length > 0) {
      throw new ConflictException({
        statusCode: 409,
        message: `Folder is not empty. This folder contains ${children.length} objects.`,
        objectCount: children.length,
      });
    }

    if (recursive) {
      await this.s3Client.deleteObjects(bucket, keys);
    } else if (keys.includes(prefix)) {
      await this.s3Client.deleteObject(bucket, prefix);
    }

    return { success: true };
  }
}
