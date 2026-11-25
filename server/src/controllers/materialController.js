import { MasterDataService } from '../services/masterDataService.js';
import { ApiResponse } from '../utils/apiResponse.js';

export class MaterialController {
  static async getAll(req, res, next) {
    try {
      const { type } = req.query;
      let materials;
      if (type === 'raw') {
        materials = await MasterDataService.getRawMaterials(req.query);
      } else if (type === 'packaging') {
        materials = await MasterDataService.getPackagingMaterials(req.query);
      } else {
        materials = await MasterDataService.getAllMaterialsCombined();
      }
      return ApiResponse.success(res, materials, 'Materials retrieved successfully');
    } catch (err) {
      next(err);
    }
  }

  static async create(req, res, next) {
    try {
      const { category } = req.body;
      let created;
      if (category === 'Packaging') {
        created = await MasterDataService.createPackagingMaterial(req.body);
      } else {
        created = await MasterDataService.createRawMaterial(req.body);
      }
      return ApiResponse.success(res, created, 'Material created successfully', 201);
    } catch (err) {
      next(err);
    }
  }
}
