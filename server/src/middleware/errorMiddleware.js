import { ApiResponse } from '../utils/apiResponse.js';

export const errorHandler = (err, req, res, next) => {
  console.error(`[ERROR] ${req.method} ${req.url}:`, err);

  const statusCode = err.statusCode || (err.status ? err.status : 500);
  const message = err.message || 'Internal Server Error';
  const errors = err.errors || [];

  return ApiResponse.error(res, message, errors, statusCode);
};

export const notFoundHandler = (req, res) => {
  return ApiResponse.error(res, `Route not found: ${req.method} ${req.originalUrl}`, [], 404);
};
