import { Request, Response, NextFunction } from 'express';

/**
 * Wraps asynchronous Express route handlers to automatically catch errors
 * and pass them to the global error handling middleware.
 * This eliminates the need for repetitive try/catch blocks in controllers.
 */
export const catchAsync = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};