import { Router } from 'express';
import { AccountController } from '../controllers/AccountController';
import { validateRequest } from '../middleware/validateRequest';
import { createAccountSchema, accountIdParamSchema, blockAccountSchema } from '../schemas/accountSchemas';

const router = Router();

/**
 * Account Management Routes
 * Handles creation, status toggling, and balance inquiries.
 */

router.post('/', validateRequest(createAccountSchema), AccountController.createAccount);
router.get('/:accountId/balance', validateRequest(accountIdParamSchema), AccountController.getBalance);
router.patch('/:accountId/block', validateRequest(blockAccountSchema), AccountController.toggleStatus);

export default router;