import { query } from '../config/database.js';

export class UserRepository {
  static async findByEmail(email) {
    const sql = `
      SELECT u.*, r.id as role_id, r.code as role_code, r.name as role_name
      FROM erp.users u
      LEFT JOIN erp.user_roles ur ON u.id = ur.user_id
      LEFT JOIN erp.roles r ON ur.role_id = r.id
      WHERE u.email = $1
    `;
    const res = await query(sql, [email.toLowerCase().trim()]);
    return res.rows[0] || null;
  }

  static async findById(id) {
    const sql = `
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             r.id as role_id, r.code as role_code, r.name as role_name
      FROM erp.users u
      LEFT JOIN erp.user_roles ur ON u.id = ur.user_id
      LEFT JOIN erp.roles r ON ur.role_id = r.id
      WHERE u.id = $1
    `;
    const res = await query(sql, [id]);
    return res.rows[0] || null;
  }

  static async findAll() {
    const sql = `
      SELECT u.id, u.name, u.email, u.phone, u.status, u.created_at,
             r.id as role_id, r.code as role_code, r.name as role_name
      FROM erp.users u
      LEFT JOIN erp.user_roles ur ON u.id = ur.user_id
      LEFT JOIN erp.roles r ON ur.role_id = r.id
      ORDER BY u.created_at ASC
    `;
    const res = await query(sql);
    return res.rows;
  }

  static async create(userData, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const sql = `
      INSERT INTO erp.users (id, name, email, password_hash, phone, status)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, name, email, phone, status, created_at
    `;
    const res = await runner(sql, [
      userData.id,
      userData.name,
      userData.email.toLowerCase().trim(),
      userData.passwordHash,
      userData.phone || null,
      userData.status || 'ACTIVE',
    ]);
    return res.rows[0];
  }

  static async assignRole(userId, roleId, client = null) {
    const runner = client ? client.query.bind(client) : query;
    const sql = `
      INSERT INTO erp.user_roles (user_id, role_id)
      VALUES ($1, $2)
      ON CONFLICT (user_id, role_id) DO NOTHING
    `;
    return runner(sql, [userId, roleId]);
  }

  static async updatePassword(userId, newPasswordHash) {
    const sql = `
      UPDATE erp.users
      SET password_hash = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, email, updated_at
    `;
    const res = await query(sql, [newPasswordHash, userId]);
    return res.rows[0];
  }

  static async saveRefreshToken(userId, token, expiresAt) {
    const sql = `
      INSERT INTO erp.refresh_tokens (user_id, token, expires_at)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, expires_at
    `;
    const res = await query(sql, [userId, token, expiresAt]);
    return res.rows[0];
  }

  static async findRefreshToken(token) {
    const sql = `
      SELECT * FROM erp.refresh_tokens
      WHERE token = $1 AND revoked = FALSE AND expires_at > CURRENT_TIMESTAMP
    `;
    const res = await query(sql, [token]);
    return res.rows[0] || null;
  }

  static async revokeRefreshToken(token) {
    const sql = `UPDATE erp.refresh_tokens SET revoked = TRUE WHERE token = $1`;
    return query(sql, [token]);
  }

  static async revokeAllUserTokens(userId) {
    const sql = `UPDATE erp.refresh_tokens SET revoked = TRUE WHERE user_id = $1`;
    return query(sql, [userId]);
  }
}
