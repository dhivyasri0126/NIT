import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET all production runs
router.get('/runs', authenticateToken, async (req, res, next) => {
  try {
    const runsRes = await query(`
      SELECT pr.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'materialId', pmi.material_id,
                   'name', pmi.material_name,
                   'plannedQty', pmi.planned_qty,
                   'actualQty', pmi.actual_qty,
                   'unit', pmi.unit_id,
                   'difference', pmi.difference_qty,
                   'variancePercent', pmi.variance_percent,
                   'cost', pmi.total_cost
                 )
               ) FILTER (WHERE pmi.id IS NOT NULL), '[]'
             ) as "materialsConsumed",
             row_to_json(po.*) as costing
      FROM erp.production_runs pr
      LEFT JOIN erp.production_material_issues pmi ON pr.id = pmi.production_run_id
      LEFT JOIN erp.production_overheads po ON pr.id = po.production_run_id
      GROUP BY pr.id, po.id
      ORDER BY pr.created_at DESC
    `);
    return ApiResponse.success(res, runsRes.rows, 'Production runs retrieved');
  } catch (err) {
    next(err);
  }
});

// POST create production run
router.post('/runs', authenticateToken, authorizeRoles('ADMIN', 'SUPERVISOR', 'OWNER'), async (req, res, next) => {
  try {
    const { productId, productName, batchNo, expectedOutput, actualOutput, damagedPouches, cartonsUsed, materialsConsumed, costing, notes } = req.body;

    const result = await withTransaction(async (client) => {
      const countRes = await client.query('SELECT count(*) FROM erp.production_runs');
      const prId = `PR-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

      const yieldVar = (((actualOutput - (expectedOutput || 200)) / (expectedOutput || 200)) * 100).toFixed(2);

      const insertRunSql = `
        INSERT INTO erp.production_runs (
          id, run_no, batch_no, bom_id, product_id, product_name, date, expected_output,
          actual_output, damaged_pouches, cartons_used, yield_variance_percent,
          supervisor_id, supervisor_name, status, notes
        )
        VALUES ($1, $1, $2, 'BOM-001', $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10, $11, 'Completed', $12)
        RETURNING *
      `;

      const runRes = await client.query(insertRunSql, [
        prId, batchNo, productId || 'PROD-001', productName || 'Murukku (200 g)',
        expectedOutput || 200, actualOutput, damagedPouches || 0, cartonsUsed || 9,
        yieldVar, req.user.id, req.user.name, notes || null
      ]);

      // Insert materials issues and deduct stock
      if (materialsConsumed && Array.isArray(materialsConsumed)) {
        for (const m of materialsConsumed) {
          await client.query(`
            INSERT INTO erp.production_material_issues (
              production_run_id, material_id, material_type, material_name, planned_qty, actual_qty,
              unit_id, difference_qty, variance_percent, total_cost
            )
            VALUES ($1, $2, 'RAW_MATERIAL', $3, $4, $5, $6, $7, $8, $9)
          `, [
            prId, m.materialId || 'MAT-001', m.name, m.plannedQty, m.actualQty,
            m.unit || 'kg', m.difference || 0, m.variancePercent || 0, m.cost || 0
          ]);

          // Deduct from inventory
          await client.query(`
            UPDATE erp.inventory_items
            SET current_stock = GREATEST(0, current_stock - $1),
                total_outward = total_outward + $1,
                updated_at = CURRENT_TIMESTAMP
            WHERE item_id = $2
          `, [m.actualQty, m.materialId]);
        }
      }

      // Add finished goods to inventory
      await client.query(`
        UPDATE erp.inventory_items
        SET current_stock = current_stock + $1,
            total_inward = total_inward + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE item_type = 'FINISHED_GOODS' AND item_id = $2
      `, [actualOutput, productId || 'PROD-001']);

      // Overheads and unit cost
      if (costing) {
        await client.query(`
          INSERT INTO erp.production_overheads (
            production_run_id, flour_cost, oil_cost, spice_cost, pouch_cost, carton_cost,
            labour_cost, power_gas_cost, total_manufacturing_cost, cost_per_packet,
            selling_price, profit_per_packet, profit_margin_percent
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [
          prId, costing.flourCost || 1725, costing.oilCost || 1470, costing.spiceCost || 240,
          costing.pouchCost || 485, costing.cartonCost || 135, costing.labourCost || 1200,
          costing.powerGasCost || 600, costing.totalManufacturingCost || 5855,
          costing.costPerPacket || 31.14, costing.sellingPrice || 50,
          costing.profitPerPacket || 18.86, costing.profitMarginPercent || 37.7
        ]);
      }

      return runRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Production run recorded and stock updated', 201);
  } catch (err) {
    next(err);
  }
});

export default router;
