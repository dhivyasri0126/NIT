import { query } from '../config/database.js';

export class ProductRepository {
  static async findAll({ search, category, status } = {}) {
    let sql = `
      SELECT p.*, c.name as category_name, u.name as unit_name,
             COALESCE(inv.current_stock, 0) as current_stock
      FROM erp.products p
      LEFT JOIN erp.product_categories c ON p.category_id = c.id
      LEFT JOIN erp.units u ON p.unit_id = u.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'FINISHED_GOODS' AND inv.item_id = p.id
      WHERE 1=1
    `;
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.id) LIKE $${params.length} OR LOWER(p.hsn) LIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      sql += ` AND c.name = $${params.length}`;
    }
    if (status) {
      params.push(status);
      sql += ` AND p.status = $${params.length}`;
    }

    sql += ` ORDER BY p.id ASC`;
    const res = await query(sql, params);
    return res.rows;
  }

  static async findById(id) {
    const sql = `
      SELECT p.*, c.name as category_name, u.name as unit_name,
             COALESCE(inv.current_stock, 0) as current_stock
      FROM erp.products p
      LEFT JOIN erp.product_categories c ON p.category_id = c.id
      LEFT JOIN erp.units u ON p.unit_id = u.id
      LEFT JOIN erp.inventory_items inv ON inv.item_type = 'FINISHED_GOODS' AND inv.item_id = p.id
      WHERE p.id = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async create(data, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const countSql = `SELECT count(*) FROM erp.products`;
    const countRes = await runner(countSql);
    const nextId = data.id || `PROD-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

    const sql = `
      INSERT INTO erp.products (
        id, name, category_id, hsn, unit_id, weight_grams, selling_price, cost_price, gst_rate, min_stock, shelf_life_days, status
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *
    `;
    const res = await runner(sql, [
      nextId,
      data.name,
      data.category_id || 1,
      data.hsn || '19059090',
      data.unit_id || 'packets',
      data.weight_grams || 200,
      data.selling_price,
      data.cost_price,
      data.gst_rate || 5.0,
      data.min_stock || 30,
      data.shelf_life_days || 90,
      data.status || 'Active',
    ]);

    // Also initialize inventory row if not exists
    const invSql = `
      INSERT INTO erp.inventory_items (item_type, item_id, item_name, unit_id, current_stock, opening_stock, reorder_level)
      VALUES ('FINISHED_GOODS', $1, $2, $3, 0, 0, $4)
      ON CONFLICT (item_type, item_id) DO NOTHING
    `;
    await runner(invSql, [nextId, data.name, data.unit_id || 'packets', data.min_stock || 30]);

    return res.rows[0];
  }

  static async update(id, data, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const sql = `
      UPDATE erp.products
      SET name = COALESCE($1, name),
          selling_price = COALESCE($2, selling_price),
          cost_price = COALESCE($3, cost_price),
          gst_rate = COALESCE($4, gst_rate),
          min_stock = COALESCE($5, min_stock),
          status = COALESCE($6, status),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $7
      RETURNING *
    `;
    const res = await runner(sql, [
      data.name,
      data.selling_price,
      data.cost_price,
      data.gst_rate,
      data.min_stock,
      data.status,
      id,
    ]);
    return res.rows[0] || null;
  }

  static async delete(id) {
    const sql = `DELETE FROM erp.products WHERE id = $1 RETURNING id`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}
