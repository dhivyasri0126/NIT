import React, { useState } from 'react';
import {
  Database,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  Package,
  Users,
  Truck,
  Boxes,
  Layers,
  X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';

export const MasterDataView = () => {
  const { products, customers, suppliers, materials, addProduct, addCustomer, addSupplier } = useERP();
  const [activeTab, setActiveTab] = useState('products');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form states
  const [prodForm, setProdForm] = useState({ name: '', hsn: '19059090', sellingPrice: 50, costPrice: 32, gstRate: 5, unit: 'packets' });
  const [custForm, setCustForm] = useState({ name: '', city: 'Trichy', gstin: '', phone: '', creditLimit: 50000 });
  const [suppForm, setSuppForm] = useState({ name: '', category: 'Grains & Flour', city: 'Trichy', gstin: '', contact: '' });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (activeTab === 'products') {
      addProduct({ ...prodForm, sellingPrice: Number(prodForm.sellingPrice), currentStock: 0, status: 'Active' });
    } else if (activeTab === 'customers') {
      addCustomer({ ...custForm, outstanding: 0 });
    } else if (activeTab === 'suppliers') {
      addSupplier({ ...suppForm, rating: 5.0 });
    }
    setShowAddModal(false);
  };

  return (
    <Layout
      breadcrumbs={['Master Data', activeTab.toUpperCase()]}
      title="ERP Master Data Management"
      subtitle="Standard definitions for products, price lists, customer accounts, suppliers, and tax rates"
      actions={
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add New {activeTab.slice(0, -1)}</span>
        </button>
      }
    >
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
        {/* Sub-tabs: Products | Customers | Suppliers | Materials */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'products', label: 'Products Master', count: products.length },
              { id: 'customers', label: 'Customers Master', count: customers.length },
              { id: 'suppliers', label: 'Suppliers Master', count: suppliers.length },
              { id: 'materials', label: 'Raw & Packaging', count: materials.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary-500 text-white shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Product Code</th>
                  <th className="pb-3">Product Name</th>
                  <th className="pb-3">Category</th>
                  <th className="pb-3">HSN Code</th>
                  <th className="pb-3 text-right">Selling Price</th>
                  <th className="pb-3 text-right">Cost Price</th>
                  <th className="pb-3 text-right">GST Rate</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {products.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 pl-2 font-bold font-mono text-primary-600">{p.id}</td>
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">{p.name}</td>
                    <td className="py-3.5 text-slate-500">{p.category}</td>
                    <td className="py-3.5 font-mono text-slate-400">{p.hsn}</td>
                    <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">₹{p.sellingPrice.toFixed(2)}</td>
                    <td className="py-3.5 text-right text-slate-500">₹{p.costPrice.toFixed(2)}</td>
                    <td className="py-3.5 text-right text-primary-600 font-semibold">{p.gstRate}%</td>
                    <td className="py-3.5 text-right pr-2">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Customers */}
        {activeTab === 'customers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Customer ID</th>
                  <th className="pb-3">Customer / Firm Name</th>
                  <th className="pb-3">City & State</th>
                  <th className="pb-3">GSTIN</th>
                  <th className="pb-3 text-right">Credit Limit</th>
                  <th className="pb-3 text-right">Outstanding</th>
                  <th className="pb-3 text-right pr-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {customers.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 pl-2 font-bold font-mono text-primary-600">{c.id}</td>
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">{c.name}</td>
                    <td className="py-3.5 text-slate-500">{c.city}, {c.state}</td>
                    <td className="py-3.5 font-mono text-slate-400">{c.gstin}</td>
                    <td className="py-3.5 text-right font-semibold">₹{c.creditLimit.toLocaleString()}</td>
                    <td className="py-3.5 text-right font-bold text-rose-600">₹{c.outstanding.toLocaleString()}</td>
                    <td className="py-3.5 text-right pr-2">
                      <button className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-600">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 3: Suppliers */}
        {activeTab === 'suppliers' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Supplier ID</th>
                  <th className="pb-3">Supplier Name</th>
                  <th className="pb-3">Category Supplied</th>
                  <th className="pb-3">City</th>
                  <th className="pb-3">GSTIN</th>
                  <th className="pb-3 text-right">Contact</th>
                  <th className="pb-3 text-right pr-2">Rating</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {suppliers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 pl-2 font-bold font-mono text-primary-600">{s.id}</td>
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">{s.name}</td>
                    <td className="py-3.5 text-slate-500">{s.category}</td>
                    <td className="py-3.5 text-slate-500">{s.city}</td>
                    <td className="py-3.5 font-mono text-slate-400">{s.gstin}</td>
                    <td className="py-3.5 text-right text-slate-600">{s.contact}</td>
                    <td className="py-3.5 text-right pr-2 font-bold text-amber-500">⭐ {s.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 4: Materials */}
        {activeTab === 'materials' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase">
                  <th className="pb-3 pl-2">Material Code</th>
                  <th className="pb-3">Material Name</th>
                  <th className="pb-3">Type</th>
                  <th className="pb-3 text-center">Unit</th>
                  <th className="pb-3 text-right">Average Unit Cost</th>
                  <th className="pb-3 text-right">Reorder Level</th>
                  <th className="pb-3 text-right pr-2">Current Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {materials.map(m => (
                  <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 pl-2 font-bold font-mono text-primary-600">{m.id}</td>
                    <td className="py-3.5 font-bold text-slate-800 dark:text-slate-100">{m.name}</td>
                    <td className="py-3.5 text-slate-500">{m.category}</td>
                    <td className="py-3.5 text-center text-slate-500 font-semibold">{m.unit}</td>
                    <td className="py-3.5 text-right font-bold">₹{m.avgCostPerUnit.toFixed(2)}</td>
                    <td className="py-3.5 text-right text-slate-400">{m.reorderLevel} {m.unit}</td>
                    <td className="py-3.5 text-right pr-2 font-black text-primary-600">{m.closingStock} {m.unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleAddSubmit} className="bg-white dark:bg-surface-dark w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white capitalize">
              Add New {activeTab.slice(0, -1)}
            </h3>

            {activeTab === 'products' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Garlic Sev (200 g)"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Selling Price (₹)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      value={prodForm.sellingPrice}
                      onChange={(e) => setProdForm({ ...prodForm, sellingPrice: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Cost Price (₹)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      value={prodForm.costPrice}
                      onChange={(e) => setProdForm({ ...prodForm, costPrice: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'customers' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Customer / Firm Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Ponmani Supermarket"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    value={custForm.name}
                    onChange={(e) => setCustForm({ ...custForm, name: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">City</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      value={custForm.city}
                      onChange={(e) => setCustForm({ ...custForm, city: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 mb-1 font-semibold">Credit Limit (₹)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                      value={custForm.creditLimit}
                      onChange={(e) => setCustForm({ ...custForm, creditLimit: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'suppliers' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-600 mb-1 font-semibold">Supplier Firm Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. Royal Spices Corp"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    value={suppForm.name}
                    onChange={(e) => setSuppForm({ ...suppForm, name: e.target.value })}
                    required
                  />
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold"
              >
                Save Record
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};
