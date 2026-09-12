import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { IdentifierError } from '../errors';
import { getAwsErrorName } from '../utils/aws-error';

@Catch()
export class AwsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AwsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof IdentifierError) {
      response.status(HttpStatus.BAD_REQUEST).json({
        statusCode: HttpStatus.BAD_REQUEST,
        message: exception.message,
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();

      if (typeof payload === 'string') {
        response.status(status).json({ statusCode: status, message: payload });
        return;
      }

      response.status(status).json(payload);
      return;
    }

    if (isMulterError(exception)) {
      const tooLarge = exception.code === 'LIMIT_FILE_SIZE';
      response
        .status(
          tooLarge ? HttpStatus.PAYLOAD_TOO_LARGE : HttpStatus.BAD_REQUEST,
        )
        .json({
          statusCode: tooLarge
            ? HttpStatus.PAYLOAD_TOO_LARGE
            : HttpStatus.BAD_REQUEST,
          message: tooLarge
            ? 'The uploaded file is too large.'
            : 'The upload is invalid.',
        });
      return;
    }

    const awsName = getAwsErrorName(exception);
    const mapped = mapAwsError(awsName);

    this.logger.error(
      `Unhandled error (${awsName || 'unknown'})`,
      exception instanceof Error ? exception.stack : undefined,
    );

    response.status(mapped.status).json({
      statusCode: mapped.status,
      message: mapped.message,
    });
  }
}

function isMulterError(
  error: unknown,
): error is { name: string; code: string } {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'MulterError' &&
    'code' in error &&
    typeof error.code === 'string'
  );
}

function mapAwsError(name: string): { status: number; message: string } {
  switch (name) {
    case 'BucketAlreadyExists':
    case 'BucketAlreadyOwnedByYou':
      return { status: HttpStatus.CONFLICT, message: 'Bucket already exists.' };
    case 'NoSuchBucket':
      return { status: HttpStatus.NOT_FOUND, message: 'Bucket not found.' };
    case 'NoSuchKey':
    case 'NotFound':
      return { status: HttpStatus.NOT_FOUND, message: 'Object not found.' };
    case 'AccessDenied':
    case 'AccessDeniedException':
    case 'Forbidden':
      return { status: HttpStatus.FORBIDDEN, message: 'Access denied.' };
    case 'InvalidBucketName':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: 'Bucket name is invalid.',
      };
    case 'EntityTooLarge':
      return {
        status: HttpStatus.PAYLOAD_TOO_LARGE,
        message: 'The uploaded file is too large.',
      };
    case 'SlowDown':
    case 'ServiceUnavailable':
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: 'AWS is busy. Try again shortly.',
      };
    default:
      return {
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: 'Something went wrong.',
      };
  }
}
