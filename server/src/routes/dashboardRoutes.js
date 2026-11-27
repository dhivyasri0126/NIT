import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET unified dashboard summary with real aggregated data
router.get('/summary', authenticateToken, async (req, res, next) => {
  try {
    // 1. Orders summary
    const ordersStatsRes = await query(`
      SELECT
        COUNT(id) as total_orders,
        COUNT(CASE WHEN status = 'Submitted' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'Approved' THEN 1 END) as approved_orders,
        COUNT(CASE WHEN status = 'Invoiced' THEN 1 END) as invoiced_orders,
        COUNT(CASE WHEN status = 'Dispatched' THEN 1 END) as dispatched_orders,
        COALESCE(SUM(total_amount), 0) as total_order_value,
        COALESCE(SUM(CASE WHEN status = 'Submitted' THEN total_amount ELSE 0 END), 0) as pending_order_value
      FROM erp.orders
    `);

    // 2. Invoices & Receivables summary
    const invStatsRes = await query(`
      SELECT
        COUNT(id) as total_invoices,
        COALESCE(SUM(total), 0) as total_billed,
        COALESCE(SUM(paid_amount), 0) as total_collected,
        COALESCE(SUM(outstanding_amount), 0) as total_receivable,
        COALESCE(SUM(cgst + sgst + igst), 0) as total_gst
      FROM erp.invoices
    `);

    // 3. Stock positions summary
    const stockStatsRes = await query(`
      SELECT
        COUNT(id) as total_items,
        COUNT(CASE WHEN current_stock <= reorder_level THEN 1 END) as low_stock_items,
        COALESCE(SUM(CASE WHEN item_type = 'FINISHED_GOODS' THEN current_stock ELSE 0 END), 0) as finished_goods_stock,
        COALESCE(SUM(CASE WHEN item_type = 'RAW_MATERIAL' THEN current_stock ELSE 0 END), 0) as raw_materials_stock,
        COALESCE(SUM(CASE WHEN item_type = 'PACKAGING' THEN current_stock ELSE 0 END), 0) as packaging_stock,
        COALESCE(SUM(current_stock * avg_cost), 0) as total_valuation
      FROM erp.inventory_items
    `);

    // 4. Production summary
    const prodStatsRes = await query(`
      SELECT
        COUNT(id) as total_runs,
        COALESCE(SUM(expected_output), 0) as total_planned_output,
        COALESCE(SUM(actual_output), 0) as total_actual_output,
        COALESCE(SUM(damaged_pouches), 0) as total_damaged_pouches,
        COALESCE(SUM(wastage_grams), 0) as total_wastage_grams,
        ROUND(COALESCE(AVG(yield_variance_percent), 0)::numeric, 2) as avg_yield_variance
      FROM erp.production_runs
    `);

    // 5. Low stock alerts
    const lowStockAlertsRes = await query(`
      SELECT item_type, item_id, item_name, current_stock, reorder_level, unit_id
      FROM erp.inventory_items
      WHERE current_stock <= reorder_level
    `);

    // 6. Recent orders
    const recentOrdersRes = await query(`
      SELECT id, order_no, customer_name, order_date, total_amount, status
      FROM erp.orders
      ORDER BY order_date DESC, created_at DESC
      LIMIT 5
    `);

    // 7. Recent payments
    const recentPaymentsRes = await query(`
      SELECT id, receipt_no, invoice_no, customer_name, date, amount_paid, payment_mode
      FROM erp.payments
      ORDER BY date DESC, created_at DESC
      LIMIT 5
    `);

    const summary = {
      orders: ordersStatsRes.rows[0],
      invoices: invStatsRes.rows[0],
      inventory: stockStatsRes.rows[0],
      production: prodStatsRes.rows[0],
      lowStockAlerts: lowStockAlertsRes.rows,
      recentOrders: recentOrdersRes.rows,
      recentPayments: recentPaymentsRes.rows,
    };

    return ApiResponse.success(res, summary, 'Dashboard summary data');
  } catch (err) {
    next(err);
  }
});

export default router;
