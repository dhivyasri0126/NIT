import React, { useState } from 'react';
import {
  Truck,
  Plus,
  Search,
  Eye,
  FileText,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  X
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';
import { StatusBadge } from '../../components/common/StatusBadge';
import { exportReportToPDF } from '../../utils/exportUtils';

export const PurchasesList = () => {
  const { purchases, suppliers, materials, createPurchase, currentUser } = useERP();
  const canCreatePurchase = ['admin', 'supervisor', 'owner'].includes(currentUser?.id);
  const [searchQuery, setSearchQuery] = useState('');
  const [supplierFilter, setSupplierFilter] = useState('All');
  const [showNewPoModal, setShowNewPoModal] = useState(false);
  const [selectedPo, setSelectedPo] = useState(null);

  // New PO form state
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [item, setItem] = useState('Rice Flour');
  const [quantity, setQuantity] = useState(60);
  const [unit, setUnit] = useState('kg');
  const [unitPrice, setUnitPrice] = useState(45);

  const filteredPurchases = purchases.filter(po => {
    const matchesSearch = po.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.supplierName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.item.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSupplier = supplierFilter === 'All' || po.supplierName === supplierFilter;
    return matchesSearch && matchesSupplier;
  });

  const handleCreatePo = (e) => {
    e.preventDefault();
    const sup = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];
    const totalAmount = quantity * unitPrice;

    createPurchase({
      supplierId: sup.id,
      supplierName: sup.name,
      item: `${item} (${quantity} ${unit})`,
      quantity: Number(quantity),
      unit,
      unitPrice: Number(unitPrice),
      totalAmount,
      invoiceRef: `INV/${Date.now().toString().slice(-4)}`,
    });

    setShowNewPoModal(false);
  };

  const handlePrintPo = (po) => {
    exportReportToPDF({
      title: `PURCHASE ORDER – ${po.poNumber}`,
      subtitle: `Supplier: ${po.supplierName} | Inward Date: ${po.date}`,
      columns: ['PO No', 'Supplier', 'Item Description', 'Qty', 'Unit Price (Rs)', 'Total (Rs)', 'Status'],
      rows: [
        [po.poNumber, po.supplierName, po.item, `${po.quantity} ${po.unit}`, po.unitPrice.toFixed(2), po.totalAmount.toFixed(2), po.status]
      ],
      filename: `${po.poNumber}_Purchase_Receipt.pdf`
    });
  };

  return (
    <Layout
      breadcrumbs={['Purchases', 'Purchase Entries']}
      title="Purchase Inward Register"
      subtitle="Procurement vouchers, supplier raw material receipts, and inventory updates"
      actions={
        canCreatePurchase ? (
          <button
            onClick={() => setShowNewPoModal(true)}
            className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-xl text-xs flex items-center gap-2 shadow-md transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>New Purchase Entry</span>
          </button>
        ) : null
      }
    >
      <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 shadow-card space-y-6">
        {/* Search & Filters Bar matching design collage */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by supplier or PO no..."
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white placeholder-slate-400"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>Jan 01, 2025 – Jan 31, 2025</span>
            </div>

            <select
              className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300"
              value={supplierFilter}
              onChange={(e) => setSupplierFilter(e.target.value)}
            >
              <option value="All">All Suppliers</option>
              {suppliers.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Purchase Orders Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                <th className="pb-3 pl-2">PO No.</th>
                <th className="pb-3">Supplier</th>
                <th className="pb-3">Date</th>
                <th className="pb-3">Items</th>
                <th className="pb-3 text-right">Amount (₹)</th>
                <th className="pb-3 text-center">Status</th>
                <th className="pb-3 text-right pr-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filteredPurchases.map(po => (
                <tr key={po.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                  <td className="py-3.5 pl-2 font-bold text-primary-600 dark:text-primary-400">
                    {po.poNumber}
                  </td>
                  <td className="py-3.5 font-semibold text-slate-800 dark:text-slate-100">
                    {po.supplierName}
                  </td>
                  <td className="py-3.5 text-slate-500">{po.date}</td>
                  <td className="py-3.5 text-slate-700 dark:text-slate-300">{po.item}</td>
                  <td className="py-3.5 text-right font-bold text-slate-900 dark:text-white">
                    ₹{po.totalAmount.toFixed(2)}
                  </td>
                  <td className="py-3.5 text-center">
                    <StatusBadge status={po.status} />
                  </td>
                  <td className="py-3.5 text-right pr-2">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedPo(po)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600"
                        title="View PO Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handlePrintPo(po)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-primary-600"
                        title="Print / PDF PO"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Purchase Modal */}
      {showNewPoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <form onSubmit={handleCreatePo} className="bg-white dark:bg-surface-dark w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Create New Purchase Receipt
            </h3>
            <p className="text-xs text-slate-400">
              Record incoming raw material shipment and automatically update warehouse stock
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Select Supplier *</label>
                <select
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Item Name *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Quantity *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Unit</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                  >
                    <option value="kg">kg</option>
                    <option value="L">L (Litres)</option>
                    <option value="pcs">pcs (Pieces)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-semibold mb-1">Unit Price (₹) *</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold"
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-primary-50 dark:bg-primary-950/40 rounded-xl flex justify-between items-center text-xs font-bold text-primary-700 dark:text-primary-300">
                <span>Total Purchase Value:</span>
                <span className="text-sm">₹{(quantity * unitPrice).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewPoModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-bold"
              >
                Record Purchase
              </button>
            </div>
          </form>
        </div>
      )}
    </Layout>
  );
};
