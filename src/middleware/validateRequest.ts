
import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { logger } from '../utils/logger';

export const validateRequest = (schema: ZodSchema) => {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                const errorMessages = error.issues.map((err) => `${err.path.join('.')}: ${err.message}`);

                logger.warn({ message: 'Validation failed', errors: errorMessages, path: req.originalUrl });

                res.status(400).json({
                    status: 'error',
                    message: 'Invalid request data',
                    details: errorMessages
                });
                return;
            }
            next(error);
        }
    };
};