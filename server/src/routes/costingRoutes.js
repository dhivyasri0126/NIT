import { Router } from 'express';
import { query } from '../config/database.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';

const router = Router();

// GET unit costing analysis for a production run
router.get('/runs/:runId', authenticateToken, async (req, res, next) => {
  try {
    const { runId } = req.params;
    const costingRes = await query(`
      SELECT po.*, pr.batch_no, pr.product_name, pr.actual_output, pr.date, pr.status
      FROM erp.production_overheads po
      JOIN erp.production_runs pr ON po.production_run_id = pr.id
      WHERE po.production_run_id = $1
    `, [runId]);

    if (costingRes.rows.length === 0) {
      return ApiResponse.error(res, 'Costing data not found for run', [], 404);
    }

    return ApiResponse.success(res, costingRes.rows[0], 'Costing retrieved');
  } catch (err) {
    next(err);
  }
});

// GET product costing breakdown and BOM pricing model
router.get('/products/:productId', authenticateToken, async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { priceInflationPercent = 0 } = req.query;

    const prodRes = await query(`SELECT * FROM erp.products WHERE id = $1`, [productId]);
    if (prodRes.rows.length === 0) {
      return ApiResponse.error(res, 'Product not found', [], 404);
    }
    const product = prodRes.rows[0];

    // Fetch active BOM
    const bomRes = await query(`
      SELECT b.*,
             COALESCE(
               json_agg(
                 json_build_object(
                   'materialId', bi.material_id,
                   'materialType', bi.material_type,
                   'materialName', bi.material_name,
                   'plannedQty', bi.planned_qty,
                   'unit', bi.unit_id,
                   'standardRate', bi.standard_rate,
                   'totalCost', ROUND((bi.planned_qty * bi.standard_rate)::numeric, 2)
                 )
               ) FILTER (WHERE bi.id IS NOT NULL), '[]'
             ) as items
      FROM erp.boms b
      LEFT JOIN erp.bom_items bi ON b.id = bi.bom_id
      WHERE b.product_id = $1 AND b.is_active = TRUE
      GROUP BY b.id
    `, [productId]);

    const bom = bomRes.rows[0];
    const items = bom ? bom.items : [];

    let rawMaterialCost = 0;
    let packagingCost = 0;

    const inflationMultiplier = 1 + (parseFloat(priceInflationPercent) || 0) / 100;

    items.forEach(item => {
      const adjustedRate = item.standardRate * (item.materialType === 'RAW_MATERIAL' ? inflationMultiplier : 1);
      const cost = item.plannedQty * adjustedRate;
      if (item.materialType === 'RAW_MATERIAL') {
        rawMaterialCost += cost;
      } else {
        packagingCost += cost;
      }
    });

    const labourCost = bom ? parseFloat(bom.standard_labour_cost) : 1200.00;
    const powerGasCost = bom ? parseFloat(bom.standard_power_gas_cost) : 600.00;
    const batchSize = bom ? parseFloat(bom.batch_size) : 200;

    const totalBatchCost = rawMaterialCost + packagingCost + labourCost + powerGasCost;
    const unitCost = batchSize > 0 ? totalBatchCost / batchSize : 0;
    const sellingPrice = parseFloat(product.selling_price) || 50.00;
    const profitMargin = sellingPrice - unitCost;
    const marginPercent = sellingPrice > 0 ? (profitMargin / sellingPrice) * 100 : 0;

    const result = {
      productId: product.id,
      productName: product.name,
      batchSize,
      unit: product.unit,
      sellingPrice,
      costBreakdown: {
        rawMaterialCost: Math.round(rawMaterialCost * 100) / 100,
        packagingCost: Math.round(packagingCost * 100) / 100,
        labourCost: Math.round(labourCost * 100) / 100,
        powerGasCost: Math.round(powerGasCost * 100) / 100,
        totalBatchCost: Math.round(totalBatchCost * 100) / 100,
        unitCost: Math.round(unitCost * 100) / 100,
      },
      profitability: {
        sellingPrice,
        unitCost: Math.round(unitCost * 100) / 100,
        profitMargin: Math.round(profitMargin * 100) / 100,
        marginPercent: Math.round(marginPercent * 10) / 10,
      },
      items,
      simulation: {
        priceInflationPercent: parseFloat(priceInflationPercent) || 0,
        simulatedRawMaterialCost: Math.round(rawMaterialCost * 100) / 100,
        simulatedUnitCost: Math.round(unitCost * 100) / 100,
      }
    };

    return ApiResponse.success(res, result, 'Product costing calculated');
  } catch (err) {
    next(err);
  }
});

export default router;
