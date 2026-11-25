import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all payments
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const resPayments = await query(`
      SELECT * FROM erp.payments ORDER BY date DESC, created_at DESC
    `);
    return ApiResponse.success(res, resPayments.rows, 'Payments retrieved');
  } catch (err) {
    next(err);
  }
});

// POST record payment
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SALESMAN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const { invoiceNo, customerName, amountPaid, paymentMode, referenceNo, notes } = req.body;

    const result = await withTransaction(async (client) => {
      const invRes = await client.query(`SELECT * FROM erp.invoices WHERE invoice_no = $1`, [invoiceNo]);
      if (invRes.rows.length === 0) throw new Error(`Invoice not found: ${invoiceNo}`);
      const inv = invRes.rows[0];

      const countRes = await client.query('SELECT count(*) FROM erp.payments');
      const payId = `PAY-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;
      const recNo = `REC-2025-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

      // Insert payment
      const paySql = `
        INSERT INTO erp.payments (id, receipt_no, invoice_id, invoice_no, customer_id, customer_name, date, amount_paid, payment_mode, reference_no, notes)
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9, $10)
        RETURNING *
      `;
      const payRes = await client.query(paySql, [
        payId, recNo, inv.id, invoiceNo, inv.customer_id, customerName || inv.customer_name,
        amountPaid, paymentMode || 'UPI / Bank Transfer', referenceNo || null, notes || null
      ]);

      // Update invoice paid & outstanding balance
      const newPaid = parseFloat(inv.paid_amount) + parseFloat(amountPaid);
      const newOutstanding = Math.max(0, parseFloat(inv.total) - newPaid);
      const newStatus = newOutstanding === 0 ? 'Paid' : 'Partially Paid';

      await client.query(`
        UPDATE erp.invoices
        SET paid_amount = $1, outstanding_amount = $2, status = $3, updated_at = CURRENT_TIMESTAMP
        WHERE id = $4
      `, [newPaid, newOutstanding, newStatus, inv.id]);

      // Update customer outstanding balance
      if (inv.customer_id) {
        await client.query(`
          UPDATE erp.customers
          SET outstanding_balance = GREATEST(0, outstanding_balance - $1),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [amountPaid, inv.customer_id]);
      }

      return payRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Payment recorded successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
