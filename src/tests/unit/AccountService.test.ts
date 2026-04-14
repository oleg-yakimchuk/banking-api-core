
import {describe, it, expect, beforeEach, vi, Mocked} from 'vitest';
import { AccountService } from '../../services/AccountService';
import { IAccountRepository } from '../../interfaces/IAccountRepository';
import {
    AccountNotFoundException,
    AccountBlockedException,
    InsufficientFundsException,
    PersonNotFoundException
} from '../../exceptions/AccountExceptions';

describe('AccountService Unit Tests', () => {
    let accountService: AccountService;
    let mockRepo: Mocked<IAccountRepository>;

    beforeEach(() => {
        mockRepo = {
            findById: vi.fn(),
            createAccount: vi.fn(),
            executeFinancialTransaction: vi.fn(),
            updateAccountStatus: vi.fn(),
            getStatement: vi.fn(),
            checkPersonExists: vi.fn()
        };

        accountService = new AccountService(mockRepo);
    });

    describe('createAccount()', () => {
        it('should create an account if person exists', async () => {
            mockRepo.checkPersonExists.mockResolvedValue(true);
            mockRepo.createAccount.mockResolvedValue(99);

            const result = await accountService.createAccount(1, 500, 1);

            expect(result.accountId).toBe(99);
            expect(mockRepo.createAccount).toHaveBeenCalledWith(1, 500, 1);
        });

        it('should throw PersonNotFoundException if person does not exist', async () => {
            mockRepo.checkPersonExists.mockResolvedValue(false);

            await expect(accountService.createAccount(999, 500, 1))
                .rejects.toThrow(PersonNotFoundException);
        });
    });

    describe('deposit()', () => {
        it('should deposit money into an active account', async () => {
            mockRepo.findById.mockResolvedValue({ balance: 100, activeFlag: 1 });
            mockRepo.executeFinancialTransaction.mockResolvedValue();

            const result = await accountService.deposit(1, 50);

            expect(result.newBalance).toBe(150);
            expect(mockRepo.executeFinancialTransaction).toHaveBeenCalledWith(1, 50, 'DEPOSIT');
        });

        it('should throw AccountNotFoundException for invalid account', async () => {
            mockRepo.findById.mockResolvedValue(undefined);

            await expect(accountService.deposit(999, 50))
                .rejects.toThrow(AccountNotFoundException);
        });

        it('should throw AccountBlockedException if account is blocked', async () => {
            mockRepo.findById.mockResolvedValue({ balance: 100, activeFlag: 0 });

            await expect(accountService.deposit(1, 50))
                .rejects.toThrow(AccountBlockedException);
        });
    });

    describe('withdraw()', () => {
        it('should process a valid withdrawal', async () => {
            mockRepo.findById.mockResolvedValue({
                balance: 500,
                activeFlag: 1,
                dailyWithdrawalLimit: 1000
            });
            mockRepo.executeFinancialTransaction.mockResolvedValue();

            const result = await accountService.withdraw(1, 200);

            expect(result.newBalance).toBe(300);
            expect(mockRepo.executeFinancialTransaction).toHaveBeenCalledWith(1, 200, 'WITHDRAWAL');
        });

        it('should throw InsufficientFundsException if balance is too low', async () => {
            mockRepo.findById.mockResolvedValue({
                balance: 100,
                activeFlag: 1,
                dailyWithdrawalLimit: 1000
            });

            await expect(accountService.withdraw(1, 200))
                .rejects.toThrow(InsufficientFundsException);
        });

        it('should throw InsufficientFundsException if amount exceeds daily limit', async () => {
            mockRepo.findById.mockResolvedValue({
                balance: 5000,
                activeFlag: 1,
                dailyWithdrawalLimit: 500
            });

            await expect(accountService.withdraw(1, 600))
                .rejects.toThrow(/exceeds daily withdrawal limit/);
        });

        it('should throw AccountBlockedException if account is blocked', async () => {
            mockRepo.findById.mockResolvedValue({ balance: 500, activeFlag: 0 });

            await expect(accountService.withdraw(1, 100))
                .rejects.toThrow(AccountBlockedException);
        });
    });

    describe('toggleAccountStatus()', () => {
        it('should block an active account', async () => {
            mockRepo.findById.mockResolvedValue({ activeFlag: 1 });
            mockRepo.updateAccountStatus.mockResolvedValue();

            const result = await accountService.toggleAccountStatus(1, true, 'Fraud suspicion');

            expect(result.message).toContain('blocked');
            expect(mockRepo.updateAccountStatus).toHaveBeenCalledWith(1, true, 'Fraud suspicion');
        });

        it('should unblock a blocked account', async () => {
            mockRepo.findById.mockResolvedValue({ activeFlag: 0 });
            mockRepo.updateAccountStatus.mockResolvedValue();

            const result = await accountService.toggleAccountStatus(1, false, 'Cleared');

            expect(result.message).toContain('unblocked');
            expect(mockRepo.updateAccountStatus).toHaveBeenCalledWith(1, false, 'Cleared');
        });
    });

    describe('getBalance()', () => {
        it('should return balance for a valid account', async () => {
            mockRepo.findById.mockResolvedValue({ balance: 750, activeFlag: 1 });

            const result = await accountService.getBalance(1);

            expect(result.balance).toBe(750);
            expect(result.active).toBe(true);
            expect(mockRepo.findById).toHaveBeenCalledWith(1);
        });

        it('should throw AccountNotFoundException for invalid account', async () => {
            mockRepo.findById.mockResolvedValue(undefined);

            await expect(accountService.getBalance(999))
                .rejects.toThrow(AccountNotFoundException);
        });
    });

    describe('getStatement()', () => {
        it('should return a statement with transactions', async () => {
            mockRepo.findById.mockResolvedValue({ activeFlag: 1 });
            mockRepo.getStatement.mockResolvedValue([
                { transactionId: 1, value: 500, type: 'DEPOSIT' }
            ]);

            const result = await accountService.getStatement(1, '2023-01-01', '2023-12-31');

            expect(result.transactionCount).toBe(1);
            expect(result.transactions[0].value).toBe(500);
            expect(mockRepo.getStatement).toHaveBeenCalledWith(1, '2023-01-01', '2023-12-31');
        });

        it('should throw AccountNotFoundException for invalid account', async () => {
            mockRepo.findById.mockResolvedValue(undefined);

            await expect(accountService.getStatement(999))
                .rejects.toThrow(AccountNotFoundException);
        });
    });
});