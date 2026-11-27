import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all invoices
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const invoicesRes = await query(`
      SELECT inv.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'sNo', ii.s_no,
                   'productId', ii.product_id,
                   'productName', ii.product_name,
                   'hsn', ii.hsn,
                   'quantity', ii.quantity,
                   'rate', ii.rate,
                   'taxable', ii.taxable,
                   'cgstRate', ii.cgst_rate,
                   'cgstAmount', ii.cgst_amount,
                   'sgstRate', ii.sgst_rate,
                   'sgstAmount', ii.sgst_amount,
                   'amount', ii.amount
                 )
               ) FILTER (WHERE ii.id IS NOT NULL), '[]'
             ) as items
      FROM erp.invoices inv
      LEFT JOIN erp.invoice_items ii ON inv.id = ii.invoice_id
      GROUP BY inv.id
      ORDER BY inv.created_at DESC
    `);
    return ApiResponse.success(res, invoicesRes.rows, 'Invoices retrieved');
  } catch (err) {
    next(err);
  }
});

// GET invoice by id
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const invRes = await query(`
      SELECT inv.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'sNo', ii.s_no,
                   'productId', ii.product_id,
                   'productName', ii.product_name,
                   'hsn', ii.hsn,
                   'quantity', ii.quantity,
                   'rate', ii.rate,
                   'taxable', ii.taxable,
                   'cgstAmount', ii.cgst_amount,
                   'sgstAmount', ii.sgst_amount,
                   'amount', ii.amount
                 )
               ) FILTER (WHERE ii.id IS NOT NULL), '[]'
             ) as items
      FROM erp.invoices inv
      LEFT JOIN erp.invoice_items ii ON inv.id = ii.invoice_id
      WHERE inv.id = $1 OR inv.invoice_no = $1
      GROUP BY inv.id
    `, [req.params.id]);

    if (invRes.rows.length === 0) {
      return ApiResponse.error(res, 'Invoice not found', [], 404);
    }
    return ApiResponse.success(res, invRes.rows[0], 'Invoice retrieved');
  } catch (err) {
    next(err);
  }
});

// Helper function to create invoice from order
async function createInvoiceFromOrder(orderId, user) {
  return await withTransaction(async (client) => {
    const orderRes = await client.query(`SELECT * FROM erp.orders WHERE id = $1`, [orderId]);
    if (orderRes.rows.length === 0) {
      throw new Error(`Order not found: ${orderId}`);
    }
    const order = orderRes.rows[0];

    // Rule: Never generate an invoice for an unapproved order or already invoiced order
    if (order.invoice_no) {
      throw new Error(`Order ${order.order_no} is already invoiced (${order.invoice_no})`);
    }
    if (order.status !== 'Approved' && order.status !== 'Dispatched') {
      throw new Error(`Cannot invoice unapproved order. Current status: ${order.status}`);
    }

    const countRes = await client.query('SELECT count(*) FROM erp.invoices');
    const invNo = `INV-${String(parseInt(countRes.rows[0].count) + 15).padStart(4, '0')}`;

    const qrCode = `GSTIN:33ABCDE1234F1Z5;INV:${invNo};DATE:${new Date().toISOString().split('T')[0]};VAL:${order.total_amount}`;

    // Determine place of supply from customer state
    const custRes = await client.query(`SELECT state FROM erp.customers WHERE id = $1`, [order.customer_id]);
    const custState = custRes.rows[0]?.state || 'Tamil Nadu';
    const placeOfSupply = custState === 'Tamil Nadu' ? 'Tamil Nadu (TN)' : `${custState} (Interstate)`;

    const insertInvSql = `
      INSERT INTO erp.invoices (
        id, invoice_no, order_id, order_no, customer_id, customer_name, customer_address, customer_gstin,
        invoice_date, place_of_supply, taxable_value, cgst, sgst, igst, total,
        paid_amount, outstanding_amount, status, qr_code_value
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, $9, $10, $11, $12, $13, $14, 0, $15, 'Unpaid', $16)
      RETURNING *
    `;

    const newInv = await client.query(insertInvSql, [
      invNo, invNo, order.id, order.order_no, order.customer_id, order.customer_name,
      order.customer_address, order.customer_gstin, placeOfSupply, order.taxable_amount,
      order.cgst_total, order.sgst_total, order.igst_total, order.total_amount,
      order.total_amount, qrCode
    ]);

    const itemsRes = await client.query(`SELECT * FROM erp.order_items WHERE order_id = $1`, [order.id]);
    let sNo = 1;
    for (const it of itemsRes.rows) {
      await client.query(`
        INSERT INTO erp.invoice_items (
          invoice_id, s_no, product_id, product_name, hsn, quantity, rate, taxable,
          cgst_rate, cgst_amount, sgst_rate, sgst_amount, amount
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        invNo, sNo++, it.product_id, it.product_name, it.hsn, it.quantity, it.rate,
        it.taxable, it.cgst_rate, it.cgst_amount, it.sgst_rate, it.sgst_amount, it.total_amount
      ]);
    }

    // Update order status
    await client.query(
      `UPDATE erp.orders SET status = 'Invoiced', invoice_no = $1, invoice_date = CURRENT_DATE WHERE id = $2`,
      [invNo, order.id]
    );

    // Update customer outstanding receivables
    await client.query(`
      UPDATE erp.customers
      SET outstanding_balance = outstanding_balance + $1,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `, [order.total_amount, order.customer_id]);

    // Audit log
    await client.query(`
      INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details)
      VALUES ($1, $2, 'GENERATE_INVOICE', 'FINANCE', $3, $4)
    `, [user?.id || 'USR-ADMIN-01', user?.name || 'Admin', invNo, JSON.stringify({ orderId, total: order.total_amount })]);

    return newInv.rows[0];
  });
}

// POST create/generate invoice (Factory Admin / Owner only; Auditor is read-only)
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return ApiResponse.error(res, 'orderId is required to generate invoice', [], 400);
    }
    const invoice = await createInvoiceFromOrder(orderId, req.user);
    return ApiResponse.success(res, invoice, 'GST Tax invoice generated successfully', 201);
  } catch (err) {
    next(err);
  }
});

// POST generate invoice from order (explicit alias)
router.post('/generate-from-order', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const { orderId } = req.body;
    if (!orderId) {
      return ApiResponse.error(res, 'orderId is required', [], 400);
    }
    const invoice = await createInvoiceFromOrder(orderId, req.user);
    return ApiResponse.success(res, invoice, 'GST Tax invoice generated successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
