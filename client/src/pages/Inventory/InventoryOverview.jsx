import React, { useState } from 'react';
import {
  Boxes,
  Package,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  Search,
  Filter,
  Layers,
  Archive
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatusBadge } from '../../components/common/StatusBadge';

export const InventoryOverview = () => {
  const { materials, products } = useERP();
  const [activeTab, setActiveTab] = useState('Overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);

  // Tab counts
  const totalItemsCount = materials.length;
  const inStockCount = materials.filter(m => m.status === 'In Stock').length;
  const lowStockCount = materials.filter(m => m.status === 'Low Stock').length;
  const outOfStockCount = materials.filter(m => m.status === 'Out of Stock').length;

  const itemIcons = {
    'Rice Flour': '🌾',
    'Cooking Oil': '🛢️',
    'Spice Mix': '🌶️',
    'Pouches (200 g)': '🛍️',
    'Cartons (20-pack capacity)': '📦',
  };

  const filteredMaterials = materials.filter(m =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Layout
      breadcrumbs={['Inventory', 'Stock Overview']}
      title="Warehouse Inventory & Stock Position"
      subtitle="Real-time multi-category raw materials, packaging, and finished stock balances"
      actions={
        <button
          onClick={() => setShowAdjustModal(true)}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs flex items-center gap-2 transition-colors"
        >
          <Layers className="w-4 h-4" />
          <span>Stock Adjustment</span>
        </button>
      }
    >
      <div className="space-y-6">
        {/* Top 4 Summary Cards matching Design Collage */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Items</div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{totalItemsCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-primary-50 dark:bg-primary-950/40 text-primary-600">
              <Boxes className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">In Stock</div>
              <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{inStockCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Low Stock</div>
              <div className="text-2xl font-black text-amber-500 mt-1">{lowStockCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-500">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="p-4 rounded-3xl bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 shadow-card flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Out of Stock</div>
              <div className="text-2xl font-black text-slate-400 mt-1">{outOfStockCount}</div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
              <Archive className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Tab navigation matching Design Collage: Overview, Raw Materials, Packaging, Finished Goods, Stock Ledger */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
              {['Overview', 'Raw Materials', 'Packaging', 'Finished Goods', 'Stock Ledger'].map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                    activeTab === t
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative w-full lg:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search stock items..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* 1. Overview Table matching design collage */}
          {activeTab === 'Overview' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-2">Item</th>
                    <th className="pb-3">Category</th>
                    <th className="pb-3 text-right">Closing Stock</th>
                    <th className="pb-3 text-center">Unit</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {filteredMaterials.map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 pl-2 font-bold text-slate-800 dark:text-slate-100 flex items-center gap-3">
                        <span className="text-xl">{itemIcons[m.name] || '📦'}</span>
                        <span>{m.name}</span>
                      </td>
                      <td className="py-3.5 text-slate-500">{m.category}</td>
                      <td className="py-3.5 text-right font-black text-slate-900 dark:text-white text-sm">
                        {m.closingStock.toFixed(1)}
                      </td>
                      <td className="py-3.5 text-center text-slate-500 font-semibold">{m.unit}</td>
                      <td className="py-3.5 text-center">
                        <StatusBadge status={m.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 2. Raw Materials Tab */}
          {activeTab === 'Raw Materials' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Raw Material</th>
                    <th className="pb-3 text-right">Opening</th>
                    <th className="pb-3 text-right">Purchased</th>
                    <th className="pb-3 text-right">Consumed</th>
                    <th className="pb-3 text-right">Closing Stock</th>
                    <th className="pb-3 text-right">Reorder Level</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {materials.filter(m => m.category === 'Raw Material').map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{m.name}</td>
                      <td className="py-3 text-right text-slate-500">{m.openingStock} {m.unit}</td>
                      <td className="py-3 text-right text-emerald-600 font-semibold">+{m.purchased} {m.unit}</td>
                      <td className="py-3 text-right text-rose-600 font-semibold">-{m.consumed} {m.unit}</td>
                      <td className="py-3 text-right font-black text-primary-600 dark:text-primary-400">{m.closingStock} {m.unit}</td>
                      <td className="py-3 text-right text-slate-400">{m.reorderLevel} {m.unit}</td>
                      <td className="py-3 text-center"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 3. Packaging Tab */}
          {activeTab === 'Packaging' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Packaging Material</th>
                    <th className="pb-3 text-right">Opening</th>
                    <th className="pb-3 text-right">Consumed in Run</th>
                    <th className="pb-3 text-right">Closing Stock</th>
                    <th className="pb-3 text-right">Reorder Level</th>
                    <th className="pb-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {materials.filter(m => m.category === 'Packaging').map(m => (
                    <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{m.name}</td>
                      <td className="py-3 text-right text-slate-500">{m.openingStock} {m.unit}</td>
                      <td className="py-3 text-right text-rose-600 font-semibold">-{m.consumed} {m.unit}</td>
                      <td className="py-3 text-right font-black text-primary-600 dark:text-primary-400">{m.closingStock} {m.unit}</td>
                      <td className="py-3 text-right text-slate-400">{m.reorderLevel} {m.unit}</td>
                      <td className="py-3 text-center"><StatusBadge status={m.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 4. Finished Goods Tab */}
          {activeTab === 'Finished Goods' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Product Name</th>
                    <th className="pb-3">HSN</th>
                    <th className="pb-3 text-right">MRP (₹)</th>
                    <th className="pb-3 text-right">Current Available Stock</th>
                    <th className="pb-3 text-right">Minimum Stock</th>
                    <th className="pb-3 text-center">Availability Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {products.map(p => (
                    <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-3 font-bold text-slate-800 dark:text-slate-200">{p.name}</td>
                      <td className="py-3 text-slate-400">{p.hsn}</td>
                      <td className="py-3 text-right font-semibold">₹{p.sellingPrice.toFixed(2)}</td>
                      <td className="py-3 text-right font-black text-emerald-600 dark:text-emerald-400 text-sm">
                        {p.currentStock} {p.unit}
                      </td>
                      <td className="py-3 text-right text-slate-400">{p.minStock} {p.unit}</td>
                      <td className="py-3 text-center">
                        {p.currentStock > p.minStock ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                            Available for Dispatch
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                            Low Buffer
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 5. Stock Movement Ledger Tab */}
          {activeTab === 'Stock Ledger' && (
            <div className="space-y-4">
              <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                Detailed Material Movement Audit Ledger
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Voucher Ref</th>
                      <th className="pb-3">Item</th>
                      <th className="pb-3">Transaction Type</th>
                      <th className="pb-3 text-right">Inward Qty</th>
                      <th className="pb-3 text-right">Outward Qty</th>
                      <th className="pb-3 text-right">Closing Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5">21 Jan 2025</td>
                      <td className="py-2.5 font-mono text-primary-600">PO-001</td>
                      <td className="py-2.5 font-bold">Rice Flour</td>
                      <td className="py-2.5 text-emerald-600 font-semibold">Purchase Receipt</td>
                      <td className="py-2.5 text-right text-emerald-600 font-bold">+60.0 kg</td>
                      <td className="py-2.5 text-right text-slate-400">-</td>
                      <td className="py-2.5 text-right font-black">160.0 kg</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5">21 Jan 2025</td>
                      <td className="py-2.5 font-mono text-primary-600">PR-001</td>
                      <td className="py-2.5 font-bold">Rice Flour</td>
                      <td className="py-2.5 text-rose-600 font-semibold">Production Issue</td>
                      <td className="py-2.5 text-right text-slate-400">-</td>
                      <td className="py-2.5 text-right text-rose-600 font-bold">-40.0 kg</td>
                      <td className="py-2.5 text-right font-black">120.0 kg</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5">21 Jan 2025</td>
                      <td className="py-2.5 font-mono text-primary-600">PR-001</td>
                      <td className="py-2.5 font-bold">Cooking Oil</td>
                      <td className="py-2.5 text-rose-600 font-semibold">Production Issue</td>
                      <td className="py-2.5 text-right text-slate-400">-</td>
                      <td className="py-2.5 text-right text-rose-600 font-bold">-10.5 L</td>
                      <td className="py-2.5 text-right font-black">19.5 L</td>
                    </tr>
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      <td className="py-2.5">21 Jan 2025</td>
                      <td className="py-2.5 font-mono text-primary-600">SO-0025</td>
                      <td className="py-2.5 font-bold">Murukku (200 g)</td>
                      <td className="py-2.5 text-primary-600 font-semibold">Sales Dispatch</td>
                      <td className="py-2.5 text-right text-slate-400">-</td>
                      <td className="py-2.5 text-right text-rose-600 font-bold">-150 pkts</td>
                      <td className="py-2.5 text-right font-black">88 pkts</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stock Adjustment Dialog */}
      {showAdjustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Physical Stock Adjustment Entry
            </h3>
            <p className="text-xs text-slate-400">
              Reconcile discrepancy between physical warehouse inventory and system stock
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">Select Material / Product</label>
                <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  {materials.map(m => (
                    <option key={m.id} value={m.id}>{m.name} (Current: {m.closingStock} {m.unit})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Adjustment Type</label>
                <select className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <option>Stock Count Surplus (+)</option>
                  <option>Damaged / Expired Write-off (-)</option>
                  <option>Handling Spill Loss (-)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">Adjust Quantity</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowAdjustModal(false)}
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold"
              >
                Apply Adjustment
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};
