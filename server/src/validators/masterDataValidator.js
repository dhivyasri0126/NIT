import { z } from 'zod';

export const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Product name is required'),
  category_id: z.number().int().optional().default(1),
  hsn: z.string().default('19059090'),
  unit_id: z.string().default('packets'),
  weight_grams: z.number().int().optional().default(200),
  selling_price: z.number().positive('Selling price must be greater than zero'),
  cost_price: z.number().nonnegative('Cost price must be non-negative'),
  gst_rate: z.number().default(5.0),
  min_stock: z.number().default(30),
  shelf_life_days: z.number().int().default(90),
  status: z.enum(['Active', 'Inactive']).default('Active'),
});

export const customerSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Customer name is required'),
  contact_person: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().default('Tamil Nadu'),
  state_code: z.string().default('33'),
  address: z.string().min(3, 'Address is required'),
  gstin: z.string().optional().nullable(),
  phone: z.string().min(6, 'Valid phone number is required'),
  credit_limit: z.number().nonnegative().default(50000),
});

export const supplierSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Supplier name is required'),
  category: z.string().min(2, 'Category is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().default('Tamil Nadu'),
  gstin: z.string().optional().nullable(),
  contact: z.string().min(6, 'Contact info is required'),
  rating: z.number().min(1).max(5).default(5.0),
});

export const materialSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Material name is required'),
  category: z.enum(['Raw Material', 'Packaging']).default('Raw Material'),
  unit_id: z.string().default('kg'),
  avg_cost_per_unit: z.number().nonnegative('Cost must be positive'),
  reorder_level: z.number().nonnegative('Reorder level must be positive'),
  supplier_id: z.string().optional().nullable(),
  status: z.string().default('In Stock'),
});

export const bomSchema = z.object({
  product_id: z.string().min(1, 'Product ID is required'),
  batch_size: z.number().positive().default(200),
  unit_id: z.string().default('packets'),
  standard_labour_cost: z.number().nonnegative().default(1200),
  standard_power_gas_cost: z.number().nonnegative().default(600),
  ingredients: z.array(z.object({
    material_id: z.string(),
    material_type: z.enum(['RAW_MATERIAL', 'PACKAGING']),
    material_name: z.string(),
    planned_qty: z.number().positive(),
    unit_id: z.string(),
    standard_rate: z.number().nonnegative(),
  })).min(1, 'BOM must contain at least one ingredient item'),
});
