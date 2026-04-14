
export interface IAccountRepository {
    findById(accountId: number): Promise<any>;
    createAccount(personId: number, dailyLimit: number, accountType: number): Promise<number>;
    executeFinancialTransaction(accountId: number, amount: number, type: 'DEPOSIT' | 'WITHDRAWAL'): Promise<void>;
    updateAccountStatus(accountId: number, isBlocked: boolean, reason: string): Promise<void>;
    getStatement(accountId: number, startDate?: string, endDate?: string): Promise<any[]>;
    checkPersonExists(personId: number): Promise<boolean>;
}