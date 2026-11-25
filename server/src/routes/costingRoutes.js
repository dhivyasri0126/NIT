import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET unit costing analysis for a production run
router.get('/runs/:runId', authenticateToken, async (req, res, next) => {
  try {
    const { runId } = req.params;
    const costingRes = await query(`
      SELECT po.*, pr.batch_no, pr.product_name, pr.actual_output, pr.date
      FROM erp.production_overheads po
      JOIN erp.production_runs pr ON po.production_run_id = pr.id
      WHERE po.production_run_id = $1
    `, [runId]);

    if (costingRes.rows.length === 0) {
      return ApiResponse.error(res, 'Costing data not found for run', [], 404);
    }

    return ApiResponse.success(res, costingRes.rows[0], 'Costing retrieved');
  } catch (err) {
    next(err);
  }
});

export default router;
