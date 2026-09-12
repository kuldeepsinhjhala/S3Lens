import { getAwsErrorName, isNoSuchBucket } from './aws-error';

describe('aws-error', () => {
  it('reads SDK name and Code fields', () => {
    expect(getAwsErrorName({ name: 'NoSuchBucket' })).toBe('NoSuchBucket');
    expect(getAwsErrorName({ Code: 'AccessDenied' })).toBe('AccessDenied');
    expect(getAwsErrorName('boom')).toBe('');
  });

  it('detects a missing bucket', () => {
    expect(isNoSuchBucket({ name: 'NoSuchBucket' })).toBe(true);
    expect(isNoSuchBucket({ name: 'NotFound' })).toBe(true);
    expect(isNoSuchBucket({ name: 'AccessDenied' })).toBe(false);
  });
});
