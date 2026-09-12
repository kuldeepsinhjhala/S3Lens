import { Injectable, Param, PipeTransform } from '@nestjs/common';
import { validateBucketName } from '../utils/bucket';

@Injectable()
export class BucketNamePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    return validateBucketName(value);
  }
}

export const BucketName = () => Param('bucketName', BucketNamePipe);
