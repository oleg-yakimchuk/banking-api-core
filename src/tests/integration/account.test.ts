
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

    describe('POST /accounts/:accountId/deposit (Deposits)', () => {
        it('should reject a negative deposit amount', async () => {
            const response = await request(app)
                .post(`/accounts/${testAccountId}/deposit`)
                .send({ amount: -50 });

            expect(response.status).toBe(400);
            expect(response.body.status).toBe('error');
        });

        it('should successfully deposit money into the account', async () => {
            const response = await request(app)
                .post(`/accounts/${testAccountId}/deposit`)
                .send({ amount: 500 });

            expect(response.status).toBe(200);
            expect(response.body.status).toBe('success');
            expect(response.body.data.newBalance).toBe(500);
        });
    });

    describe('POST /accounts/:accountId/withdraw (Withdrawals)', () => {
        it('should reject a withdrawal that exceeds the balance (Business Logic)', async () => {
            const response = await request(app)
                .post(`/accounts/${testAccountId}/withdraw`)
                .send({ amount: 9999 }); // They only have 500!

            expect(response.status).toBe(400);
            expect(response.body.message).toBe('Insufficient funds for this transaction.');
        });

        it('should successfully withdraw money', async () => {
            const response = await request(app)
                .post(`/accounts/${testAccountId}/withdraw`)
                .send({ amount: 100 });

            expect(response.status).toBe(200);
            expect(response.body.data.newBalance).toBe(400); // 500 - 100 = 400
        });
    });
});