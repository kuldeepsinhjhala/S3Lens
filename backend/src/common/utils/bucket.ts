import { IdentifierError } from '../errors';

const BUCKET_NAME_PATTERN =
  /^(?!\d+\.\d+\.\d+\.\d+$)[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/;

export function validateBucketName(name: string): string {
  const bucketName = name.trim().toLowerCase();

  if (!bucketName) {
    throw new IdentifierError('Bucket name is required.');
  }

  if (bucketName.length < 3 || bucketName.length > 63) {
    throw new IdentifierError(
      'Bucket name must be between 3 and 63 characters.',
    );
  }

  if (
    bucketName.includes('..') ||
    bucketName.includes('.-') ||
    bucketName.includes('-.')
  ) {
    throw new IdentifierError('Bucket name format is invalid.');
  }

  if (!BUCKET_NAME_PATTERN.test(bucketName)) {
    throw new IdentifierError(
      'Bucket names must be DNS-compliant: lowercase letters, numbers, and hyphens.',
    );
  }

  return bucketName;
}

export function parseProtectedBuckets(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

export function isProtectedBucket(
  bucketName: string,
  protectedBuckets: string[],
): boolean {
  return protectedBuckets.includes(bucketName.toLowerCase());
}

export function resolveBucketRegion(
  locationConstraint: string | undefined | null,
): string {
  if (!locationConstraint) {
    return 'us-east-1';
  }

  if (locationConstraint === 'EU') {
    return 'eu-west-1';
  }

  return locationConstraint;
}
