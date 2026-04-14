
import { Request, Response } from 'express';
import { AccountService } from '../services/AccountService';
import { AccountRepository } from '../repositories/AccountRepository';
import { catchAsync } from '../utils/catchAsync';
import { logger } from '../utils/logger';

const accountRepository = new AccountRepository();
const accountService = new AccountService(accountRepository);

export class AccountController {

    static createAccount = catchAsync(async (req: Request, res: Response) => {
        logger.debug({ body: req.body }, 'Controller: createAccount invoked');
        const { personId, dailyWithdrawalLimit, accountType } = req.body;
        const result = await accountService.createAccount(personId, dailyWithdrawalLimit, accountType);
        res.status(201).json({ status: 'success', data: result });
    });

    static getBalance = catchAsync(async (req: Request, res: Response) => {
        logger.debug({ params: req.params }, 'Controller: getBalance invoked');
        const accountId = parseInt(req.params.accountId as string, 10);
        const result = await accountService.getBalance(accountId);
        res.status(200).json({ status: 'success', data: result });
    });

    static deposit = catchAsync(async (req: Request, res: Response) => {
        logger.debug({ params: req.params, body: req.body }, 'Controller: deposit invoked');
        const accountId = parseInt(req.params.accountId as string, 10);
        const { amount } = req.body;
        const result = await accountService.deposit(accountId, amount);
        res.status(200).json({ status: 'success', data: result });
    });

    static withdraw = catchAsync(async (req: Request, res: Response) => {
        logger.debug({ params: req.params, body: req.body }, 'Controller: withdraw invoked');
        const accountId = parseInt(req.params.accountId as string, 10);
        const { amount } = req.body;
        const result = await accountService.withdraw(accountId, amount);
        res.status(200).json({ status: 'success', data: result });
    });

    static toggleStatus = catchAsync(async (req: Request, res: Response) => {
        logger.debug({ params: req.params, body: req.body }, 'Controller: toggleStatus invoked');
        const accountId = parseInt(req.params.accountId as string, 10);
        const { block, reason } = req.body;
        const result = await accountService.toggleAccountStatus(accountId, block, reason);
        res.status(200).json({ status: 'success', data: result });
    });

    static getStatement = catchAsync(async (req: Request, res: Response) => {
        logger.debug({ params: req.params, query: req.query }, 'Controller: getStatement invoked');
        const accountId = parseInt(req.params.accountId as string, 10);
        const { startDate, endDate } = req.query as { startDate?: string, endDate?: string };
        const result = await accountService.getStatement(accountId, startDate, endDate);
        res.status(200).json({ status: 'success', data: result });
    });
}