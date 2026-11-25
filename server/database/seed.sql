-- ==============================================================================
-- SRI MURUKKU FOODS ERP - BENCHMARK SEED DATA
-- Scheme: erp
-- ==============================================================================

SET search_path TO erp, public;

-- Clean existing data in dependency order
TRUNCATE TABLE erp.audit_logs CASCADE;
TRUNCATE TABLE erp.payments CASCADE;
TRUNCATE TABLE erp.dispatches CASCADE;
TRUNCATE TABLE erp.invoice_items CASCADE;
TRUNCATE TABLE erp.invoices CASCADE;
TRUNCATE TABLE erp.order_items CASCADE;
TRUNCATE TABLE erp.order_status_history CASCADE;
TRUNCATE TABLE erp.orders CASCADE;
TRUNCATE TABLE erp.production_overheads CASCADE;
TRUNCATE TABLE erp.production_material_issues CASCADE;
TRUNCATE TABLE erp.production_runs CASCADE;
TRUNCATE TABLE erp.purchase_items CASCADE;
TRUNCATE TABLE erp.purchases CASCADE;
TRUNCATE TABLE erp.stock_ledger CASCADE;
TRUNCATE TABLE erp.inventory_items CASCADE;
TRUNCATE TABLE erp.bom_items CASCADE;
TRUNCATE TABLE erp.boms CASCADE;
TRUNCATE TABLE erp.packaging_materials CASCADE;
TRUNCATE TABLE erp.raw_materials CASCADE;
TRUNCATE TABLE erp.products CASCADE;
TRUNCATE TABLE erp.suppliers CASCADE;
TRUNCATE TABLE erp.customers CASCADE;
TRUNCATE TABLE erp.product_categories CASCADE;
TRUNCATE TABLE erp.units CASCADE;
TRUNCATE TABLE erp.refresh_tokens CASCADE;
TRUNCATE TABLE erp.user_roles CASCADE;
TRUNCATE TABLE erp.role_permissions CASCADE;
TRUNCATE TABLE erp.permissions CASCADE;
TRUNCATE TABLE erp.users CASCADE;
TRUNCATE TABLE erp.roles CASCADE;

-- 1. Roles
INSERT INTO erp.roles (id, name, code, description) VALUES
(1, 'Admin / Manager', 'ADMIN', 'Super administrative control over all modules'),
(2, 'Salesman (Field)', 'SALESMAN', 'Field order capture, customer inquiries and price lists'),
(3, 'Production Supervisor', 'SUPERVISOR', 'Shop floor batch entries, material issues, and variance tracking'),
(4, 'Accountant / Auditor', 'AUDITOR', 'Financial audit, GST registers, purchase verification, and collections'),
(5, 'Business Owner (MD)', 'OWNER', 'Executive analytics, unit cost economics, and company profitability');

-- 2. Users (Password: Password@123)
INSERT INTO erp.users (id, name, email, password_hash, phone, status) VALUES
('USR-ADMIN-01', 'Dhivyasri M', 'dhivyasri@srimurukku.com', '$2b$10$0YD6Ab1Hweiz2D3GEldRs.t9zcxHr1F7oiZni0/XdJNZrJDO8AR0S', '+91 94431 82026', 'ACTIVE'),
('USR-SALES-01', 'K. Ramanathan', 'raman@srimurukku.com', '$2b$10$0YD6Ab1Hweiz2D3GEldRs.t9zcxHr1F7oiZni0/XdJNZrJDO8AR0S', '+91 98421 55667', 'ACTIVE'),
('USR-PROD-01', 'M. Selvam', 'selvam@srimurukku.com', '$2b$10$0YD6Ab1Hweiz2D3GEldRs.t9zcxHr1F7oiZni0/XdJNZrJDO8AR0S', '+91 97890 12345', 'ACTIVE'),
('USR-AUDIT-01', 'V. Jayanthi CA', 'audit@srimurukku.com', '$2b$10$0YD6Ab1Hweiz2D3GEldRs.t9zcxHr1F7oiZni0/XdJNZrJDO8AR0S', '+91 98940 33221', 'ACTIVE'),
('USR-OWNER-01', 'S. Murugan', 'murugan@srimurukku.com', '$2b$10$0YD6Ab1Hweiz2D3GEldRs.t9zcxHr1F7oiZni0/XdJNZrJDO8AR0S', '+91 94430 99881', 'ACTIVE');

-- Assign User Roles
INSERT INTO erp.user_roles (user_id, role_id) VALUES
('USR-ADMIN-01', 1),
('USR-SALES-01', 2),
('USR-PROD-01', 3),
('USR-AUDIT-01', 4),
('USR-OWNER-01', 5);

-- 3. Units
INSERT INTO erp.units (id, name, is_fractional) VALUES
('kg', 'Kilograms', TRUE),
('L', 'Litres', TRUE),
('pcs', 'Pieces', FALSE),
('packets', 'Packets', FALSE),
('cartons', 'Cartons', FALSE);

-- 4. Product Categories
INSERT INTO erp.product_categories (id, name, description) VALUES
(1, 'Snacks', 'Traditional South Indian deep-fried crispy snacks'),
(2, 'Sweets', 'Traditional festive and milk sweets');

-- 5. Products (Benchmark)
INSERT INTO erp.products (id, name, category_id, hsn, unit_id, weight_grams, selling_price, cost_price, gst_rate, min_stock, shelf_life_days, status) VALUES
('PROD-001', 'Murukku (200 g)', 1, '19059090', 'packets', 200, 50.00, 31.14, 5.00, 50, 90, 'Active'),
('PROD-002', 'Special Mixture (200 g)', 1, '19059090', 'packets', 200, 52.50, 33.50, 5.00, 40, 90, 'Active'),
('PROD-003', 'Ribbon Pakoda (200 g)', 1, '19059090', 'packets', 200, 48.00, 30.00, 5.00, 30, 90, 'Active'),
('PROD-004', 'Kara Thattai (200 g)', 1, '19059090', 'packets', 200, 45.00, 28.50, 5.00, 30, 90, 'Active'),
('PROD-005', 'Traditional Sweets (250 g)', 2, '21069099', 'packets', 250, 80.00, 54.00, 5.00, 25, 30, 'Active');

-- 6. Customers (Benchmark: Retailer A in TN, Distributor B in KA)
INSERT INTO erp.customers (id, name, contact_person, city, state, state_code, address, gstin, phone, credit_limit, outstanding_balance) VALUES
('CUST-001', 'Retailer A', 'Sundaram Stores', 'Trichy', 'Tamil Nadu', '33', '12 Rockfort Bazaar, Trichy - 620002', '33AAACR1234A1Z1', '+91 98421 11223', 50000.00, 3875.00),
('CUST-002', 'Distributor B', 'Karnataka Wholesale Mart', 'Bengaluru', 'Karnataka', '29', '45 Commercial Street, Bengaluru - 560001', '29BBBCD2345B1Z2', '+91 94432 99887', 100000.00, 0.00),
('CUST-003', 'Retailer C', 'Salem Fresh Express', 'Salem', 'Tamil Nadu', '33', '78 Cherry Road, Salem - 636007', '33CCCRE3456C1Z3', '+91 97890 33445', 35000.00, 2625.00),
('CUST-004', 'Retailer D', 'Erode Organics', 'Erode', 'Tamil Nadu', '33', '15 Brough Road, Erode - 638001', '33DDDRE4567D1Z4', '+91 98940 77665', 40000.00, 3200.00),
('CUST-005', 'Distributor A', 'Nellai Snacks Hub', 'Tirunelveli', 'Tamil Nadu', '33', '22 High Ground, Tirunelveli - 627002', '33EEEDI5678E1Z5', '+91 94861 44556', 80000.00, 4800.00);

-- 7. Suppliers
INSERT INTO erp.suppliers (id, name, category, city, state, gstin, contact, rating) VALUES
('SUPP-001', 'ABC Traders', 'Grains & Flour', 'Trichy', 'Tamil Nadu', '33AABCT9988A1Z9', '+91 94431 12345', 4.8),
('SUPP-002', 'Oil Suppliers Co.', 'Edible Oil', 'Madurai', 'Tamil Nadu', '33BOSCO8877B1Z8', '+91 98422 23456', 4.6),
('SUPP-003', 'Spice Mart', 'Spices & Condiments', 'Trichy', 'Tamil Nadu', '33CSPMT7766C1Z7', '+91 97891 34567', 4.9),
('SUPP-004', 'PolyPack Industries', 'Flexible Packaging', 'Coimbatore', 'Tamil Nadu', '33DPACK6655D1Z6', '+91 98943 45678', 4.7),
('SUPP-005', 'Corrugated Boxes Ltd', 'Outer Cartons', 'Karur', 'Tamil Nadu', '33ECBOX5544E1Z5', '+91 94434 56789', 4.5);

-- 8. Raw Materials & Packaging (Benchmark closing stock)
INSERT INTO erp.raw_materials (id, name, category, unit_id, avg_cost_per_unit, reorder_level, supplier_id, status) VALUES
('MAT-001', 'Rice Flour', 'Raw Material', 'kg', 43.1250, 50.00, 'SUPP-001', 'In Stock'),
('MAT-002', 'Cooking Oil', 'Raw Material', 'L', 140.0000, 15.00, 'SUPP-002', 'In Stock'),
('MAT-003', 'Spice Mix', 'Raw Material', 'kg', 200.0000, 2.00, 'SUPP-003', 'In Stock');

INSERT INTO erp.packaging_materials (id, name, category, unit_id, avg_cost_per_unit, reorder_level, supplier_id, status) VALUES
('MAT-004', 'Pouches (200 g)', 'Packaging', 'pcs', 2.5000, 200.00, 'SUPP-004', 'In Stock'),
('MAT-005', 'Cartons (20-pack capacity)', 'Packaging', 'pcs', 15.0000, 25.00, 'SUPP-005', 'Low Stock');

-- 9. Bill of Materials (BOM for Murukku 200g - 200 Packets)
INSERT INTO erp.boms (id, product_id, batch_size, unit_id, standard_labour_cost, standard_power_gas_cost, is_active) VALUES
('BOM-001', 'PROD-001', 200, 'packets', 1200.00, 600.00, TRUE);

INSERT INTO erp.bom_items (bom_id, material_id, material_type, material_name, planned_qty, unit_id, standard_rate) VALUES
('BOM-001', 'MAT-001', 'RAW_MATERIAL', 'Rice Flour', 40.0000, 'kg', 43.1250),
('BOM-001', 'MAT-002', 'RAW_MATERIAL', 'Cooking Oil', 10.0000, 'L', 140.0000),
('BOM-001', 'MAT-003', 'RAW_MATERIAL', 'Spice Mix', 1.2000, 'kg', 200.0000),
('BOM-001', 'MAT-004', 'PACKAGING', 'Pouches (200 g)', 200.0000, 'pcs', 2.5000),
('BOM-001', 'MAT-005', 'PACKAGING', 'Cartons (20-pack)', 10.0000, 'pcs', 15.0000);

-- 10. Inventory Positions (Exact Benchmark Values)
-- Flour: 100 opening + 60 purchased - 40 consumed = 120 kg
-- Oil: 30 opening - 10.5 consumed = 19.5 L
-- Spice: 5 opening - 1.2 consumed = 3.8 kg
-- Pouches: 500 opening - 194 consumed = 306 pcs
-- Cartons: 30 opening - 9 consumed = 21 pcs (Low Stock)
-- Finished Murukku: 50 opening + 188 produced - 150 dispatched = 88 packets
INSERT INTO erp.inventory_items (item_type, item_id, item_name, unit_id, opening_stock, total_inward, total_outward, current_stock, reorder_level, avg_cost, status) VALUES
('RAW_MATERIAL', 'MAT-001', 'Rice Flour', 'kg', 100.0000, 60.0000, 40.0000, 120.0000, 50.0000, 43.1250, 'In Stock'),
('RAW_MATERIAL', 'MAT-002', 'Cooking Oil', 'L', 30.0000, 0.0000, 10.5000, 19.5000, 15.0000, 140.0000, 'In Stock'),
('RAW_MATERIAL', 'MAT-003', 'Spice Mix', 'kg', 5.0000, 0.0000, 1.2000, 3.8000, 2.0000, 200.0000, 'In Stock'),
('PACKAGING', 'MAT-004', 'Pouches (200 g)', 'pcs', 500.0000, 0.0000, 194.0000, 306.0000, 200.0000, 2.5000, 'In Stock'),
('PACKAGING', 'MAT-005', 'Cartons (20-pack capacity)', 'pcs', 30.0000, 0.0000, 9.0000, 21.0000, 25.0000, 15.0000, 'Low Stock'),
('FINISHED_GOODS', 'PROD-001', 'Murukku (200 g)', 'packets', 50.0000, 188.0000, 150.0000, 88.0000, 50.0000, 31.1400, 'In Stock'),
('FINISHED_GOODS', 'PROD-002', 'Special Mixture (200 g)', 'packets', 140.0000, 0.0000, 0.0000, 140.0000, 40.0000, 33.5000, 'In Stock'),
('FINISHED_GOODS', 'PROD-003', 'Ribbon Pakoda (200 g)', 'packets', 75.0000, 0.0000, 0.0000, 75.0000, 30.0000, 30.0000, 'In Stock'),
('FINISHED_GOODS', 'PROD-004', 'Kara Thattai (200 g)', 'packets', 60.0000, 0.0000, 0.0000, 60.0000, 30.0000, 28.5000, 'In Stock'),
('FINISHED_GOODS', 'PROD-005', 'Traditional Sweets (250 g)', 'packets', 45.0000, 0.0000, 0.0000, 45.0000, 25.0000, 54.0000, 'In Stock');

-- 11. Purchases (Benchmark: PO-001 Flour 60 kg @ 45)
INSERT INTO erp.purchases (id, po_number, supplier_id, supplier_name, order_date, invoice_ref, taxable_amount, gst_amount, total_amount, status, payment_status, notes) VALUES
('PO-001', 'PO-001', 'SUPP-001', 'ABC Traders', '2025-01-21', 'ABC/24-25/892', 2700.00, 0.00, 2700.00, 'Received', 'Paid', 'Benchmark 60kg Rice Flour inward'),
('PO-002', 'PO-002', 'SUPP-002', 'Oil Suppliers Co.', '2025-01-10', 'OSC/990', 2800.00, 0.00, 2800.00, 'Received', 'Paid', '20L Cooking oil drum'),
('PO-003', 'PO-003', 'SUPP-003', 'Spice Mart', '2025-01-08', 'SPM-401', 1000.00, 0.00, 1000.00, 'Received', 'Paid', '5kg Spice mix');

INSERT INTO erp.purchase_items (purchase_id, material_id, material_type, item_name, quantity, unit_id, unit_price, gst_rate, total_amount) VALUES
('PO-001', 'MAT-001', 'RAW_MATERIAL', 'Rice Flour', 60.0000, 'kg', 45.0000, 0.00, 2700.00),
('PO-002', 'MAT-002', 'RAW_MATERIAL', 'Cooking Oil', 20.0000, 'L', 140.0000, 0.00, 2800.00),
('PO-003', 'MAT-003', 'RAW_MATERIAL', 'Spice Mix', 5.0000, 'kg', 200.0000, 0.00, 1000.00);

-- 12. Production Run (Benchmark: PR-001)
INSERT INTO erp.production_runs (id, run_no, batch_no, bom_id, product_id, product_name, date, expected_output, actual_output, damaged_pouches, wastage_grams, cartons_used, yield_variance_percent, supervisor_id, supervisor_name, status, notes) VALUES
('PR-001', 'PR-001', 'BATCH-001', 'BOM-001', 'PROD-001', 'Murukku (200 g)', '2025-01-21', 200.00, 188.00, 6.00, 1200.00, 9.00, -6.00, 'USR-PROD-01', 'M. Selvam', 'Completed', 'Slight oil absorption variance due to batch fry temperature calibration.');

INSERT INTO erp.production_material_issues (production_run_id, material_id, material_type, material_name, planned_qty, actual_qty, unit_id, difference_qty, variance_percent, unit_cost, total_cost) VALUES
('PR-001', 'MAT-001', 'RAW_MATERIAL', 'Rice Flour', 40.0000, 40.0000, 'kg', 0.0000, 0.00, 43.1250, 1725.00),
('PR-001', 'MAT-002', 'RAW_MATERIAL', 'Cooking Oil', 10.0000, 10.5000, 'L', 0.5000, 5.00, 140.0000, 1470.00),
('PR-001', 'MAT-003', 'RAW_MATERIAL', 'Spice Mix', 1.2000, 1.2000, 'kg', 0.0000, 0.00, 200.0000, 240.00),
('PR-001', 'MAT-004', 'PACKAGING', 'Pouches (200 g)', 200.0000, 204.0000, 'pcs', -4.0000, -3.00, 2.5000, 485.00),
('PR-001', 'MAT-005', 'PACKAGING', 'Cartons (20-pack)', 10.0000, 9.0000, 'pcs', -1.0000, -10.00, 15.0000, 135.00);

INSERT INTO erp.production_overheads (production_run_id, flour_cost, oil_cost, spice_cost, pouch_cost, carton_cost, labour_cost, power_gas_cost, total_manufacturing_cost, cost_per_packet, selling_price, profit_per_packet, profit_margin_percent) VALUES
('PR-001', 1725.00, 1470.00, 240.00, 485.00, 135.00, 1200.00, 600.00, 5855.00, 31.1400, 50.00, 18.8600, 37.70);

-- 13. Sales Orders (Benchmark: SO-0025 Retailer A, SO-0026 Distributor B)
INSERT INTO erp.orders (id, order_no, customer_id, customer_name, customer_address, customer_gstin, salesman_id, order_date, taxable_amount, cgst_total, sgst_total, igst_total, total_amount, status, shortage_quantity, invoice_no, invoice_date, notes) VALUES
('SO-0025', 'SO-0025', 'CUST-001', 'Retailer A', 'Coimbatore, Tamil Nadu - 641001', '33AAACR1234A1Z1', 'USR-SALES-01', '2025-01-21', 7500.00, 187.50, 187.50, 0.00, 7875.00, 'Dispatched', 0, 'INV-0015', '2025-01-21', 'Priority retail delivery to Sundaram Stores'),
('SO-0026', 'SO-0026', 'CUST-002', 'Distributor B', 'Bengaluru, Karnataka - 560001', '29BBBCD2345B1Z2', 'USR-SALES-01', '2025-01-21', 6000.00, 0.00, 0.00, 300.00, 6300.00, 'Insufficient Stock', 32, NULL, NULL, 'Ordered 120 pkts, warehouse stock only 88 pkts available'),
('SO-0024', 'SO-0024', 'CUST-003', 'Retailer C', 'Salem, Tamil Nadu - 636007', '33CCCRE3456C1Z3', 'USR-SALES-01', '2025-01-20', 2625.00, 65.63, 65.63, 0.00, 2756.25, 'Invoiced', 0, 'INV-0014', '2025-01-20', 'Regular counter booking'),
('SO-0023', 'SO-0023', 'CUST-004', 'Retailer D', 'Erode, Tamil Nadu - 638001', '33DDDRE4567D1Z4', 'USR-SALES-01', '2025-01-19', 3200.00, 80.00, 80.00, 0.00, 3360.00, 'Approved', 0, NULL, NULL, 'Awaiting fulfillment'),
('SO-0022', 'SO-0022', 'CUST-005', 'Distributor A', 'Tirunelveli, Tamil Nadu - 627002', '33EEEDI5678E1Z5', 'USR-SALES-01', '2025-01-18', 4800.00, 120.00, 120.00, 0.00, 5040.00, 'Submitted', 0, NULL, NULL, 'Fresh order booking');

INSERT INTO erp.order_items (order_id, product_id, product_name, hsn, quantity, rate, discount_percent, taxable, cgst_rate, cgst_amount, sgst_rate, sgst_amount, igst_rate, igst_amount, total_amount) VALUES
('SO-0025', 'PROD-001', 'Murukku (200 g)', '19059090', 150.00, 50.00, 0.00, 7500.00, 2.50, 187.50, 2.50, 187.50, 0.00, 0.00, 7875.00),
('SO-0026', 'PROD-001', 'Murukku (200 g)', '19059090', 120.00, 50.00, 0.00, 6000.00, 0.00, 0.00, 0.00, 0.00, 5.00, 300.00, 6300.00),
('SO-0024', 'PROD-002', 'Special Mixture (200 g)', '19059090', 50.00, 52.50, 0.00, 2625.00, 2.50, 65.63, 2.50, 65.63, 0.00, 0.00, 2756.25),
('SO-0023', 'PROD-004', 'Kara Thattai (200 g)', '19059090', 80.00, 40.00, 0.00, 3200.00, 2.50, 80.00, 2.50, 80.00, 0.00, 0.00, 3360.00),
('SO-0022', 'PROD-005', 'Traditional Sweets (250 g)', '21069099', 60.00, 80.00, 0.00, 4800.00, 2.50, 120.00, 2.50, 120.00, 0.00, 0.00, 5040.00);

-- 14. Invoices (Benchmark: INV-0015)
INSERT INTO erp.invoices (id, invoice_no, order_id, order_no, customer_id, customer_name, customer_address, customer_gstin, invoice_date, place_of_supply, taxable_value, cgst, sgst, igst, total, paid_amount, outstanding_amount, status, qr_code_value) VALUES
('INV-0015', 'INV-0015', 'SO-0025', 'SO-0025', 'CUST-001', 'Retailer A', 'Coimbatore, Tamil Nadu - 641001', '33AAACR1234A1Z1', '2025-01-21', 'Tamil Nadu (TN)', 7500.00, 187.50, 187.50, 0.00, 7875.00, 4000.00, 3875.00, 'Partially Paid', 'GSTIN:33ABCDE1234F1Z5;INV:INV-0015;DATE:2025-01-21;VAL:7875.00');

INSERT INTO erp.invoice_items (invoice_id, s_no, product_id, product_name, hsn, quantity, rate, taxable, cgst_rate, cgst_amount, sgst_rate, sgst_amount, amount) VALUES
('INV-0015', 1, 'PROD-001', 'Murukku (200 g)', '19059090', 150.00, 50.00, 7500.00, 2.50, 187.50, 2.50, 187.50, 7875.00);

-- 15. Payments (Benchmark: PAY-001 ₹4,000 for INV-0015)
INSERT INTO erp.payments (id, receipt_no, invoice_id, invoice_no, customer_id, customer_name, date, amount_paid, payment_mode, reference_no, notes) VALUES
('PAY-001', 'REC-2025-001', 'INV-0015', 'INV-0015', 'CUST-001', 'Retailer A', '2025-01-21', 4000.00, 'UPI / Bank Transfer', 'UPI/502199812401', 'Part payment against Murukku 150 pkt delivery');

-- 16. Stock Movement Ledger
INSERT INTO erp.stock_ledger (transaction_date, item_type, item_id, item_name, voucher_type, voucher_ref, inward_qty, outward_qty, balance_qty, unit_id, notes) VALUES
('2025-01-21', 'RAW_MATERIAL', 'MAT-001', 'Rice Flour', 'OPENING_BALANCE', 'OPENING-2025', 100.0000, 0.0000, 100.0000, 'kg', 'Opening stock benchmark'),
('2025-01-21', 'RAW_MATERIAL', 'MAT-001', 'Rice Flour', 'PURCHASE_RECEIPT', 'PO-001', 60.0000, 0.0000, 160.0000, 'kg', 'Inward from ABC Traders @ 45/kg'),
('2025-01-21', 'RAW_MATERIAL', 'MAT-001', 'Rice Flour', 'PRODUCTION_ISSUE', 'PR-001', 0.0000, 40.0000, 120.0000, 'kg', 'Issued for Batch PR-001'),
('2025-01-21', 'RAW_MATERIAL', 'MAT-002', 'Cooking Oil', 'PRODUCTION_ISSUE', 'PR-001', 0.0000, 10.5000, 19.5000, 'L', 'Issued for Batch PR-001 (+5% variance)'),
('2025-01-21', 'FINISHED_GOODS', 'PROD-001', 'Murukku (200 g)', 'PRODUCTION_RECEIPT', 'PR-001', 188.0000, 0.0000, 238.0000, 'packets', 'Good finished output produced'),
('2025-01-21', 'FINISHED_GOODS', 'PROD-001', 'Murukku (200 g)', 'SALES_DISPATCH', 'SO-0025', 0.0000, 150.0000, 88.0000, 'packets', 'Dispatched to Retailer A');

-- 17. Audit Logs
INSERT INTO erp.audit_logs (user_id, user_name, action, module, entity_id, details) VALUES
('USR-ADMIN-01', 'Dhivyasri M', 'INITIAL_SYSTEM_SETUP', 'SYSTEM', 'NIT-2026', '{"message": "System seed initialized with NIT Trichy 2026 benchmark data"}'::jsonb),
('USR-PROD-01', 'M. Selvam', 'PRODUCTION_RUN_COMPLETED', 'PRODUCTION', 'PR-001', '{"batch": "BATCH-001", "goodOutput": 188, "variancePercent": -6.0}'::jsonb),
('USR-ADMIN-01', 'Dhivyasri M', 'INVOICE_GENERATED', 'SALES', 'INV-0015', '{"total": 7875.00, "customer": "Retailer A"}'::jsonb);
