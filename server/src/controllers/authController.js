import { AuthService } from '../services/authService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class AuthController {
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);
      return ApiResponse.success(res, result, 'Login successful');
    } catch (err) {
      next(err);
    }
  }

  static async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      return ApiResponse.success(res, { user }, 'User registered successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async refreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const tokens = await AuthService.refreshToken(refreshToken);
      return ApiResponse.success(res, tokens, 'Tokens refreshed successfully');
    } catch (err) {
      next(err);
    }
  }

  static async me(req, res, next) {
    try {
      return ApiResponse.success(res, { user: req.user }, 'Current user profile');
    } catch (err) {
      next(err);
    }
  }

  static async changePassword(req, res, next) {
    try {
      const { currentPassword, newPassword } = req.body;
      const result = await AuthService.changePassword(req.user.id, currentPassword, newPassword);
      return ApiResponse.success(res, result, 'Password changed successfully');
    } catch (err) {
      next(err);
    }
  }
}
