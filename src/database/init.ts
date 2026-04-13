// src/database/init.ts
import { db } from './db';
import { logger } from '../utils/logger';

const initializeDatabase = () => {
    db.serialize(() => {
        // Persons Table
        db.run(`
            CREATE TABLE IF NOT EXISTS persons (
                personId INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                document TEXT NOT NULL UNIQUE,
                birthDate DATE NOT NULL
            )
        `);

        // Accounts Table
        db.run(`
            CREATE TABLE IF NOT EXISTS accounts (
                accountId INTEGER PRIMARY KEY AUTOINCREMENT,
                personId INTEGER NOT NULL,
                balance REAL DEFAULT 0.0,
                dailyWithdrawalLimit REAL NOT NULL,
                activeFlag INTEGER DEFAULT 1, -- 1 for active, 0 for blocked
                accountType INTEGER NOT NULL,
                createDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (personId) REFERENCES persons (personId)
            )
        `);

        // Transactions Table
        db.run(`
            CREATE TABLE IF NOT EXISTS transactions (
                transactionId INTEGER PRIMARY KEY AUTOINCREMENT,
                accountId INTEGER NOT NULL,
                value REAL NOT NULL,
                type TEXT NOT NULL, -- 'DEPOSIT' or 'WITHDRAWAL'
                transactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (accountId) REFERENCES accounts (accountId)
            )
        `);

        // Audit Table
        db.run(`
            CREATE TABLE IF NOT EXISTS audit_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                accountId INTEGER NOT NULL,
                action TEXT NOT NULL, -- 'BLOCK' or 'UNBLOCK'
                reason TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (accountId) REFERENCES accounts (accountId)
            )
        `);

        // 5. Seed Initial Person Data
        db.run(`
            INSERT OR IGNORE INTO persons (personId, name, document, birthDate)
            VALUES (1, 'Oleg Yakimchuk', 'DOC-123456789', '1990-01-01')
        `, (err) => {
            if (err) {
                logger.error({ error: err.message }, 'Error seeding initial person');
            } else {
                logger.info('Database tables created and initial Person seeded successfully.');
            }
        });
    });

    // Close the connection when the script finishes
    db.close();
};

initializeDatabase();