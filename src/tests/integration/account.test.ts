
import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Account API Integration Tests', () => {

    let testAccountId: number;

    describe('POST /accounts (Account Creation)', () => {
        it('should reject account creation with invalid data (Zod Validation Shield)', async () => {
            const response = await request(app)
                .post('/accounts')
                .send({
                    personId: 1,
                    dailyWithdrawalLimit: -500,
                    accountType: 1
                });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
            expect(response.body.details[0]).toContain('greater than 0');
        });

        it('should successfully create a new account for an existing person', async () => {
            const response = await request(app)
                .post('/accounts')
                .send({
                    personId: 1,
                    dailyWithdrawalLimit: 1000,
                    accountType: 1
                });

            expect(response.status).toBe(201);
            expect(response.body.status).toBe('success');
            expect(response.body.data).toHaveProperty('accountId');

            testAccountId = response.body.data.accountId;
        });
    });

    describe('POST /transactions/:accountId/deposit (Deposits)', () => {
        it('should reject a negative deposit amount', async () => {
            const response = await request(app)
                .post(`/transactions/${testAccountId}/deposit`)
                .send({ amount: -50 });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
        });

        it('should successfully deposit money into the account', async () => {
            const response = await request(app)
                .post(`/transactions/${testAccountId}/deposit`)
                .send({ amount: 500 });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.newBalance).toBe(500);
        });
    });

    describe('POST /transactions/:accountId/withdraw (Withdrawals)', () => {
        it('should reject a withdrawal that exceeds the balance (Business Logic)', async () => {
            const response = await request(app)
                .post(`/transactions/${testAccountId}/withdraw`)
                .send({ amount: 9999 });

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Insufficient funds for this transaction.');
        });

        it('should successfully withdraw money', async () => {
            const response = await request(app)
                .post(`/transactions/${testAccountId}/withdraw`)
                .send({ amount: 100 });

            expect(response.status).toBe(200);
            expect(response.body.data.newBalance).toBe(400);
        });
    });

    describe('GET /accounts/:accountId/balance (Balance Inquiry)', () => {
        it('should return 400 if accountId is not a number (Zod Validation)', async () => {
            const response = await request(app).get('/accounts/apple/balance');
            expect(response.status).toBe(400);
        });

        it('should successfully retrieve the account balance', async () => {
            const response = await request(app).get(`/accounts/${testAccountId}/balance`);
            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('balance');
            expect(response.body.data.balance).toBe(400); // 500 deposit - 100 withdrawal
        });
    });

    describe('PATCH /accounts/:accountId/block (Account Blocking)', () => {
        it('should reject blocking if reason is missing (Zod Validation)', async () => {
            const response = await request(app)
                .patch(`/accounts/${testAccountId}/block`)
                .send({ block: true }); // Missing 'reason'

            expect(response.status).toBe(400);
            expect(response.body.details[0]).toContain('reason');
        });

        it('should successfully block the account', async () => {
            const response = await request(app)
                .patch(`/accounts/${testAccountId}/block`)
                .send({ block: true, reason: 'Suspicious activity detected' });

            expect(response.status).toBe(200);
            expect(response.body.data.message).toContain('blocked');
        });
    });

    describe('GET /transactions/:accountId/statement (Account Statement)', () => {
        it('should reject invalid date formats (Zod Validation)', async () => {
            const response = await request(app)
                .get(`/transactions/${testAccountId}/statement?startDate=01-01-2023`);

            expect(response.status).toBe(400);
        });

        it('should reject if startDate is after endDate (Zod Logic Refinement)', async () => {
            const response = await request(app)
                .get(`/transactions/${testAccountId}/statement?startDate=2024-12-31&endDate=2024-01-01`);

            expect(response.status).toBe(400);
            expect(response.body.details[0]).toContain('startDate must be before or equal to endDate');
        });

        it('should successfully retrieve the statement', async () => {
            const response = await request(app).get(`/transactions/${testAccountId}/statement`);

            expect(response.status).toBe(200);
            expect(response.body.data).toHaveProperty('transactions');
            expect(Array.isArray(response.body.data.transactions)).toBe(true);
            expect(response.body.data.transactionCount).toBe(2);
        });
    });
});