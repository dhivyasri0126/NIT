import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all orders with filtering and role boundaries
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const { customerId, salesmanId, status, startDate, endDate } = req.query;
    let sql = `
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
      WHERE 1=1
    `;
    const params = [];

    // Salesman restricted to their own orders unless Admin/Owner/Auditor
    if (req.user.role === 'SALESMAN') {
      params.push(req.user.id);
      sql += ` AND o.salesman_id = $${params.length}`;
    } else if (salesmanId) {
      params.push(salesmanId);
      sql += ` AND o.salesman_id = $${params.length}`;
    }

    if (customerId) {
      params.push(customerId);
      sql += ` AND o.customer_id = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND o.status = $${params.length}`;
    }
    if (startDate) {
      params.push(startDate);
      sql += ` AND o.order_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      sql += ` AND o.order_date <= $${params.length}`;
    }

    sql += ` GROUP BY o.id ORDER BY o.order_date DESC, o.created_at DESC`;

    const ordersRes = await query(sql, params);
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
      WHERE o.id = $1 OR o.order_no = $1
      GROUP BY o.id
    `, [req.params.id]);

    if (orderRes.rows.length === 0) {
      return ApiResponse.error(res, `Order not found: ${req.params.id}`, [], 404);
    }

    // Role check for salesmen
    if (req.user.role === 'SALESMAN' && orderRes.rows[0].salesman_id !== req.user.id) {
      return ApiResponse.error(res, 'Access denied to this order record', [], 403);
    }

    return ApiResponse.success(res, orderRes.rows[0], 'Order retrieved');
  } catch (err) {
    next(err);
  }
});

// POST create order
router.post('/', authenticateToken, async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      customerAddress,
      customerGstin,
      items,
      taxableAmount,
      cgstTotal,
      sgstTotal,
      igstTotal,
      totalAmount,
      notes,
    } = req.body;

    if (!customerId || !items || !items.length) {
      return ApiResponse.error(res, 'Customer and at least one order line item are required', [], 400);
    }

    const result = await withTransaction(async (client) => {
      const countRes = await client.query('SELECT count(*) FROM erp.orders');
      const orderNo = `SO-${String(parseInt(countRes.rows[0].count) + 22).padStart(4, '0')}`;
      const orderId = orderNo;

      let status = 'Submitted';
      let shortageQty = 0;

      // Check finished-goods stock availability for primary product
      const first = items[0];
      const stockRes = await client.query(
        `SELECT current_stock FROM erp.inventory_items WHERE item_type = 'FINISHED_GOODS' AND item_id = $1`,
        [first.productId]
      );
      const currentStock = stockRes.rows[0] ? parseFloat(stockRes.rows[0].current_stock) : 0;
      if (currentStock < parseFloat(first.quantity)) {
        status = 'Insufficient Stock';
        shortageQty = parseFloat(first.quantity) - currentStock;
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

      // Record in audit log
      await client.query(`
        INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details)
        VALUES ($1, $2, 'ORDER_CREATED', 'SALES', $3, $4)
      `, [req.user.id, req.user.name, orderId, JSON.stringify({ orderNo, customerName, totalAmount, status })]);

      return orderRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Sales order created successfully', 201);
  } catch (err) {
    next(err);
  }
});

// POST /sync - Bulk offline order synchronization with idempotency keys
router.post('/sync', authenticateToken, async (req, res, next) => {
  try {
    const { queuedOrders = [] } = req.body;
    if (!Array.isArray(queuedOrders) || queuedOrders.length === 0) {
      return ApiResponse.success(res, { synced: 0, results: [] }, 'No offline orders to sync');
    }

    const results = [];
    for (const orderData of queuedOrders) {
      try {
        const synced = await withTransaction(async (client) => {
          // Check if order number already exists (idempotency)
          if (orderData.orderNo) {
            const existRes = await client.query(`SELECT id, order_no FROM erp.orders WHERE order_no = $1`, [orderData.orderNo]);
            if (existRes.rows.length > 0) {
              return { success: true, orderNo: orderData.orderNo, status: 'ALREADY_SYNCED' };
            }
          }

          const countRes = await client.query('SELECT count(*) FROM erp.orders');
          const orderNo = orderData.orderNo || `SO-${String(parseInt(countRes.rows[0].count) + 22).padStart(4, '0')}`;
          const orderId = orderNo;

          let status = 'Submitted';
          let shortageQty = 0;

          if (orderData.items && orderData.items.length > 0) {
            const first = orderData.items[0];
            const stockRes = await client.query(
              `SELECT current_stock FROM erp.inventory_items WHERE item_type = 'FINISHED_GOODS' AND item_id = $1`,
              [first.productId]
            );
            const currentStock = stockRes.rows[0] ? parseFloat(stockRes.rows[0].current_stock) : 0;
            if (currentStock < parseFloat(first.quantity)) {
              status = 'Insufficient Stock';
              shortageQty = parseFloat(first.quantity) - currentStock;
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
            orderId, orderNo, orderData.customerId, orderData.customerName, orderData.customerAddress, orderData.customerGstin,
            req.user.id, orderData.taxableAmount || 0, orderData.cgstTotal || 0, orderData.sgstTotal || 0, orderData.igstTotal || 0,
            orderData.totalAmount || 0, status, shortageQty, (orderData.notes || '') + ' (Offline Synced)'
          ]);

          if (orderData.items && Array.isArray(orderData.items)) {
            for (const it of orderData.items) {
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

          return { success: true, orderNo, status: 'SYNCED', id: orderId };
        });

        results.push(synced);
      } catch (err) {
        results.push({ success: false, orderNo: orderData.orderNo, error: err.message });
      }
    }

    const syncedCount = results.filter(r => r.success).length;
    return ApiResponse.success(res, { syncedCount, results }, `Successfully synchronized ${syncedCount} offline orders`);
  } catch (err) {
    next(err);
  }
});

// PUT /:id/approve - Approve order
router.put('/:id/approve', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const result = await withTransaction(async (client) => {
      const updateRes = await client.query(
        `UPDATE erp.orders SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [req.params.id]
      );
      if (updateRes.rows.length === 0) throw new Error('Order not found');

      await client.query(`
        INSERT INTO erp.order_status_history (order_id, old_status, new_status, changed_by, reason)
        VALUES ($1, 'Submitted', 'Approved', $2, 'Order approved by management')
      `, [req.params.id, req.user.id]);

      await client.query(`
        INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details)
        VALUES ($1, $2, 'ORDER_APPROVED', 'SALES', $3, '{"status": "Approved"}'::jsonb)
      `, [req.user.id, req.user.name, req.params.id]);

      return updateRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Order approved successfully');
  } catch (err) {
    next(err);
  }
});

// PUT /:id/reject - Reject order
router.put('/:id/reject', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const { reason = 'Order cancelled by management' } = req.body;
    const result = await withTransaction(async (client) => {
      const updateRes = await client.query(
        `UPDATE erp.orders SET status = 'Rejected', rejection_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
        [reason, req.params.id]
      );
      if (updateRes.rows.length === 0) throw new Error('Order not found');

      await client.query(`
        INSERT INTO erp.order_status_history (order_id, old_status, new_status, changed_by, reason)
        VALUES ($1, 'Submitted', 'Rejected', $2, $3)
      `, [req.params.id, req.user.id, reason]);

      return updateRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Order rejected');
  } catch (err) {
    next(err);
  }
});

// PUT /:id/dispatch - Dispatch order
router.put('/:id/dispatch', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const { carrierName = 'Murukku Express Delivery', vehicleNo = 'TN-45-AB-1234' } = req.body;

    const result = await withTransaction(async (client) => {
      const orderRes = await client.query(`SELECT * FROM erp.orders WHERE id = $1`, [req.params.id]);
      if (orderRes.rows.length === 0) throw new Error('Order not found');
      const order = orderRes.rows[0];

      // Prevent dispatch if order is unapproved or rejected
      if (order.status === 'Rejected' || order.status === 'Submitted') {
        throw new Error(`Order must be approved prior to dispatch (current status: ${order.status})`);
      }

      // Check stock sufficiency before deducting
      const itemsRes = await client.query(`SELECT * FROM erp.order_items WHERE order_id = $1`, [order.id]);
      for (const item of itemsRes.rows) {
        const curStockRes = await client.query(
          `SELECT current_stock, item_name FROM erp.inventory_items WHERE item_type = 'FINISHED_GOODS' AND item_id = $1`,
          [item.product_id]
        );
        const curStock = curStockRes.rows[0] ? parseFloat(curStockRes.rows[0].current_stock) : 0;
        if (curStock < parseFloat(item.quantity)) {
          throw new Error(`Cannot dispatch beyond available inventory for ${item.product_name}. Available: ${curStock}, Requested: ${item.quantity}`);
        }
      }

      // Update order status
      const updatedOrder = await client.query(
        `UPDATE erp.orders SET status = 'Dispatched', updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING *`,
        [req.params.id]
      );

      // Deduct stock from finished goods inventory & create ledger entries
      for (const item of itemsRes.rows) {
        await client.query(`
          UPDATE erp.inventory_items
          SET current_stock = current_stock - $1,
              total_outward = total_outward + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE item_type = 'FINISHED_GOODS' AND item_id = $2
        `, [item.quantity, item.product_id]);

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

      // Create dispatch gate pass record
      const countRes = await client.query('SELECT count(*) FROM erp.dispatches');
      const dispNo = `DSP-${String(parseInt(countRes.rows[0].count) + 1).padStart(4, '0')}`;
      await client.query(`
        INSERT INTO erp.dispatches (id, dispatch_no, order_id, invoice_id, customer_name, dispatch_date, carrier_name, vehicle_no, gate_pass_no)
        VALUES ($1, $1, $2, $3, $4, CURRENT_DATE, $5, $6, $7)
      `, [dispNo, order.id, order.invoice_no, order.customer_name, carrierName, vehicleNo, `GP-${Date.now().toString().slice(-4)}`]);

      // Record in audit log
      await client.query(`
        INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details)
        VALUES ($1, $2, 'ORDER_DISPATCHED', 'SALES', $3, $4)
      `, [req.user.id, req.user.name, order.id, JSON.stringify({ dispatchNo: dispNo, orderNo: order.order_no, carrierName })]);

      return updatedOrder.rows[0];
    });

    return ApiResponse.success(res, result, 'Order dispatched, gate pass created, and inventory deducted successfully');
  } catch (err) {
    next(err);
  }
});

export default router;
