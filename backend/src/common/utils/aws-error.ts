export function getAwsErrorName(error: unknown): string {
  if (typeof error !== 'object' || error === null) {
    return '';
  }

  if ('name' in error && typeof error.name === 'string') {
    return error.name;
  }

  if ('Code' in error && typeof error.Code === 'string') {
    return error.Code;
  }

  return '';
}

export function isNoSuchBucket(error: unknown): boolean {
  const name = getAwsErrorName(error);
  return name === 'NoSuchBucket' || name === 'NotFound';
}
