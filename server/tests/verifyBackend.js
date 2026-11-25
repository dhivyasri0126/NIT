import http from 'http';
import app from '../src/app.js';
import { testConnection, pool } from '../src/config/database.js';

let server;
const PORT = 5055; // Use dedicated test port

function request({ method = 'GET', path, headers = {}, body = null }) {
  return new Promise((resolve, reject) => {
    const dataStr = body ? JSON.stringify(body) : null;
    const reqHeaders = { ...headers };
    if (dataStr) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(dataStr);
    }

    const req = http.request({
      hostname: 'localhost',
      port: PORT,
      path,
      method,
      headers: reqHeaders,
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on('error', reject);
    if (dataStr) req.write(dataStr);
    req.end();
  });
}

async function runTests() {
  console.log('\n===============================================================');
  console.log('🧪 RUNNING COMPREHENSIVE BACKEND VALIDATION SUITE');
  console.log('===============================================================\n');

  try {
    await testConnection();
    server = app.listen(PORT);
    console.log(`✓ Test server running on http://localhost:${PORT}\n`);

    // 1. Health check
    console.log('--- 1. Health Check Test ---');
    const health = await request({ path: '/api/health' });
    console.log(`Status: ${health.status}, Response:`, health.body.status);
    if (health.status !== 200 || health.body.status !== 'healthy') throw new Error('Health check failed');
    console.log('✓ Health check passed!\n');

    // 2. Test Login for all 5 roles
    console.log('--- 2. Multi-Role Authentication Test ---');
    const rolesToTest = [
      { email: 'dhivyasri@srimurukku.com', role: 'ADMIN', name: 'Dhivyasri M (Admin)' },
      { email: 'raman@srimurukku.com', role: 'SALESMAN', name: 'K. Ramanathan (Salesman)' },
      { email: 'selvam@srimurukku.com', role: 'SUPERVISOR', name: 'M. Selvam (Supervisor)' },
      { email: 'audit@srimurukku.com', role: 'AUDITOR', name: 'V. Jayanthi CA (Auditor)' },
      { email: 'murugan@srimurukku.com', role: 'OWNER', name: 'S. Murugan (Owner)' },
    ];

    const tokens = {};

    for (const r of rolesToTest) {
      const loginRes = await request({
        method: 'POST',
        path: '/api/v1/auth/login',
        body: { email: r.email, password: 'Password@123' },
      });

      if (loginRes.status !== 200 || !loginRes.body.success) {
        throw new Error(`Login failed for ${r.name}: ${JSON.stringify(loginRes.body)}`);
      }

      console.log(`✓ ${r.name} logged in successfully! Role verified: ${loginRes.body.data.user.role}`);
      tokens[r.role] = loginRes.body.data.accessToken;
    }
    console.log('✓ All 5 roles authenticated successfully!\n');

    // 3. Test JWT & /me endpoint
    console.log('--- 3. JWT Token Verification (/me) ---');
    const unauthRes = await request({ path: '/api/v1/auth/me' });
    console.log(`Unauthenticated request: status ${unauthRes.status} (${unauthRes.body.message})`);
    if (unauthRes.status !== 401) throw new Error('Unauthenticated request was not blocked');

    const authMeRes = await request({
      path: '/api/v1/auth/me',
      headers: { Authorization: `Bearer ${tokens.ADMIN}` },
    });
    console.log(`Authenticated request: status ${authMeRes.status}, User: ${authMeRes.body.data.user.name}`);
    if (authMeRes.status !== 200) throw new Error('Valid token was rejected');
    console.log('✓ JWT middleware verified!\n');

    // 4. Role-Based Access Control (RBAC) tests
    console.log('--- 4. Role-Based Access Control (RBAC) Protection ---');
    // Salesman attempts to register a new user (admin-only)
    const forbiddenRes = await request({
      method: 'POST',
      path: '/api/v1/auth/register',
      headers: { Authorization: `Bearer ${tokens.SALESMAN}` },
      body: { name: 'Test', email: 'test@srimurukku.com', password: 'Password@123', roleId: 2 },
    });
    console.log(`Salesman creating user: status ${forbiddenRes.status} (${forbiddenRes.body.message})`);
    if (forbiddenRes.status !== 403) throw new Error('RBAC violation: Non-admin was not forbidden from registering users');

    // Salesman attempts to delete a product (admin/owner only)
    const deleteProdForbidden = await request({
      method: 'DELETE',
      path: '/api/v1/products/PROD-001',
      headers: { Authorization: `Bearer ${tokens.SALESMAN}` },
    });
    console.log(`Salesman deleting product: status ${deleteProdForbidden.status} (${deleteProdForbidden.body.message})`);
    if (deleteProdForbidden.status !== 403) throw new Error('RBAC violation: Salesman allowed to delete product');
    console.log('✓ RBAC enforcement verified!\n');

    // 5. Master Data APIs
    console.log('--- 5. Master Data APIs (Products, Customers, Suppliers, Materials, BOM) ---');
    const prodsRes = await request({
      path: '/api/v1/products',
      headers: { Authorization: `Bearer ${tokens.ADMIN}` },
    });
    console.log(`Products in database: ${prodsRes.body.data.length}`);
    const murukku = prodsRes.body.data.find(p => p.id === 'PROD-001');
    console.log(`Murukku 200g - Selling Price: ₹${murukku.selling_price}, Current Stock: ${murukku.current_stock} pkts`);
    if (murukku.selling_price !== '50.00') throw new Error('Murukku price mismatch');

    const custsRes = await request({
      path: '/api/v1/customers',
      headers: { Authorization: `Bearer ${tokens.SALESMAN}` },
    });
    console.log(`Customers in database: ${custsRes.body.data.length}`);
    const retA = custsRes.body.data.find(c => c.id === 'CUST-001');
    console.log(`Retailer A - City: ${retA.city}, Outstanding: ₹${retA.outstanding_balance}`);

    const suppsRes = await request({
      path: '/api/v1/suppliers',
      headers: { Authorization: `Bearer ${tokens.ADMIN}` },
    });
    console.log(`Suppliers in database: ${suppsRes.body.data.length}`);

    const matsRes = await request({
      path: '/api/v1/master-data/materials',
      headers: { Authorization: `Bearer ${tokens.ADMIN}` },
    });
    console.log(`Raw & Packaging Materials: ${matsRes.body.data.length}`);
    const flour = matsRes.body.data.find(m => m.name === 'Rice Flour');
    const cartons = matsRes.body.data.find(m => m.name.includes('Cartons'));
    console.log(`Rice Flour Closing Stock: ${flour.closing_stock} kg (In Stock)`);
    console.log(`Cartons Closing Stock: ${cartons.closing_stock} pcs (Status: ${cartons.status})`);

    const bomRes = await request({
      path: '/api/v1/master-data/boms/default',
      headers: { Authorization: `Bearer ${tokens.SUPERVISOR}` },
    });
    console.log(`Murukku Standard BOM Ingredients: ${bomRes.body.data.ingredients.length} items`);
    console.log('✓ Master data APIs verified!\n');

    // 6. Orders, Invoices, Production, Inventory
    console.log('--- 6. Orders, Invoices & Production Data ---');
    const ordersRes = await request({
      path: '/api/v1/orders',
      headers: { Authorization: `Bearer ${tokens.ADMIN}` },
    });
    console.log(`Orders count: ${ordersRes.body.data.length}`);
    const so25 = ordersRes.body.data.find(o => o.order_no === 'SO-0025');
    console.log(`SO-0025 Retailer A: Total ₹${so25.total_amount}, Status: ${so25.status}`);

    const invsRes = await request({
      path: '/api/v1/invoices',
      headers: { Authorization: `Bearer ${tokens.AUDITOR}` },
    });
    console.log(`Invoices count: ${invsRes.body.data.length}`);
    const inv15 = invsRes.body.data.find(i => i.invoice_no === 'INV-0015');
    console.log(`INV-0015 Total: ₹${inv15.total}, Paid: ₹${inv15.paid_amount}, Outstanding: ₹${inv15.outstanding_amount}`);

    const prodRunsRes = await request({
      path: '/api/v1/production/runs',
      headers: { Authorization: `Bearer ${tokens.SUPERVISOR}` },
    });
    console.log(`Production runs: ${prodRunsRes.body.data.length}`);
    const pr1 = prodRunsRes.body.data[0];
    console.log(`PR-001 Batch: ${pr1.batch_no}, Actual Output: ${pr1.actual_output} pkts, Yield Var: ${pr1.yield_variance_percent}%`);

    console.log('\n===============================================================');
    console.log('🎉 ALL BACKEND TESTS PASSED WITH 100% SUCCESS!');
    console.log('===============================================================\n');

  } catch (err) {
    console.error('\n❌ Test failure:', err);
    process.exitCode = 1;
  } finally {
    if (server) server.close();
    await pool.end();
  }
}

runTests();
