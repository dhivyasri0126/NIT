import { query } from '../config/database.js';

export class MaterialRepository {
  static async findAllRaw({ search } = {}) {
    let sql = `
      SELECT rm.*, u.name as unit_name, s.name as supplier_name,
             COALESCE(inv.current_stock, 0) as closing_stock,
             COALESCE(inv.opening_stock, 0) as opening_stock,
             COALESCE(inv.total_inward, 0) as purchased,
             COALESCE(inv.total_outward, 0) as consumed
      FROM erp.raw_materials rm
      LEFT JOIN erp.units u ON rm.unit_id = u.id
      LEFT JOIN erp.suppliers s ON rm.supplier_id = s.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'RAW_MATERIAL' AND inv.item_id = rm.id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(rm.name) LIKE $${params.length} OR LOWER(rm.id) LIKE $${params.length})`;
    }
    sql += ` ORDER BY rm.id ASC`;
    const res = await query(sql, params);
    return res.rows;
  }

  static async findAllPackaging({ search } = {}) {
    let sql = `
      SELECT pm.*, u.name as unit_name, s.name as supplier_name,
             COALESCE(inv.current_stock, 0) as closing_stock,
             COALESCE(inv.opening_stock, 0) as opening_stock,
             COALESCE(inv.total_inward, 0) as purchased,
             COALESCE(inv.total_outward, 0) as consumed
      FROM erp.packaging_materials pm
      LEFT JOIN erp.units u ON pm.unit_id = u.id
      LEFT JOIN erp.suppliers s ON pm.supplier_id = s.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'PACKAGING' AND inv.item_id = pm.id
      WHERE 1=1
    `;
    const params = [];
    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(pm.name) LIKE $${params.length} OR LOWER(pm.id) LIKE $${params.length})`;
    }
    sql += ` ORDER BY pm.id ASC`;
    const res = await query(sql, params);
    return res.rows;
  }

  static async findAllMaterialsCombined() {
    const raw = await this.findAllRaw();
    const pkg = await this.findAllPackaging();
    return [...raw, ...pkg];
  }

  static async createRaw(data) {
    const countSql = `SELECT count(*) FROM erp.raw_materials`;
    const countRes = await query(countSql);
    const nextId = data.id || `MAT-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

    const sql = `
      INSERT INTO erp.raw_materials (id, name, category, unit_id, avg_cost_per_unit, reorder_level, supplier_id, status)
      VALUES ($1, $2, 'Raw Material', $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const res = await query(sql, [
      nextId,
      data.name,
      data.unit_id || 'kg',
      data.avg_cost_per_unit || 0.0,
      data.reorder_level || 10.0,
      data.supplier_id || null,
      data.status || 'In Stock',
    ]);

    await query(`
      INSERT INTO erp.inventory_items (item_type, item_id, item_name, unit_id, current_stock, opening_stock, reorder_level, avg_cost)
      VALUES ('RAW_MATERIAL', $1, $2, $3, 0, 0, $4, $5)
      ON CONFLICT (item_type, item_id) DO NOTHING
    `, [nextId, data.name, data.unit_id || 'kg', data.reorder_level || 10.0, data.avg_cost_per_unit || 0.0]);

    return res.rows[0];
  }

  static async createPackaging(data) {
    const countSql = `SELECT count(*) FROM erp.packaging_materials`;
    const countRes = await query(countSql);
    const nextId = data.id || `MAT-${String(parseInt(countRes.rows[0].count) + 4).padStart(3, '0')}`;

    const sql = `
      INSERT INTO erp.packaging_materials (id, name, category, unit_id, avg_cost_per_unit, reorder_level, supplier_id, status)
      VALUES ($1, $2, 'Packaging', $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const res = await query(sql, [
      nextId,
      data.name,
      data.unit_id || 'pcs',
      data.avg_cost_per_unit || 0.0,
      data.reorder_level || 50.0,
      data.supplier_id || null,
      data.status || 'In Stock',
    ]);

    await query(`
      INSERT INTO erp.inventory_items (item_type, item_id, item_name, unit_id, current_stock, opening_stock, reorder_level, avg_cost)
      VALUES ('PACKAGING', $1, $2, $3, 0, 0, $4, $5)
      ON CONFLICT (item_type, item_id) DO NOTHING
    `, [nextId, data.name, data.unit_id || 'pcs', data.reorder_level || 50.0, data.avg_cost_per_unit || 0.0]);

    return res.rows[0];
  }
}
