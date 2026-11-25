import { MasterDataService } from '../services/masterDataService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class CustomerController {
  static async getAll(req, res, next) {
    try {
      const { search, state } = req.query;
      const customers = await MasterDataService.getCustomers({ search, state });
      return ApiResponse.success(res, customers, 'Customers retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const customer = await MasterDataService.getCustomerById(req.params.id);
      return ApiResponse.success(res, customer, 'Customer retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const newCustomer = await MasterDataService.createCustomer(req.body);
      return ApiResponse.success(res, newCustomer, 'Customer created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await MasterDataService.updateCustomer(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Customer updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const deleted = await MasterDataService.deleteCustomer(req.params.id);
      return ApiResponse.success(res, deleted, 'Customer deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
