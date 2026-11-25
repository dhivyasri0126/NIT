import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { loginSchema, registerSchema, refreshTokenSchema, changePasswordSchema } from '../validators/authValidator.js';

const router = Router();

router.post('/login', validate(loginSchema), AuthController.login);
router.post('/refresh', validate(refreshTokenSchema), AuthController.refreshToken);
router.get('/me', authenticateToken, AuthController.me);
router.post('/change-password', authenticateToken, validate(changePasswordSchema), AuthController.changePassword);

// Registration strictly restricted to Admin role
router.post('/register', authenticateToken, authorizeRoles('ADMIN'), validate(registerSchema), AuthController.register);

export default router;
