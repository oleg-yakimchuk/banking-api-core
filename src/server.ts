
import app from './app';
import { logger } from './utils/logger';
import './database/db';

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    logger.info(`Banking API is live and running on http://localhost:${PORT}`);
});