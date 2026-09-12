import {
  buildFolderKey,
  buildUploadKey,
  inferContentType,
  normalizePrefix,
  objectDisplayName,
  requireFolderPrefix,
  validateFilename,
  validateFolderName,
  validateObjectKey,
} from './filename';
import { IdentifierError } from '../errors';

describe('filename utils', () => {
  describe('normalizePrefix', () => {
    it('returns empty string for blank input', () => {
      expect(normalizePrefix(undefined)).toBe('');
      expect(normalizePrefix('')).toBe('');
      expect(normalizePrefix('/')).toBe('');
    });

    it('strips a leading slash and ensures a trailing slash', () => {
      expect(normalizePrefix('images')).toBe('images/');
      expect(normalizePrefix('/images/certificates')).toBe(
        'images/certificates/',
      );
    });

    it('rejects parent-directory segments', () => {
      expect(() => normalizePrefix('images/../secret/')).toThrow(
        IdentifierError,
      );
    });
  });

  describe('requireFolderPrefix', () => {
    it('accepts a real folder prefix', () => {
      expect(requireFolderPrefix('images')).toBe('images/');
      expect(requireFolderPrefix('images/certificates/')).toBe(
        'images/certificates/',
      );
    });

    it('rejects root-equivalent prefixes so recursive delete cannot wipe a bucket', () => {
      expect(() => requireFolderPrefix(undefined)).toThrow(IdentifierError);
      expect(() => requireFolderPrefix('')).toThrow(IdentifierError);
      expect(() => requireFolderPrefix('/')).toThrow(IdentifierError);
      expect(() => requireFolderPrefix('   ')).toThrow(IdentifierError);
    });
  });

  describe('validateFilename', () => {
    it('allows the documented filename shapes', () => {
      expect(validateFilename('certificate.pdf')).toBe('certificate.pdf');
      expect(validateFilename('aws_certificate.pdf')).toBe(
        'aws_certificate.pdf',
      );
      expect(validateFilename('aws-certificate-2026.pdf')).toBe(
        'aws-certificate-2026.pdf',
      );
      expect(validateFilename('my document.pdf')).toBe('my document.pdf');
    });

    it('rejects path-like input', () => {
      expect(() => validateFilename('../../secret.txt')).toThrow(
        IdentifierError,
      );
      expect(() => validateFilename('/foo/bar.txt')).toThrow(IdentifierError);
      expect(() => validateFilename('folder/file.png')).toThrow(
        IdentifierError,
      );
    });
  });

  describe('validateFolderName', () => {
    it('accepts simple names and strips trailing slashes', () => {
      expect(validateFolderName('aws')).toBe('aws');
      expect(validateFolderName('2026/')).toBe('2026');
    });

    it('rejects nested paths', () => {
      expect(() => validateFolderName('a/b')).toThrow(IdentifierError);
    });
  });

  describe('key builders', () => {
    it('builds a nested folder marker key', () => {
      expect(buildFolderKey('images/certificates/', 'aws')).toBe(
        'images/certificates/aws/',
      );
    });

    it('builds an upload key with a server timestamp', () => {
      expect(
        buildUploadKey(
          'images/certificates/aws/',
          'aws-cloud-practitioner.pdf',
          1776000000000,
        ),
      ).toBe(
        'images/certificates/aws/1776000000000-aws-cloud-practitioner.pdf',
      );
    });

    it('validates object keys', () => {
      expect(validateObjectKey('images/file.png')).toBe('images/file.png');
      expect(() => validateObjectKey('../other')).toThrow(IdentifierError);
    });
  });

  describe('display and content type', () => {
    it('uses the stored object name including the timestamp', () => {
      expect(objectDisplayName('images/1775324451804-kuldeep.png')).toBe(
        '1775324451804-kuldeep.png',
      );
    });

    it('infers content types from extensions', () => {
      expect(inferContentType('photo.png')).toBe('image/png');
      expect(inferContentType('resume.pdf')).toBe('application/pdf');
      expect(inferContentType('noext')).toBeNull();
    });
  });
});
