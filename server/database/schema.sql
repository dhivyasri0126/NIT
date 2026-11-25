-- ==============================================================================
-- SRI MURUKKU FOODS ERP - DATABASE SCHEMA
-- Target Database: PostgreSQL 15+ / Neon PostgreSQL
-- Schema: erp
-- ==============================================================================

CREATE SCHEMA IF NOT EXISTS erp;
SET search_path TO erp, public;

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. AUTHENTICATION & ACCESS CONTROL (RBAC)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(30) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    module VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.role_permissions (
    role_id INT NOT NULL REFERENCES erp.roles(id) ON DELETE CASCADE,
    permission_id INT NOT NULL REFERENCES erp.permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS erp.users (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'USR-ADMIN-01' or UUID
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(25),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.user_roles (
    user_id VARCHAR(50) NOT NULL REFERENCES erp.users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES erp.roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

CREATE TABLE IF NOT EXISTS erp.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(50) NOT NULL REFERENCES erp.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 2. MASTER DATA
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.units (
    id VARCHAR(20) PRIMARY KEY, -- 'kg', 'L', 'pcs', 'packets', 'cartons'
    name VARCHAR(50) NOT NULL,
    is_fractional BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.product_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.customers (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'CUST-001'
    name VARCHAR(150) NOT NULL,
    contact_person VARCHAR(100),
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    state_code VARCHAR(10) DEFAULT '33',
    address TEXT NOT NULL,
    gstin VARCHAR(25),
    phone VARCHAR(30) NOT NULL,
    credit_limit NUMERIC(12, 2) DEFAULT 0.00 CHECK (credit_limit >= 0),
    outstanding_balance NUMERIC(12, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.suppliers (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'SUPP-001'
    name VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) DEFAULT 'Tamil Nadu',
    gstin VARCHAR(25),
    contact VARCHAR(50) NOT NULL,
    rating NUMERIC(3, 1) DEFAULT 5.0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.products (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'PROD-001'
    name VARCHAR(150) NOT NULL,
    category_id INT REFERENCES erp.product_categories(id),
    hsn VARCHAR(20) NOT NULL DEFAULT '19059090',
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    weight_grams INT DEFAULT 200,
    selling_price NUMERIC(12, 2) NOT NULL CHECK (selling_price >= 0),
    cost_price NUMERIC(12, 2) NOT NULL CHECK (cost_price >= 0),
    gst_rate NUMERIC(5, 2) DEFAULT 5.00 CHECK (gst_rate >= 0),
    min_stock NUMERIC(12, 2) DEFAULT 30,
    shelf_life_days INT DEFAULT 90,
    status VARCHAR(20) DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.raw_materials (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'MAT-001'
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'Raw Material',
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    avg_cost_per_unit NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 10.00,
    supplier_id VARCHAR(50) REFERENCES erp.suppliers(id),
    status VARCHAR(20) DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.packaging_materials (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'MAT-004'
    name VARCHAR(150) NOT NULL,
    category VARCHAR(50) DEFAULT 'Packaging',
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    avg_cost_per_unit NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    reorder_level NUMERIC(12, 2) NOT NULL DEFAULT 50.00,
    supplier_id VARCHAR(50) REFERENCES erp.suppliers(id),
    status VARCHAR(20) DEFAULT 'In Stock',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.boms (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'BOM-001'
    product_id VARCHAR(50) NOT NULL REFERENCES erp.products(id) ON DELETE CASCADE,
    batch_size NUMERIC(12, 2) NOT NULL DEFAULT 200,
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    standard_labour_cost NUMERIC(12, 2) DEFAULT 1200.00,
    standard_power_gas_cost NUMERIC(12, 2) DEFAULT 600.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.bom_items (
    id SERIAL PRIMARY KEY,
    bom_id VARCHAR(50) NOT NULL REFERENCES erp.boms(id) ON DELETE CASCADE,
    material_id VARCHAR(50) NOT NULL,
    material_type VARCHAR(30) NOT NULL CHECK (material_type IN ('RAW_MATERIAL', 'PACKAGING')),
    material_name VARCHAR(150) NOT NULL,
    planned_qty NUMERIC(12, 4) NOT NULL CHECK (planned_qty > 0),
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    standard_rate NUMERIC(12, 4) NOT NULL DEFAULT 0.0000
);

-- ==============================================================================
-- 3. INVENTORY & STOCK LEDGER
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.inventory_items (
    id SERIAL PRIMARY KEY,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('RAW_MATERIAL', 'PACKAGING', 'FINISHED_GOODS')),
    item_id VARCHAR(50) NOT NULL, -- references raw_materials, packaging_materials or products
    item_name VARCHAR(150) NOT NULL,
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    opening_stock NUMERIC(12, 4) DEFAULT 0.0000,
    total_inward NUMERIC(12, 4) DEFAULT 0.0000,
    total_outward NUMERIC(12, 4) DEFAULT 0.0000,
    current_stock NUMERIC(12, 4) NOT NULL DEFAULT 0.0000,
    reorder_level NUMERIC(12, 4) DEFAULT 0.0000,
    avg_cost NUMERIC(12, 4) DEFAULT 0.0000,
    status VARCHAR(30) DEFAULT 'In Stock',
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_inventory_item UNIQUE (item_type, item_id)
);

CREATE TABLE IF NOT EXISTS erp.stock_ledger (
    id BIGSERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('RAW_MATERIAL', 'PACKAGING', 'FINISHED_GOODS')),
    item_id VARCHAR(50) NOT NULL,
    item_name VARCHAR(150) NOT NULL,
    voucher_type VARCHAR(50) NOT NULL CHECK (
        voucher_type IN ('PURCHASE_RECEIPT', 'PRODUCTION_ISSUE', 'PRODUCTION_RECEIPT', 'SALES_DISPATCH', 'STOCK_ADJUSTMENT', 'OPENING_BALANCE')
    ),
    voucher_ref VARCHAR(100) NOT NULL,
    inward_qty NUMERIC(12, 4) DEFAULT 0.0000,
    outward_qty NUMERIC(12, 4) DEFAULT 0.0000,
    balance_qty NUMERIC(12, 4) NOT NULL,
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.stock_adjustments (
    id SERIAL PRIMARY KEY,
    adjustment_no VARCHAR(50) UNIQUE NOT NULL,
    item_type VARCHAR(30) NOT NULL CHECK (item_type IN ('RAW_MATERIAL', 'PACKAGING', 'FINISHED_GOODS')),
    item_id VARCHAR(50) NOT NULL,
    adjustment_type VARCHAR(30) NOT NULL CHECK (adjustment_type IN ('SURPLUS', 'DAMAGE_WRITEOFF', 'SPILLAGE', 'EXPIRY')),
    quantity NUMERIC(12, 4) NOT NULL,
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    reason TEXT NOT NULL,
    approved_by VARCHAR(50) REFERENCES erp.users(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. PURCHASES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.purchases (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'PO-001'
    po_number VARCHAR(50) UNIQUE NOT NULL,
    supplier_id VARCHAR(50) NOT NULL REFERENCES erp.suppliers(id),
    supplier_name VARCHAR(150) NOT NULL,
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    invoice_ref VARCHAR(100),
    taxable_amount NUMERIC(12, 2) DEFAULT 0.00,
    gst_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Received' CHECK (status IN ('Draft', 'Ordered', 'Received', 'Cancelled')),
    payment_status VARCHAR(30) DEFAULT 'Paid' CHECK (payment_status IN ('Unpaid', 'Partially Paid', 'Paid')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.purchase_items (
    id SERIAL PRIMARY KEY,
    purchase_id VARCHAR(50) NOT NULL REFERENCES erp.purchases(id) ON DELETE CASCADE,
    material_id VARCHAR(50) NOT NULL,
    material_type VARCHAR(30) NOT NULL CHECK (material_type IN ('RAW_MATERIAL', 'PACKAGING')),
    item_name VARCHAR(150) NOT NULL,
    quantity NUMERIC(12, 4) NOT NULL CHECK (quantity > 0),
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    unit_price NUMERIC(12, 4) NOT NULL CHECK (unit_price >= 0),
    gst_rate NUMERIC(5, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL
);

-- ==============================================================================
-- 5. PRODUCTION
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.production_runs (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'PR-001'
    run_no VARCHAR(50) UNIQUE NOT NULL,
    batch_no VARCHAR(50) NOT NULL, -- e.g. 'BATCH-001'
    bom_id VARCHAR(50) NOT NULL REFERENCES erp.boms(id),
    product_id VARCHAR(50) NOT NULL REFERENCES erp.products(id),
    product_name VARCHAR(150) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    expected_output NUMERIC(12, 2) NOT NULL DEFAULT 200,
    actual_output NUMERIC(12, 2) NOT NULL DEFAULT 0, -- Good packets
    damaged_pouches NUMERIC(12, 2) DEFAULT 0,
    wastage_grams NUMERIC(12, 2) DEFAULT 0,
    cartons_used NUMERIC(12, 2) DEFAULT 0,
    yield_variance_percent NUMERIC(6, 2) DEFAULT 0.00,
    supervisor_id VARCHAR(50) REFERENCES erp.users(id),
    supervisor_name VARCHAR(100),
    status VARCHAR(30) DEFAULT 'Completed' CHECK (status IN ('Planned', 'In Progress', 'Completed', 'Aborted')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.production_material_issues (
    id SERIAL PRIMARY KEY,
    production_run_id VARCHAR(50) NOT NULL REFERENCES erp.production_runs(id) ON DELETE CASCADE,
    material_id VARCHAR(50) NOT NULL,
    material_type VARCHAR(30) NOT NULL,
    material_name VARCHAR(150) NOT NULL,
    planned_qty NUMERIC(12, 4) NOT NULL,
    actual_qty NUMERIC(12, 4) NOT NULL,
    unit_id VARCHAR(20) NOT NULL REFERENCES erp.units(id),
    difference_qty NUMERIC(12, 4) NOT NULL,
    variance_percent NUMERIC(6, 2) NOT NULL,
    unit_cost NUMERIC(12, 4) DEFAULT 0.0000,
    total_cost NUMERIC(12, 2) DEFAULT 0.00
);

CREATE TABLE IF NOT EXISTS erp.production_overheads (
    id SERIAL PRIMARY KEY,
    production_run_id VARCHAR(50) UNIQUE NOT NULL REFERENCES erp.production_runs(id) ON DELETE CASCADE,
    flour_cost NUMERIC(12, 2) DEFAULT 0.00,
    oil_cost NUMERIC(12, 2) DEFAULT 0.00,
    spice_cost NUMERIC(12, 2) DEFAULT 0.00,
    pouch_cost NUMERIC(12, 2) DEFAULT 0.00,
    carton_cost NUMERIC(12, 2) DEFAULT 0.00,
    labour_cost NUMERIC(12, 2) DEFAULT 1200.00,
    power_gas_cost NUMERIC(12, 2) DEFAULT 600.00,
    total_manufacturing_cost NUMERIC(12, 2) NOT NULL,
    cost_per_packet NUMERIC(12, 4) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    profit_per_packet NUMERIC(12, 4) NOT NULL,
    profit_margin_percent NUMERIC(6, 2) NOT NULL
);

-- ==============================================================================
-- 6. SALES, ORDERS & INVOICES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.orders (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'SO-0025'
    order_no VARCHAR(50) UNIQUE NOT NULL,
    customer_id VARCHAR(50) NOT NULL REFERENCES erp.customers(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_address TEXT,
    customer_gstin VARCHAR(25),
    salesman_id VARCHAR(50) REFERENCES erp.users(id),
    order_date DATE NOT NULL DEFAULT CURRENT_DATE,
    taxable_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    cgst_total NUMERIC(12, 2) DEFAULT 0.00,
    sgst_total NUMERIC(12, 2) DEFAULT 0.00,
    igst_total NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(30) DEFAULT 'Submitted' CHECK (
        status IN ('Submitted', 'Approved', 'Rejected', 'Invoiced', 'Dispatched', 'Insufficient Stock')
    ),
    shortage_quantity NUMERIC(12, 2) DEFAULT 0,
    invoice_no VARCHAR(50),
    invoice_date DATE,
    rejection_reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.order_items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES erp.orders(id) ON DELETE CASCADE,
    product_id VARCHAR(50) NOT NULL REFERENCES erp.products(id),
    product_name VARCHAR(150) NOT NULL,
    hsn VARCHAR(20) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL CHECK (quantity > 0),
    rate NUMERIC(12, 2) NOT NULL CHECK (rate >= 0),
    discount_percent NUMERIC(5, 2) DEFAULT 0.00,
    taxable NUMERIC(12, 2) NOT NULL,
    cgst_rate NUMERIC(5, 2) DEFAULT 2.50,
    cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) DEFAULT 2.50,
    sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    igst_rate NUMERIC(5, 2) DEFAULT 0.00,
    igst_amount NUMERIC(12, 2) DEFAULT 0.00,
    total_amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS erp.order_status_history (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL REFERENCES erp.orders(id) ON DELETE CASCADE,
    old_status VARCHAR(30),
    new_status VARCHAR(30) NOT NULL,
    changed_by VARCHAR(50) REFERENCES erp.users(id),
    reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.invoices (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'INV-0015'
    invoice_no VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) REFERENCES erp.orders(id),
    order_no VARCHAR(50),
    customer_id VARCHAR(50) NOT NULL REFERENCES erp.customers(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_address TEXT,
    customer_gstin VARCHAR(25),
    invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
    place_of_supply VARCHAR(100) DEFAULT 'Tamil Nadu (TN)',
    taxable_value NUMERIC(12, 2) NOT NULL,
    cgst NUMERIC(12, 2) DEFAULT 0.00,
    sgst NUMERIC(12, 2) DEFAULT 0.00,
    igst NUMERIC(12, 2) DEFAULT 0.00,
    total NUMERIC(12, 2) NOT NULL,
    paid_amount NUMERIC(12, 2) DEFAULT 0.00,
    outstanding_amount NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'Unpaid' CHECK (status IN ('Unpaid', 'Partially Paid', 'Paid')),
    qr_code_value TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS erp.invoice_items (
    id SERIAL PRIMARY KEY,
    invoice_id VARCHAR(50) NOT NULL REFERENCES erp.invoices(id) ON DELETE CASCADE,
    s_no INT NOT NULL,
    product_id VARCHAR(50) NOT NULL REFERENCES erp.products(id),
    product_name VARCHAR(150) NOT NULL,
    hsn VARCHAR(20) NOT NULL,
    quantity NUMERIC(12, 2) NOT NULL,
    rate NUMERIC(12, 2) NOT NULL,
    taxable NUMERIC(12, 2) NOT NULL,
    cgst_rate NUMERIC(5, 2) DEFAULT 2.50,
    cgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    sgst_rate NUMERIC(5, 2) DEFAULT 2.50,
    sgst_amount NUMERIC(12, 2) DEFAULT 0.00,
    amount NUMERIC(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS erp.dispatches (
    id VARCHAR(50) PRIMARY KEY,
    dispatch_no VARCHAR(50) UNIQUE NOT NULL,
    order_id VARCHAR(50) REFERENCES erp.orders(id),
    invoice_id VARCHAR(50) REFERENCES erp.invoices(id),
    customer_name VARCHAR(150) NOT NULL,
    dispatch_date DATE NOT NULL DEFAULT CURRENT_DATE,
    carrier_name VARCHAR(100),
    vehicle_no VARCHAR(50),
    gate_pass_no VARCHAR(50),
    status VARCHAR(30) DEFAULT 'Dispatched',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. PAYMENTS & RECEIVABLES
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.payments (
    id VARCHAR(50) PRIMARY KEY, -- e.g. 'PAY-001'
    receipt_no VARCHAR(50) UNIQUE NOT NULL,
    invoice_id VARCHAR(50) REFERENCES erp.invoices(id),
    invoice_no VARCHAR(50) NOT NULL,
    customer_id VARCHAR(50) REFERENCES erp.customers(id),
    customer_name VARCHAR(150) NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    amount_paid NUMERIC(12, 2) NOT NULL CHECK (amount_paid > 0),
    payment_mode VARCHAR(50) NOT NULL DEFAULT 'Bank Transfer / UPI',
    reference_no VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. AUDIT LOGS
-- ==============================================================================

CREATE TABLE IF NOT EXISTS erp.audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(50),
    user_name VARCHAR(100),
    action VARCHAR(100) NOT NULL,
    module VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- INDEXES FOR FAST ERP QUERIES & AUDIT TRAILS
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_orders_customer ON erp.orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON erp.orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_customer ON erp.invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON erp.invoices(status);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_item ON erp.stock_ledger(item_type, item_id);
CREATE INDEX IF NOT EXISTS idx_stock_ledger_date ON erp.stock_ledger(transaction_date);
CREATE INDEX IF NOT EXISTS idx_production_runs_product ON erp.production_runs(product_id);
CREATE INDEX IF NOT EXISTS idx_purchases_supplier ON erp.purchases(supplier_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON erp.audit_logs(user_id);
