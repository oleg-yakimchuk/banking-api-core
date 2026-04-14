import pino from 'pino';

/**
 * Global application logger configured to read from environment variables.
 * Allows tech support to enable 'debug' or 'trace' levels dynamically in production.
 */
export const logger = pino({
    // Dynamically set the log level, defaulting to 'info' if not specified
    level: process.env.LOG_LEVEL || 'info',
    transport: {
        target: 'pino-pretty',
        options: {
            colorize: true,
            translateTime: 'SYS:standard',
        },
    },
});