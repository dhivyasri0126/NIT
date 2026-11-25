import { Router } from 'express';
import { CustomerController } from '../controllers/customerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { customerSchema } from '../validators/masterDataValidator.js';

const router = Router();

// Admin, Salesman, Auditor, Owner can view customer directory
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'SALESMAN', 'AUDITOR', 'OWNER'), CustomerController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN', 'SALESMAN', 'AUDITOR', 'OWNER'), CustomerController.getById);

// Admin and Salesman can register new customers
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SALESMAN', 'OWNER'), validate(customerSchema), CustomerController.create);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), validate(customerSchema.partial()), CustomerController.update);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), CustomerController.delete);

export default router;
