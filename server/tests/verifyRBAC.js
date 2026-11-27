import http from 'http';
import app from '../src/app.js';

async function runRBACTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const base = `http://localhost:${port}`;

  const req = async (method, path, token, body) => {
    const res = await fetch(base + path, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
  };

  const login = async (email) => {
    const r = await req('POST', '/api/v1/auth/login', null, { email, password: 'Password@123' });
    if (r.status !== 200) throw new Error(`Login failed for ${email}: ${JSON.stringify(r)}`);
    return r.data.data.token;
  };

  try {
    console.log('=== Verifying RBAC & Live Endpoints ===');
    const adminToken = await login('dhivyasri@srimurukku.com');
    const salesToken = await login('raman@srimurukku.com');
    const supToken = await login('selvam@srimurukku.com');
    const audToken = await login('audit@srimurukku.com');
    const ownToken = await login('murugan@srimurukku.com');
    console.log('✓ All 5 role tokens acquired');

    const checks = [
      // Auditor Read-Only checks
      ['GET', '/api/v1/reports/sales', audToken, null, 200, 'Auditor GET /reports/sales'],
      ['GET', '/api/v1/reports/gst-summary', audToken, null, 200, 'Auditor GET /reports/gst-summary'],
      ['GET', '/api/v1/reports/costing', audToken, null, 200, 'Auditor GET /reports/costing'],
      ['GET', '/api/v1/reports/audit-logs', audToken, null, 200, 'Auditor GET /reports/audit-logs'],
      ['GET', '/api/v1/payments/receivables', audToken, null, 200, 'Auditor GET /payments/receivables'],
      ['GET', '/api/v1/payments/ageing', audToken, null, 200, 'Auditor GET /payments/ageing'],
      ['POST', '/api/v1/invoices', audToken, { orderId: 'SO-0025' }, 403, 'Auditor blocked from POST /invoices (Read-Only)'],
      ['POST', '/api/v1/payments', audToken, { invoiceNo: 'INV-0015', amountPaid: 100 }, 403, 'Auditor blocked from POST /payments (Read-Only)'],
      ['POST', '/api/v1/purchases', audToken, { item: 'Flour', quantity: 10 }, 403, 'Auditor blocked from POST /purchases (Read-Only)'],
      ['POST', '/api/v1/inventory/adjustments', audToken, { itemId: 'MAT-001', adjustmentType: 'ADD', quantity: 1 }, 403, 'Auditor blocked from POST /inventory/adjustments (Read-Only)'],
      // Salesman checks
      ['GET', '/api/v1/orders', salesToken, null, 200, 'Salesman GET /orders (own orders)'],
      ['PUT', '/api/v1/orders/SO-0025/approve', salesToken, null, 403, 'Salesman blocked from approving orders'],
      ['POST', '/api/v1/payments', salesToken, { invoiceNo: 'INV-0015', amountPaid: 100 }, 403, 'Salesman blocked from recording payments'],
      ['POST', '/api/v1/production/runs', salesToken, {}, 403, 'Salesman blocked from production runs'],
      // Supervisor checks
      ['GET', '/api/v1/production/runs', supToken, null, 200, 'Supervisor GET /production/runs'],
      ['GET', '/api/v1/reports/variance', supToken, null, 200, 'Supervisor GET /reports/variance'],
      ['PUT', '/api/v1/orders/SO-0025/approve', supToken, null, 403, 'Supervisor blocked from approving orders'],
      ['POST', '/api/v1/invoices', supToken, { orderId: 'SO-0025' }, 403, 'Supervisor blocked from generating invoices'],
      // Admin & Owner checks
      ['GET', '/api/v1/dashboard/summary', adminToken, null, 200, 'Admin GET /dashboard/summary'],
      ['GET', '/api/v1/costing/products/PROD-001', ownToken, null, 200, 'Owner GET /costing/products/PROD-001'],
    ];

    let failed = 0;
    for (const [m, p, t, b, exp, label] of checks) {
      const r = await req(m, p, t, b);
      if (r.status === exp) {
        console.log(`✓ PASS [${r.status}]: ${label}`);
      } else {
        console.error(`✗ FAIL [${r.status} != ${exp}]: ${label}`, r.data);
        failed++;
      }
    }

    console.log(`\nSummary: ${checks.length - failed}/${checks.length} checks passed.`);
    server.close();
    process.exit(failed > 0 ? 1 : 0);
  } catch (e) {
    console.error('Test suite error:', e);
    server.close();
    process.exit(1);
  }
}

runRBACTests();
