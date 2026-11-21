import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Factory,
  Boxes,
  Truck,
  DollarSign,
  Receipt,
  BarChart3,
  Database,
  Users,
  Settings,
  ChevronDown,
  ChevronRight,
  PlusCircle,
  FileText,
  Send,
  SlidersHorizontal,
  X,
  Sparkles
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useERP } from '../../context/ERPContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const { currentUser } = useERP();
  const location = useLocation();

  // Collapsible sub-menus state
  const [openSections, setOpenSections] = useState({
    sales: true,
    production: true,
    inventory: true,
    master: false,
  });

  const toggleSection = (section) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const navItemClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
      isActive
        ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
        : 'text-slate-400 hover:text-white hover:bg-sidebar-hover'
    }`;

  const subNavItemClass = ({ isActive }) =>
    `flex items-center gap-2 pl-9 pr-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
      isActive
        ? 'text-white font-semibold bg-white/10'
        : 'text-slate-400 hover:text-white hover:bg-white/5'
    }`;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-sidebar text-slate-300 flex flex-col border-r border-sidebar-border transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-primary-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 text-white font-black text-xl">
              🥨
            </div>
            <div>
              <h1 className="font-bold text-white text-base leading-tight tracking-tight">
                Sri Murukku Foods
              </h1>
              <p className="text-[11px] text-primary-400 font-medium">
                Food Manufacturing ERP
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-sidebar-hover"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Role Badge */}
        <div className="px-5 py-2.5 bg-sidebar-dark/60 border-b border-sidebar-border/60 flex items-center justify-between text-xs">
          <span className="text-slate-400">Active Role:</span>
          <span className="px-2 py-0.5 rounded-full font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30">
            {currentUser?.badge || 'Admin'}
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 scrollbar-thin">
          {/* 1. Dashboard */}
          <NavLink to="/" end className={navItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <Home className="w-4 h-4 flex-shrink-0" />
            <span>{t('dashboard')}</span>
          </NavLink>

          {/* 2. Sales & Orders (Collapsible) */}
          <div>
            <button
              onClick={() => toggleSection('sales')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-sidebar-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-4 h-4 flex-shrink-0" />
                <span>{t('salesAndOrders')}</span>
              </div>
              {openSections.sales ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSections.sales && (
              <div className="mt-1 space-y-1">
                <NavLink to="/sales/create-order" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('createOrder')}
                </NavLink>
                <NavLink to="/sales/orders" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('orders')}
                </NavLink>
                <NavLink to="/sales/invoices" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('invoices')}
                </NavLink>
                <NavLink to="/sales/dispatches" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('dispatches')}
                </NavLink>
                <NavLink to="/sales/mobile-order" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  <span>Salesman Quick Capture</span>
                </NavLink>
              </div>
            )}
          </div>

          {/* 3. Production Management (Collapsible) */}
          <div>
            <button
              onClick={() => toggleSection('production')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-sidebar-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <Factory className="w-4 h-4 flex-shrink-0" />
                <span>{t('productionManagement')}</span>
              </div>
              {openSections.production ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSections.production && (
              <div className="mt-1 space-y-1">
                <NavLink to="/production/run" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('productionRun')}
                </NavLink>
                <NavLink to="/production/bom" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('bom')}
                </NavLink>
                <NavLink to="/production/plan" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('productionPlan')}
                </NavLink>
                <NavLink to="/production/history" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('productionHistory')}
                </NavLink>
              </div>
            )}
          </div>

          {/* 4. Inventory (Collapsible) */}
          <div>
            <button
              onClick={() => toggleSection('inventory')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-sidebar-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <Boxes className="w-4 h-4 flex-shrink-0" />
                <span>{t('inventory')}</span>
              </div>
              {openSections.inventory ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSections.inventory && (
              <div className="mt-1 space-y-1">
                <NavLink to="/inventory" end className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('stockOverview')}
                </NavLink>
                <NavLink to="/inventory/raw" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('rawMaterials')}
                </NavLink>
                <NavLink to="/inventory/packaging" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('packagingMaterials')}
                </NavLink>
                <NavLink to="/inventory/finished" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('finishedGoods')}
                </NavLink>
                <NavLink to="/inventory/ledger" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  {t('stockLedger')}
                </NavLink>
              </div>
            )}
          </div>

          {/* 5. Purchases */}
          <NavLink to="/purchases" className={navItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <Truck className="w-4 h-4 flex-shrink-0" />
            <span>{t('purchases')}</span>
          </NavLink>

          {/* 6. Product Costing */}
          <NavLink to="/costing" className={navItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <DollarSign className="w-4 h-4 flex-shrink-0" />
            <span>{t('productCosting')}</span>
          </NavLink>

          {/* 7. Payments & Receivables */}
          <NavLink to="/payments" className={navItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <Receipt className="w-4 h-4 flex-shrink-0" />
            <span>{t('paymentsReceivables')}</span>
          </NavLink>

          {/* 8. Reports & Audit */}
          <NavLink to="/reports" className={navItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <BarChart3 className="w-4 h-4 flex-shrink-0" />
            <span>{t('reportsAudit')}</span>
          </NavLink>

          {/* 9. Master Data */}
          <div>
            <button
              onClick={() => toggleSection('master')}
              className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-sidebar-hover transition-colors"
            >
              <div className="flex items-center gap-3">
                <Database className="w-4 h-4 flex-shrink-0" />
                <span>{t('masterData')}</span>
              </div>
              {openSections.master ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {openSections.master && (
              <div className="mt-1 space-y-1">
                <NavLink to="/master/products" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Products Master
                </NavLink>
                <NavLink to="/master/customers" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Customers Master
                </NavLink>
                <NavLink to="/master/suppliers" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Suppliers Master
                </NavLink>
                <NavLink to="/master/materials" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Raw & Packing Master
                </NavLink>
                <NavLink to="/master/boms" className={subNavItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
                  <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                  Standard BOM Master
                </NavLink>
              </div>
            )}
          </div>

          {/* 10. User Management */}
          <NavLink to="/users" className={navItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <Users className="w-4 h-4 flex-shrink-0" />
            <span>{t('userManagement')}</span>
          </NavLink>

          {/* 11. Settings */}
          <NavLink to="/settings" className={navItemClass} onClick={() => window.innerWidth < 1024 && onClose()}>
            <Settings className="w-4 h-4 flex-shrink-0" />
            <span>{t('settings')}</span>
          </NavLink>
        </div>

        {/* Bottom Murukku Traditional Craft Banner */}
        <div className="p-4 border-t border-sidebar-border bg-sidebar-dark/40">
          <div className="p-3 rounded-xl bg-gradient-to-r from-amber-500/10 to-primary-500/10 border border-amber-500/20 flex items-center gap-3">
            <span className="text-2xl">🌾</span>
            <div className="text-xs">
              <div className="font-semibold text-amber-300">NIT Trichy Benchmark</div>
              <div className="text-[11px] text-slate-400">Murukku 200g (Batch: 200)</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
