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

export class PersonNotFoundException extends AppError {
    constructor(message: string = 'The specified Person ID does not exist in the system.') {
        super(message, 404);
    }
}