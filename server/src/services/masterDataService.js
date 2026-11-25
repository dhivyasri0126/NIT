import { ProductRepository } from '../repositories/productRepository.js';
import { CustomerRepository } from '../repositories/customerRepository.js';
import { SupplierRepository } from '../repositories/supplierRepository.js';
import { MaterialRepository } from '../repositories/materialRepository.js';
import { query } from '../config/database.js';

export class MasterDataService {
  // Products
  static async getProducts(filters) {
    return ProductRepository.findAll(filters);
  }

  static async getProductById(id) {
    const prod = await ProductRepository.findById(id);
    if (!prod) throw { statusCode: 404, message: `Product not found: ${id}` };
    return prod;
  }

  static async createProduct(data) {
    return ProductRepository.create(data);
  }

  static async updateProduct(id, data) {
    const updated = await ProductRepository.update(id, data);
    if (!updated) throw { statusCode: 404, message: `Product not found: ${id}` };
    return updated;
  }

  static async deleteProduct(id) {
    const deleted = await ProductRepository.delete(id);
    if (!deleted) throw { statusCode: 404, message: `Product not found: ${id}` };
    return deleted;
  }

  // Customers
  static async getCustomers(filters) {
    return CustomerRepository.findAll(filters);
  }

  static async getCustomerById(id) {
    const cust = await CustomerRepository.findById(id);
    if (!cust) throw { statusCode: 404, message: `Customer not found: ${id}` };
    return cust;
  }

  static async createCustomer(data) {
    return CustomerRepository.create(data);
  }

  static async updateCustomer(id, data) {
    const updated = await CustomerRepository.update(id, data);
    if (!updated) throw { statusCode: 404, message: `Customer not found: ${id}` };
    return updated;
  }

  static async deleteCustomer(id) {
    const deleted = await CustomerRepository.delete(id);
    if (!deleted) throw { statusCode: 404, message: `Customer not found: ${id}` };
    return deleted;
  }

  // Suppliers
  static async getSuppliers(filters) {
    return SupplierRepository.findAll(filters);
  }

  static async getSupplierById(id) {
    const supp = await SupplierRepository.findById(id);
    if (!supp) throw { statusCode: 404, message: `Supplier not found: ${id}` };
    return supp;
  }

  static async createSupplier(data) {
    return SupplierRepository.create(data);
  }

  static async updateSupplier(id, data) {
    const updated = await SupplierRepository.update(id, data);
    if (!updated) throw { statusCode: 404, message: `Supplier not found: ${id}` };
    return updated;
  }

  static async deleteSupplier(id) {
    const deleted = await SupplierRepository.delete(id);
    if (!deleted) throw { statusCode: 404, message: `Supplier not found: ${id}` };
    return deleted;
  }

  // Materials
  static async getRawMaterials(filters) {
    return MaterialRepository.findAllRaw(filters);
  }

  static async getPackagingMaterials(filters) {
    return MaterialRepository.findAllPackaging(filters);
  }

  static async getAllMaterialsCombined() {
    return MaterialRepository.findAllMaterialsCombined();
  }

  static async createRawMaterial(data) {
    return MaterialRepository.createRaw(data);
  }

  static async createPackagingMaterial(data) {
    return MaterialRepository.createPackaging(data);
  }

  // Categories & Units
  static async getCategories() {
    const res = await query(`SELECT * FROM erp.product_categories ORDER BY id ASC`);
    return res.rows;
  }

  static async getUnits() {
    const res = await query(`SELECT * FROM erp.units ORDER BY id ASC`);
    return res.rows;
  }
}
