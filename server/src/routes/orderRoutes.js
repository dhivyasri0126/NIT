import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all orders
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const ordersRes = await query(`
      SELECT o.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'productId', oi.product_id,
                   'productName', oi.product_name,
                   'hsn', oi.hsn,
                   'quantity', oi.quantity,
                   'rate', oi.rate,
                   'discountPercent', oi.discount_percent,
                   'taxable', oi.taxable,
                   'cgstRate', oi.cgst_rate,
                   'cgstAmount', oi.cgst_amount,
                   'sgstRate', oi.sgst_rate,
                   'sgstAmount', oi.sgst_amount,
                   'igstRate', oi.igst_rate,
                   'igstAmount', oi.igst_amount,
                   'totalAmount', oi.total_amount
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) as items
      FROM erp.orders o
      LEFT JOIN erp.order_items oi ON o.id = oi.order_id
      GROUP BY o.id
      ORDER BY o.created_at DESC
    `);
    return ApiResponse.success(res, ordersRes.rows, 'Orders retrieved successfully');
  } catch (err) {
    next(err);
  }
});

// GET order by id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const orderRes = await query(`
      SELECT o.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'id', oi.id,
                   'productId', oi.product_id,
                   'productName', oi.product_name,
                   'hsn', oi.hsn,
                   'quantity', oi.quantity,
                   'rate', oi.rate,
                   'taxable', oi.taxable,
                   'cgstAmount', oi.cgst_amount,
                   'sgstAmount', oi.sgst_amount,
                   'totalAmount', oi.total_amount
                 )
               ) FILTER (WHERE oi.id IS NOT NULL), '[]'
             ) as items
      FROM erp.orders o
      LEFT JOIN erp.order_items oi ON o.id = oi.order_id
      WHERE o.id = $1
      GROUP BY o.id
    `, [req.params.id]);

    if (orderRes.rows.length === 0) {
      return ApiResponse.error(res, `Order not found: ${req.params.id}`, [], 404);
    }
    return ApiResponse.success(res, orderRes.rows[0], 'Order retrieved');
  } catch (err) {
    next(err);
  }
});

// POST create order
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const { customerId, customerName, customerAddress, customerGstin, items, taxableAmount, cgstTotal, sgstTotal, igstTotal, totalAmount, notes } = req.body;

    const result = await withTransaction(async (client) => {
      const countRes = await client.query('SELECT count(*) FROM erp.orders');
      const orderNo = `SO-${String(parseInt(countRes.rows[0].count) + 22).padStart(4, '0')}`;
      const orderId = orderNo;

      let status = 'Submitted';
      let shortageQty = 0;

      // Check stock availability
      if (items && items.length > 0) {
        const first = items[0];
        const stockRes = await client.query(
          `SELECT current_stock FROM erp.inventory_items WHERE item_type = 'FINISHED_GOODS' AND item_id = $1`,
          [first.productId]
        );
        const currentStock = stockRes.rows[0] ? parseFloat(stockRes.rows[0].current_stock) : 0;
        if (currentStock < first.quantity) {
          status = 'Insufficient Stock';
          shortageQty = first.quantity - currentStock;
        }
      }

      const insertOrderSql = `
        INSERT INTO erp.orders (
          id, order_no, customer_id, customer_name, customer_address, customer_gstin,
          salesman_id, order_date, taxable_amount, cgst_total, sgst_total, igst_total, total_amount,
          status, shortage_quantity, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_DATE, $8, $9, $10, $11, $12, $13, $14, $15)
        RETURNING *
      `;

      const orderRes = await client.query(insertOrderSql, [
        orderId, orderNo, customerId, customerName, customerAddress, customerGstin,
        req.user.id, taxableAmount, cgstTotal || 0, sgstTotal || 0, igstTotal || 0, totalAmount,
        status, shortageQty, notes || null
      ]);

      if (items && Array.isArray(items)) {
        for (const it of items) {
          await client.query(`
            INSERT INTO erp.order_items (
              order_id, product_id, product_name, hsn, quantity, rate, discount_percent, taxable,
              cgst_rate, cgst_amount, sgst_rate, sgst_amount, igst_rate, igst_amount, total_amount
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
          `, [
            orderId, it.productId, it.productName, it.hsn || '19059090', it.quantity, it.rate,
            it.discountPercent || 0, it.taxable, it.cgstRate || 2.5, it.cgstAmount || 0,
            it.sgstRate || 2.5, it.sgstAmount || 0, it.igstRate || 0, it.igstAmount || 0, it.totalAmount
          ]);
        }
      }

      return orderRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Sales order created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// PUT approve order
router.put('/:id/approve', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const result = await query(
      `UPDATE erp.orders SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (result.rows.length === 0) {
      return ApiResponse.error(res, 'Order not found', [], 404);
    }
    return ApiResponse.success(res, result.rows[0], 'Order approved');
  } catch (err) {
    next(err);
  }
});

// PUT dispatch order
router.put('/:id/dispatch', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const result = await withTransaction(async (client) => {
      const orderRes = await client.query(`SELECT * FROM erp.orders WHERE id = $1`, [req.params.id]);
      if (orderRes.rows.length === 0) throw new Error('Order not found');
      const order = orderRes.rows[0];

      // Update order status
      const updatedOrder = await client.query(
        `UPDATE erp.orders SET status = 'Dispatched', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [req.params.id]
      );

      // Deduct stock from finished goods inventory
      const itemsRes = await client.query(`SELECT * FROM erp.order_items WHERE order_id = $1`, [order.id]);
      for (const item of itemsRes.rows) {
        await client.query(`
          UPDATE erp.inventory_items
          SET current_stock = GREATEST(0, current_stock - $1),
              total_outward = total_outward + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE item_type = 'FINISHED_GOODS' AND item_id = $2
        `, [item.quantity, item.product_id]);

        // Record in stock ledger
        const balRes = await client.query(
          `SELECT current_stock FROM erp.inventory_items WHERE item_type = 'FINISHED_GOODS' AND item_id = $1`,
          [item.product_id]
        );
        const bal = balRes.rows[0] ? balRes.rows[0].current_stock : 0;

        await client.query(`
          INSERT INTO erp.stock_ledger (item_type, item_id, item_name, voucher_type, voucher_ref, outward_qty, balance_qty, unit_id, notes)
          VALUES ('FINISHED_GOODS', $1, $2, 'SALES_DISPATCH', $3, $4, $5, 'packets', $6)
        `, [item.product_id, item.product_name, order.order_no, item.quantity, bal, `Dispatched to ${order.customer_name}`]);
      }

      return updatedOrder.rows[0];
    });

    return ApiResponse.success(res, result, 'Order dispatched and inventory deducted');
  } catch (err) {
    next(err);
  }
});

export default router;
