import { parseMaxUploadBytes, validateEnv } from './env';

describe('env', () => {
  it('requires AWS keys', () => {
    expect(() => validateEnv({})).toThrow('AWS_ACCESS_KEY_ID');
    expect(() => validateEnv({ AWS_ACCESS_KEY_ID: 'akid' })).toThrow(
      'AWS_SECRET_ACCESS_KEY',
    );
    expect(
      validateEnv({
        AWS_ACCESS_KEY_ID: 'akid',
        AWS_SECRET_ACCESS_KEY: 'secret',
      }),
    ).toMatchObject({ AWS_ACCESS_KEY_ID: 'akid' });
  });

  it('parses a positive upload limit and falls back otherwise', () => {
    expect(parseMaxUploadBytes('1048576')).toBe(1_048_576);
    expect(parseMaxUploadBytes(undefined)).toBe(26_214_400);
    expect(parseMaxUploadBytes('0')).toBe(26_214_400);
    expect(parseMaxUploadBytes('nope')).toBe(26_214_400);
  });
});
