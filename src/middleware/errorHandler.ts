import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import { env } from '../config/env';

export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;
  code?: string;

  constructor(statusCode: number, message: string, code?: string, isOperational = true, stack = '') {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.code = code;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  let { statusCode, message, code } = err;

  if (!(err instanceof ApiError)) {
    statusCode = 500;
    message = 'Internal Server Error';
    code = 'INTERNAL_SERVER_ERROR';
  }

  res.locals.errorMessage = err.message;

  const response = {
    error: {
      message,
      code,
      statusCode,
      ...(env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  };

  logger.error(err);
  res.status(statusCode).send(response);
};
