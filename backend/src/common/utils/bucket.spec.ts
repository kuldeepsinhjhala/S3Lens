import {
  isProtectedBucket,
  parseProtectedBuckets,
  resolveBucketRegion,
  validateBucketName,
} from './bucket';
import { IdentifierError } from '../errors';

describe('bucket utils', () => {
  it('accepts a valid DNS bucket name', () => {
    expect(validateBucketName('kuldeep-documents')).toBe('kuldeep-documents');
  });

  it('rejects invalid bucket names', () => {
    expect(() => validateBucketName('AB')).toThrow(IdentifierError);
    expect(() => validateBucketName('My_Bucket')).toThrow(IdentifierError);
  });

  it('parses and matches protected buckets', () => {
    const protectedBuckets = parseProtectedBuckets(
      'kuldeepsinhjhala-portfolio-prod-s3, another-bucket',
    );

    expect(protectedBuckets).toEqual([
      'kuldeepsinhjhala-portfolio-prod-s3',
      'another-bucket',
    ]);
    expect(
      isProtectedBucket('kuldeepsinhjhala-portfolio-prod-s3', protectedBuckets),
    ).toBe(true);
    expect(
      isProtectedBucket('KuldeepSinhJhala-Portfolio-Prod-S3', protectedBuckets),
    ).toBe(true);
    expect(isProtectedBucket('kuldeep-documents', protectedBuckets)).toBe(
      false,
    );
  });

  it('resolves empty location constraints to us-east-1', () => {
    expect(resolveBucketRegion(undefined)).toBe('us-east-1');
    expect(resolveBucketRegion('EU')).toBe('eu-west-1');
    expect(resolveBucketRegion('ap-south-1')).toBe('ap-south-1');
  });
});
