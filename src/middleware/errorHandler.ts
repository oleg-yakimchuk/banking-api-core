
import { Request, Response, NextFunction } from 'express';
import { AppError } from '../exceptions/AppError';
import { logger } from '../utils/logger';

/** Global middleware to catch exceptions and format standard API error responses. */
export const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    if (err instanceof AppError) {
        logger.warn({
            message: err.message,
            statusCode: err.statusCode,
            path: req.originalUrl
        });

        res.status(err.statusCode).json({
            status: 'error',
            message: err.message
        });
        return;
    }

    logger.error({
        message: 'CRITICAL UNEXPECTED ERROR',
        error: err.message,
        stack: err.stack,
        path: req.originalUrl
    });

    res.status(500).json({
        status: 'error',
        message: 'An internal server error occurred.'
    });
};