import { query } from '../config/database.js';

export class SupplierRepository {
  static async findAll({ search, category } = {}) {
    let sql = `SELECT * FROM erp.suppliers WHERE 1=1`;
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(city) LIKE $${params.length} OR LOWER(id) LIKE $${params.length})`;
    }
    if (category) {
      params.push(category);
      sql += ` AND category = $${params.length}`;
    }

    sql += ` ORDER BY id ASC`;
    const res = await query(sql, params);
    return res.rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM erp.suppliers WHERE id = $1`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async create(data) {
    const countSql = `SELECT count(*) FROM erp.suppliers`;
    const countRes = await query(countSql);
    const nextId = data.id || `SUPP-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

    const sql = `
      INSERT INTO erp.suppliers (id, name, category, city, state, gstin, contact, rating)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const res = await query(sql, [
      nextId,
      data.name,
      data.category,
      data.city,
      data.state || 'Tamil Nadu',
      data.gstin || null,
      data.contact,
      data.rating || 5.0,
    ]);
    return res.rows[0];
  }

  static async update(id, data) {
    const sql = `
      UPDATE erp.suppliers
      SET name = COALESCE($1, name),
          category = COALESCE($2, category),
          city = COALESCE($3, city),
          state = COALESCE($4, state),
          gstin = COALESCE($5, gstin),
          contact = COALESCE($6, contact),
          rating = COALESCE($7, rating),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $8
      RETURNING *
    `;
    const res = await query(sql, [
      data.name,
      data.category,
      data.city,
      data.state,
      data.gstin,
      data.contact,
      data.rating,
      id,
    ]);
    return res.rows[0] || null;
  }

  static async delete(id) {
    const sql = `DELETE FROM erp.suppliers WHERE id = $1 RETURNING id`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}
