
import { Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/AccountService';

const accountService = new AccountService();

export class AccountController {

    static async getStatement(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = parseInt(req.params.accountId as string, 10);

            const { startDate, endDate } = req.query as { startDate?: string, endDate?: string };

            const result = await accountService.getStatement(accountId, startDate, endDate);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async createAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { personId, dailyWithdrawalLimit, accountType } = req.body;
            const result = await accountService.createAccount(personId, dailyWithdrawalLimit, accountType);
            res.status(201).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async getBalance(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = parseInt(req.params.accountId as string, 10);
            const result = await accountService.getBalance(accountId);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async deposit(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = parseInt(req.params.accountId as string, 10);
            const { amount } = req.body;
            const result = await accountService.deposit(accountId, amount);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async withdraw(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = parseInt(req.params.accountId as string, 10);
            const { amount } = req.body;
            const result = await accountService.withdraw(accountId, amount);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    }

    static async toggleStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const accountId = parseInt(req.params.accountId as string, 10);
            const { block, reason } = req.body;
            const result = await accountService.toggleAccountStatus(accountId, block, reason);
            res.status(200).json({ status: 'success', data: result });
        } catch (error) {
            next(error);
        }
    }
}