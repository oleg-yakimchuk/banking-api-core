import { AppError } from './AppError';

export class InsufficientFundsException extends AppError {
    constructor(message: string = 'Insufficient funds for this transaction.') {
        super(message, 400);
    }
}

export class AccountNotFoundException extends AppError {
    constructor(message: string = 'The requested account does not exist.') {
        super(message, 404);
    }
}

export class AccountBlockedException extends AppError {
    constructor(message: string = 'Operation denied: This account is currently blocked.') {
        super(message, 403);
    }
}