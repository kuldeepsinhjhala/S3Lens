import { IdentifierError } from '../errors';

const FILENAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._()-]*$/;
const FOLDER_NAME_PATTERN = /^[A-Za-z0-9][A-Za-z0-9 ._()-]*$/;
const MAX_FILENAME_LENGTH = 255;
const MAX_KEY_LENGTH = 1024;

const MIME_BY_EXTENSION: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  avif: 'image/avif',
  pdf: 'application/pdf',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  json: 'application/json',
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  zip: 'application/zip',
  csv: 'text/csv',
  md: 'text/markdown',
  xml: 'application/xml',
  woff: 'font/woff',
  woff2: 'font/woff2',
};

export function normalizePrefix(prefix: string | undefined | null): string {
  if (!prefix) {
    return '';
  }

  let value = prefix.replace(/\\/g, '/').trim();
  value = value.replace(/^\/+/, '');

  if (!value) {
    return '';
  }

  if (value.includes('\0') || value.split('/').includes('..')) {
    throw new IdentifierError('Prefix must stay within the current location.');
  }

  if (!value.endsWith('/')) {
    value += '/';
  }

  return value;
}

export function requireFolderPrefix(prefix: string | undefined | null): string {
  const value = normalizePrefix(prefix);
  if (!value) {
    throw new IdentifierError('A folder prefix is required.');
  }
  return value;
}

export function validateFilename(filename: string): string {
  const name = filename.trim();

  if (!name) {
    throw new IdentifierError('Filename is required.');
  }

  if (name.length > MAX_FILENAME_LENGTH) {
    throw new IdentifierError('Filename is too long.');
  }

  if (
    name.includes('/') ||
    name.includes('\\') ||
    name.includes('\0') ||
    name.includes('..') ||
    name === '.' ||
    name.startsWith('/')
  ) {
    throw new IdentifierError('Filename cannot contain path characters.');
  }

  if (!FILENAME_PATTERN.test(name)) {
    throw new IdentifierError(
      'Filename may only include letters, numbers, spaces, dots, hyphens, and underscores.',
    );
  }

  return name;
}

export function validateFolderName(name: string): string {
  const folderName = name.replace(/\\/g, '/').trim().replace(/\/+$/, '');

  if (!folderName) {
    throw new IdentifierError('Folder name is required.');
  }

  if (
    folderName.includes('/') ||
    folderName.includes('\0') ||
    folderName.includes('..') ||
    folderName === '.'
  ) {
    throw new IdentifierError('Folder name cannot contain path characters.');
  }

  if (!FOLDER_NAME_PATTERN.test(folderName)) {
    throw new IdentifierError(
      'Folder name may only include letters, numbers, spaces, dots, hyphens, and underscores.',
    );
  }

  return folderName;
}

export function buildFolderKey(
  prefix: string | undefined,
  name: string,
): string {
  const key = `${normalizePrefix(prefix)}${validateFolderName(name)}/`;
  assertKeyLength(key);
  return key;
}

export function buildUploadKey(
  prefix: string | undefined,
  filename: string,
  timestamp: number,
): string {
  const key = `${normalizePrefix(prefix)}${timestamp}-${validateFilename(filename)}`;
  assertKeyLength(key);
  return key;
}

export function validateObjectKey(key: string): string {
  const value = key.replace(/\\/g, '/').trim();

  if (!value) {
    throw new IdentifierError('Object key is required.');
  }

  if (
    value.startsWith('/') ||
    value.includes('\0') ||
    value.split('/').includes('..')
  ) {
    throw new IdentifierError('Object key is invalid.');
  }

  assertKeyLength(value);
  return value;
}

export function objectDisplayName(key: string): string {
  const trimmed = key.endsWith('/') ? key.slice(0, -1) : key;
  const segments = trimmed.split('/');
  const last = segments[segments.length - 1];
  return last || key;
}

export function folderDisplayName(key: string): string {
  const normalized = key.endsWith('/') ? key : `${key}/`;
  const withoutTrailing = normalized.slice(0, -1);
  const segments = withoutTrailing.split('/');
  const last = segments[segments.length - 1] ?? '';
  return last ? `${last}/` : normalized;
}

export function inferContentType(filename: string): string | null {
  const dot = filename.lastIndexOf('.');
  if (dot < 0 || dot === filename.length - 1) {
    return null;
  }

  const extension = filename.slice(dot + 1).toLowerCase();
  return MIME_BY_EXTENSION[extension] ?? null;
}

function assertKeyLength(key: string): void {
  if (key.length > MAX_KEY_LENGTH) {
    throw new IdentifierError('The resulting S3 key is too long.');
  }
}
