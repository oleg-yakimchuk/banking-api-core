
import { db } from '../database/db';

export class AccountRepository {


    async findById(accountId: number): Promise<any> {
        return new Promise((resolve, reject) => {
            db.get(`SELECT * FROM accounts WHERE accountId = ?`, [accountId], (err, row) => {
                if (err) reject(err);
                else resolve(row);
            });
        });
    }

    async createAccount(personId: number, dailyLimit: number, accountType: number): Promise<number> {
        return new Promise((resolve, reject) => {
            db.run(
                `INSERT INTO accounts (personId, dailyWithdrawalLimit, accountType) VALUES (?, ?, ?)`,
                [personId, dailyLimit, accountType],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.lastID); // Returns the newly created accountId
                }
            );
        });
    }

    async executeFinancialTransaction(accountId: number, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL'): Promise<void> {
        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                const balanceChange = type === 'DEPOSIT' ? amount : -amount;

                db.run(`UPDATE accounts SET balance = balance + ? WHERE accountId = ?`, [balanceChange, accountId], (err) => {
                    if (err) return db.run('ROLLBACK', () => reject(err));
                });

                db.run(`INSERT INTO transactions (accountId, value, type) VALUES (?, ?, ?)`, [accountId, amount, type], (err) => {
                    if (err) return db.run('ROLLBACK', () => reject(err));
                });

                db.run('COMMIT', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }

    async updateAccountStatus(accountId: number, isBlocked: boolean, reason: string): Promise<void> {
        const flag = isBlocked ? 0 : 1;
        const action = isBlocked ? 'BLOCK' : 'UNBLOCK';

        return new Promise((resolve, reject) => {
            db.serialize(() => {
                db.run('BEGIN TRANSACTION');

                db.run(`UPDATE accounts SET activeFlag = ? WHERE accountId = ?`, [flag, accountId], (err) => {
                    if (err) return db.run('ROLLBACK', () => reject(err));
                });

                db.run(`INSERT INTO audit_logs (accountId, action, reason) VALUES (?, ?, ?)`, [accountId, action, reason], (err) => {
                    if (err) return db.run('ROLLBACK', () => reject(err));
                });

                db.run('COMMIT', (err) => {
                    if (err) reject(err);
                    else resolve();
                });
            });
        });
    }
}