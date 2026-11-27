import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ERPProvider } from './context/ERPContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';
import { RoleGuard } from './components/common/RoleGuard';

// Landing & Auth Pages
import { LandingPage } from './pages/Landing/LandingPage';
import { LoginPage } from './pages/Auth/LoginPage';

// Dashboard & Functional Modules
import { DashboardRouter } from './pages/Dashboard/DashboardRouter';
import { OrderList } from './pages/Sales/OrderList';
import { CreateOrder } from './pages/Sales/CreateOrder';
import { MobileOrderCapture } from './pages/Sales/MobileOrderCapture';
import { InvoiceView } from './pages/Sales/InvoiceView';
import { Dispatches } from './pages/Sales/Dispatches';
import { ProductionRunView } from './pages/Production/ProductionRunView';
import { BOMConfig } from './pages/Production/BOMConfig';
import { ProductionPlan } from './pages/Production/ProductionPlan';
import { ProductionHistory } from './pages/Production/ProductionHistory';
import { InventoryOverview } from './pages/Inventory/InventoryOverview';
import { PurchasesList } from './pages/Purchases/PurchasesList';
import { CostingDashboard } from './pages/Costing/CostingDashboard';
import { PaymentsReceivables } from './pages/Payments/PaymentsReceivables';
import { ReportsAudit } from './pages/Reports/ReportsAudit';
import { MasterDataView } from './pages/MasterData/MasterDataView';
import { UserManagement } from './pages/Users/UserManagement';
import { SettingsView } from './pages/Settings/SettingsView';

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <ERPProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Portal & Showcase */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Main ERP Role Dashboard */}
              <Route path="/dashboard" element={<DashboardRouter />} />

              {/* Sales & Orders */}
              <Route path="/sales/orders" element={<RoleGuard allowedRoles={['admin', 'salesman', 'auditor', 'owner']}><OrderList /></RoleGuard>} />
              <Route path="/sales/create-order" element={<RoleGuard allowedRoles={['admin', 'salesman']}><CreateOrder /></RoleGuard>} />
              <Route path="/sales/mobile-order" element={<RoleGuard allowedRoles={['admin', 'salesman']}><MobileOrderCapture /></RoleGuard>} />
              <Route path="/sales/invoices" element={<RoleGuard allowedRoles={['admin', 'auditor', 'owner']}><InvoiceView /></RoleGuard>} />
              <Route path="/sales/dispatches" element={<RoleGuard allowedRoles={['admin', 'owner']}><Dispatches /></RoleGuard>} />

              {/* Production Management */}
              <Route path="/production/run" element={<RoleGuard allowedRoles={['admin', 'supervisor']}><ProductionRunView /></RoleGuard>} />
              <Route path="/production/bom" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'owner']}><BOMConfig /></RoleGuard>} />
              <Route path="/production/plan" element={<RoleGuard allowedRoles={['admin', 'supervisor']}><ProductionPlan /></RoleGuard>} />
              <Route path="/production/history" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'owner']}><ProductionHistory /></RoleGuard>} />

              {/* Inventory */}
              <Route path="/inventory" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'auditor', 'owner']}><InventoryOverview /></RoleGuard>} />
              <Route path="/inventory/raw" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'auditor', 'owner']}><InventoryOverview /></RoleGuard>} />
              <Route path="/inventory/packaging" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'auditor', 'owner']}><InventoryOverview /></RoleGuard>} />
              <Route path="/inventory/finished" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'auditor', 'owner']}><InventoryOverview /></RoleGuard>} />
              <Route path="/inventory/ledger" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'auditor', 'owner']}><InventoryOverview /></RoleGuard>} />

              {/* Purchases */}
              <Route path="/purchases" element={<RoleGuard allowedRoles={['admin', 'supervisor', 'auditor', 'owner']}><PurchasesList /></RoleGuard>} />

              {/* Costing */}
              <Route path="/costing" element={<RoleGuard allowedRoles={['admin', 'auditor', 'owner']}><CostingDashboard /></RoleGuard>} />

              {/* Payments & Receivables */}
              <Route path="/payments" element={<RoleGuard allowedRoles={['admin', 'auditor', 'owner']}><PaymentsReceivables /></RoleGuard>} />

              {/* Reports & Audit */}
              <Route path="/reports" element={<RoleGuard allowedRoles={['admin', 'auditor', 'owner']}><ReportsAudit /></RoleGuard>} />

              {/* Master Data (Admin Only) */}
              <Route path="/master/products" element={<RoleGuard allowedRoles={['admin']}><MasterDataView /></RoleGuard>} />
              <Route path="/master/customers" element={<RoleGuard allowedRoles={['admin']}><MasterDataView /></RoleGuard>} />
              <Route path="/master/suppliers" element={<RoleGuard allowedRoles={['admin']}><MasterDataView /></RoleGuard>} />
              <Route path="/master/materials" element={<RoleGuard allowedRoles={['admin']}><MasterDataView /></RoleGuard>} />
              <Route path="/master/boms" element={<RoleGuard allowedRoles={['admin']}><BOMConfig /></RoleGuard>} />

              {/* Users & Settings */}
              <Route path="/users" element={<RoleGuard allowedRoles={['admin']}><UserManagement /></RoleGuard>} />
              <Route path="/settings" element={<SettingsView />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </ERPProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
