import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Wraps an async route handler to properly handle TypeScript types
 * and ensures that any thrown errors are passed to next()
 */
export const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}; 