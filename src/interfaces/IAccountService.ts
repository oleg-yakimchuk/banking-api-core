
export interface IAccountService {
    createAccount(personId: number, dailyLimit: number, accountType: number): Promise<any>;
    getBalance(accountId: number): Promise<any>;
    deposit(accountId: number, amount: number): Promise<any>;
    withdraw(accountId: number, amount: number): Promise<any>;
    toggleAccountStatus(accountId: number, block: boolean, reason: string): Promise<any>;
    getStatement(accountId: number, startDate?: string, endDate?: string): Promise<any>;
}