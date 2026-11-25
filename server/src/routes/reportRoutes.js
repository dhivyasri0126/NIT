import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET Sales and GST summary
router.get('/gst-summary', authenticateToken, async (req, res, next) => {
  try {
    const summaryRes = await query(`
      SELECT
        COUNT(id) as total_invoices,
        COALESCE(SUM(taxable_value), 0) as total_taxable,
        COALESCE(SUM(cgst), 0) as total_cgst,
        COALESCE(SUM(sgst), 0) as total_sgst,
        COALESCE(SUM(igst), 0) as total_igst,
        COALESCE(SUM(total), 0) as gross_sales,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(outstanding_amount), 0) as total_outstanding
      FROM erp.invoices
    `);
    return ApiResponse.success(res, summaryRes.rows[0], 'GST Tax summary calculated');
  } catch (err) {
    next(err);
  }
});

// GET Stock audit summary
router.get('/stock-summary', authenticateToken, async (req, res, next) => {
  try {
    const stockRes = await query(`
      SELECT
        item_type,
        COUNT(id) as item_count,
        SUM(current_stock) as total_qty,
        SUM(current_stock * avg_cost) as total_valuation
      FROM erp.inventory_items
      GROUP BY item_type
    `);
    return ApiResponse.success(res, stockRes.rows, 'Stock valuation summary');
  } catch (err) {
    next(err);
  }
});

export default router;
