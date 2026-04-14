
import express from 'express';
import morgan from 'morgan';
import pinoHttp from 'pino-http';
import { logger } from './utils/logger';
import accountRoutes from './routes/accountRoutes';
import { errorHandler } from './middleware/errorHandler';

const app = express();

app.use(express.json());

app.use(morgan('dev'));

app.use(pinoHttp({ logger, autoLogging: false }));

app.use('/accounts', accountRoutes);

app.use(errorHandler);

export default app;