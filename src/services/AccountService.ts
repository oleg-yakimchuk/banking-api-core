import { IAccountRepository } from '../interfaces/IAccountRepository';
import { IAccountService } from '../interfaces/IAccountService';
import {
    AccountNotFoundException,
    AccountBlockedException,
    InsufficientFundsException,
    PersonNotFoundException
} from '../exceptions/AccountExceptions';
import { logger } from '../utils/logger';

export class AccountService implements IAccountService {
    constructor(private accountRepo: IAccountRepository) {}

    /** Creates a new account, ensuring the associated person exists. */
    async createAccount(personId: number, dailyLimit: number, accountType: number) {
        logger.debug({ personId, dailyLimit, accountType }, 'Service: Starting account creation');

        const personExists = await this.accountRepo.checkPersonExists(personId);
        if (!personExists) {
            logger.debug({ personId }, 'Service: Account creation failed - Person not found');
            throw new PersonNotFoundException();
        }

        const accountId = await this.accountRepo.createAccount(personId, dailyLimit, accountType);
        logger.debug({ accountId, personId }, 'Service: Account created successfully');
        return { accountId, message: 'Account created successfully' };
    }
    /** Retrieves account balance and active status. */
    async getBalance(accountId: number) {
        logger.debug({ accountId }, 'Service: Fetching balance');

        const account = await this.accountRepo.findById(accountId);
        if (!account) {
            logger.debug({ accountId }, 'Service: Balance fetch failed - Account not found');
            throw new AccountNotFoundException();
        }

        logger.debug({ accountId, balance: account.balance }, 'Service: Balance fetched successfully');
        return { accountId, balance: account.balance, active: account.activeFlag === 1 };
    }
    /** Processes a deposit. Rejects if the account is blocked. */
    async deposit(accountId: number, amount: number) {
        logger.debug({ accountId, amount }, 'Service: Starting deposit');

        const account = await this.accountRepo.findById(accountId);
        if (!account) {
            logger.debug({ accountId }, 'Service: Deposit failed - Account not found');
            throw new AccountNotFoundException();
        }
        if (account.activeFlag === 0) {
            logger.debug({ accountId }, 'Service: Deposit failed - Account is blocked');
            throw new AccountBlockedException('Cannot deposit into a blocked account.');
        }

        await this.accountRepo.executeFinancialTransaction(accountId, amount, 'DEPOSIT');
        logger.debug({ accountId, amount, newBalance: account.balance + amount }, 'Service: Deposit successful');
        return { message: 'Deposit successful', newBalance: account.balance + amount };
    }
    /** Processes a withdrawal, validating balance, daily limits, and block status. */
    async withdraw(accountId: number, amount: number) {
        logger.debug({ accountId, amount }, 'Service: Starting withdrawal process');

        const account = await this.accountRepo.findById(accountId);
        if (!account) {
            logger.debug({ accountId }, 'Service: Withdrawal failed - Account not found');
            throw new AccountNotFoundException();
        }
        if (account.activeFlag === 0) {
            logger.debug({ accountId }, 'Service: Withdrawal failed - Account is blocked');
            throw new AccountBlockedException('Cannot withdraw from a blocked account.');
        }

        if (account.balance < amount) {
            logger.debug({ accountId, balance: account.balance, amount }, 'Service: Withdrawal failed - Insufficient overall funds');
            throw new InsufficientFundsException();
        }
        if (amount > account.dailyWithdrawalLimit) {
            logger.debug({ accountId, limit: account.dailyWithdrawalLimit, amount }, 'Service: Withdrawal failed - Exceeds daily limit');
            throw new InsufficientFundsException(`Amount exceeds daily withdrawal limit of ${account.dailyWithdrawalLimit}`);
        }

        await this.accountRepo.executeFinancialTransaction(accountId, amount, 'WITHDRAWAL');
        logger.debug({ accountId, amount }, 'Service: Withdrawal successful');

        return { message: 'Withdrawal successful', newBalance: account.balance - amount };
    }
    /** Blocks or unblocks an account for a specified reason. */
    async toggleAccountStatus(accountId: number, block: boolean, reason: string) {
        logger.debug({ accountId, block, reason }, 'Service: Toggling account status');

        const account = await this.accountRepo.findById(accountId);
        if (!account) {
            logger.debug({ accountId }, 'Service: Toggle status failed - Account not found');
            throw new AccountNotFoundException();
        }

        await this.accountRepo.updateAccountStatus(accountId, block, reason);
        logger.debug({ accountId, block }, 'Service: Account status toggled successfully');
        return { message: `Account successfully ${block ? 'blocked' : 'unblocked'}.` };
    }
    /** Retrieves transaction history, supporting optional date-range filters. */
    async getStatement(accountId: number, startDate?: string, endDate?: string) {
        logger.debug({ accountId, startDate, endDate }, 'Service: Fetching account statement');

        const account = await this.accountRepo.findById(accountId);
        if (!account) {
            logger.debug({ accountId }, 'Service: Statement fetch failed - Account not found');
            throw new AccountNotFoundException();
        }

        const transactions = await this.accountRepo.getStatement(accountId, startDate, endDate);
        logger.debug({ accountId, transactionCount: transactions.length }, 'Service: Statement fetched successfully');
        return {
            accountId,
            transactionCount: transactions.length,
            transactions
        };
    }
}