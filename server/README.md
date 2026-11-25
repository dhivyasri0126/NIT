# Sri Murukku Foods ERP — Backend Service

A secure, scalable, and normalized **Order-to-Audit Management System Backend** built for small-scale food manufacturers, based on the **NIT Tiruchirappalli Winter Internship 2026** problem statement.

---

## 1. Tech Stack

- **Runtime**: Node.js (v24 LTS)
- **Framework**: Express.js (ES Modules)
- **Database**: PostgreSQL 18.7 on **Neon AWS Cloud** (`pg` connection pool with automatic `erp` schema path)
- **Authentication**: JWT Access Token (`8h`) & Refresh Token (`7d`), `bcryptjs` password hashing (cost factor 10)
- **Security & Validation**: Role-Based Access Control (RBAC), Helmet, CORS, Zod schema validation
- **Logging**: Morgan HTTP logger

---

## 2. Database Design (`erp` Schema)

The database is normalized into **31 tables** within an isolated `erp` PostgreSQL schema:

| Category | Tables | Key Features |
| :--- | :--- | :--- |
| **Authentication & RBAC** | `roles`, `permissions`, `role_permissions`, `users`, `user_roles`, `refresh_tokens` | 5 system roles, token revocation, audit tracking |
| **Master Data** | `units`, `product_categories`, `products`, `customers`, `suppliers`, `raw_materials`, `packaging_materials`, `boms`, `bom_items` | HSN codes, GST rates, reorder levels, standard BOM batch of 200 packets |
| **Sales & Billing** | `orders`, `order_items`, `order_status_history`, `invoices`, `invoice_items`, `dispatches` | Intra/interstate GST (CGST/SGST/IGST), stock shortage detection, e-invoice QR code |
| **Production** | `production_runs`, `production_material_issues`, `production_overheads` | Planned vs actual consumption, &gt;3% variance alerts, unit costing |
| **Inventory & Stock** | `inventory_items`, `stock_ledger`, `stock_adjustments` | Double-entry movement ledger, live balances, physical stock reconciliation |
| **Purchases** | `purchases`, `purchase_items` | Inward receipts automatically update raw material stock |
| **Finance & Audit** | `payments`, `audit_logs` | Part payments, receivables balance tracking, immutable audit trail |

*Note: All monetary figures and physical weights use `NUMERIC(12, 2)` or `NUMERIC(12, 4)` for exact financial precision without floating-point errors.*

---

## 3. Seeded Accounts (NIT Benchmark)

All accounts share the initial password: **`Password@123`**

| Role | Name | Email | Permissions / Focus |
| :--- | :--- | :--- | :--- |
| **Admin** | Dhivyasri M | `dhivyasri@srimurukku.com` | Full administrative control, user creation, order approval, dispatch |
| **Salesman** | K. Ramanathan | `raman@srimurukku.com` | Field order capture, price lists, customer dues |
| **Supervisor** | M. Selvam | `selvam@srimurukku.com` | Shop floor batch entries, material consumption, variance monitoring |
| **Auditor** | V. Jayanthi CA | `audit@srimurukku.com` | GSTR-1 / GSTR-3B tax reports, purchase audit, collections |
| **Owner (MD)** | S. Murugan | `murugan@srimurukku.com` | Executive analytics, unit economics, profitability margin (37.7%) |

---

## 4. Benchmark Dataset State

- **Murukku 200 g Standard BOM**: Batch 200 pkts (Flour 40kg, Oil 10L, Spice 1.2kg, Pouches 200pcs, Cartons 10pcs)
- **Raw Material Stock**: Flour `120.0 kg`, Oil `19.5 L`, Spice `3.8 kg`
- **Packaging Stock**: Pouches `306 pcs`, Cartons `21 pcs` (*Low Stock warning, threshold: 25*)
- **Finished Stock**: Murukku (200 g) `88 packets` (50 opening + 188 produced − 150 dispatched)
- **Batch PR-001**: 188 good pkts, 6 damaged pouches, **Yield Variance: -6.0%**, **Oil Variance: +5.0%** (&gt;3% threshold alert)
- **Order SO-0025 / Invoice INV-0015**: Retailer A (₹7,500 taxable + ₹187.50 CGST + ₹187.50 SGST = **₹7,875.00** gross). Payment `PAY-001` recorded for ₹4,000.00; **Outstanding Balance: ₹3,875.00**.
- **Order SO-0026**: Distributor B (120 pkts ordered, warehouse stock 88 pkts → **Insufficient Stock, Shortage: 32 pkts**).

---

## 5. API Endpoints Catalog

### Authentication & Users
- `POST /api/v1/auth/login` — Authenticate and receive access & refresh tokens
- `POST /api/v1/auth/refresh` — Issue new tokens via refresh token rotation
- `GET /api/v1/auth/me` — Get current user and verified role
- `POST /api/v1/auth/change-password` — Change password (revokes active refresh tokens)
- `POST /api/v1/auth/register` — Register system user (*Admin only*)
- `GET /api/v1/users` — List authorized system users (*Admin / Owner*)

### Master Data
- `GET /api/v1/products` — List all products with current live stock
- `POST /api/v1/products` — Create new product (*Admin / Owner*)
- `PUT /api/v1/products/:id` — Update product details (*Admin / Owner*)
- `GET /api/v1/customers` — Customer directory with outstanding balances
- `POST /api/v1/customers` — Create customer account (*Admin / Salesman / Owner*)
- `GET /api/v1/suppliers` — Supplier directory
- `POST /api/v1/suppliers` — Create supplier entry (*Admin / Supervisor / Owner*)
- `GET /api/v1/master-data/materials` — Raw and packaging materials with live stock
- `POST /api/v1/master-data/materials` — Add raw/packaging material
- `GET /api/v1/master-data/boms/default` — Murukku 200g standard recipe
- `PUT /api/v1/master-data/boms/:productId` — Update BOM formula

### Sales & Invoicing
- `GET /api/v1/orders` — List sales orders with line items & status
- `POST /api/v1/orders` — Create sales order (auto-calculates GST and checks stock availability)
- `PUT /api/v1/orders/:id/approve` — Approve order (*Admin / Owner*)
- `PUT /api/v1/orders/:id/dispatch` — Dispatch goods and auto-deduct finished goods inventory
- `GET /api/v1/invoices` — List tax invoices
- `POST /api/v1/invoices/generate-from-order` — Generate statutory GST invoice from approved order

### Production & Inventory
- `GET /api/v1/production/runs` — Production runs with material consumption and costings
- `POST /api/v1/production/runs` — Record batch run (deducts raw ingredients, adds finished goods)
- `GET /api/v1/inventory/items` — Raw materials, packaging, and finished stock balances
- `GET /api/v1/inventory/ledger` — Audit trail of all stock movements
- `POST /api/v1/inventory/adjustments` — Physical stock reconciliation entry

### Purchases, Costing, Payments & Reports
- `GET /api/v1/purchases` — Purchase orders list
- `POST /api/v1/purchases` — Inward raw material receipt (automatically increases warehouse inventory)
- `GET /api/v1/costing/runs/:runId` — Unit cost economics per packet
- `GET /api/v1/payments` — Receipts register
- `POST /api/v1/payments` — Record collection (updates invoice and customer outstanding balance)
- `GET /api/v1/reports/gst-summary` — GSTR-1 / GSTR-3B tax reconciliation summary
- `GET /api/v1/reports/stock-summary` — Category-wise stock valuation

---

## 6. Commands to Run & Test

```bash
# Move to server directory
cd D:/Projects/NIT/server

# Start server in development mode (with hot reloading)
npm run dev

# Run complete automated verification test suite
node tests/verifyBackend.js

# Re-run migration & seed if needed
npm run db:setup
```
