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

// POST generate invoice from order
router.post('/generate-from-order', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const invoice = await withTransaction(async (client) => {
      const orderRes = await client.query(`SELECT * FROM erp.orders WHERE id = $1`, [orderId]);
      if (orderRes.rows.length === 0) throw new Error(`Order not found: ${orderId}`);
      const order = orderRes.rows[0];

      const countRes = await client.query('SELECT count(*) FROM erp.invoices');
      const invNo = `INV-${String(parseInt(countRes.rows[0].count) + 15).padStart(4, '0')}`;

      const qrCode = `GSTIN:33ABCDE1234F1Z5;INV:${invNo};DATE:${new Date().toISOString().split('T')[0]};VAL:${order.total_amount}`;

      const insertInvSql = `
        INSERT INTO erp.invoices (
          id, invoice_no, order_id, order_no, customer_id, customer_name, customer_address, customer_gstin,
          invoice_date, place_of_supply, taxable_value, cgst, sgst, igst, total,
          paid_amount, outstanding_amount, status, qr_code_value
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_DATE, 'Tamil Nadu (TN)', $9, $10, $11, $12, $13, 0, $14, 'Unpaid', $15)
        RETURNING *
      `;

      const newInv = await client.query(insertInvSql, [
        invNo, invNo, order.id, order.order_no, order.customer_id, order.customer_name,
        order.customer_address, order.customer_gstin, order.taxable_amount,
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

      await client.query(
        `UPDATE erp.orders SET status = 'Invoiced', invoice_no = $1, invoice_date = CURRENT_DATE WHERE id = $2`,
        [invNo, order.id]
      );

      return newInv.rows[0];
    });

    return ApiResponse.success(res, invoice, 'GST Tax invoice generated successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
