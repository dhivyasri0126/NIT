import { verifyAccessToken } from '../utils/tokenHelper.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { query } from '../config/database.js';

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return ApiResponse.error(res, 'Authorization token missing or invalid format', [], 401);
  }

  const token = authHeader.split(' ')[1];
  const decoded = verifyAccessToken(token);

  if (!decoded) {
    return ApiResponse.error(res, 'Access token expired or invalid', [], 401);
  }

  try {
    // Fetch active user and role details from PostgreSQL
    const sql = `
      SELECT u.id, u.name, u.email, u.phone, u.status,
             r.code as role_code, r.name as role_name
      FROM erp.users u
      LEFT JOIN erp.user_roles ur ON u.id = ur.user_id
      LEFT JOIN erp.roles r ON ur.role_id = r.id
      WHERE u.id = $1 AND u.status = 'ACTIVE'
    `;
    const result = await query(sql, [decoded.userId]);

    if (result.rows.length === 0) {
      return ApiResponse.error(res, 'User account is inactive or not found', [], 401);
    }

    req.user = {
      id: result.rows[0].id,
      name: result.rows[0].name,
      email: result.rows[0].email,
      phone: result.rows[0].phone,
      role: result.rows[0].role_code, // e.g. 'ADMIN', 'SALESMAN', 'SUPERVISOR', 'AUDITOR', 'OWNER'
      roleName: result.rows[0].role_name,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return ApiResponse.error(res, 'Internal server authentication error', [error.message], 500);
  }
};
