import { MasterDataService } from '../services/masterDataService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class ProductController {
  static async getAll(req, res, next) {
    try {
      const { search, category, status } = req.query;
      const products = await MasterDataService.getProducts({ search, category, status });
      return ApiResponse.success(res, products, 'Products retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getById(req, res, next) {
    try {
      const product = await MasterDataService.getProductById(req.params.id);
      return ApiResponse.success(res, product, 'Product retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const newProduct = await MasterDataService.createProduct(req.body);
      return ApiResponse.success(res, newProduct, 'Product created successfully', 201);
    } catch (err) {
      next(err);
    }
  }

  static async update(req, res, next) {
    try {
      const updated = await MasterDataService.updateProduct(req.params.id, req.body);
      return ApiResponse.success(res, updated, 'Product updated successfully');
    } catch (err) {
      next(err);
    }
  }

  static async delete(req, res, next) {
    try {
      const deleted = await MasterDataService.deleteProduct(req.params.id);
      return ApiResponse.success(res, deleted, 'Product deleted successfully');
    } catch (err) {
      next(err);
    }
  }
}
