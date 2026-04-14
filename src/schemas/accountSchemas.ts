
import { z } from 'zod';

// Schema for POST /accounts
export const createAccountSchema = z.object({
    body: z.object({
        personId: z.number().int().positive('Person ID must be a positive integer'),
        dailyWithdrawalLimit: z.number().positive('Daily limit must be greater than 0'),
        accountType: z.number().int('Account type must be an integer')
    })
});

// Schema for POST /accounts/:accountId/deposit AND withdraw
export const transactionSchema = z.object({
    body: z.object({
        amount: z.number().positive('Amount must be strictly greater than 0')
    }),
    params: z.object({
        accountId: z.string().regex(/^\d+$/, 'Account ID must be a valid number')
    })
});

// Schema for PATCH /accounts/:accountId/block
export const blockAccountSchema = z.object({
    body: z.object({
        block: z.boolean({ message: 'Block status (true/false) is required' }),
        reason: z.string().min(5, 'Please provide a reason (min 5 characters)')
    }),
    params: z.object({
        accountId: z.string().regex(/^\d+$/, 'Account ID must be a valid number')
    })
});