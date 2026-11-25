import { query } from '../config/database.js';

export class CustomerRepository {
  static async findAll({ search, state } = {}) {
    let sql = `SELECT * FROM erp.customers WHERE 1=1`;
    const params = [];

    if (search) {
      params.push(`%${search.toLowerCase()}%`);
      sql += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(city) LIKE $${params.length} OR LOWER(id) LIKE $${params.length})`;
    }
    if (state) {
      params.push(state);
      sql += ` AND state = $${params.length}`;
    }

    sql += ` ORDER BY id ASC`;
    const res = await query(sql, params);
    return res.rows;
  }

  static async findById(id) {
    const sql = `SELECT * FROM erp.customers WHERE id = $1`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async create(data) {
    const countSql = `SELECT count(*) FROM erp.customers`;
    const countRes = await query(countSql);
    const nextId = data.id || `CUST-${String(parseInt(countRes.rows[0].count) + 1).padStart(3, '0')}`;

    const sql = `
      INSERT INTO erp.customers (
        id, name, contact_person, city, state, state_code, address, gstin, phone, credit_limit, outstanding_balance
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *
    `;
    const res = await query(sql, [
      nextId,
      data.name,
      data.contact_person || null,
      data.city,
      data.state || 'Tamil Nadu',
      data.state_code || '33',
      data.address,
      data.gstin || null,
      data.phone,
      data.credit_limit || 50000.0,
      data.outstanding_balance || 0.0,
    ]);
    return res.rows[0];
  }

  static async update(id, data) {
    const sql = `
      UPDATE erp.customers
      SET name = COALESCE($1, name),
          contact_person = COALESCE($2, contact_person),
          city = COALESCE($3, city),
          state = COALESCE($4, state),
          address = COALESCE($5, address),
          gstin = COALESCE($6, gstin),
          phone = COALESCE($7, phone),
          credit_limit = COALESCE($8, credit_limit),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = $9
      RETURNING *
    `;
    const res = await query(sql, [
      data.name,
      data.contact_person,
      data.city,
      data.state,
      data.address,
      data.gstin,
      data.phone,
      data.credit_limit,
      id,
    ]);
    return res.rows[0] || null;
  }

  static async delete(id) {
    const sql = `DELETE FROM erp.customers WHERE id = $1 RETURNING id`;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }
}
