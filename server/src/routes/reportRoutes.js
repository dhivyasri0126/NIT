import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET Sales register with customer breakdowns
router.get('/sales', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER', 'SALESMAN'), async (req, res, next) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    let sql = `
      SELECT
        o.id,
        o.order_no,
        o.order_date,
        o.customer_name,
        u.name as salesman_name,
        o.status,
        o.taxable_amount,
        o.cgst_total,
        o.sgst_total,
        o.igst_total,
        o.total_amount,
        o.invoice_no
      FROM erp.orders o
      LEFT JOIN erp.users u ON o.salesman_id = u.id
      WHERE 1=1
    `;
    const params = [];

    if (req.user.role === 'SALESMAN') {
      params.push(req.user.id);
      sql += ` AND o.salesman_id = $${params.length}`;
    }
    if (customerId) {
      params.push(customerId);
      sql += ` AND o.customer_id = $${params.length}`;
    }
    if (startDate) {
      params.push(startDate);
      sql += ` AND o.order_date >= $${params.length}`;
    }
    if (endDate) {
      params.push(endDate);
      sql += ` AND o.order_date <= $${params.length}`;
    }
    sql += ` ORDER BY o.order_date DESC, o.created_at DESC`;

    const salesRes = await query(sql, params);
    return ApiResponse.success(res, salesRes.rows, 'Sales register retrieved');
  } catch (err) {
    next(err);
  }
});

// GET Purchase register with supplier details
router.get('/purchases', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER', 'SUPERVISOR'), async (req, res, next) => {
  try {
    const purchasesRes = await query(`
      SELECT
        p.id,
        p.po_number,
        p.supplier_name,
        p.order_date,
        p.invoice_ref,
        p.total_amount,
        p.status,
        p.payment_status,
        COALESCE(
          json_agg(
            json_build_object(
              'itemName', pi.item_name,
              'quantity', pi.quantity,
              'unit', pi.unit_id,
              'rate', pi.unit_price,
              'amount', pi.total_amount
            )
          ) FILTER (WHERE pi.id IS NOT NULL), '[]'
        ) as items
      FROM erp.purchases p
      LEFT JOIN erp.purchase_items pi ON p.id = pi.purchase_id
      GROUP BY p.id
      ORDER BY p.order_date DESC
    `);
    return ApiResponse.success(res, purchasesRes.rows, 'Purchase register retrieved');
  } catch (err) {
    next(err);
  }
});

// GET Inventory status & movements
router.get('/inventory', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER', 'SUPERVISOR'), async (req, res, next) => {
  try {
    const invRes = await query(`
      SELECT
        item_type,
        item_id,
        item_name,
        unit_id,
        opening_stock,
        total_inward,
        total_outward,
        current_stock,
        reorder_level,
        avg_cost,
        ROUND((current_stock * avg_cost)::numeric, 2) as valuation,
        status,
        (current_stock <= reorder_level) as is_low_stock
      FROM erp.inventory_items
      ORDER BY item_type, item_name
    `);
    return ApiResponse.success(res, invRes.rows, 'Inventory report retrieved');
  } catch (err) {
    next(err);
  }
});

// GET Production yield summary
router.get('/production', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER', 'SUPERVISOR'), async (req, res, next) => {
  try {
    const prodRes = await query(`
      SELECT
        pr.id,
        pr.run_number,
        pr.batch_no,
        pr.product_name,
        pr.date,
        pr.planned_output,
        pr.actual_output,
        pr.wastage_qty,
        pr.efficiency_percent,
        pr.supervisor_name,
        pr.status,
        po.total_cost,
        po.unit_cost
      FROM erp.production_runs pr
      LEFT JOIN erp.production_overheads po ON pr.id = po.production_run_id
      ORDER BY pr.date DESC
    `);
    return ApiResponse.success(res, prodRes.rows, 'Production report retrieved');
  } catch (err) {
    next(err);
  }
});

// GET GST tax summary
router.get('/gst-summary', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
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
router.get('/stock-summary', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER', 'SUPERVISOR'), async (req, res, next) => {
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

// GET Material & yield variance report
router.get('/variance', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER', 'SUPERVISOR'), async (req, res, next) => {
  try {
    const varianceRes = await query(`
      SELECT
        pr.batch_no,
        pr.product_name,
        pr.date,
        pmi.material_name,
        pmi.unit_id,
        pmi.planned_qty,
        pmi.actual_qty,
        pmi.variance_qty,
        pmi.variance_percent,
        (pmi.variance_percent > 3.0 OR pmi.variance_percent < -3.0) as is_significant_variance
      FROM erp.production_material_issues pmi
      JOIN erp.production_runs pr ON pmi.production_run_id = pr.id
      ORDER BY pr.date DESC, pmi.id ASC
    `);
    return ApiResponse.success(res, varianceRes.rows, 'Variance report retrieved');
  } catch (err) {
    next(err);
  }
});

// GET Product profitability report
router.get('/costing', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const costingRes = await query(`
      SELECT
        p.id,
        p.name,
        pc.name as category,
        p.selling_price,
        p.cost_price,
        ROUND((p.selling_price - p.cost_price)::numeric, 2) as profit_per_unit,
        ROUND((((p.selling_price - p.cost_price) / NULLIF(p.selling_price, 0)) * 100)::numeric, 1) as margin_percent,
        COALESCE(inv.current_stock, 0) as current_stock,
        ROUND((COALESCE(inv.current_stock, 0) * p.cost_price)::numeric, 2) as inventory_valuation
      FROM erp.products p
      LEFT JOIN erp.product_categories pc ON p.category_id = pc.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'FINISHED_GOODS' AND inv.item_id = p.id
      ORDER BY margin_percent DESC NULLS LAST
    `);
    return ApiResponse.success(res, costingRes.rows, 'Costing and profitability report');
  } catch (err) {
    next(err);
  }
});

// GET Audit logs
router.get('/audit-logs', authenticateToken, authorizeRoles('ADMIN', 'AUDITOR', 'OWNER'), async (req, res, next) => {
  try {
    const logsRes = await query(`
      SELECT
        al.id,
        al.action,
        al.module,
        al.entity_id,
        al.details,
        al.ip_address,
        al.created_at,
        COALESCE(al.user_name, u.name) as user_name,
        u.email as user_email
      FROM erp.audit_logs al
      LEFT JOIN erp.users u ON al.user_id = u.id
      ORDER BY al.created_at DESC
      LIMIT 100
    `);
    return ApiResponse.success(res, logsRes.rows, 'Audit trail retrieved');
  } catch (err) {
    next(err);
  }
});

export default router;
