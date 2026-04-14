import express from 'express';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import accountRoutes from './routes/accountRoutes';
import transactionRoutes from './routes/transactionRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

/**
 * Logging Configuration
 * Using Morgan's 'combined' format for detailed Apache-style access logs.
 */
if (process.env.NODE_ENV !== 'test' || process.env.LOG_LEVEL === 'debug') {
    app.use(morgan('combined'));
}

app.use(pinoHttp({ logger, autoLogging: false }));

app.use('/accounts', accountRoutes);
app.use('/transactions', transactionRoutes); // New transaction router mounted here

app.use(errorHandler);

export default app;