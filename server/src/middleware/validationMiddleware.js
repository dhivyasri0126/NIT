import { ApiResponse } from '../utils/apiResponse.js';

/**
 * Zod validation middleware for req.body or req.query
 */
export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    try {
      const dataToValidate = source === 'query' ? req.query : req.body;
      const parsed = schema.parse(dataToValidate);
      if (source === 'query') {
        req.query = parsed;
      } else {
        req.body = parsed;
      }
      next();
    } catch (err) {
      if (err.errors) {
        const formattedErrors = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message,
        }));
        return ApiResponse.error(res, 'Validation error in request payload', formattedErrors, 422);
      }
      return ApiResponse.error(res, 'Invalid request input', [err.message], 400);
    }
  };
};
