import { Router } from 'express';
import { ProductController } from '../controllers/productController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { productSchema } from '../validators/masterDataValidator.js';

const router = Router();

// All authenticated roles (Admin, Salesman, Supervisor, Auditor, Owner) can view products
router.get('/', authenticateToken, ProductController.getAll);
router.get('/:id', authenticateToken, ProductController.getById);

// Only Admin and Owner can add, edit, or delete products
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), validate(productSchema), ProductController.create);
router.put('/:id', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), validate(productSchema.partial()), ProductController.update);
router.delete('/:id', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), ProductController.delete);

export default router;
