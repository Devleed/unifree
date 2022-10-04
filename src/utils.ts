import { HttpException, HttpStatus } from '@nestjs/common';

export const throwError = (error: any, message?: string) => {
  error =
    (error?.response && error?.response.data?.error
      ? error?.response?.data?.error
      : error?.response?.data) ||
    error?.data ||
    error;

  console.error(`${message || 'error '} ===`, error);

  if (error.code === 11000) {
    throw new HttpException(
      {
        status: HttpStatus.CONFLICT,
        message: 'Mongo duplicate key error',
      },
      HttpStatus.CONFLICT,
    );
  }

  const status =
    error.status &&
    (typeof error.status === 'string' || typeof error.status === 'number')
      ? error.status
      : typeof error.status === 'object'
      ? error.status.status
        ? error.status.status
        : error.code || HttpStatus.INTERNAL_SERVER_ERROR
      : error.code || HttpStatus.INTERNAL_SERVER_ERROR;

  const receivedMessage =
    typeof error.status === 'object'
      ? error.status.message ||
        error.status.error ||
        error.message ||
        'Internal server error'
      : error.message || 'Internal server error';

  throw new HttpException(
    {
      status,
      message: receivedMessage,
    },
    status,
  );
};
