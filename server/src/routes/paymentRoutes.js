import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all payments
router.get('/', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const resPayments = await query(`
      SELECT * FROM erp.payments ORDER BY date DESC, created_at DESC
    `);
    return ApiResponse.success(res, resPayments.rows, 'Payments retrieved');
  } catch (err) {
    next(err);
  }
});

// GET customer receivables summary
router.get('/receivables', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const receivablesRes = await query(`
      SELECT
        c.id as customer_id,
        c.name as customer_name,
        c.city,
        c.state,
        c.credit_limit,
        c.outstanding_balance,
        COALESCE(SUM(inv.total), 0) as total_invoiced,
        COALESCE(SUM(inv.paid_amount), 0) as total_paid,
        COALESCE(SUM(inv.outstanding_amount), 0) as total_outstanding,
        COUNT(CASE WHEN inv.status != 'Paid' THEN 1 END) as pending_invoices_count
      FROM erp.customers c
      LEFT JOIN erp.invoices inv ON c.id = inv.customer_id
      GROUP BY c.id
      ORDER BY total_outstanding DESC, c.name ASC
    `);
    return ApiResponse.success(res, receivablesRes.rows, 'Customer receivables retrieved');
  } catch (err) {
    next(err);
  }
});

// GET receivables ageing breakdown (0-30, 31-60, 61-90, >90 days)
router.get('/ageing', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const ageingRes = await query(`
      SELECT
        c.id as customer_id,
        c.name as customer_name,
        c.city,
        c.credit_limit,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - inv.invoice_date <= 30 THEN inv.outstanding_amount ELSE 0 END), 0) as bucket_0_30,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - inv.invoice_date BETWEEN 31 AND 60 THEN inv.outstanding_amount ELSE 0 END), 0) as bucket_31_60,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - inv.invoice_date BETWEEN 61 AND 90 THEN inv.outstanding_amount ELSE 0 END), 0) as bucket_61_90,
        COALESCE(SUM(CASE WHEN CURRENT_DATE - inv.invoice_date > 90 THEN inv.outstanding_amount ELSE 0 END), 0) as bucket_above_90,
        COALESCE(SUM(inv.outstanding_amount), 0) as total_outstanding
      FROM erp.customers c
      LEFT JOIN erp.invoices inv ON c.id = inv.customer_id AND inv.outstanding_amount > 0
      GROUP BY c.id
      ORDER BY total_outstanding DESC
    `);
    return ApiResponse.success(res, ageingRes.rows, 'Receivables ageing analysis');
  } catch (err) {
    next(err);
  }
});

// GET customer payment history by customer id
router.get('/customers/:id', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER', 'SALESMAN'), async (req, res, next) => {
  try {
    const custId = req.params.id;
    const historyRes = await query(`
      SELECT * FROM erp.payments
      WHERE customer_id = $1
      ORDER BY date DESC, created_at DESC
    `, [custId]);

    return ApiResponse.success(res, historyRes.rows, 'Customer payment history');
  } catch (err) {
    next(err);
  }
});

// POST record payment (Factory Admin / Owner only; Auditor is read-only)
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'OWNER'), async (req, res, next) => {
  try {
    const { invoiceNo, invoiceId, customerName, amountPaid, paymentMode, referenceNo, notes } = req.body;

    const result = await withTransaction(async (client) => {
      // Find invoice by invoice_no or id
      const invRes = await client.query(
        `SELECT * FROM erp.invoices WHERE invoice_no = $1 OR id = $1 OR id = $2`,
        [invoiceNo || invoiceId, invoiceId]
      );
      if (invRes.rows.length === 0) throw new Error(`Invoice not found: ${invoiceNo || invoiceId}`);
      const inv = invRes.rows[0];

      const countRes = await client.query('SELECT count(*) FROM erp.payments');
      const payId = `PAY-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;
      const recNo = `REC-2025-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

      // Insert payment record
      const paySql = `
        INSERT INTO erp.payments (
          id, receipt_no, invoice_id, invoice_no, customer_id, customer_name,
          date, amount_paid, payment_mode, reference_no, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, CURRENT_DATE, $7, $8, $9, $10)
        RETURNING *
      `;
      const payRes = await client.query(paySql, [
        payId, recNo, inv.id, inv.invoice_no, inv.customer_id, customerName || inv.customer_name,
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

      // Record audit log
      await client.query(`
        INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details)
        VALUES ($1, $2, 'RECORD_PAYMENT', 'FINANCE', $3, $4)
      `, [req.user?.id || 'USR-ADMIN-01', req.user?.name || 'Admin', payId, JSON.stringify({ amountPaid, invoiceNo: inv.invoice_no })]);

      return payRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Payment recorded successfully', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
