
import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { validateRequest } from '../middleware/validateRequest';
import { createAccountSchema,
    transactionSchema,
    blockAccountSchema,
    accountIdParamSchema,
    statementQuerySchema } from '../schemas/accountSchemas';

const router = Router();

router.post('/', validateRequest(createAccountSchema), AccountController.createAccount);
router.get('/:accountId/balance', validateRequest(accountIdParamSchema), AccountController.getBalance);
router.post('/:accountId/deposit', validateRequest(transactionSchema), AccountController.deposit);
router.post('/:accountId/withdraw', validateRequest(transactionSchema), AccountController.withdraw);
router.patch('/:accountId/block', validateRequest(blockAccountSchema), AccountController.toggleStatus);
router.get('/:accountId/statement', validateRequest(statementQuerySchema), AccountController.getStatement);

export default router;