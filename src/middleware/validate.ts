import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { ApiError } from './errorHandler';

export const validate = (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: any) {
      next(new ApiError(400, error.errors[0].message, 'BAD_REQUEST'));
    }
  };
