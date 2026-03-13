import { Request, Response, NextFunction } from 'express';
import { ApiError } from './errorHandler';
import { env } from '../config/env';

export const auth = (req: Request, res: Response, next: NextFunction) => {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== env.API_KEY) {
    return next(new ApiError(401, 'Unauthorized', 'UNAUTHORIZED'));
  }

  next();
};
