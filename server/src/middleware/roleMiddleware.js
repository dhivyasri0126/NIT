import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Authorize based on allowed role codes
 * e.g. authorizeRoles('ADMIN', 'SUPERVISOR')
 */
export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return ApiResponse.error(res, 'User identity or role unverified', [], 403);
    }

    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
    const userRole = req.user.role.toUpperCase();

    if (!normalizedAllowed.includes(userRole)) {
      return ApiResponse.error(
        res,
        `Access denied. Role '${req.user.roleName || userRole}' is not permitted to access this resource.`,
        [`Required roles: ${allowedRoles.join(', ')}`],
        403
      );
    }

    next();
  };
};
