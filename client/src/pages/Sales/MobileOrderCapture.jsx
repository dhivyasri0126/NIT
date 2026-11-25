import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Smartphone,
  Plus,
  Minus,
  Check,
  WifiOff,
  ShoppingBag,
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { useERP } from '../../context/ERPContext';
import { Layout } from '../../components/common/Layout';

export const MobileOrderCapture = () => {
  const { customers, products, createOrder, isOffline, offlineQueue } = useERP();
  const navigate = useNavigate();

  const [selectedCustomerId, setSelectedCustomerId] = useState(customers[0]?.id || '');
  const [quantities, setQuantities] = useState({
    'PROD-001': 100, // Murukku
    'PROD-002': 0,
    'PROD-003': 0,
    'PROD-004': 0,
    'PROD-005': 0,
  });
  const [submitted, setSubmitted] = useState(false);

  const selectedCustomer = customers.find(c => c.id === selectedCustomerId);

  const handleQtyChange = (prodId, delta) => {
    setQuantities(prev => ({
      ...prev,
      [prodId]: Math.max(0, (prev[prodId] || 0) + delta)
    }));
  };

  const selectedItems = products
    .filter(p => quantities[p.id] > 0)
    .map(p => {
      const qty = quantities[p.id];
      const taxable = qty * p.sellingPrice;
      const cgst = taxable * 0.025;
      const sgst = taxable * 0.025;
      return {
        productId: p.id,
        productName: p.name,
        hsn: p.hsn,
        quantity: qty,
        rate: p.sellingPrice,
        taxable,
        cgstAmount: cgst,
        sgstAmount: sgst,
        totalAmount: taxable + cgst + sgst,
      };
    });

  const totalAmount = selectedItems.reduce((sum, it) => sum + it.totalAmount, 0);

  const handleSubmit = () => {
    if (selectedItems.length === 0) return;

    createOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      customerAddress: selectedCustomer.address,
      customerGstin: selectedCustomer.gstin,
      items: selectedItems,
      taxableAmount: selectedItems.reduce((sum, it) => sum + it.taxable, 0),
      cgstTotal: selectedItems.reduce((sum, it) => sum + it.cgstAmount, 0),
      sgstTotal: selectedItems.reduce((sum, it) => sum + it.sgstAmount, 0),
      igstTotal: 0,
      totalAmount,
      notes: 'Captured via Salesman Mobile Quick Entry',
    });

    setSubmitted(true);
    setTimeout(() => {
      navigate('/sales/orders');
    }, 1200);
  };

  return (
    <Layout
      breadcrumbs={['Sales & Orders', 'Salesman Quick Capture']}
      title="Field Sales Order Entry"
      subtitle="Lightweight, mobile-first touch UI for retail field booking"
      actions={
        <button
          onClick={() => navigate('/sales/orders')}
          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
      }
    >
      <div className="max-w-2xl mx-auto space-y-5">
        {isOffline && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300">
            <WifiOff className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <span>Offline mode active: Order will be safely stored on this device until synced.</span>
          </div>
        )}

        {submitted && (
          <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg">
            <CheckCircle2 className="w-5 h-5" />
            <span>Order recorded successfully! Redirecting...</span>
          </div>
        )}

        {/* Customer Select Card */}
        <div className="bg-white dark:bg-surface-dark border border-slate-200/80 dark:border-slate-800 rounded-3xl p-5 shadow-card space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Select Customer / Retailer Store
          </label>
          <select
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold text-slate-900 dark:text-white"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
          >
            {customers.map(c => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.city} (Due: ₹{c.outstanding})
              </option>
            ))}
          </select>

          <div className="text-xs text-slate-500 flex justify-between items-center px-1">
            <span>Contact: {selectedCustomer?.phone}</span>
            <span className="font-semibold text-primary-600 dark:text-primary-400">{selectedCustomer?.city}</span>
          </div>
        </div>

        {/* Products Touch List */}
        <div className="space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 px-1">
            Select Products & Quantities
          </label>

          {products.map(prod => {
            const qty = quantities[prod.id] || 0;
            const isShort = qty > prod.currentStock;

            return (
              <div
                key={prod.id}
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                  qty > 0
                    ? 'bg-primary-50/40 dark:bg-primary-950/20 border-primary-200 dark:border-primary-900/60 shadow-sm'
                    : 'bg-white dark:bg-surface-dark border-slate-200/80 dark:border-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                    <span>{prod.name}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      ₹{prod.sellingPrice}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Live Stock: <span className="font-bold text-slate-700 dark:text-slate-300">{prod.currentStock} {prod.unit}</span>
                  </div>
                  {isShort && (
                    <div className="text-[10px] text-rose-500 font-bold mt-1">
                      ⚠️ Exceeds stock by {qty - prod.currentStock} pkts
                    </div>
                  )}
                </div>

                {/* Touch Counter Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleQtyChange(prod.id, -10)}
                    disabled={qty === 0}
                    className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-white font-bold flex items-center justify-center transition-all disabled:opacity-30"
                  >
                    <Minus className="w-4 h-4" />
                  </button>

                  <span className="w-12 text-center font-black text-base text-slate-900 dark:text-white">
                    {qty}
                  </span>

                  <button
                    type="button"
                    onClick={() => handleQtyChange(prod.id, 10)}
                    className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 text-white font-bold flex items-center justify-center transition-all shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Booking Summary Bar */}
        <div className="sticky bottom-4 z-20 p-4 bg-slate-900 text-white rounded-3xl shadow-2xl flex items-center justify-between border border-slate-700">
          <div>
            <div className="text-xs text-slate-400">Total with 5% GST:</div>
            <div className="text-xl font-black text-amber-300">
              ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={selectedItems.length === 0}
            className="px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl text-xs flex items-center gap-2 transition-all disabled:opacity-40 shadow-lg shadow-primary-500/30"
          >
            <Check className="w-4 h-4" />
            <span>Book Order Now</span>
          </button>
        </div>
      </div>
    </Layout>
  );
};
