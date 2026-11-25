import { Router } from 'express';
import { query, withTransaction } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// Handler function for getting all production runs
const getProductionRuns = async (req, res, next) => {
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
      ORDER BY pr.date DESC, pr.created_at DESC
    `);
    return ApiResponse.success(res, runsRes.rows, 'Production runs retrieved');
  } catch (err) {
    next(err);
  }
};

// Handler function for getting single run by ID
const getProductionRunById = async (req, res, next) => {
  try {
    const runRes = await query(`
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
      WHERE pr.id = $1 OR pr.run_no = $1
      GROUP BY pr.id, po.id
    `, [req.params.id]);

    if (runRes.rows.length === 0) {
      return ApiResponse.error(res, 'Production run not found', [], 404);
    }
    return ApiResponse.success(res, runRes.rows[0], 'Production run retrieved');
  } catch (err) {
    next(err);
  }
};

// Handler function for creating production run (atomic 11-step transaction)
const createProductionRun = async (req, res, next) => {
  try {
    const {
      productId,
      productName,
      batchNo,
      expectedOutput = 200,
      actualOutput,
      damagedPouches = 0,
      wastageGrams = 0,
      cartonsUsed = 9,
      materialsConsumed = [],
      costing,
      notes,
    } = req.body;

    const actualGood = parseFloat(actualOutput);
    if (isNaN(actualGood) || actualGood <= 0) {
      return ApiResponse.error(res, 'Valid actual output (packets produced) is required', [], 400);
    }

    const result = await withTransaction(async (client) => {
      // 1. Generate ID
      const countRes = await client.query('SELECT count(*) FROM erp.production_runs');
      const prId = `PR-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;
      const effectiveBatch = batchNo || `BATCH-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

      // 2. Validate availability of raw and packaging materials
      for (const m of materialsConsumed) {
        const matStockRes = await client.query(
          `SELECT current_stock, item_name, unit_id FROM erp.inventory_items WHERE item_id = $1`,
          [m.materialId]
        );
        if (matStockRes.rows.length > 0) {
          const avail = parseFloat(matStockRes.rows[0].current_stock);
          if (avail < parseFloat(m.actualQty)) {
            throw new Error(`Insufficient inventory for ${matStockRes.rows[0].item_name}: requested ${m.actualQty}, available ${avail}`);
          }
        }
      }

      // 3. Compute Yield Variance
      const yieldVariance = (((actualGood - expectedOutput) / expectedOutput) * 100).toFixed(2);

      // 4. Insert Production Run Record
      const insertRunSql = `
        INSERT INTO erp.production_runs (
          id, run_no, batch_no, bom_id, product_id, product_name, date, expected_output,
          actual_output, damaged_pouches, wastage_grams, cartons_used, yield_variance_percent,
          supervisor_id, supervisor_name, status, notes
        )
        VALUES ($1, $1, $2, 'BOM-001', $3, $4, CURRENT_DATE, $5, $6, $7, $8, $9, $10, $11, $12, 'Completed', $13)
        RETURNING *
      `;

      const runRes = await client.query(insertRunSql, [
        prId, effectiveBatch, productId || 'PROD-001', productName || 'Murukku (200 g)',
        expectedOutput, actualGood, damagedPouches, wastageGrams, cartonsUsed,
        yieldVariance, req.user.id, req.user.name, notes || null
      ]);

      // 5. Deduct raw & packaging materials & record ledger
      let totalMaterialCost = 0;
      for (const m of materialsConsumed) {
        const planned = parseFloat(m.plannedQty || 0);
        const actual = parseFloat(m.actualQty || 0);
        const diff = actual - planned;
        const varPct = planned > 0 ? ((diff / planned) * 100).toFixed(2) : 0;
        const cost = parseFloat(m.cost || 0);
        totalMaterialCost += cost;

        // Record material issue
        await client.query(`
          INSERT INTO erp.production_material_issues (
            production_run_id, material_id, material_type, material_name, planned_qty, actual_qty,
            unit_id, difference_qty, variance_percent, total_cost
          )
          VALUES ($1, $2, 'RAW_MATERIAL', $3, $4, $5, $6, $7, $8, $9)
        `, [prId, m.materialId, m.name, planned, actual, m.unit || 'kg', diff, varPct, cost]);

        // Deduct inventory
        await client.query(`
          UPDATE erp.inventory_items
          SET current_stock = GREATEST(0, current_stock - $1),
              total_outward = total_outward + $1,
              updated_at = CURRENT_TIMESTAMP
          WHERE item_id = $2
        `, [actual, m.materialId]);

        // Stock Ledger entry
        const curRes = await client.query(`SELECT current_stock, unit_id FROM erp.inventory_items WHERE item_id = $1`, [m.materialId]);
        const bal = curRes.rows[0] ? curRes.rows[0].current_stock : 0;
        await client.query(`
          INSERT INTO erp.stock_ledger (item_type, item_id, item_name, voucher_type, voucher_ref, outward_qty, balance_qty, unit_id, notes)
          VALUES ('RAW_MATERIAL', $1, $2, 'PRODUCTION_ISSUE', $3, $4, $5, $6, $7)
        `, [m.materialId, m.name, prId, actual, bal, m.unit || 'kg', `Issued for Batch ${effectiveBatch}`]);
      }

      // 6. Increase Finished Goods stock & record in stock ledger
      await client.query(`
        UPDATE erp.inventory_items
        SET current_stock = current_stock + $1,
            total_inward = total_inward + $1,
            updated_at = CURRENT_TIMESTAMP
        WHERE item_type = 'FINISHED_GOODS' AND item_id = $2
      `, [actualGood, productId || 'PROD-001']);

      const fgBalRes = await client.query(
        `SELECT current_stock FROM erp.inventory_items WHERE item_type = 'FINISHED_GOODS' AND item_id = $1`,
        [productId || 'PROD-001']
      );
      const fgBal = fgBalRes.rows[0] ? fgBalRes.rows[0].current_stock : 0;

      await client.query(`
        INSERT INTO erp.stock_ledger (item_type, item_id, item_name, voucher_type, voucher_ref, inward_qty, balance_qty, unit_id, notes)
        VALUES ('FINISHED_GOODS', $1, $2, 'PRODUCTION_RECEIPT', $3, $4, $5, 'packets', $6)
      `, [productId || 'PROD-001', productName || 'Murukku (200 g)', prId, actualGood, fgBal, `Output from Batch ${effectiveBatch}`]);

      // 7. Calculate and insert Overheads & Costing
      const labour = (costing && costing.labourCost) || 1200.00;
      const powerGas = (costing && costing.powerGasCost) || 600.00;
      const totalMfgCost = totalMaterialCost > 0 ? (totalMaterialCost + labour + powerGas) : ((costing && costing.totalManufacturingCost) || 5855.00);
      const costPerPkt = (totalMfgCost / actualGood).toFixed(4);
      const sellingPrice = (costing && costing.sellingPrice) || 50.00;
      const profitPerPkt = (sellingPrice - costPerPkt).toFixed(4);
      const profitMargin = ((profitPerPkt / sellingPrice) * 100).toFixed(2);

      await client.query(`
        INSERT INTO erp.production_overheads (
          production_run_id, flour_cost, oil_cost, spice_cost, pouch_cost, carton_cost,
          labour_cost, power_gas_cost, total_manufacturing_cost, cost_per_packet,
          selling_price, profit_per_packet, profit_margin_percent
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `, [
        prId,
        (costing && costing.flourCost) || 1725.00,
        (costing && costing.oilCost) || 1470.00,
        (costing && costing.spiceCost) || 240.00,
        (costing && costing.pouchCost) || 485.00,
        (costing && costing.cartonCost) || 135.00,
        labour,
        powerGas,
        totalMfgCost,
        costPerPkt,
        sellingPrice,
        profitPerPkt,
        profitMargin
      ]);

      // 8. Audit log
      await client.query(`
        INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details)
        VALUES ($1, $2, 'PRODUCTION_RUN_POSTED', 'PRODUCTION', $3, $4)
      `, [req.user.id, req.user.name, prId, JSON.stringify({ batchNo: effectiveBatch, actualGood, yieldVariance, totalMfgCost, costPerPkt })]);

      return runRes.rows[0];
    });

    return ApiResponse.success(res, result, 'Production batch posted and inventory updated atomically', 201);
  } catch (err) {
    next(err);
  }
};

// Mount routes (supporting both / and /runs)
router.get('/', authenticateToken, getProductionRuns);
router.get('/runs', authenticateToken, getProductionRuns);
router.get('/:id', authenticateToken, getProductionRunById);
router.get('/runs/:id', authenticateToken, getProductionRunById);

router.post('/', authenticateToken, authorizeRoles('ADMIN', 'SUPERVISOR', 'OWNER'), createProductionRun);
router.post('/runs', authenticateToken, authorizeRoles('ADMIN', 'SUPERVISOR', 'OWNER'), createProductionRun);

export default router;
