import { Router } from 'express';
import { SupplierController } from '../controllers/supplierController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { supplierSchema } from '../validators/masterDataValidator.js';

const router = Router();

router.get('/', authenticateToken, SupplierController.getAll);
router.get('/:id', authenticateToken, SupplierController.getById);

router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERVISOR', 'OWNER'), validate(supplierSchema), SupplierController.create);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), validate(supplierSchema.partial()), SupplierController.update);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), SupplierController.delete);

export default router;
