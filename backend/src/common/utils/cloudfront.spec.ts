import {
  bucketNameFromOriginDomain,
  buildCloudFrontUrl,
  mapCloudFrontStatus,
  originDomainForBucket,
} from './cloudfront';

describe('cloudfront utils', () => {
  it('builds a CloudFront URL without encoding slashes', () => {
    expect(
      buildCloudFrontUrl(
        'd2dhxmagz6qgkm.cloudfront.net',
        'images/1775324451804-kuldeep.png',
      ),
    ).toBe(
      'https://d2dhxmagz6qgkm.cloudfront.net/images/1775324451804-kuldeep.png',
    );
  });

  it('encodes spaces in key segments', () => {
    expect(
      buildCloudFrontUrl('d123.cloudfront.net', 'images/my file.png'),
    ).toBe('https://d123.cloudfront.net/images/my%20file.png');
  });

  it('extracts the bucket name from regional and global S3 origins', () => {
    expect(
      bucketNameFromOriginDomain(
        'kuldeepsinhjhala-portfolio-prod-s3.s3.ap-south-1.amazonaws.com',
      ),
    ).toBe('kuldeepsinhjhala-portfolio-prod-s3');

    expect(bucketNameFromOriginDomain('documents.s3.amazonaws.com')).toBe(
      'documents',
    );
  });

  it('returns null for unrelated origins', () => {
    expect(bucketNameFromOriginDomain('example.com')).toBeNull();
  });

  it('builds the origin domain used when creating a distribution', () => {
    expect(originDomainForBucket('docs', 'ap-south-1')).toBe(
      'docs.s3.ap-south-1.amazonaws.com',
    );
    expect(originDomainForBucket('docs', 'us-east-1')).toBe(
      'docs.s3.amazonaws.com',
    );
  });

  it('maps disabled distributions to a Disabling status', () => {
    expect(mapCloudFrontStatus('Deployed', false)).toBe('Disabling');
    expect(mapCloudFrontStatus('InProgress', true)).toBe('InProgress');
    expect(mapCloudFrontStatus('Deployed', true)).toBe('Deployed');
  });
});
