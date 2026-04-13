
import sqlite3 from 'sqlite3';
import { logger } from '../utils/logger';

const sqlite = sqlite3.verbose();

export const db = new sqlite.Database('./database.sqlite', (err) => {
    if (err) {
        logger.error({ message: 'Failed to connect to the database', error: err.message });
        process.exit(1);
    }
    logger.info('Connected to the SQLite database successfully.');
});


db.run('PRAGMA foreign_keys = ON', (err) => {
    if (err) logger.error('Failed to enable foreign key constraints');
});