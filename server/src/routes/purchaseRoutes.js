import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all purchases
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const resPurchases = await query(`
      SELECT p.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', pi.id,
                   'materialId', pi.material_id,
                   'itemName', pi.item_name,
                   'quantity', pi.quantity,
                   'unit', pi.unit_id,
                   'unitPrice', pi.unit_price,
                   'totalAmount', pi.total_amount
                 )
               ) FILTER (WHERE pi.id IS NOT NULL), '[]'
             ) as items
      FROM erp.purchases p
      LEFT JOIN erp.purchase_items pi ON p.id = pi.purchase_id
      GROUP BY p.id
      ORDER BY p.order_date DESC, p.created_at DESC
    `);
    return ApiResponse.success(res, resPurchases.rows, 'Purchases retrieved');
  } catch (err) {
    next(err);
  }
});

// POST create purchase inward
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERVISOR', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const { supplierId, supplierName, item, quantity, unit, unitPrice, totalAmount, invoiceRef, notes } = req.body;

    const result = await withTransaction(async (client) => {
      const countRes = await client.query('SELECT count(*) FROM erp.purchases');
      const poNo = `PO-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

      const insertPoSql = `
        INSERT INTO erp.purchases (
          id, po_number, supplier_id, supplier_name, order_date, invoice_ref,
          taxable_amount, total_amount, status, payment_status, notes
        )
        VALUES ($1, $1, $2, $3, CURRENT_DATE, $4, $5, $5, 'Received', 'Paid', $6)
        RETURNING *
      `;

      const poRes = await client.query(insertPoSql, [
        poNo, supplierId, supplierName, invoiceRef || null, totalAmount, notes || null
      ]);

      // Add to purchase items
      await client.query(`
        INSERT INTO erp.purchase_items (purchase_id, material_id, material_type, item_name, quantity, unit_id, unit_price, total_amount)
        VALUES ($1, 'MAT-001', 'RAW_MATERIAL', $2, $3, $4, $5, $6)
      `, [poNo, item, quantity, unit || 'kg', unitPrice, totalAmount]);

      // Update material stock in inventory
      await client.query(`
        UPDATE erp.inventory_items
        SET current_stock = current_stock + $1,
            total_inward = total_inward + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE item_name ILIKE $2 OR item_id = 'MAT-001'
      `, [quantity, `%${item}%`]);

      // Record in stock ledger
      const balRes = await client.query(`
        SELECT current_stock FROM erp.inventory_items WHERE item_name ILIKE $1 OR item_id = 'MAT-001' LIMIT 1
      `, [`%${item}%`]);
      const bal = balRes.rows[0] ? balRes.rows[0].current_stock : 0;

      await client.query(`
        INSERT INTO erp.stock_ledger (item_type, item_id, item_name, voucher_type, voucher_ref, inward_qty, balance_qty, unit_id, notes)
        VALUES ('RAW_MATERIAL', 'MAT-001', $1, 'PURCHASE_RECEIPT', $2, $3, $4, $5, $6)
      `, [item, poNo, quantity, bal, unit || 'kg', `Inward from ${supplierName}`]);

      return poRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Purchase order recorded and stock increased', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
