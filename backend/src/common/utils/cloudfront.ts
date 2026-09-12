export function buildCloudFrontUrl(domain: string, key: string): string {
  const host = domain.replace(/^https?:\/\//, '').replace(/\/+$/, '');
  const path = key
    .split('/')
    .filter(
      (segment, index, parts) =>
        !(segment === '' && index === parts.length - 1),
    )
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  return `https://${host}/${path}`;
}

export function bucketNameFromOriginDomain(domainName: string): string | null {
  const host = domainName.trim().toLowerCase().replace(/\.$/, '');

  const patterns = [
    /\.s3-website[.-][\w-]+\.amazonaws\.com$/,
    /\.s3\.dualstack\.[\w-]+\.amazonaws\.com$/,
    /\.s3\.[\w-]+\.amazonaws\.com$/,
    /\.s3-[\w-]+\.amazonaws\.com$/,
    /\.s3\.amazonaws\.com$/,
  ];

  for (const pattern of patterns) {
    if (pattern.test(host)) {
      return host.replace(pattern, '');
    }
  }

  return null;
}

export function originDomainForBucket(
  bucketName: string,
  region: string,
): string {
  if (region === 'us-east-1') {
    return `${bucketName}.s3.amazonaws.com`;
  }

  return `${bucketName}.s3.${region}.amazonaws.com`;
}

export function mapCloudFrontStatus(
  status: string | undefined,
  enabled?: boolean,
): string | null {
  if (!status) {
    return null;
  }

  if (enabled === false) {
    return status === 'Deployed' ? 'Disabling' : 'InProgress';
  }

  return status;
}
