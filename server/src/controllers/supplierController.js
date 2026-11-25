import { MasterDataService } from '../services/masterDataService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class SupplierController {
  static async getAll(req, res, next) {
    try {
      const { search, category } = req.query;
      const suppliers = await MasterDataService.getSuppliers({ search, category });
      return ApiResponse.success(res, suppliers, 'Suppliers retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const supplier = await MasterDataService.getSupplierById(req.params.id);
      return ApiResponse.success(res, supplier, 'Supplier retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const newSupplier = await MasterDataService.createSupplier(req.body);
      return ApiResponse.success(res, newSupplier, 'Supplier created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await MasterDataService.updateSupplier(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Supplier updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const deleted = await MasterDataService.deleteSupplier(req.params.id);
      return ApiResponse.success(res, deleted, 'Supplier deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
