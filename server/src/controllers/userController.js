import { UserRepository } from '../repositories/userRepository.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class UserController {
  static async getAll(req, res, next) {
    try {
      const users = await UserRepository.findAll();
      return ApiResponse.success(res, users, 'Users retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const user = await UserRepository.findById(req.params.id);
      if (!user) {
        return ApiResponse.error(res, `User not found: ${req.params.id}`, [], 404);
      }
      return ApiResponse.success(res, user, 'User retrieved successfully');
    } catch (err) {
      next(err);
    }
  }
}
