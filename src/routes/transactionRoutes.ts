import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { validateRequest } from '../middleware/validateRequest';
import { transactionSchema, statementQuerySchema } from '../schemas/accountSchemas';

const router = Router();

/**
 * Transaction Routes
 * Handles all financial movements (deposits/withdrawals) and statement generation.
 */
router.post('/:accountId/deposit', validateRequest(transactionSchema), AccountController.deposit);
router.post('/:accountId/withdraw', validateRequest(transactionSchema), AccountController.withdraw);
router.get('/:accountId/statement', validateRequest(statementQuerySchema), AccountController.getStatement);

export default router;