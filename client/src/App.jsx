import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ERPProvider } from './context/ERPContext';
import { LanguageProvider } from './context/LanguageContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
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
              {/* Dashboard */}
              <Route path="/" element={<DashboardRouter />} />

              {/* Sales & Orders */}
              <Route path="/sales/orders" element={<OrderList />} />
              <Route path="/sales/create-order" element={<CreateOrder />} />
              <Route path="/sales/mobile-order" element={<MobileOrderCapture />} />
              <Route path="/sales/invoices" element={<InvoiceView />} />
              <Route path="/sales/dispatches" element={<Dispatches />} />

              {/* Production Management */}
              <Route path="/production/run" element={<ProductionRunView />} />
              <Route path="/production/bom" element={<BOMConfig />} />
              <Route path="/production/plan" element={<ProductionPlan />} />
              <Route path="/production/history" element={<ProductionHistory />} />

              {/* Inventory */}
              <Route path="/inventory" element={<InventoryOverview />} />
              <Route path="/inventory/raw" element={<InventoryOverview />} />
              <Route path="/inventory/packaging" element={<InventoryOverview />} />
              <Route path="/inventory/finished" element={<InventoryOverview />} />
              <Route path="/inventory/ledger" element={<InventoryOverview />} />

              {/* Purchases */}
              <Route path="/purchases" element={<PurchasesList />} />

              {/* Costing */}
              <Route path="/costing" element={<CostingDashboard />} />

              {/* Payments & Receivables */}
              <Route path="/payments" element={<PaymentsReceivables />} />

              {/* Reports & Audit */}
              <Route path="/reports" element={<ReportsAudit />} />

              {/* Master Data */}
              <Route path="/master/products" element={<MasterDataView />} />
              <Route path="/master/customers" element={<MasterDataView />} />
              <Route path="/master/suppliers" element={<MasterDataView />} />
              <Route path="/master/materials" element={<MasterDataView />} />
              <Route path="/master/boms" element={<BOMConfig />} />

              {/* Users & Settings */}
              <Route path="/users" element={<UserManagement />} />
              <Route path="/settings" element={<SettingsView />} />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </ERPProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
