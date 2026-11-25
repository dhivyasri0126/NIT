import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = Router();

// Only Admin and Owner can view system user list
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), UserController.getAll);
router.get('/:id', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), UserController.getById);

export default router;
