import { IAccountRepository } from '../interfaces/IAccountRepository';
import { IAccountService } from '../interfaces/IAccountService';
import { AccountRepository } from '../repositories/AccountRepository';
import {
    AccountNotFoundException,
    AccountBlockedException,
    InsufficientFundsException,
    PersonNotFoundException
} from '../exceptions/AccountExceptions';

export class AccountService implements IAccountService{
    constructor(private accountRepo: IAccountRepository) {}

    async getStatement(accountId: number, startDate?: string, endDate?: string) {
        const account = await this.accountRepo.findById(accountId);
        if (!account) throw new AccountNotFoundException();

        const transactions = await this.accountRepo.getStatement(accountId, startDate, endDate);
        return {
            accountId,
            transactionCount: transactions.length,
            transactions
        };
    }

    async createAccount(personId: number, dailyLimit: number, accountType: number) {
        const personExists = await this.accountRepo.checkPersonExists(personId);
        if (!personExists) {
            throw new PersonNotFoundException();
        }

        const accountId = await this.accountRepo.createAccount(personId, dailyLimit, accountType);
        return { accountId, message: 'Account created successfully' };
    }

    async getBalance(accountId: number) {
        const account = await this.accountRepo.findById(accountId);
        if (!account) throw new AccountNotFoundException();

        return { accountId, balance: account.balance, active: account.activeFlag === 1 };
    }

    async deposit(accountId: number, amount: number) {
        const account = await this.accountRepo.findById(accountId);
        if (!account) throw new AccountNotFoundException();
        if (account.activeFlag === 0) throw new AccountBlockedException('Cannot deposit into a blocked account.');

        await this.accountRepo.executeFinancialTransaction(accountId, amount, 'DEPOSIT');
        return { message: 'Deposit successful', newBalance: account.balance + amount };
    }

    async withdraw(accountId: number, amount: number) {
        const account = await this.accountRepo.findById(accountId);
        if (!account) throw new AccountNotFoundException();
        if (account.activeFlag === 0) throw new AccountBlockedException('Cannot withdraw from a blocked account.');

        if (account.balance < amount) throw new InsufficientFundsException();
        if (amount > account.dailyWithdrawalLimit) {
            throw new InsufficientFundsException(`Amount exceeds daily withdrawal limit of ${account.dailyWithdrawalLimit}`);
        }

        await this.accountRepo.executeFinancialTransaction(accountId, amount, 'WITHDRAWAL');
        return { message: 'Withdrawal successful', newBalance: account.balance - amount };
    }

    async toggleAccountStatus(accountId: number, block: boolean, reason: string) {
        const account = await this.accountRepo.findById(accountId);
        if (!account) throw new AccountNotFoundException();

        await this.accountRepo.updateAccountStatus(accountId, block, reason);
        return { message: `Account successfully ${block ? 'blocked' : 'unblocked'}.` };
    }
}