import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all inventory items
router.get('/items', authenticateToken, async (req, res, next) => {
  try {
    const { type } = req.query;
    let sql = `SELECT * FROM erp.inventory_items WHERE 1=1`;
    const params = [];

    if (type) {
      params.push(type.toUpperCase());
      sql += ` AND item_type = $${params.length}`;
    }

    sql += ` ORDER BY item_type, id ASC`;
    const result = await query(sql, params);
    return ApiResponse.success(res, result.rows, 'Inventory items retrieved');
  } catch (err) {
    next(err);
  }
});

// GET stock ledger movements
router.get('/ledger', authenticateToken, async (req, res, next) => {
  try {
    const { itemId } = req.query;
    let sql = `SELECT * FROM erp.stock_ledger WHERE 1=1`;
    const params = [];

    if (itemId) {
      params.push(itemId);
      sql += ` AND item_id = $${params.length}`;
    }

    sql += ` ORDER BY transaction_date DESC, id DESC LIMIT 100`;
    const result = await query(sql, params);
    return ApiResponse.success(res, result.rows, 'Stock ledger retrieved');
  } catch (err) {
    next(err);
  }
});

// POST stock adjustment
router.post('/adjustments', authenticateToken, async (req, res, next) => {
  try {
    const { itemId, itemType, adjustmentType, quantity, reason } = req.body;

    const result = await withTransaction(async (client) => {
      const countRes = await client.query('SELECT count(*) FROM erp.stock_adjustments');
      const adjNo = `ADJ-${String(parseInt(countRes.rows[0].count) + 1).padStart(4, '0')}`;

      const insertSql = `
        INSERT INTO erp.stock_adjustments (adjustment_no, item_type, item_id, adjustment_type, quantity, unit_id, reason, approved_by)
        VALUES ($1, $2, $3, $4, $5, 'kg', $6, $7)
        RETURNING *
      `;
      const adjRes = await client.query(insertSql, [adjNo, itemType, itemId, adjustmentType, quantity, reason, req.user.id]);

      // Adjust stock in inventory
      const isSurplus = adjustmentType === 'SURPLUS';
      await client.query(`
        UPDATE erp.inventory_items
        SET current_stock = current_stock + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE item_id = $2
      `, [isSurplus ? Math.abs(quantity) : -Math.abs(quantity), itemId]);

      return adjRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Stock adjustment applied successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
