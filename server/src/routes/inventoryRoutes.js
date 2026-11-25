import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all inventory items
router.get('/', authenticateToken, async (req, res, next) => {
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

router.get('/items', authenticateToken, async (req, res, next) => {
  try {
    const result = await query(`SELECT * FROM erp.inventory_items ORDER BY item_type, id ASC`);
    return ApiResponse.success(res, result.rows, 'Inventory items retrieved');
  } catch (err) {
    next(err);
  }
});

// GET raw materials inventory
router.get('/raw-materials', authenticateToken, async (req, res, next) => {
  try {
    const sql = `
      SELECT rm.*, u.name as unit_name, s.name as supplier_name,
             COALESCE(inv.current_stock, 0) as closing_stock,
             COALESCE(inv.opening_stock, 0) as opening_stock,
             COALESCE(inv.total_inward, 0) as purchased,
             COALESCE(inv.total_outward, 0) as consumed
      FROM erp.raw_materials rm
      LEFT JOIN erp.units u ON rm.unit_id = u.id
      LEFT JOIN erp.suppliers s ON rm.supplier_id = s.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'RAW_MATERIAL' AND inv.item_id = rm.id
      ORDER BY rm.id ASC
    `;
    const result = await query(sql);
    return ApiResponse.success(res, result.rows, 'Raw materials inventory retrieved');
  } catch (err) {
    next(err);
  }
});

// GET packaging materials inventory
router.get('/packaging', authenticateToken, async (req, res, next) => {
  try {
    const sql = `
      SELECT pm.*, u.name as unit_name, s.name as supplier_name,
             COALESCE(inv.current_stock, 0) as closing_stock,
             COALESCE(inv.opening_stock, 0) as opening_stock,
             COALESCE(inv.total_inward, 0) as purchased,
             COALESCE(inv.total_outward, 0) as consumed
      FROM erp.packaging_materials pm
      LEFT JOIN erp.units u ON pm.unit_id = u.id
      LEFT JOIN erp.suppliers s ON pm.supplier_id = s.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'PACKAGING' AND inv.item_id = pm.id
      ORDER BY pm.id ASC
    `;
    const result = await query(sql);
    return ApiResponse.success(res, result.rows, 'Packaging materials inventory retrieved');
  } catch (err) {
    next(err);
  }
});

// GET finished goods inventory
router.get('/finished-goods', authenticateToken, async (req, res, next) => {
  try {
    const sql = `
      SELECT p.*, c.name as category_name, u.name as unit_name,
             COALESCE(inv.current_stock, 0) as current_stock,
             COALESCE(inv.opening_stock, 0) as opening_stock,
             COALESCE(inv.total_inward, 0) as produced,
             COALESCE(inv.total_outward, 0) as dispatched
      FROM erp.products p
      LEFT JOIN erp.product_categories c ON p.category_id = c.id
      LEFT JOIN erp.units u ON p.unit_id = u.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'FINISHED_GOODS' AND inv.item_id = p.id
      ORDER BY p.id ASC
    `;
    const result = await query(sql);
    return ApiResponse.success(res, result.rows, 'Finished goods inventory retrieved');
  } catch (err) {
    next(err);
  }
});

// GET stock movement ledger
router.get('/ledger', authenticateToken, async (req, res, next) => {
  try {
    const { itemId, voucherType } = req.query;
    let sql = `SELECT * FROM erp.stock_ledger WHERE 1=1`;
    const params = [];

    if (itemId) {
      params.push(itemId);
      sql += ` AND item_id = $${params.length}`;
    }
    if (voucherType) {
      params.push(voucherType);
      sql += ` AND voucher_type = $${params.length}`;
    }

    sql += ` ORDER BY transaction_date DESC, id DESC LIMIT 100`;
    const result = await query(sql, params);
    return ApiResponse.success(res, result.rows, 'Stock movement ledger retrieved');
  } catch (err) {
    next(err);
  }
});

// POST stock adjustment
router.post('/adjustments', authenticateToken, async (req, res, next) => {
  try {
    const { itemId, itemType, adjustmentType, quantity, reason } = req.body;
    const qtyNum = parseFloat(quantity);

    if (!itemId || !adjustmentType || isNaN(qtyNum) || qtyNum === 0) {
      return ApiResponse.error(res, 'Item ID, adjustment type, and non-zero quantity are required', [], 400);
    }

    const result = await withTransaction(async (client) => {
      const countRes = await client.query('SELECT count(*) FROM erp.stock_adjustments');
      const adjNo = `ADJ-${String(parseInt(countRes.rows[0].count) + 1).padStart(4, '0')}`;

      // Fetch current stock
      const stockRes = await client.query(
        `SELECT current_stock, item_name, unit_id FROM erp.inventory_items WHERE item_id = $1`,
        [itemId]
      );
      if (stockRes.rows.length === 0) {
        throw new Error(`Inventory item not found: ${itemId}`);
      }
      const item = stockRes.rows[0];
      const curStock = parseFloat(item.current_stock);

      const isSurplus = adjustmentType === 'SURPLUS';
      const delta = isSurplus ? Math.abs(qtyNum) : -Math.abs(qtyNum);
      const newStock = curStock + delta;

      if (newStock < 0) {
        throw new Error(`Adjustment would result in negative stock balance (${newStock})`);
      }

      const insertSql = `
        INSERT INTO erp.stock_adjustments (adjustment_no, item_type, item_id, adjustment_type, quantity, unit_id, reason, approved_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const adjRes = await client.query(insertSql, [
        adjNo, itemType || 'RAW_MATERIAL', itemId, adjustmentType, Math.abs(qtyNum), item.unit_id, reason || 'Reconciliation', req.user.id
      ]);

      await client.query(`
        UPDATE erp.inventory_items
        SET current_stock = $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE item_id = $2
      `, [newStock, itemId]);

      // Stock ledger entry
      await client.query(`
        INSERT INTO erp.stock_ledger (item_type, item_id, item_name, voucher_type, voucher_ref, inward_qty, outward_qty, balance_qty, unit_id, notes)
        VALUES ($1, $2, $3, 'STOCK_ADJUSTMENT', $4, $5, $6, $7, $8, $9)
      `, [
        itemType || 'RAW_MATERIAL', itemId, item.item_name, adjNo,
        isSurplus ? Math.abs(qtyNum) : 0, !isSurplus ? Math.abs(qtyNum) : 0,
        newStock, item.unit_id, `Stock adjustment (${adjustmentType}): ${reason}`
      ]);

      // Audit log
      await client.query(`
        INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details)
        VALUES ($1, $2, 'STOCK_ADJUSTMENT', 'INVENTORY', $3, $4)
      `, [req.user.id, req.user.name, adjNo, JSON.stringify({ itemId, adjustmentType, delta, newStock, reason })]);

      return adjRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Stock adjustment applied successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
