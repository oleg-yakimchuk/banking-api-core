import pino from 'pino';

export const logger = pino({
    level: process.env.NODE_ENV === 'test' ? 'silent' : 'info',
    timestamp: pino.stdTimeFunctions.isoTime,
});