const DEFAULT_UPLOAD_BYTES = 26_214_400;

export function validateEnv(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const accessKey = config.AWS_ACCESS_KEY_ID;
  const secretKey = config.AWS_SECRET_ACCESS_KEY;

  if (typeof accessKey !== 'string' || !accessKey.trim()) {
    throw new Error('AWS_ACCESS_KEY_ID is required.');
  }

  if (typeof secretKey !== 'string' || !secretKey.trim()) {
    throw new Error('AWS_SECRET_ACCESS_KEY is required.');
  }

  return config;
}

export function parseMaxUploadBytes(value: string | undefined): number {
  if (!value) {
    return DEFAULT_UPLOAD_BYTES;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_UPLOAD_BYTES;
  }

  return parsed;
}
