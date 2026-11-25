import { Router } from 'express';
import { MasterDataService } from '../services/masterDataService.js';
import { MaterialController } from '../controllers/materialController.js';
import { BomController } from '../controllers/bomController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { materialSchema, bomSchema } from '../validators/masterDataValidator.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Units and Categories
router.get('/units', authenticateToken, async (req, res, next) => {
  try {
    const units = await MasterDataService.getUnits();
    return ApiResponse.success(res, units, 'Units retrieved');
  } catch (err) {
    next(err);
  }
});

router.get('/categories', authenticateToken, async (req, res, next) => {
  try {
    const categories = await MasterDataService.getCategories();
    return ApiResponse.success(res, categories, 'Categories retrieved');
  } catch (err) {
    next(err);
  }
});

// Materials (Raw & Packaging)
router.get('/materials', authenticateToken, MaterialController.getAll);
router.post('/materials', authenticateToken, authorizeRoles('ADMIN', 'SUPERVISOR', 'OWNER'), validate(materialSchema), MaterialController.create);

// BOM routes
router.get('/boms/default', authenticateToken, BomController.getDefaultMurukkuBom);
router.get('/boms/:productId', authenticateToken, BomController.getByProduct);
router.put('/boms/:productId', authenticateToken, authorizeRoles('ADMIN', 'SUPERVISOR', 'OWNER'), validate(bomSchema.partial()), BomController.updateFormula);

export default router;
