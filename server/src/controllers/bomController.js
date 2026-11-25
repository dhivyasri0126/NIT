import { BomRepository } from '../repositories/bomRepository.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class BomController {
  static async getByProduct(req, res, next) {
    try {
      const { productId } = req.params;
      const bom = await BomRepository.findByProductId(productId);
      if (!bom) {
        return ApiResponse.error(res, `BOM formula not found for product: ${productId}`, [], 404);
      }
      return ApiResponse.success(res, bom, 'BOM formula retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async getDefaultMurukkuBom(req, res, next) {
    try {
      const bom = await BomRepository.findDefaultMurukkuBom();
      return ApiResponse.success(res, bom, 'Murukku (200 g) standard BOM');
    } catch (err) {
      next(err);
    }
  }

  static async updateFormula(req, res, next) {
    try {
      const { productId } = req.params;
      const updated = await BomRepository.updateFormula(productId, req.body);
      return ApiResponse.success(res, updated, 'BOM formula updated successfully');
    } catch (err) {
      next(err);
    }
  }
}
